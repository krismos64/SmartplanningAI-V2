/**
 * Page Object - Dashboard Employee
 *
 * Encapsule les selecteurs et actions pour le dashboard employe.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-149
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardEmployeePage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Conteneur principal */
  readonly container: Locator

  /** Message de bienvenue */
  readonly welcomeMessage: Locator

  /** Section des statistiques */
  readonly statsSection: Locator

  /** Cartes de statistiques individuelles */
  readonly statsCards: Locator

  /** Section planning de la semaine */
  readonly scheduleSection: Locator

  /** Section solde de conges */
  readonly leaveBalanceSection: Locator

  /** Section actions rapides */
  readonly quickActionsSection: Locator

  /** Boutons d'action */
  readonly demandLeaveButton: Locator
  readonly viewScheduleButton: Locator
  readonly viewPendingRequestsLink: Locator

  /** Indicateur de chargement */
  readonly loadingIndicator: Locator

  /** Message d'erreur */
  readonly errorMessage: Locator

  /** Message profil non configure */
  readonly noProfileMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Conteneur
    this.container = page.locator('div.space-y-6').first()

    // Welcome
    this.welcomeMessage = page.getByRole('heading', { level: 1 })

    // Stats
    this.statsSection = page.getByRole('region', { name: /statistiques/i })
    this.statsCards = page.locator('[data-testid^="stat-card"]')

    // Schedule
    this.scheduleSection = page
      .locator('text=Planning de la semaine')
      .locator('..')

    // Leave balance
    this.leaveBalanceSection = page
      .locator('text=Solde de conges')
      .locator('..')

    // Quick Actions
    this.quickActionsSection = page
      .locator('text=Actions rapides')
      .locator('..')
    this.demandLeaveButton = page.getByRole('link', {
      name: /demander un conge/i,
    })
    this.viewScheduleButton = page.getByRole('link', {
      name: /voir mon planning/i,
    })
    this.viewPendingRequestsLink = page.getByRole('link', {
      name: /demandes en attente/i,
    })

    // States
    this.loadingIndicator = page.locator('[data-testid="loading"]')
    this.errorMessage = page.locator('text=Erreur de chargement')
    this.noProfileMessage = page.locator('text=Profil employe non configure')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le dashboard employee
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/dashboard')
  }

  /**
   * Attend que la page soit completement chargee
   */
  async waitForLoad(): Promise<void> {
    // Attendre que le message de bienvenue soit visible
    await expect(this.welcomeMessage).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que le dashboard est affiche correctement
   */
  async expectToBeVisible(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible()
    await expect(this.container).toBeVisible()
  }

  /**
   * Verifie le message de bienvenue contient le prenom
   */
  async expectWelcomeMessageContains(name: string): Promise<void> {
    await expect(this.welcomeMessage).toContainText(name)
  }

  /**
   * Verifie que les statistiques sont affichees
   */
  async expectStatsVisible(): Promise<void> {
    // Au moins 4 stats cards
    const statsText = this.page.locator(
      'text=/Heures cette semaine|Cong[eé]s restants|Prochain shift|Demandes en attente/i'
    )
    await expect(statsText.first()).toBeVisible()
  }

  /**
   * Verifie que le planning est affiche
   */
  async expectScheduleVisible(): Promise<void> {
    await expect(this.page.locator('text=Planning de la semaine')).toBeVisible()
  }

  /**
   * Verifie que le solde de conges est affiche
   */
  async expectLeaveBalanceVisible(): Promise<void> {
    await expect(this.page.locator('text=Solde de conges')).toBeVisible()
  }

  /**
   * Verifie que les actions rapides sont affichees
   */
  async expectQuickActionsVisible(): Promise<void> {
    await expect(this.page.locator('text=Actions rapides')).toBeVisible()
  }

  /**
   * Verifie que la page affiche une erreur
   */
  async expectErrorState(): Promise<void> {
    await expect(this.errorMessage).toBeVisible()
  }

  /**
   * Verifie que le profil n'est pas configure
   */
  async expectNoProfileState(): Promise<void> {
    await expect(this.noProfileMessage).toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur "Demander un conge"
   */
  async clickDemandLeave(): Promise<void> {
    await this.demandLeaveButton.click()
  }

  /**
   * Clique sur "Voir mon planning"
   */
  async clickViewSchedule(): Promise<void> {
    await this.viewScheduleButton.click()
  }

  /**
   * Recupere le nombre de demandes en attente affiche
   */
  async getPendingRequestsCount(): Promise<string | null> {
    const pendingText = this.page.locator('text=/\\d+ demande/i')
    if (await pendingText.isVisible()) {
      const text = await pendingText.textContent()
      return text
    }
    return null
  }

  /**
   * Recupere les heures travaillees cette semaine
   */
  async getWeeklyHours(): Promise<string | null> {
    const hoursCard = this.page.locator(
      'text=/\\d+h?\\s*(cette semaine|travaillees)/i'
    )
    if (await hoursCard.isVisible()) {
      return await hoursCard.textContent()
    }
    return null
  }

  /**
   * Verifie le titre de la page
   */
  async expectPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/mon dashboard|dashboard/i)
  }
}
