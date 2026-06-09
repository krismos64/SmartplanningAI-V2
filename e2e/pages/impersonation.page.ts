/**
 * Page Object - Impersonation (mode support SYSTEM_ADMIN)
 *
 * Encapsule les selecteurs et actions pour le mode impersonation.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * Note: L'impersonation utilise l'API directe via page.evaluate() car:
 * 1. Le dropdown Radix portale en dehors du DOM stable
 * 2. Le session.update() NextAuth doit se terminer avant la navigation
 * 3. Evite les ERR_TOO_MANY_REDIRECTS causes par router.push() concurrent
 *
 * @ticket SP-456
 */

import { Page, Locator, Cookie, expect } from '@playwright/test'
import { TEST_USERS } from '../fixtures/auth.fixture'
import { setConsentCookie } from '../fixtures/consent.fixture'

export class ImpersonationPage {
  readonly page: Page

  /**
   * Snapshot des cookies du context admin (JWT SYSTEM_ADMIN) capture juste
   * avant le demarrage de l'impersonation. Permet de restaurer la session
   * admin dans stopImpersonation() sans repasser par un re-login UI complet
   * (cause racine du flaky nightly recurrent depuis le 3 juin 2026 : le
   * goto('/login') + submit + waitForURL timeout sur le serveur dev lent du CI).
   */
  private adminCookies: Cookie[] = []

  // ==========================================================================
  // Locators
  // ==========================================================================

  /** Banniere orange mode support */
  readonly banner: Locator

  /** Texte de la banniere */
  readonly bannerText: Locator

  /** Bouton quitter le mode support */
  readonly quitButton: Locator

  /** Titre page Entreprises */
  readonly companiesTitle: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  constructor(page: Page) {
    this.page = page

    // Banniere impersonation
    this.banner = page.getByTestId('impersonation-banner')
    this.bannerText = page.getByTestId('impersonation-banner-text')
    this.quitButton = page.getByTestId('quit-impersonation-button')

    // Page Companies
    this.companiesTitle = page.getByRole('heading', { name: /entreprises/i })
    this.loadingIndicator = page.locator('text=Chargement...').first()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Demarre l'impersonation via l'API directe + navigation manuelle.
   *
   * Utilise page.evaluate() pour appeler /api/admin/impersonate car :
   * 1. Le dropdown Radix portale en dehors du DOM stable (detached elements)
   * 2. Le session.update() NextAuth doit se terminer avant la navigation
   * 3. Evite les race conditions entre router.push() et le middleware
   *
   * Le companyId est recupere via le DOM (data attribute) ou en cliquant
   * sur le dropdown et en interceptant le lien de detail.
   */
  async startImpersonation(companyName: string): Promise<void> {
    // Naviguer vers la liste des entreprises
    await this.page.goto('/app/admin/companies', {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })

    // Attendre que la table contienne des lignes de donnees (pas "Chargement...")
    const tableRows = this.page.locator('table tbody tr')
    await expect(tableRows.first()).toBeVisible({ timeout: 15000 })

    // Trouver la ligne de TechCorp — attendre qu'elle soit visible et stable
    const row = this.page.locator('table tbody tr', { hasText: companyName })
    await expect(row).toBeVisible({ timeout: 10000 })

    // Petit delai pour laisser React finir ses re-renders
    // (useEffect + fetchData dans CompaniesDataTable provoque un second render)
    await this.page.waitForTimeout(500)

    // Cliquer sur le bouton "Menu actions" de la ligne cible
    const actionsButton = row.getByRole('button', {
      name: /menu actions/i,
    })
    await actionsButton.click({ timeout: 10000 })

    // Attendre que le menu Radix s'ouvre (portale au body)
    const impersonateItem = this.page.getByRole('menuitem', {
      name: /voir espace client/i,
    })
    await expect(impersonateItem).toBeVisible({ timeout: 5000 })

    // Capturer les cookies admin (JWT SYSTEM_ADMIN valide) AVANT que l'API
    // impersonate ne mute la session. stopImpersonation() les reinjecte pour
    // restaurer la session admin sans re-login UI (cf. champ adminCookies).
    this.adminCookies = await this.page.context().cookies()

    // Intercepter la reponse API et cliquer en parallele
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/admin/impersonate') &&
          resp.request().method() === 'POST',
        { timeout: 15000 }
      ),
      impersonateItem.click(),
    ])

    const status = apiResponse.status()
    if (status !== 200) {
      const body = await apiResponse.text()
      throw new Error(`Impersonation API returned ${status}: ${body}`)
    }

    // Attendre que la page se stabilise sur un dashboard
    await this.page.waitForURL(/\/app\/(dashboard|director|manager|employee)/, {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    })

    // Reload pour forcer le Server Component layout.tsx a lire le cookie
    // sp-impersonation (fallback SP-456 quand updateSession echoue)
    await this.page.reload({ waitUntil: 'domcontentloaded' })
  }

  /**
   * Arrete l'impersonation via l'API DELETE + re-login admin.
   *
   * Le bouton UI a des problemes de timing avec updateSession() (NextAuth v5
   * ClientFetchError), donc on utilise l'API DELETE directement, puis on
   * restaure la session admin en reinjectant les cookies SYSTEM_ADMIN captures
   * dans startImpersonation() (voir champ adminCookies).
   *
   * Cette restauration par cookies remplace l'ancien re-login UI complet
   * (goto('/login') + submit + waitForURL), qui etait la cause racine du flaky
   * nightly recurrent : sur le serveur dev lent du CI, le POST credentials
   * NextAuth + redirection timeoutait (~1.3 min observees). Reinjecter le JWT
   * deja valide est instantane et deterministe. Le re-login UI reste disponible
   * en fallback (reloginAdminViaUI) si aucun cookie n'a ete capture.
   */
  async stopImpersonation(): Promise<void> {
    // 1. Appeler l'API DELETE (supprime le cookie impersonation + audit log)
    const deleteResp = await this.page.request.delete('/api/admin/impersonate')
    if (!deleteResp.ok()) {
      throw new Error(`DELETE impersonation failed: ${deleteResp.status()}`)
    }

    // 2. Supprimer TOUS les cookies du browser context.
    // clearCookies() supprime les HttpOnly cookies (JWT impersonation inclus).
    await this.page.context().clearCookies()
    await setConsentCookie(this.page.context())

    // 3. Restaurer la session admin en reinjectant les cookies SYSTEM_ADMIN
    // captures avant l'impersonation. Pas de re-login UI : on remet le JWT
    // d'origine, deja valide et SYSTEM_ADMIN propre.
    if (this.adminCookies.length === 0) {
      // Securite : aucun snapshot (startImpersonation pas appelee ?) → fallback UI
      await this.reloginAdminViaUI()
      return
    }

    // Filtrer le cookie impersonation residuel s'il etait present dans le
    // snapshot (ne devrait pas l'etre, capture avant le start, mais defensif).
    const cookiesToRestore = this.adminCookies.filter(
      (c) => c.name !== 'sp-impersonation'
    )
    await this.page.context().addCookies(cookiesToRestore)

    // 4. Naviguer vers /app/admin/companies avec la session admin restauree.
    await this.page.goto('/app/admin/companies', {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
  }

  /**
   * Fallback : re-login admin via le formulaire UI.
   *
   * Conserve uniquement comme filet de securite si stopImpersonation() n'a pas
   * de snapshot de cookies a restaurer. Le chemin nominal passe par la
   * reinjection des cookies (cf. stopImpersonation), bien plus stable en CI.
   */
  private async reloginAdminViaUI(): Promise<void> {
    // Naviguer vers /login avec retry (serveur dev lent en CI nightly)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.goto('/login', {
          timeout: 30000,
          waitUntil: 'domcontentloaded',
        })
        await this.page.waitForURL(/\/login/, { timeout: 10000 })
        break
      } catch {
        if (attempt === 2)
          throw new Error('Failed to navigate to /login after 3 attempts')
        await this.page.context().clearCookies()
        await setConsentCookie(this.page.context())
        await this.page.waitForTimeout(2000)
      }
    }

    await this.page.waitForLoadState('load').catch(() => {})
    const emailField = this.page.getByPlaceholder('vous@entreprise.com')
    await emailField.waitFor({ state: 'visible', timeout: 30000 })

    const admin = TEST_USERS.SYSTEM_ADMIN
    await emailField.fill(admin.email)
    await this.page.getByPlaceholder('••••••••').fill(admin.password)

    const appUrlPattern =
      /\/app\/(dashboard|director|manager|admin|employee|settings|billing)/
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await this.page.getByRole('button', { name: 'Se connecter' }).click()
        await this.page.waitForURL(appUrlPattern, {
          timeout: 30000,
          waitUntil: 'commit',
        })
        break
      } catch {
        if (attempt === 1)
          throw new Error(
            'Re-login admin failed: no redirect to /app after 2 attempts'
          )
        await emailField.fill(admin.email)
        await this.page.getByPlaceholder('••••••••').fill(admin.password)
      }
    }

    await this.page.goto('/app/admin/companies', {
      waitUntil: 'domcontentloaded',
    })
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que la banniere orange est visible avec le nom de l'entreprise
   */
  async expectBannerVisible(companyName: string): Promise<void> {
    await expect(this.banner).toBeVisible({ timeout: 10000 })
    await expect(this.bannerText).toContainText(companyName)
    await expect(this.quitButton).toBeVisible()
  }

  /**
   * Verifie que la banniere n'est pas dans le DOM
   */
  async expectBannerHidden(): Promise<void> {
    await expect(this.banner).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Verifie que les boutons de mutation sont desactives
   */
  async expectMutationButtonsDisabled(): Promise<void> {
    const newCompanyButton = this.page.getByRole('button', {
      name: /nouvelle entreprise/i,
    })
    if (await newCompanyButton.isVisible()) {
      await expect(newCompanyButton).toBeDisabled()
    }
  }

  /**
   * Verifie que l'URL est un dashboard (lecture seule)
   */
  async expectRedirectedToReadOnly(): Promise<void> {
    await expect(this.page).toHaveURL(
      /\/app\/(dashboard|director|manager|employee)/
    )
  }
}
