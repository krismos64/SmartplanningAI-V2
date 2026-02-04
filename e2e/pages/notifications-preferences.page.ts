/**
 * Page Object pour les tests E2E de la page Préférences Notifications
 *
 * @ticket SP-275
 */

import { Page, Locator, expect } from '@playwright/test'

type NotificationCategory = 'planning' | 'leaves' | 'tasks' | 'system'

export class NotificationsPreferencesPage {
  readonly page: Page

  // Page containers
  readonly pageContainer: Locator
  readonly loadingState: Locator

  // Navigation
  readonly backButton: Locator
  readonly resetButton: Locator

  constructor(page: Page) {
    this.page = page

    // Page containers
    this.pageContainer = page.getByTestId('notifications-page')
    this.loadingState = page.getByTestId('notifications-loading')

    // Navigation
    this.backButton = page.getByRole('link', { name: /Retour aux paramètres/ })
    this.resetButton = page.getByTestId('reset-button')
  }

  /**
   * Navigue vers la page Notifications
   */
  async goto() {
    await this.page.goto('/app/settings/notifications')
  }

  /**
   * Attend que la page soit chargée
   */
  async waitForPageLoad() {
    await expect(this.pageContainer).toBeVisible({ timeout: 10000 })
  }

  /**
   * Retourne au hub paramètres
   */
  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL('**/settings')
  }

  // ========================================================================
  // Category locators
  // ========================================================================

  /**
   * Récupère la carte d'une catégorie
   */
  getCategoryCard(category: NotificationCategory): Locator {
    return this.page.getByTestId(`notification-category-${category}`)
  }

  /**
   * Récupère le switch email d'une catégorie
   */
  getEmailSwitch(category: NotificationCategory): Locator {
    return this.page.getByTestId(`notification-email-${category}`)
  }

  /**
   * Récupère le switch in-app d'une catégorie
   */
  getInAppSwitch(category: NotificationCategory): Locator {
    return this.page.getByTestId(`notification-inapp-${category}`)
  }

  // ========================================================================
  // Actions
  // ========================================================================

  /**
   * Toggle le switch email d'une catégorie
   */
  async toggleEmail(category: NotificationCategory) {
    await this.getEmailSwitch(category).click()
  }

  /**
   * Toggle le switch in-app d'une catégorie
   */
  async toggleInApp(category: NotificationCategory) {
    await this.getInAppSwitch(category).click()
  }

  /**
   * Réinitialise les préférences
   */
  async reset() {
    await this.resetButton.click()
  }

  // ========================================================================
  // Assertions
  // ========================================================================

  /**
   * Vérifie que le header est affiché
   */
  async expectHeaderDisplayed() {
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      'Notifications'
    )
    await expect(
      this.page.getByText(/Configurez vos préférences de notifications/)
    ).toBeVisible()
  }

  /**
   * Vérifie que toutes les catégories sont visibles
   */
  async expectAllCategoriesVisible() {
    await expect(this.getCategoryCard('planning')).toBeVisible()
    await expect(this.getCategoryCard('leaves')).toBeVisible()
    await expect(this.getCategoryCard('tasks')).toBeVisible()
    await expect(this.getCategoryCard('system')).toBeVisible()
  }

  /**
   * Vérifie l'état du switch email
   */
  async expectEmailEnabled(category: NotificationCategory, enabled: boolean) {
    const switchEl = this.getEmailSwitch(category)
    await expect(switchEl).toHaveAttribute(
      'data-state',
      enabled ? 'checked' : 'unchecked'
    )
  }

  /**
   * Vérifie l'état du switch in-app
   */
  async expectInAppEnabled(category: NotificationCategory, enabled: boolean) {
    const switchEl = this.getInAppSwitch(category)
    await expect(switchEl).toHaveAttribute(
      'data-state',
      enabled ? 'checked' : 'unchecked'
    )
  }

  /**
   * Vérifie que toutes les préférences sont activées (par défaut)
   */
  async expectAllPreferencesEnabled() {
    const categories: NotificationCategory[] = [
      'planning',
      'leaves',
      'tasks',
      'system',
    ]
    for (const category of categories) {
      await this.expectEmailEnabled(category, true)
      await this.expectInAppEnabled(category, true)
    }
  }

  /**
   * Vérifie qu'un toast de succès apparaît
   */
  async expectToastSuccess() {
    await expect(
      this.page.getByText('Préférences enregistrées').first()
    ).toBeVisible({ timeout: 5000 })
  }

  /**
   * Vérifie qu'un toast de réinitialisation apparaît
   */
  async expectToastReset() {
    await expect(
      this.page.getByText('Préférences réinitialisées')
    ).toBeVisible({ timeout: 5000 })
  }

  /**
   * Vérifie que le loading state s'affiche
   */
  async expectLoadingState() {
    await expect(this.loadingState).toBeVisible()
  }
}
