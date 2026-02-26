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
import { loginAs, TEST_USERS } from '../fixtures/auth.fixture'

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
    // 1. Appeler l'API DELETE (supprime le cookie serveur + audit log)
    const deleteResp = await this.page.request.delete(
      '/api/admin/impersonate'
    )
    if (!deleteResp.ok()) {
      throw new Error(`DELETE impersonation failed: ${deleteResp.status()}`)
    }

    // 2. Supprimer le cookie impersonation du browser context
    await this.page.context().clearCookies({ name: 'sp-impersonation' })

    // 3. Supprimer le cookie de session NextAuth (JWT obsolete avec role DIRECTOR)
    // On supprime uniquement les cookies auth, pas le consentement cookies
    await this.page.context().clearCookies({ name: 'authjs.session-token' })
    await this.page.context().clearCookies({
      name: '__Secure-authjs.session-token',
    })
    await this.page.context().clearCookies({
      name: 'authjs.csrf-token',
    })

    // 4. Naviguer vers /login avant loginAs pour eviter les redirections
    // middleware en cascade (CI lent: la page peut rester sur un dashboard
    // invalide apres clearCookies, provoquant un timeout sur loginAs)
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' })
    await this.page.waitForLoadState('networkidle')

    // 5. Re-login admin pour obtenir un JWT SYSTEM_ADMIN propre
    await loginAs(this.page, TEST_USERS.SYSTEM_ADMIN)

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
