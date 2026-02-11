/**
 * Page Object - Dashboard Manager
 *
 * Basé sur l'UI réelle avec les composants :
 * ManagerWelcome, ManagerStats, ManagerTeamChart,
 * ManagerPendingLeaves, ManagerQuickActions, PersonalTasksWidget
 *
 * @ticket SP-149
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardManagerPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Sections principales
  // ==========================================================================

  /** Carte de bienvenue */
  readonly welcomeCard: Locator

  /** Conteneur des statistiques (4 KPI) */
  readonly statsContainer: Locator

  /** Cartes de statistiques individuelles */
  readonly statCards: Locator

  /** Carte performance équipe (chart) */
  readonly teamChartCard: Locator

  /** Carte congés en attente */
  readonly pendingLeavesCard: Locator

  /** Actions rapides */
  readonly quickActionsCard: Locator

  /** Widget notes perso */
  readonly tasksWidget: Locator

  // ==========================================================================
  // Locators - Welcome
  // ==========================================================================

  readonly pendingLeavesBadge: Locator
  readonly absencesBadge: Locator
  readonly allGoodBadge: Locator

  // ==========================================================================
  // Locators - Quick Actions
  // ==========================================================================

  readonly viewTeamLink: Locator
  readonly viewPlanningLink: Locator
  readonly viewLeavesLink: Locator
  readonly viewIncidentsLink: Locator

  constructor(page: Page) {
    this.page = page

    // Sections principales
    this.welcomeCard = page.getByTestId('manager-welcome')
    this.statsContainer = page.getByTestId('manager-stats')
    this.statCards = page.getByTestId('stat-card')
    this.teamChartCard = page.getByTestId('manager-team-chart')
    this.pendingLeavesCard = page.getByTestId('manager-pending-leaves')
    this.quickActionsCard = page.getByTestId('manager-quick-actions')
    this.tasksWidget = page.getByTestId('tasks-widget')

    // Welcome badges
    this.pendingLeavesBadge = page.getByTestId('pending-leaves-badge')
    this.absencesBadge = page.getByTestId('absences-badge')
    this.allGoodBadge = page.getByTestId('all-good-badge')

    // Quick action links
    this.viewTeamLink = page.getByRole('link', { name: /voir l'équipe/i })
    this.viewPlanningLink = page.getByRole('link', {
      name: /voir le planning/i,
    })
    this.viewLeavesLink = page.getByRole('link', {
      name: /tous les congés/i,
    })
    this.viewIncidentsLink = page.getByRole('link', {
      name: /notes d'incident/i,
    })
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto(): Promise<void> {
    await this.page.goto('/app/manager/dashboard')
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded')
    await expect(this.welcomeCard).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions - Structure
  // ==========================================================================

  async expectWelcomeVisible(): Promise<void> {
    await expect(this.welcomeCard).toBeVisible()
    // Le greeting contient le nom de l'utilisateur
    const heading = this.welcomeCard.locator('h1')
    await expect(heading).toBeVisible()
  }

  async expectGreetingContainsName(name: string): Promise<void> {
    const heading = this.welcomeCard.locator('h1')
    await expect(heading).toContainText(name)
  }

  async expectStatsVisible(): Promise<void> {
    await expect(this.statsContainer).toBeVisible()
    await expect(this.statCards).toHaveCount(4, { timeout: 10000 })
  }

  async expectTeamChartVisible(): Promise<void> {
    await expect(this.teamChartCard).toBeVisible()
    await expect(
      this.teamChartCard.getByText('Performance équipe')
    ).toBeVisible()
  }

  async expectPendingLeavesVisible(): Promise<void> {
    await expect(this.pendingLeavesCard).toBeVisible()
    await expect(
      this.pendingLeavesCard.getByText('Congés à valider')
    ).toBeVisible()
  }

  async expectQuickActionsVisible(): Promise<void> {
    await expect(this.quickActionsCard).toBeVisible()
    await expect(this.viewTeamLink).toBeVisible()
    await expect(this.viewPlanningLink).toBeVisible()
    await expect(this.viewLeavesLink).toBeVisible()
    await expect(this.viewIncidentsLink).toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  async clickViewTeam(): Promise<void> {
    await this.viewTeamLink.click()
  }

  async clickViewPlanning(): Promise<void> {
    await this.viewPlanningLink.click()
  }

  async clickViewLeaves(): Promise<void> {
    await this.viewLeavesLink.click()
  }

  async clickViewIncidents(): Promise<void> {
    await this.viewIncidentsLink.click()
  }
}
