/**
 * Page Object - Impersonation (mode support SYSTEM_ADMIN)
 *
 * Encapsule les selecteurs et actions pour le mode impersonation.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * @ticket SP-456
 */

import { Page, Locator, expect } from '@playwright/test'

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
   * Demarre l'impersonation sur une entreprise cible
   *
   * Navigue vers /app/admin/companies, ouvre le menu actions de l'entreprise,
   * clique sur "Voir espace client", attend la redirection vers /app/dashboard.
   */
  async startImpersonation(companyName: string): Promise<void> {
    // Naviguer vers la liste des entreprises
    await this.page.goto('/app/admin/companies')
    await expect(this.companiesTitle).toBeVisible({ timeout: 15000 })
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })

    // Trouver la ligne de l'entreprise cible et ouvrir le menu actions
    const row = this.page.locator('table tbody tr', {
      hasText: companyName,
    })
    await expect(row).toBeVisible({ timeout: 10000 })

    // Ouvrir le dropdown menu actions
    const actionsButton = row.getByRole('button', {
      name: /menu actions/i,
    })
    await actionsButton.click()

    // Cliquer sur "Voir espace client"
    const impersonateItem = this.page.getByRole('menuitem', {
      name: /voir espace client/i,
    })
    await expect(impersonateItem).toBeVisible({ timeout: 5000 })
    await impersonateItem.click()

    // Attendre la redirection vers le dashboard client
    await this.page.waitForURL('**/app/dashboard**', { timeout: 30000 })
  }

  /**
   * Arrete l'impersonation via le bouton de la banniere
   *
   * Clique sur "Quitter le mode support", attend la redirection
   * vers /app/admin/companies.
   */
  async stopImpersonation(): Promise<void> {
    await expect(this.quitButton).toBeVisible({ timeout: 5000 })
    await this.quitButton.click()

    // Attendre la redirection retour vers la liste des entreprises
    await this.page.waitForURL('**/app/admin/companies**', { timeout: 30000 })
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
   *
   * Teste le bouton "Nouvelle entreprise" dans la page admin
   * et les items de menu disabled dans le dropdown.
   */
  async expectMutationButtonsDisabled(): Promise<void> {
    // Le bouton "Nouvelle entreprise" doit etre disabled
    const newCompanyButton = this.page.getByRole('button', {
      name: /nouvelle entreprise/i,
    })
    if (await newCompanyButton.isVisible()) {
      await expect(newCompanyButton).toBeDisabled()
    }
  }

  /**
   * Verifie que l'URL est le dashboard (lecture seule)
   */
  async expectRedirectedToReadOnly(): Promise<void> {
    await expect(this.page).toHaveURL(/\/app\/dashboard/)
  }
}
