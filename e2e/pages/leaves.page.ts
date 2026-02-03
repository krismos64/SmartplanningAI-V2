/**
 * Page Object pour les tests E2E de la page Congés
 *
 * @ticket SP-416
 * @description Encapsule les interactions avec la page /app/dashboard/leaves
 */

import { Page, Locator, expect } from '@playwright/test'

export interface CreateLeaveData {
  type:
    | 'PAID_LEAVE'
    | 'RTT'
    | 'SICK_LEAVE'
    | 'UNPAID_LEAVE'
    | 'FAMILY_EVENT'
    | 'PARENTAL_LEAVE'
    | 'OTHER'
  startDate: Date
  endDate: Date
  reason?: string
}

export class LeavesPage {
  readonly page: Page

  // Locators - Page principale
  readonly createButton: Locator
  readonly listTab: Locator
  readonly calendarTab: Locator
  readonly filterStatus: Locator
  readonly filterType: Locator
  readonly filterReset: Locator
  readonly leavesListTab: Locator
  readonly leavesCalendarTab: Locator
  readonly leavesCalendar: Locator

  // Locators - Formulaire création
  readonly leaveForm: Locator
  readonly typeSelect: Locator
  readonly datePicker: Locator
  readonly reasonInput: Locator
  readonly submitButton: Locator

  // Locators - Review dialog
  readonly reviewComment: Locator
  readonly approveButton: Locator
  readonly rejectButton: Locator

  // Locators - Calendrier
  readonly calendarMonthYear: Locator

  constructor(page: Page) {
    this.page = page

    // Page principale (use first() because there might be duplicate buttons for mobile/desktop)
    this.createButton = page.getByTestId('create-leave-button').first()
    this.listTab = page.getByRole('tab', { name: /liste/i })
    this.calendarTab = page.getByRole('tab', { name: /calendrier/i })
    this.filterStatus = page.getByTestId('filter-status')
    this.filterType = page.getByTestId('filter-type')
    this.filterReset = page.getByTestId('filter-reset')
    this.leavesListTab = page.getByTestId('leaves-list-tab')
    this.leavesCalendarTab = page.getByTestId('leaves-calendar-tab')
    this.leavesCalendar = page.getByTestId('leaves-calendar')

    // Formulaire
    this.leaveForm = page.getByTestId('leave-request-form')
    this.typeSelect = page.getByTestId('leave-type-select')
    this.datePicker = page.getByTestId('leave-date-picker')
    this.reasonInput = page.getByTestId('leave-reason')
    this.submitButton = page.getByTestId('leave-submit')

    // Review dialog
    this.reviewComment = page.getByTestId('review-comment')
    this.approveButton = page.getByTestId('approve-button')
    this.rejectButton = page.getByTestId('reject-button')

    // Calendrier
    this.calendarMonthYear = page.getByTestId('calendar-month-year')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  async goto() {
    await this.page.goto('/app/dashboard/leaves')
    // Use domcontentloaded instead of networkidle because SSE keeps connection open
    await this.page.waitForLoadState('domcontentloaded')
    // Wait for page content to be ready (heading is always unique)
    await this.page.getByRole('heading', { name: /congés/i }).waitFor({ state: 'visible', timeout: 20000 })
  }

  async gotoBalances() {
    await this.page.goto('/app/dashboard/leaves/balances')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoDetail(id: string) {
    await this.page.goto(`/app/dashboard/leaves/${id}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ==========================================================================
  // Tabs
  // ==========================================================================

  async switchToListView() {
    await this.listTab.click()
    await expect(this.leavesListTab).toBeVisible()
  }

  async switchToCalendarView() {
    await this.calendarTab.click()
    await expect(this.leavesCalendarTab).toBeVisible()
  }

  // ==========================================================================
  // Filtres
  // ==========================================================================

  async filterByStatus(status: string) {
    await this.filterStatus.click()
    await this.page.getByRole('option', { name: status }).click()
  }

  async filterByType(type: string) {
    await this.filterType.click()
    await this.page.getByRole('option', { name: type }).click()
  }

  async resetFilters() {
    if (await this.filterReset.isVisible()) {
      await this.filterReset.click()
    }
  }

  // ==========================================================================
  // Liste des demandes
  // ==========================================================================

  async getRequestsCount(): Promise<number> {
    const cards = this.page.getByTestId(/^leave-request-card-/)
    return await cards.count()
  }

  async getRequestCard(id: string): Promise<Locator> {
    return this.page.getByTestId(`leave-request-card-${id}`)
  }

  async clickFirstRequest() {
    const firstCard = this.page.getByTestId(/^leave-request-card-/).first()
    await firstCard.click()
  }

  // ==========================================================================
  // Création de demande
  // ==========================================================================

  async openCreateModal() {
    await this.createButton.click()
    await expect(this.leaveForm).toBeVisible()
  }

  async selectLeaveType(type: string) {
    await this.typeSelect.click()
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click()
  }

  async selectDates(startDate: Date, endDate: Date) {
    await this.datePicker.click()

    // Sélectionner la date de début
    const startDay = startDate.getDate().toString()
    await this.page
      .getByRole('gridcell', { name: new RegExp(`^${startDay}$`) })
      .first()
      .click()

    // Si les dates sont différentes, sélectionner la fin
    if (startDate.getTime() !== endDate.getTime()) {
      const endDay = endDate.getDate().toString()
      await this.page
        .getByRole('gridcell', { name: new RegExp(`^${endDay}$`) })
        .first()
        .click()
    }
  }

  async fillReason(reason: string) {
    await this.reasonInput.fill(reason)
  }

  async submitCreateForm() {
    await this.submitButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async createRequest(data: CreateLeaveData) {
    await this.openCreateModal()
    await this.selectLeaveType(data.type.replace('_', ' '))
    await this.selectDates(data.startDate, data.endDate)
    if (data.reason) {
      await this.fillReason(data.reason)
    }
    await this.submitCreateForm()
  }

  // ==========================================================================
  // Actions Manager - Review
  // ==========================================================================

  async approveRequest() {
    await this.approveButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async rejectRequest(comment: string) {
    await this.reviewComment.fill(comment)
    await this.rejectButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ==========================================================================
  // Soldes (Director)
  // ==========================================================================

  async editBalance(employeeId: string, cpTotal: number, rttTotal: number) {
    const editButton = this.page.getByTestId(`edit-balance-${employeeId}`)
    await editButton.click()

    await this.page.getByTestId('cp-total-input').fill(cpTotal.toString())
    await this.page.getByTestId('rtt-total-input').fill(rttTotal.toString())

    await this.page.getByRole('button', { name: /enregistrer/i }).click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  // ==========================================================================
  // Calendrier
  // ==========================================================================

  async navigateToNextMonth() {
    await this.page.getByRole('button', { name: /mois suivant/i }).click()
  }

  async navigateToPreviousMonth() {
    await this.page.getByRole('button', { name: /mois précédent/i }).click()
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  async expectToastSuccess(message?: string) {
    const toast = this.page.locator('[data-sonner-toast]').first()
    await expect(toast).toBeVisible({ timeout: 10000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectToastError(message?: string) {
    const toast = this.page.locator('[data-sonner-toast][data-type="error"]')
    await expect(toast).toBeVisible({ timeout: 10000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectRequestStatus(status: string) {
    await expect(this.page.getByText(status)).toBeVisible()
  }
}
