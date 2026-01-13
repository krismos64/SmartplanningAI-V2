/**
 * Page Object - Company List (CRUD)
 *
 * Encapsule les selecteurs et actions pour la liste des entreprises.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export class CompanyListPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Compteur total */
  readonly totalCount: Locator

  /** Bouton nouvelle entreprise */
  readonly newCompanyButton: Locator

  /** Bouton actualiser */
  readonly refreshButton: Locator

  /** Input recherche */
  readonly searchInput: Locator

  /** Select filtre plan */
  readonly planFilter: Locator

  /** Select filtre statut */
  readonly statusFilter: Locator

  /** Tableau des entreprises */
  readonly table: Locator

  /** Lignes du tableau */
  readonly tableRows: Locator

  /** Message aucune entreprise */
  readonly emptyMessage: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  /** Pagination - bouton precedent */
  readonly prevPageButton: Locator

  /** Pagination - bouton suivant */
  readonly nextPageButton: Locator

  /** Pagination - texte page */
  readonly pageInfo: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.pageTitle = page.getByRole('heading', { name: /entreprises/i })
    this.totalCount = page.locator('text=/\\d+ entreprise/i')
    this.newCompanyButton = page.getByRole('link', {
      name: /nouvelle entreprise/i,
    })
    this.refreshButton = page.getByRole('button', { name: /actualiser/i })

    // Filtres
    this.searchInput = page.getByPlaceholder(/rechercher/i)
    this.planFilter = page.getByRole('combobox', { name: /plan/i })
    this.statusFilter = page.getByRole('combobox', { name: /statut/i })

    // Table
    this.table = page.locator('table')
    this.tableRows = page.locator('table tbody tr')
    this.emptyMessage = page.locator('text=Aucune entreprise trouvée')
    this.loadingIndicator = page.locator('text=Chargement...').first()

    // Pagination
    this.prevPageButton = page.getByRole('button', { name: /précédent/i })
    this.nextPageButton = page.getByRole('button', { name: /suivant/i })
    this.pageInfo = page.locator('text=/Page \\d+ sur \\d+/i')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers la liste des entreprises
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/admin/companies')
  }

  /**
   * Attend que la page soit chargee
   */
  async waitForLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
    // Attendre que le chargement soit termine
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que la page est affichee
   */
  async expectToBeVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.newCompanyButton).toBeVisible()
  }

  /**
   * Verifie le nombre d'entreprises affiche
   */
  async expectTotalCount(count: number): Promise<void> {
    await expect(
      this.page.locator(`text=${count} entreprise`)
    ).toBeVisible()
  }

  /**
   * Verifie qu'une entreprise est dans la liste
   */
  async expectCompanyInList(companyName: string): Promise<void> {
    await expect(this.page.locator(`text=${companyName}`).first()).toBeVisible()
  }

  /**
   * Verifie qu'une entreprise n'est PAS dans la liste
   */
  async expectCompanyNotInList(companyName: string): Promise<void> {
    await expect(this.page.locator(`text=${companyName}`)).not.toBeVisible()
  }

  /**
   * Verifie l'etat vide
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur le bouton nouvelle entreprise
   */
  async clickNewCompany(): Promise<void> {
    await this.newCompanyButton.click()
  }

  /**
   * Recherche une entreprise
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
    // Attendre le debounce
    await this.page.waitForTimeout(500)
  }

  /**
   * Filtre par plan
   */
  async filterByPlan(plan: string): Promise<void> {
    await this.planFilter.click()
    await this.page.getByRole('option', { name: plan }).click()
  }

  /**
   * Filtre par statut
   */
  async filterByStatus(status: 'Actif' | 'Inactif'): Promise<void> {
    await this.statusFilter.click()
    await this.page.getByRole('option', { name: status }).click()
  }

  /**
   * Actualise la liste
   */
  async refresh(): Promise<void> {
    await this.refreshButton.click()
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Clique sur une entreprise pour voir les details
   */
  async viewCompany(companyName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: companyName })
    await row.getByRole('button', { name: /voir|actions/i }).click()
    // Si menu dropdown
    const viewOption = this.page.getByRole('menuitem', { name: /voir/i })
    if (await viewOption.isVisible()) {
      await viewOption.click()
    }
  }

  /**
   * Clique sur supprimer pour une entreprise
   */
  async deleteCompany(companyName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: companyName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /supprimer/i }).click()
  }

  /**
   * Confirme la suppression dans le dialog
   */
  async confirmDelete(): Promise<void> {
    await this.page
      .getByRole('button', { name: /supprimer|confirmer/i })
      .click()
  }

  /**
   * Annule la suppression dans le dialog
   */
  async cancelDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /annuler/i }).click()
  }

  /**
   * Toggle le statut d'une entreprise
   */
  async toggleCompanyStatus(companyName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: companyName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page
      .getByRole('menuitem', { name: /activer|desactiver/i })
      .click()
  }

  /**
   * Navigue vers la page suivante
   */
  async nextPage(): Promise<void> {
    await this.nextPageButton.click()
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Navigue vers la page precedente
   */
  async prevPage(): Promise<void> {
    await this.prevPageButton.click()
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Recupere le nombre de lignes dans le tableau
   */
  async getRowCount(): Promise<number> {
    return await this.tableRows.count()
  }
}
