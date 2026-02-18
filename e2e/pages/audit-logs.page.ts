/**
 * Page Object - Audit Logs (Admin)
 *
 * Encapsule les selecteurs et actions pour la page journal d'audit.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * @ticket SP-446
 */

import { Page, Locator, expect } from '@playwright/test'

export class AuditLogsPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Header
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Compteur total */
  readonly totalCount: Locator

  /** Bouton actualiser */
  readonly refreshButton: Locator

  /** Bouton exporter CSV */
  readonly exportButton: Locator

  // ==========================================================================
  // Locators - Filtres
  // ==========================================================================

  /** Input recherche email/nom */
  readonly searchInput: Locator

  /** Bouton reinitialiser */
  readonly resetButton: Locator

  /** Inputs date */
  readonly dateFromInput: Locator
  readonly dateToInput: Locator

  // ==========================================================================
  // Locators - Table
  // ==========================================================================

  /** Tableau */
  readonly table: Locator

  /** Lignes du tableau */
  readonly tableRows: Locator

  /** En-tetes du tableau */
  readonly tableHeaders: Locator

  /** Message vide */
  readonly emptyMessage: Locator

  // ==========================================================================
  // Locators - Pagination
  // ==========================================================================

  /** Bouton precedent */
  readonly prevPageButton: Locator

  /** Bouton suivant */
  readonly nextPageButton: Locator

  /** Texte page */
  readonly pageInfo: Locator

  // ==========================================================================
  // Locators - Modal detail
  // ==========================================================================

  /** Titre du dialog de detail */
  readonly detailDialogTitle: Locator

  /** Contenu JSON dans le dialog */
  readonly detailJsonContent: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.pageTitle = page.getByRole('heading', { name: /journal d'audit/i })
    this.totalCount = page.locator('text=/\\d+ entrée/i')
    this.refreshButton = page.getByRole('button', { name: /actualiser/i })
    this.exportButton = page.getByRole('button', { name: /exporter csv/i })

    // Filtres
    this.searchInput = page.getByPlaceholder(/rechercher par email/i)
    this.resetButton = page.getByRole('button', { name: /réinitialiser/i })
    this.dateFromInput = page.locator('input[type="date"][aria-label="Date de début"]')
    this.dateToInput = page.locator('input[type="date"][aria-label="Date de fin"]')

    // Table
    this.table = page.locator('table')
    this.tableRows = page.locator('table tbody tr')
    this.tableHeaders = page.locator('table thead th')
    this.emptyMessage = page.locator("text=Aucun log d'audit trouvé.")

    // Pagination
    this.prevPageButton = page.getByRole('button', { name: /précédent/i })
    this.nextPageButton = page.getByRole('button', { name: /suivant/i })
    this.pageInfo = page.locator('text=/Page \\d+ sur \\d+/i')

    // Modal detail
    this.detailDialogTitle = page.getByRole('heading', {
      name: /détail du log/i,
    })
    this.detailJsonContent = page.locator(
      '[role="dialog"] pre'
    )
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto(): Promise<void> {
    await this.page.goto('/app/admin/logs')
  }

  async gotoWithParams(params: string): Promise<void> {
    await this.page.goto(`/app/admin/logs?${params}`)
  }

  async waitForLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  async expectToBeVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.table).toBeVisible()
  }

  // ==========================================================================
  // Actions - Filtres
  // ==========================================================================

  /**
   * Selectionne un filtre action via le Select Shadcn
   */
  async filterByAction(label: string): Promise<void> {
    // Le premier trigger est "Toutes les actions"
    const triggers = this.page.locator('button[role="combobox"]')
    await triggers.first().click()
    await this.page.getByRole('option', { name: label }).click()
    // Attendre la mise a jour URL
    await this.page.waitForURL(/action=/, { timeout: 10000 })
  }

  /**
   * Selectionne un filtre type d'entite via le Select Shadcn
   */
  async filterByEntityType(label: string): Promise<void> {
    const triggers = this.page.locator('button[role="combobox"]')
    // Le deuxieme trigger est "Tous les types"
    await triggers.nth(1).click()
    await this.page.getByRole('option', { name: label }).click()
    await this.page.waitForURL(/entityType=/, { timeout: 10000 })
  }

  /**
   * Recherche par email/nom (Enter pour soumettre)
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
    await this.searchInput.press('Enter')
    await this.page.waitForURL(/search=/, { timeout: 10000 })
  }

  /**
   * Reinitialise les filtres
   */
  async resetFilters(): Promise<void> {
    await this.resetButton.click()
    await this.page.waitForURL(/\/app\/admin\/logs$/, { timeout: 10000 })
  }

  // ==========================================================================
  // Actions - Pagination
  // ==========================================================================

  async changePageSize(size: string): Promise<void> {
    // Le troisieme combobox est le selecteur de taille de page
    const pageSizeTrigger = this.page.locator(
      'button[role="combobox"]'
    ).last()
    await pageSizeTrigger.click()
    await this.page.getByRole('option', { name: size }).click()
    await this.page.waitForURL(/pageSize=/, { timeout: 10000 })
  }

  async nextPage(): Promise<void> {
    await this.nextPageButton.click()
    await this.page.waitForURL(/page=/, { timeout: 10000 })
  }

  // ==========================================================================
  // Actions - Detail modal
  // ==========================================================================

  async openDetailForFirstRow(): Promise<void> {
    const detailButton = this.page
      .getByRole('button', { name: /voir les détails/i })
      .first()
    await detailButton.click()
    await expect(this.detailDialogTitle).toBeVisible({ timeout: 5000 })
  }

  async closeDetailModal(): Promise<void> {
    // Fermer via le bouton close du dialog
    const closeButton = this.page.locator('[role="dialog"] button[aria-label="Close"]')
    if (await closeButton.isVisible()) {
      await closeButton.click()
    } else {
      // Alternative : appuyer Escape
      await this.page.keyboard.press('Escape')
    }
    await expect(this.detailDialogTitle).not.toBeVisible({ timeout: 5000 })
  }
}
