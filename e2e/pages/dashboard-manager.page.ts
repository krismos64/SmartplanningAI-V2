/**
 * Page Object - Dashboard Manager
 *
 * Encapsule les selecteurs et actions pour le dashboard manager.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-149
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardManagerPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Conteneur principal */
  readonly container: Locator

  /** Titre du dashboard */
  readonly pageTitle: Locator

  /** Sous-titre avec nom de l'equipe */
  readonly teamSubtitle: Locator

  /** Cartes de statistiques */
  readonly membersCard: Locator
  readonly shiftsCard: Locator
  readonly pendingRequestsCard: Locator

  /** Section actions rapides */
  readonly quickActionsSection: Locator
  readonly createShiftButton: Locator
  readonly validateLeavesButton: Locator
  readonly viewTeamButton: Locator

  /** Tableau planning de l'equipe */
  readonly teamScheduleTable: Locator
  readonly scheduleRows: Locator

  /** Section demandes de conges */
  readonly leaveRequestsSection: Locator
  readonly leaveRequestItems: Locator
  readonly approveButtons: Locator
  readonly rejectButtons: Locator

  constructor(page: Page) {
    this.page = page

    // Conteneur
    this.container = page.locator('div.space-y-6').first()

    // Titre
    this.pageTitle = page.getByRole('heading', { name: /dashboard manager/i })
    this.teamSubtitle = page.locator('text=/Gerez votre equipe/i')

    // Stats Cards
    this.membersCard = page
      .locator("text=Membres d'equipe")
      .locator('..')
      .locator('..')
    this.shiftsCard = page
      .locator('text=Shifts cette semaine')
      .locator('..')
      .locator('..')
    this.pendingRequestsCard = page
      .locator('text=Demandes en attente')
      .locator('..')
      .locator('..')

    // Quick Actions
    this.quickActionsSection = page
      .locator('text=Actions rapides')
      .locator('..')
    this.createShiftButton = page.getByRole('button', {
      name: /creer un shift/i,
    })
    this.validateLeavesButton = page.getByRole('button', {
      name: /valider des conges/i,
    })
    this.viewTeamButton = page.getByRole('button', { name: /vue equipe/i })

    // Team Schedule
    this.teamScheduleTable = page.locator('table')
    this.scheduleRows = page.locator('tbody tr')

    // Leave Requests
    this.leaveRequestsSection = page
      .locator('text=Demandes de conges a valider')
      .locator('..')
    this.leaveRequestItems = page.locator(
      '[class*="flex items-center justify-between"]'
    )
    this.approveButtons = page.getByRole('button', { name: /approuver/i })
    this.rejectButtons = page.getByRole('button', { name: /rejeter/i })
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le dashboard manager
   */
  async goto(): Promise<void> {
    await this.page.goto('/manager')
  }

  /**
   * Attend que la page soit completement chargee
   */
  async waitForLoad(): Promise<void> {
    await expect(this.pageTitle).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que le dashboard est affiche correctement
   */
  async expectToBeVisible(): Promise<void> {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.container).toBeVisible()
  }

  /**
   * Verifie que les statistiques d'equipe sont affichees
   */
  async expectTeamStatsVisible(): Promise<void> {
    await expect(this.page.locator("text=Membres d'equipe")).toBeVisible()
    await expect(this.page.locator('text=Shifts cette semaine')).toBeVisible()
    await expect(this.page.locator('text=Demandes en attente')).toBeVisible()
  }

  /**
   * Verifie que le planning d'equipe est affiche
   */
  async expectTeamScheduleVisible(): Promise<void> {
    await expect(
      this.page.locator("text=Planning de l'equipe cette semaine")
    ).toBeVisible()
    await expect(this.teamScheduleTable).toBeVisible()
  }

  /**
   * Verifie que la section demandes de conges est affichee
   */
  async expectLeaveRequestsVisible(): Promise<void> {
    await expect(
      this.page.locator('text=Demandes de conges a valider')
    ).toBeVisible()
  }

  /**
   * Verifie que les actions rapides sont affichees
   */
  async expectQuickActionsVisible(): Promise<void> {
    await expect(this.page.locator('text=Actions rapides')).toBeVisible()
    await expect(this.createShiftButton).toBeVisible()
    await expect(this.validateLeavesButton).toBeVisible()
    await expect(this.viewTeamButton).toBeVisible()
  }

  /**
   * Verifie le nombre de membres d'equipe affiche
   */
  async expectTeamMembersCount(count: number | string): Promise<void> {
    const countText = this.membersCard.locator('p.text-3xl')
    await expect(countText).toContainText(String(count))
  }

  /**
   * Verifie le nombre de demandes en attente
   */
  async expectPendingRequestsCount(count: number | string): Promise<void> {
    const countText = this.pendingRequestsCard.locator('p.text-3xl')
    await expect(countText).toContainText(String(count))
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur "Creer un shift"
   */
  async clickCreateShift(): Promise<void> {
    await this.createShiftButton.click()
  }

  /**
   * Clique sur "Valider des conges"
   */
  async clickValidateLeaves(): Promise<void> {
    await this.validateLeavesButton.click()
  }

  /**
   * Clique sur "Vue equipe"
   */
  async clickViewTeam(): Promise<void> {
    await this.viewTeamButton.click()
  }

  /**
   * Approuve la premiere demande de conge
   */
  async approveFirstLeaveRequest(): Promise<void> {
    await this.approveButtons.first().click()
  }

  /**
   * Rejette la premiere demande de conge
   */
  async rejectFirstLeaveRequest(): Promise<void> {
    await this.rejectButtons.first().click()
  }

  /**
   * Recupere le nombre de lignes dans le planning d'equipe
   */
  async getScheduleRowsCount(): Promise<number> {
    return await this.scheduleRows.count()
  }

  /**
   * Recupere le nombre de demandes de conges affichees
   */
  async getLeaveRequestsCount(): Promise<number> {
    return await this.approveButtons.count()
  }

  /**
   * Verifie le titre de la page
   */
  async expectPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/dashboard manager/i)
  }

  /**
   * Verifie que les jours de la semaine sont affiches
   */
  async expectWeekDaysVisible(): Promise<void> {
    const headers = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
    for (const day of headers) {
      await expect(this.page.locator(`th:has-text("${day}")`)).toBeVisible()
    }
  }
}
