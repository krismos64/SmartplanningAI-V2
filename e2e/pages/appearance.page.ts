/**
 * Page Object pour les tests E2E de la page Apparence
 *
 * @ticket SP-276 - Préférences Affichage
 */

import { Page, Locator, expect } from '@playwright/test'

export class AppearancePage {
  readonly page: Page

  // Page containers
  readonly appearancePage: Locator
  readonly loadingState: Locator

  // Theme selector
  readonly themeSelector: Locator
  readonly themeOptionSystem: Locator
  readonly themeOptionLight: Locator
  readonly themeOptionDark: Locator

  // Date/Time format selector
  readonly dateTimeFormatSelector: Locator
  readonly dateFormatSelect: Locator
  readonly timeFormatSelect: Locator

  // Preview section
  readonly preferencesPreview: Locator
  readonly previewDate: Locator
  readonly previewTime: Locator
  readonly previewDateTime: Locator

  // Navigation
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page

    // Page containers — scoped to #main-content to avoid strict mode violation
    // when React renders duplicate testids during hydration
    this.appearancePage = page.locator('#main-content').getByTestId('appearance-page')
    this.loadingState = page.getByTestId('appearance-loading')

    // Theme selector
    this.themeSelector = page.getByTestId('theme-selector')
    this.themeOptionSystem = page.getByTestId('theme-option-system')
    this.themeOptionLight = page.getByTestId('theme-option-light')
    this.themeOptionDark = page.getByTestId('theme-option-dark')

    // Date/Time format selector
    this.dateTimeFormatSelector = page.getByTestId('datetime-format-selector')
    this.dateFormatSelect = page.getByTestId('date-format-select')
    this.timeFormatSelect = page.getByTestId('time-format-select')

    // Preview section
    this.preferencesPreview = page.getByTestId('preferences-preview')
    this.previewDate = page.getByTestId('preview-date')
    this.previewTime = page.getByTestId('preview-time')
    this.previewDateTime = page.getByTestId('preview-datetime')

    // Navigation
    this.backButton = page.getByRole('link', { name: 'Retour aux paramètres' })
  }

  /**
   * Navigue vers la page Apparence
   */
  async goto() {
    await this.page.goto('/app/parametres/appearance')
  }

  /**
   * Attend que la page soit chargée
   */
  async waitForPageLoad() {
    await expect(this.appearancePage).toBeVisible({ timeout: 10000 })
    await expect(this.themeSelector).toBeVisible()
  }

  /**
   * Vérifie que le header est affiché
   */
  async expectHeaderDisplayed() {
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      'Apparence'
    )
    await expect(
      this.page.getByText("Personnalisez le thème et les formats d'affichage")
    ).toBeVisible()
  }

  /**
   * Vérifie que toutes les sections sont visibles
   */
  async expectAllSectionsVisible() {
    await expect(this.themeSelector).toBeVisible()
    await expect(this.dateTimeFormatSelector).toBeVisible()
    await expect(this.preferencesPreview).toBeVisible()
  }

  /**
   * Sélectionne un thème
   */
  async selectTheme(theme: 'system' | 'light' | 'dark') {
    const optionMap = {
      system: this.themeOptionSystem,
      light: this.themeOptionLight,
      dark: this.themeOptionDark,
    }
    await optionMap[theme].click()
  }

  /**
   * Vérifie que le thème est sélectionné
   */
  async expectThemeSelected(theme: 'system' | 'light' | 'dark') {
    const optionMap = {
      system: this.themeOptionSystem,
      light: this.themeOptionLight,
      dark: this.themeOptionDark,
    }
    await expect(optionMap[theme]).toHaveAttribute('aria-pressed', 'true')
  }

  /**
   * Vérifie le thème appliqué au document
   */
  async expectDocumentTheme(theme: 'light' | 'dark') {
    // next-themes applique la classe sur <html>
    await expect(this.page.locator('html')).toHaveClass(new RegExp(theme))
  }

  /**
   * Sélectionne un format de date
   */
  async selectDateFormat(format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') {
    // Attendre que le select soit enabled (isPending = false apres Server Action)
    await expect(this.dateFormatSelect).toBeEnabled({ timeout: 10000 })
    await this.dateFormatSelect.click()
    await this.page.getByTestId(`date-format-option-${format}`).click()
  }

  /**
   * Vérifie le format de date sélectionné
   */
  async expectDateFormatSelected(
    format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  ) {
    const labelMap = {
      'DD/MM/YYYY': '31/12/2026 (FR)',
      'MM/DD/YYYY': '12/31/2026 (US)',
      'YYYY-MM-DD': '2026-12-31 (ISO)',
    }
    await expect(this.dateFormatSelect).toContainText(labelMap[format])
  }

  /**
   * Sélectionne un format d'heure
   */
  async selectTimeFormat(format: '24h' | '12h') {
    // Attendre que le select soit enabled (isPending = false apres Server Action)
    await expect(this.timeFormatSelect).toBeEnabled({ timeout: 10000 })
    await this.timeFormatSelect.click()
    await this.page.getByTestId(`time-format-option-${format}`).click()
  }

  /**
   * Vérifie le format d'heure sélectionné
   */
  async expectTimeFormatSelected(format: '24h' | '12h') {
    const labelMap = {
      '24h': '14:30 (24h)',
      '12h': '2:30 PM (12h)',
    }
    await expect(this.timeFormatSelect).toContainText(labelMap[format])
  }

  /**
   * Vérifie que la prévisualisation est mise à jour
   */
  async expectPreviewUpdated() {
    // La prévisualisation doit contenir des valeurs non vides
    await expect(this.previewDate).not.toHaveText('—')
    await expect(this.previewTime).not.toHaveText('—')
    await expect(this.previewDateTime).not.toHaveText('—')
  }

  /**
   * Vérifie le format de la prévisualisation de date
   */
  async expectPreviewDateFormat(regex: RegExp) {
    await expect(this.previewDate).toHaveText(regex)
  }

  /**
   * Clique sur le bouton retour
   */
  async goBack() {
    await this.backButton.click()
    await this.page.waitForURL('/app/parametres')
  }

  /**
   * Vérifie que le loading state s'affiche
   */
  async expectLoadingState() {
    await expect(this.loadingState).toBeVisible()
  }
}
