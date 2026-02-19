/**
 * Page Object - Schedules (Plannings)
 *
 * Encapsule les sélecteurs et actions pour la page des plannings.
 *
 * @ticket SP-406
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

  // Navigation
  readonly navPrev: Locator
  readonly navNext: Locator
  readonly navToday: Locator
  readonly dateRangeLabel: Locator
  readonly viewModeSelect: Locator

  // Filtres et options
  readonly filtersButton: Locator
  readonly availabilityToggle: Locator

  // Stats
  readonly statsTotal: Locator
  readonly statsEmployees: Locator
  readonly statsConfirmed: Locator
  readonly statsDraft: Locator

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
    this.schedulesPage = page.getByTestId('schedules-page')
    this.scheduleCalendar = page.getByTestId('schedule-calendar')

    // Header
    this.title = page.getByTestId('schedules-title')
    this.newShiftButton = page.getByTestId('new-shift-button')
    this.exportButton = page.getByTestId('export-button')

    // Navigation
    this.navPrev = page.getByTestId('nav-prev')
    this.navNext = page.getByTestId('nav-next')
    this.navToday = page.getByTestId('nav-today')
    this.dateRangeLabel = page.getByTestId('date-range-label').first()
    this.viewModeSelect = page.getByTestId('view-mode-select')

    // Filtres et options
    this.filtersButton = page.getByTestId('filters-button')
    this.availabilityToggle = page.getByTestId('availability-toggle')

    // Stats
    this.statsTotal = page.getByTestId('stats-total')
    this.statsEmployees = page.getByTestId('stats-employees')
    this.statsConfirmed = page.getByTestId('stats-confirmed')
    this.statsDraft = page.getByTestId('stats-draft')

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

  async navigateNext() {
    const currentLabel = await this.dateRangeLabel.textContent()
    await this.navNext.click()
    return currentLabel
  }

  async navigatePrev() {
    const currentLabel = await this.dateRangeLabel.textContent()
    await this.navPrev.click()
    return currentLabel
  }

  async goToToday() {
    await this.navToday.click()
  }

  async setViewMode(mode: 'day' | 'week' | 'month') {
    await this.viewModeSelect.click()
    const label = mode === 'day' ? 'Jour' : mode === 'week' ? 'Semaine' : 'Mois'
    await this.page.getByRole('option', { name: label }).click()
  }

  async clickNewShift() {
    await this.newShiftButton.click()
    await this.shiftModal.waitFor({ state: 'visible' })
  }

  async openExportDropdown() {
    await this.exportButton.click()
  }

  async toggleAvailabilities() {
    await this.availabilityToggle.click()
  }

  async openFilters() {
    await this.filtersButton.click()
  }
}
