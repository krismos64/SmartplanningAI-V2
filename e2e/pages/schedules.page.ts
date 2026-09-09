/**
 * Page Object - Schedules (Plannings)
 *
 * Encapsule les sélecteurs et actions pour la page des plannings.
 *
 * Réécrit en SP-585 : 11 des 21 sélecteurs de la version SP-406 pointaient vers
 * des `data-testid` disparus, dont toute la navigation. Un Page Object dont les
 * sélecteurs pointent dans le vide ne fait échouer aucune configuration, il
 * reste simplement inutilisable, ce qui explique qu'aucun spec ne s'en servait.
 *
 * Les sélecteurs privilégient désormais le rôle et le nom accessible quand ils
 * existent : ils survivent à un changement de classe ou de structure, et un
 * bouton sans nom accessible est de toute façon un défaut à corriger (les
 * flèches de navigation en portent un depuis SP-584).
 *
 * @ticket SP-406, SP-585
 */

import { Page, Locator } from '@playwright/test'

export class SchedulesPage {
  readonly page: Page

  // Conteneurs
  readonly schedulesPage: Locator
  readonly scheduleCalendar: Locator

  // Header
  readonly title: Locator
  readonly newShiftButton: Locator
  readonly exportButton: Locator

  // Sélecteur de vue (boutons à texte visible, masqués sous le point sm)
  readonly viewDayButton: Locator
  readonly viewWeekButton: Locator
  readonly viewMonthButton: Locator

  // Navigation de la grille semaine
  readonly navPrev: Locator
  readonly navNext: Locator
  readonly navToday: Locator
  /** Libellé « 7 sept. au 13 sept. 2026 » de la grille semaine */
  readonly weekRangeHeading: Locator
  /** Tableau employés × jours de la vue semaine */
  readonly weeklyGrid: Locator

  // Export dropdown items
  readonly exportPdf: Locator
  readonly exportExcel: Locator

  // Modal
  readonly shiftModal: Locator
  readonly shiftSaveButton: Locator

  // Alerts
  readonly conflictAlert: Locator

  constructor(page: Page) {
    this.page = page

    // Conteneurs
    // `.first()` : en mode production, le conteneur apparaît deux fois dans le
    // DOM (rendu serveur puis hydratation), et un locator strict échoue. Le
    // défaut ne se voit qu'avec `npm run start`, jamais en dev.
    this.schedulesPage = page.getByTestId('schedules-page').first()
    this.scheduleCalendar = page.getByTestId('schedule-calendar')

    // Header
    this.title = page.getByTestId('schedules-title')
    this.newShiftButton = page.getByTestId('new-shift-button').first()
    this.exportButton = page.getByTestId('export-button')

    // Sélecteur de vue
    this.viewDayButton = page.getByRole('button', { name: 'Jour', exact: true })
    this.viewWeekButton = page.getByRole('button', {
      name: 'Semaine',
      exact: true,
    })
    this.viewMonthButton = page.getByRole('button', {
      name: 'Mois',
      exact: true,
    })

    // Navigation de la grille semaine. Les noms accessibles viennent de SP-584 :
    // avant, ces deux flèches étaient des boutons à icône seule, donc
    // inatteignables autrement que par une classe CSS.
    this.navPrev = page.getByRole('button', { name: 'Semaine précédente' })
    this.navNext = page.getByRole('button', { name: 'Semaine suivante' })
    this.navToday = page.getByRole('button', { name: "Aujourd'hui" })
    this.weekRangeHeading = page.getByRole('heading', { name: /\bau\b/ })
    this.weeklyGrid = page.getByRole('table')

    // Export dropdown items
    this.exportPdf = page.getByTestId('export-pdf')
    this.exportExcel = page.getByTestId('export-excel')

    // Modal
    this.shiftModal = page.getByTestId('shift-modal')
    this.shiftSaveButton = page.getByTestId('shift-save-button')

    // Alerts
    this.conflictAlert = page.getByTestId('conflict-alert')
  }

  async goto() {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.goto('/app/dashboard/schedules', {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        })
        break
      } catch (error) {
        if (attempt === 2) throw error
        await this.page.waitForTimeout(2000)
      }
    }
    await this.waitForLoad()
  }

  async waitForLoad() {
    await this.schedulesPage
      .first()
      .waitFor({ state: 'visible', timeout: 15000 })
  }

  /**
   * Attend que la grille semaine soit rendue et stable.
   *
   * Nécessaire avant toute lecture ou tout clic : en local le serveur de
   * développement recompile sous la charge de plusieurs workers, et la grille
   * disparaît le temps du rechargement. Sans cette attente, un test lit un
   * libellé absent et échoue sur `element(s) not found`, ce qui ressemble à un
   * défaut du produit alors que c'est le harnais.
   */
  async waitForGrid(timeout = 20000) {
    await this.weeklyGrid.waitFor({ state: 'visible', timeout })
    await this.weekRangeHeading.waitFor({ state: 'visible', timeout })
  }

  /** Texte de la plage affichée par la grille semaine, ex. « 7 sept. au 13 sept. 2026 » */
  async weekRangeText(): Promise<string> {
    await this.waitForGrid()
    return (await this.weekRangeHeading.textContent()) ?? ''
  }

  async navigateNext() {
    await this.waitForGrid()
    await this.navNext.click()
  }

  async navigatePrev() {
    await this.waitForGrid()
    await this.navPrev.click()
  }

  async goToToday() {
    await this.waitForGrid()
    await this.navToday.click()
  }

  async setViewMode(mode: 'day' | 'week' | 'month') {
    const button =
      mode === 'day'
        ? this.viewDayButton
        : mode === 'week'
          ? this.viewWeekButton
          : this.viewMonthButton
    await button.click()
  }

  async clickNewShift() {
    await this.newShiftButton.click()
    await this.shiftModal.waitFor({ state: 'visible' })
  }

  async openExportDropdown() {
    await this.exportButton.click()
  }
}
