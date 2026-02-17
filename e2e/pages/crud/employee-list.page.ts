/**
 * Page Object - Employee List (CRUD)
 *
 * Encapsule les selecteurs et actions pour la liste des employes.
 * Accessible aux SYSTEM_ADMIN, DIRECTOR et MANAGER avec acces differencies.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export class EmployeeListPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Compteur total */
  readonly totalCount: Locator

  /** Bouton nouvel employe */
  readonly newEmployeeButton: Locator

  /** Bouton actualiser */
  readonly refreshButton: Locator

  /** Input recherche */
  readonly searchInput: Locator

  /** Select filtre equipe */
  readonly teamFilter: Locator

  /** Select filtre statut */
  readonly statusFilter: Locator

  /** Select filtre type contrat */
  readonly contractFilter: Locator

  /** Tableau des employes */
  readonly table: Locator

  /** Lignes du tableau */
  readonly tableRows: Locator

  /** Message aucun employe */
  readonly emptyMessage: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  /** Pagination - bouton precedent */
  readonly prevPageButton: Locator

  /** Pagination - bouton suivant */
  readonly nextPageButton: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.pageTitle = page.getByRole('heading', { name: /employ/i })
    this.totalCount = page.locator('text=/\\d+ employ/i')
    this.newEmployeeButton = page.locator(
      'a[href="/app/dashboard/employees/new"]'
    )
    this.refreshButton = page.getByRole('button', { name: /actualiser/i })

    // Filtres
    this.searchInput = page.getByPlaceholder(/rechercher/i)
    this.teamFilter = page.getByRole('combobox', { name: /equipe/i })
    this.statusFilter = page.getByRole('combobox', { name: /statut/i })
    this.contractFilter = page.getByRole('combobox', { name: /contrat/i })

    // Table
    this.table = page.locator('table')
    this.tableRows = page.locator('table tbody tr')
    this.emptyMessage = page.locator(
      'text=/aucun employe|aucun collaborateur/i'
    )
    this.loadingIndicator = page.locator('text=Chargement...').first()

    // Pagination
    this.prevPageButton = page.getByRole('button', {
      name: /précédent|precedent/i,
    })
    this.nextPageButton = page.getByRole('button', { name: /suivant/i })
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers la liste des employes
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/dashboard/employees')
  }

  /**
   * Attend que la page soit chargee
   */
  async waitForLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
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
  }

  /**
   * Verifie qu'un employe est dans la liste
   */
  async expectEmployeeInList(employeeName: string): Promise<void> {
    await expect(
      this.page.locator(`text=${employeeName}`).first()
    ).toBeVisible()
  }

  /**
   * Verifie qu'un employe n'est PAS dans la liste
   */
  async expectEmployeeNotInList(employeeName: string): Promise<void> {
    await expect(this.page.locator(`text=${employeeName}`)).not.toBeVisible()
  }

  /**
   * Verifie l'etat vide
   */
  async expectEmptyState(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible()
  }

  /**
   * Verifie que le bouton creation est visible
   */
  async expectCreateButtonVisible(): Promise<void> {
    await expect(this.newEmployeeButton).toBeVisible()
  }

  /**
   * Verifie que le bouton creation est cache
   */
  async expectCreateButtonHidden(): Promise<void> {
    await expect(this.newEmployeeButton).not.toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur le bouton nouvel employe
   */
  async clickNewEmployee(): Promise<void> {
    await expect(this.newEmployeeButton).toBeVisible({ timeout: 15000 })
    await this.newEmployeeButton.click()
    await this.page.waitForURL(/\/app\/dashboard\/employees\/new/, {
      timeout: 10000,
    })
  }

  /**
   * Recherche un employe
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500)
  }

  /**
   * Filtre par equipe
   */
  async filterByTeam(teamName: string): Promise<void> {
    await this.teamFilter.click()
    await this.page.getByRole('option', { name: teamName }).click()
  }

  /**
   * Filtre par statut
   */
  async filterByStatus(status: 'Actif' | 'Inactif'): Promise<void> {
    await this.statusFilter.click()
    await this.page.getByRole('option', { name: status }).click()
  }

  /**
   * Voir les details d'un employe
   */
  async viewEmployee(employeeName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: employeeName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /voir/i }).click()
  }

  /**
   * Editer un employe
   */
  async editEmployee(employeeName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: employeeName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /modifier|editer/i }).click()
  }

  /**
   * Supprimer un employe
   */
  async deleteEmployee(employeeName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: employeeName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /supprimer/i }).click()
  }

  /**
   * Desactiver un employe (soft delete)
   */
  async deactivateEmployee(employeeName: string): Promise<void> {
    const row = this.page.locator('table tbody tr', { hasText: employeeName })
    await row.getByRole('button', { name: /actions/i }).click()
    await this.page.getByRole('menuitem', { name: /desactiver/i }).click()
  }

  /**
   * Confirme la suppression
   */
  async confirmDelete(): Promise<void> {
    await this.page
      .getByRole('button', { name: /supprimer|confirmer/i })
      .click()
  }

  /**
   * Annule la suppression
   */
  async cancelDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /annuler/i }).click()
  }

  /**
   * Recupere le nombre de lignes
   */
  async getRowCount(): Promise<number> {
    return await this.tableRows.count()
  }
}
