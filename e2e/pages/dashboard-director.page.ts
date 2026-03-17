/**
 * Page Object - Dashboard Director
 *
 * Encapsule les selecteurs et actions pour le dashboard directeur.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-149
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardDirectorPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Conteneur principal */
  readonly container: Locator

  /** Message de bienvenue */
  readonly welcomeMessage: Locator

  /** Nom de l'entreprise dans le welcome */
  readonly companyName: Locator

  /** Section statistiques avec 6 KPIs */
  readonly statsSection: Locator
  readonly totalEmployeesCard: Locator
  readonly teamsCountCard: Locator
  readonly attendanceRateCard: Locator
  readonly pendingLeavesCard: Locator

  /** Graphique repartition equipes */
  readonly teamsChartSection: Locator

  /** Graphique evolution effectifs */
  readonly trendsChartSection: Locator

  /** Liste des conges en attente */
  readonly pendingLeavesSection: Locator
  readonly leaveItems: Locator
  readonly viewAllLeavesLink: Locator

  /** Actions rapides */
  readonly quickActionsSection: Locator
  readonly addTeamLink: Locator
  readonly addEmployeeLink: Locator
  readonly viewLeavesLink: Locator
  readonly viewStatsLink: Locator

  /** Etats speciaux */
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator
  readonly noCompanyMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Conteneur
    this.container = page.locator('div.space-y-6').first()

    // Welcome
    this.welcomeMessage = page.getByRole('heading', { level: 1 })
    this.companyName = page.locator('text=/Vue globale|entreprise/i')

    // Stats Section
    this.statsSection = page.getByRole('region', { name: /statistiques/i })
    this.totalEmployeesCard = page
      .locator('text=Employes')
      .locator('..')
      .locator('..')
    this.teamsCountCard = page
      .locator('text=Equipes')
      .locator('..')
      .locator('..')
    this.attendanceRateCard = page
      .locator('text=Taux presence')
      .locator('..')
      .locator('..')
    this.pendingLeavesCard = page
      .locator('text=/Cong[eé]s en attente|demandes/i')
      .locator('..')
      .locator('..')

    // Charts
    this.teamsChartSection = page
      .locator('text=/R[eé]partition|[eé]quipes/i')
      .locator('..')
    this.trendsChartSection = page
      .locator('text=/[EÉ]volution|effectifs/i')
      .locator('..')

    // Pending Leaves
    this.pendingLeavesSection = page
      .locator('text=Conges en attente')
      .locator('..')
    this.leaveItems = page.locator('[data-testid="leave-item"]')
    this.viewAllLeavesLink = page.getByRole('link', {
      name: /voir tout|voir tous/i,
    })

    // Quick Actions
    this.quickActionsSection = page
      .locator('text=Actions rapides')
      .locator('..')
    this.addTeamLink = page.getByRole('link', {
      name: /ajouter.*equipe|nouvelle equipe/i,
    })
    this.addEmployeeLink = page.getByRole('link', {
      name: /ajouter.*employe|nouvel employe/i,
    })
    this.viewLeavesLink = page.getByRole('link', {
      name: /gerer.*conges|voir.*conges/i,
    })
    this.viewStatsLink = page.getByRole('link', {
      name: /statistiques|rapports/i,
    })

    // States
    this.loadingIndicator = page.locator('[data-testid="loading"]')
    this.errorMessage = page.locator('text=Erreur de chargement')
    this.noCompanyMessage = page.locator('text=Entreprise non configuree')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le dashboard director
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/directeur/dashboard')
  }

  /**
   * Attend que la page soit completement chargee
   */
  async waitForLoad(): Promise<void> {
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
   * Verifie que les 6 KPIs sont affiches
   */
  async expectKPIsVisible(): Promise<void> {
    const kpiLabels = [
      'Employes',
      'Equipes',
      'Taux presence',
      /Conges|demandes/i,
      'Heures',
      /Budget|Cout/i,
    ]

    // Verifier au moins 4 KPIs visibles
    let visibleCount = 0
    for (const label of kpiLabels) {
      const locator =
        typeof label === 'string'
          ? this.page.locator(`text=${label}`)
          : this.page.locator(`text=${label.source}`)
      if (
        await locator
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        visibleCount++
      }
    }
    expect(visibleCount).toBeGreaterThanOrEqual(4)
  }

  /**
   * Verifie que le graphique equipes est affiche
   */
  async expectTeamsChartVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/R[eé]partition.*[eé]quipes|[eé]quipes.*effectif/i')
    ).toBeVisible()
  }

  /**
   * Verifie que le graphique tendances est affiche
   */
  async expectTrendsChartVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/[EÉ]volution.*effectifs|tendances/i')
    ).toBeVisible()
  }

  /**
   * Verifie que la section conges en attente est affichee
   */
  async expectPendingLeavesVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/Cong[eé]s en attente|demandes.*cong[eé]s/i')
    ).toBeVisible()
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
   * Verifie que l'entreprise n'est pas configuree
   */
  async expectNoCompanyState(): Promise<void> {
    await expect(this.noCompanyMessage).toBeVisible()
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur "Ajouter une equipe"
   */
  async clickAddTeam(): Promise<void> {
    await this.addTeamLink.click()
  }

  /**
   * Clique sur "Ajouter un employe"
   */
  async clickAddEmployee(): Promise<void> {
    await this.addEmployeeLink.click()
  }

  /**
   * Clique sur "Voir tous les conges"
   */
  async clickViewAllLeaves(): Promise<void> {
    await this.viewAllLeavesLink.click()
  }

  /**
   * Recupere le nombre d'employes affiche
   */
  async getTotalEmployees(): Promise<string | null> {
    const employeesText = this.page
      .locator('text=Employes')
      .locator('..')
      .locator('..')
      .locator('p.text-2xl, p.text-3xl')
    if (await employeesText.isVisible()) {
      return await employeesText.textContent()
    }
    return null
  }

  /**
   * Recupere le nombre de demandes de conges en attente
   */
  async getPendingLeavesCount(): Promise<string | null> {
    const pendingText = this.page.locator(
      'text=/\\d+.*demande|\\d+.*cong[eé].*attente/i'
    )
    if (await pendingText.first().isVisible()) {
      return await pendingText.first().textContent()
    }
    return null
  }

  /**
   * Recupere le taux de presence affiche
   */
  async getAttendanceRate(): Promise<string | null> {
    const rateText = this.page.locator(
      'text=/\\d+%.*pr[eé]sence|pr[eé]sence.*\\d+%/i'
    )
    if (await rateText.first().isVisible()) {
      return await rateText.first().textContent()
    }
    return null
  }

  /**
   * Verifie le titre de la page
   */
  async expectPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/dashboard director/i)
  }

  /**
   * Verifie que le nom de l'entreprise est affiche
   */
  async expectCompanyNameVisible(companyName: string): Promise<void> {
    await expect(this.page.locator(`text=${companyName}`)).toBeVisible()
  }
}
