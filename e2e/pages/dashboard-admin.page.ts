/**
 * Page Object - Dashboard Super Admin
 *
 * Encapsule les selecteurs et actions pour le dashboard super admin.
 * Utilise le pattern Page Object Model pour des tests maintenables.
 *
 * @ticket SP-149
 */

import { Page, Locator, expect } from '@playwright/test'

export class DashboardAdminPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements de la page
  // ==========================================================================

  /** Conteneur principal */
  readonly container: Locator

  /** Message de bienvenue */
  readonly welcomeMessage: Locator

  /** Resume plateforme dans le welcome */
  readonly platformSummary: Locator

  /** Section statistiques avec 6 KPIs SaaS */
  readonly statsSection: Locator
  readonly totalCompaniesCard: Locator
  readonly totalUsersCard: Locator
  readonly activeSubscriptionsCard: Locator
  readonly mrrCard: Locator
  readonly conversionRateCard: Locator
  readonly churnRateCard: Locator

  /** Graphique MRR */
  readonly mrrChartSection: Locator

  /** Graphique inscriptions */
  readonly signupsChartSection: Locator

  /** Graphique repartition plans */
  readonly plansChartSection: Locator

  /** Liste des dernieres entreprises */
  readonly recentCompaniesSection: Locator
  readonly companyItems: Locator
  readonly viewAllCompaniesLink: Locator

  /** Actions rapides */
  readonly quickActionsSection: Locator
  readonly viewCompaniesLink: Locator
  readonly viewUsersLink: Locator
  readonly viewSubscriptionsLink: Locator
  readonly platformSettingsLink: Locator

  /** Etats speciaux */
  readonly loadingIndicator: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Conteneur
    this.container = page.locator('div.space-y-6').first()

    // Welcome
    this.welcomeMessage = page.getByRole('heading', { level: 1 })
    this.platformSummary = page.locator('text=/entreprises|utilisateurs|MRR/i')

    // Stats Section - 6 KPIs SaaS
    this.statsSection = page.getByRole('region', { name: /statistiques/i })
    this.totalCompaniesCard = page
      .locator('text=Entreprises')
      .locator('..')
      .locator('..')
    this.totalUsersCard = page
      .locator('text=Utilisateurs')
      .locator('..')
      .locator('..')
    this.activeSubscriptionsCard = page
      .locator('text=Abonnements actifs')
      .locator('..')
      .locator('..')
    this.mrrCard = page.locator('text=MRR').locator('..').locator('..')
    this.conversionRateCard = page
      .locator('text=Taux conversion')
      .locator('..')
      .locator('..')
    this.churnRateCard = page
      .locator('text=Taux churn')
      .locator('..')
      .locator('..')

    // Charts
    this.mrrChartSection = page
      .locator('text=/Evolution MRR|MRR.*mois/i')
      .locator('..')
    this.signupsChartSection = page
      .locator('text=/Nouvelles inscriptions|inscriptions/i')
      .locator('..')
    this.plansChartSection = page
      .locator('text=/Repartition.*plans|revenus.*plan/i')
      .locator('..')

    // Recent Companies
    this.recentCompaniesSection = page
      .locator('text=/Dernieres inscriptions|entreprises recentes/i')
      .locator('..')
    this.companyItems = page.locator('[data-testid="company-item"]')
    this.viewAllCompaniesLink = page.getByRole('link', { name: /voir tout/i })

    // Quick Actions
    this.quickActionsSection = page
      .locator('text=Actions rapides')
      .locator('..')
    this.viewCompaniesLink = page.getByRole('link', {
      name: /gerer.*entreprises|voir.*entreprises/i,
    })
    this.viewUsersLink = page.getByRole('link', {
      name: /gerer.*utilisateurs|voir.*utilisateurs/i,
    })
    this.viewSubscriptionsLink = page.getByRole('link', {
      name: /gerer.*abonnements|voir.*abonnements/i,
    })
    this.platformSettingsLink = page.getByRole('link', {
      name: /parametres|configuration/i,
    })

    // States
    this.loadingIndicator = page.locator('[data-testid="loading"]')
    this.errorMessage = page.locator('text=Erreur de chargement')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le dashboard admin
   */
  async goto(): Promise<void> {
    await this.page.goto('/app/admin/dashboard')
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
   * Verifie que les 6 KPIs SaaS sont affiches
   */
  async expectSaaSKPIsVisible(): Promise<void> {
    const kpiLabels = [
      'Entreprises',
      'Utilisateurs',
      'Abonnements actifs',
      'MRR',
      'Taux conversion',
      'Taux churn',
    ]

    let visibleCount = 0
    for (const label of kpiLabels) {
      const locator = this.page.locator(`text=${label}`)
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
   * Verifie que le graphique MRR est affiche
   */
  async expectMrrChartVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/Evolution.*MRR|MRR/i').first()
    ).toBeVisible()
  }

  /**
   * Verifie que le graphique inscriptions est affiche
   */
  async expectSignupsChartVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/Nouvelles inscriptions|inscriptions/i')
    ).toBeVisible()
  }

  /**
   * Verifie que le graphique plans est affiche
   */
  async expectPlansChartVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/Repartition|plans|revenus/i').first()
    ).toBeVisible()
  }

  /**
   * Verifie que la section dernieres entreprises est affichee
   */
  async expectRecentCompaniesVisible(): Promise<void> {
    await expect(
      this.page.locator('text=/Dernieres inscriptions|entreprises/i').first()
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

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Clique sur "Voir toutes les entreprises"
   */
  async clickViewAllCompanies(): Promise<void> {
    await this.viewAllCompaniesLink.click()
  }

  /**
   * Clique sur "Gerer les entreprises"
   */
  async clickManageCompanies(): Promise<void> {
    await this.viewCompaniesLink.click()
  }

  /**
   * Clique sur "Gerer les utilisateurs"
   */
  async clickManageUsers(): Promise<void> {
    await this.viewUsersLink.click()
  }

  /**
   * Clique sur "Gerer les abonnements"
   */
  async clickManageSubscriptions(): Promise<void> {
    await this.viewSubscriptionsLink.click()
  }

  /**
   * Recupere le nombre total d'entreprises affiche
   */
  async getTotalCompanies(): Promise<string | null> {
    const companiesText = this.page
      .locator('text=Entreprises')
      .locator('..')
      .locator('..')
      .locator('[class*="text-2xl"], [class*="text-3xl"]')
    if (await companiesText.first().isVisible()) {
      return await companiesText.first().textContent()
    }
    return null
  }

  /**
   * Recupere le MRR affiche
   */
  async getMrr(): Promise<string | null> {
    const mrrText = this.page
      .locator('text=MRR')
      .locator('..')
      .locator('..')
      .locator('[class*="text-2xl"], [class*="text-3xl"]')
    if (await mrrText.first().isVisible()) {
      return await mrrText.first().textContent()
    }
    return null
  }

  /**
   * Recupere le taux de churn affiche
   */
  async getChurnRate(): Promise<string | null> {
    const churnText = this.page
      .locator('text=Taux churn')
      .locator('..')
      .locator('..')
      .locator('[class*="text-2xl"], [class*="text-3xl"]')
    if (await churnText.first().isVisible()) {
      return await churnText.first().textContent()
    }
    return null
  }

  /**
   * Verifie le titre de la page
   */
  async expectPageTitle(): Promise<void> {
    await expect(this.page).toHaveTitle(/dashboard admin/i)
  }

  /**
   * Verifie que le resume plateforme contient les bonnes valeurs
   */
  async expectPlatformSummaryContains(text: string): Promise<void> {
    await expect(this.page.locator(`text=${text}`)).toBeVisible()
  }

  /**
   * Verifie l'indicateur de sante du churn
   */
  async expectChurnHealthIndicator(): Promise<void> {
    // Le churn devrait avoir un indicateur de sante
    const healthIndicator = this.page.locator(
      'text=/Retention saine|Attention requise/i'
    )
    await expect(healthIndicator).toBeVisible()
  }
}
