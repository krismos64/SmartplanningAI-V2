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

import { Page, Locator, expect } from '@playwright/test'
import { TEST_USERS } from '../fixtures/auth.fixture'
import { setConsentCookie } from '../fixtures/consent.fixture'

export class ImpersonationPage {
  readonly page: Page

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
   * ClientFetchError), donc on utilise l'API directement puis on re-logue
   * l'admin pour obtenir un JWT SYSTEM_ADMIN propre.
   */
  async stopImpersonation(): Promise<void> {
    // 1. Appeler l'API DELETE (supprime le cookie impersonation + audit log)
    const deleteResp = await this.page.request.delete(
      '/api/admin/impersonate'
    )
    if (!deleteResp.ok()) {
      throw new Error(`DELETE impersonation failed: ${deleteResp.status()}`)
    }

    // 2. Supprimer TOUS les cookies du browser context AVANT le signout.
    // clearCookies() supprime les HttpOnly cookies (JWT NextAuth inclus).
    // C'est la seule methode fiable car :
    // - page.request.post est un contexte API separe (cookies non propages au browser)
    // - page.evaluate(fetch) avec redirect:'manual' ignore les Set-Cookie des 302
    // - page.goto('/api/auth/signout') provoque une navigation impredictible
    await this.page.context().clearCookies()
    await setConsentCookie(this.page.context())

    // 3. Verifier que tous les cookies auth sont bien supprimes
    const remainingCookies = await this.page.context().cookies()
    const authCookies = remainingCookies.filter(
      (c) => c.name.includes('session') || c.name.includes('csrf') || c.name.includes('callback')
    )
    if (authCookies.length > 0) {
      // Force une seconde suppression si des cookies persistent
      await this.page.context().clearCookies()
      await setConsentCookie(this.page.context())
    }

    // 4. Naviguer vers /login et attendre que la page soit prete.
    // En CI nightly, le serveur Next.js peut etre lent a servir la page
    // apres clearCookies(). On fait un goto explicite avec retry pour
    // s'assurer que la page de login est chargee avant loginAs().
    // Apres clearCookies(), le middleware peut rediriger vers /login ou
    // servir la page directement — on attend que l'URL contienne /login.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.goto('/login', { timeout: 30000, waitUntil: 'domcontentloaded' })
        // Verifier qu'on est bien sur /login (le middleware peut rediriger)
        await this.page.waitForURL(/\/login/, { timeout: 10000 })
        break
      } catch {
        if (attempt === 2) throw new Error('Failed to navigate to /login after 3 attempts')
        // Force un second clearCookies en cas de cookie residuel qui redirect
        await this.page.context().clearCookies()
        await setConsentCookie(this.page.context())
        await this.page.waitForTimeout(2000)
      }
    }

    // Attendre que le champ email soit visible (hydration React lente en CI)
    // En CI nightly, React peut mettre du temps a s'hydrater apres clearCookies.
    // On attend d'abord le load complet, puis le champ.
    await this.page.waitForLoadState('load').catch(() => {})
    const emailField = this.page.getByPlaceholder('vous@entreprise.com')
    await emailField.waitFor({ state: 'visible', timeout: 45000 })

    // 5. Re-login admin directement (on est deja sur /login avec le champ visible,
    // evite le double goto('/login') que ferait loginAs)
    const admin = TEST_USERS.SYSTEM_ADMIN
    await emailField.fill(admin.email)
    await this.page.getByPlaceholder('••••••••').fill(admin.password)
    await this.page.getByRole('button', { name: 'Se connecter' }).click()
    await this.page.waitForURL(
      /\/app\/(dashboard|director|manager|admin|employee|settings|billing)/,
      { timeout: 60000 }
    )

    // 6. Naviguer vers /app/admin/companies
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
