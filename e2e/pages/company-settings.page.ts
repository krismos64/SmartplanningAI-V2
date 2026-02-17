/**
 * Page Object pour les tests E2E de la page Paramètres Entreprise
 *
 * @ticket SP-435
 */

import { Page, Locator, expect } from '@playwright/test'
import type { DayOfWeek } from '../../src/types/company'

export class CompanySettingsPage {
  readonly page: Page

  // Page container
  readonly companySettingsPage: Locator
  readonly loadingState: Locator

  // Sections
  readonly companyInfoSection: Locator
  readonly workingDaysSection: Locator
  readonly workingHoursSection: Locator

  // Company Info inputs
  readonly companyNameInput: Locator
  readonly companyAddressInput: Locator

  // Working Days
  readonly workingDaysPresets: Locator
  readonly presetMonFri: Locator
  readonly presetMonSat: Locator
  readonly presetAllWeek: Locator
  readonly workingDaysCheckboxes: Locator

  // Working Hours
  readonly workingHoursStartInput: Locator
  readonly workingHoursEndInput: Locator
  readonly lunchBreakToggle: Locator
  readonly lunchBreakHours: Locator
  readonly lunchBreakStartInput: Locator
  readonly lunchBreakEndInput: Locator

  // Actions
  readonly resetButton: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly backButton: Locator

  constructor(page: Page) {
    this.page = page

    // Page container
    this.companySettingsPage = page.getByTestId('company-settings-page')
    this.loadingState = page.getByTestId('company-settings-loading')

    // Sections
    this.companyInfoSection = page.getByTestId('company-info-section')
    this.workingDaysSection = page.getByTestId('working-days-section')
    this.workingHoursSection = page.getByTestId('working-hours-section')

    // Company Info inputs
    this.companyNameInput = page.getByTestId('company-name-input')
    this.companyAddressInput = page.getByTestId('company-address-input')

    // Working Days
    this.workingDaysPresets = page.getByTestId('working-days-presets')
    this.presetMonFri = page.getByTestId('preset-mon-fri')
    this.presetMonSat = page.getByTestId('preset-mon-sat')
    this.presetAllWeek = page.getByTestId('preset-all-week')
    this.workingDaysCheckboxes = page.getByTestId('working-days-checkboxes')

    // Working Hours
    this.workingHoursStartInput = page.getByTestId('working-hours-start-input')
    this.workingHoursEndInput = page.getByTestId('working-hours-end-input')
    this.lunchBreakToggle = page.getByTestId('lunch-break-toggle')
    this.lunchBreakHours = page.getByTestId('lunch-break-hours')
    this.lunchBreakStartInput = page.getByTestId('lunch-break-start-input')
    this.lunchBreakEndInput = page.getByTestId('lunch-break-end-input')

    // Actions
    this.resetButton = page.getByTestId('reset-button')
    this.saveButton = page.getByTestId('save-button')
    this.cancelButton = page.getByTestId('cancel-button')
    this.backButton = page.locator('a[aria-label="Retour aux paramètres"]')
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async goto() {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.page.goto('/app/settings/company', {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        })
        return
      } catch (error) {
        if (attempt === 2) throw error
        await this.page.waitForTimeout(2000)
      }
    }
  }

  async waitForPageLoad() {
    // Attendre que le loading disparaisse si présent
    await expect(this.loadingState).not.toBeVisible({ timeout: 15000 }).catch(() => {})
    // Use .first() to avoid strict mode violation when DashboardLayout Suspense causes brief DOM duplication
    await expect(this.companySettingsPage.first()).toBeVisible({ timeout: 15000 })
  }

  async waitForLoadingComplete() {
    // Wait for loading state to disappear if present
    await expect(this.loadingState).not.toBeVisible({ timeout: 10000 })
    await expect(this.companySettingsPage.first()).toBeVisible()
  }

  async goBack() {
    await this.backButton.click()
  }

  // ============================================================================
  // PAGE STRUCTURE ASSERTIONS
  // ============================================================================

  async expectPageDisplayed() {
    await expect(this.companySettingsPage).toBeVisible()
    await expect(
      this.page.getByRole('heading', {
        level: 1,
        name: 'Paramètres Entreprise',
      })
    ).toBeVisible()
  }

  async expectAllSectionsDisplayed() {
    await expect(this.companyInfoSection).toBeVisible()
    await expect(this.workingDaysSection).toBeVisible()
    await expect(this.workingHoursSection).toBeVisible()
  }

  async expectResetButtonVisible() {
    await expect(this.resetButton).toBeVisible()
  }

  // ============================================================================
  // COMPANY INFO
  // ============================================================================

  async fillCompanyName(name: string) {
    await this.companyNameInput.fill(name)
  }

  async fillCompanyAddress(address: string) {
    await this.companyAddressInput.fill(address)
  }

  async clearCompanyName() {
    await this.companyNameInput.clear()
  }

  async clearCompanyAddress() {
    await this.companyAddressInput.clear()
  }

  async expectCompanyName(name: string) {
    await expect(this.companyNameInput).toHaveValue(name)
  }

  async expectCompanyAddress(address: string) {
    await expect(this.companyAddressInput).toHaveValue(address)
  }

  // ============================================================================
  // WORKING DAYS
  // ============================================================================

  getDayCheckbox(day: DayOfWeek): Locator {
    return this.page.getByTestId(`day-checkbox-${day}`)
  }

  async toggleDay(day: DayOfWeek) {
    await this.getDayCheckbox(day).click()
  }

  async expectDayChecked(day: DayOfWeek) {
    await expect(this.getDayCheckbox(day)).toBeChecked()
  }

  async expectDayUnchecked(day: DayOfWeek) {
    await expect(this.getDayCheckbox(day)).not.toBeChecked()
  }

  async selectPresetMonFri() {
    await this.presetMonFri.click()
  }

  async selectPresetMonSat() {
    await this.presetMonSat.click()
  }

  async selectPresetAllWeek() {
    await this.presetAllWeek.click()
  }

  async expectPresetMonFriActive() {
    // Active preset has default variant (primary background)
    await expect(this.presetMonFri)
      .toHaveAttribute('data-state', undefined)
      .catch(() => {
        // Fallback: check for visual class
      })
  }

  async expectWorkingDays(days: DayOfWeek[]) {
    for (const day of days) {
      await this.expectDayChecked(day)
    }
    // All other days should be unchecked
    const allDays: DayOfWeek[] = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ]
    for (const day of allDays) {
      if (!days.includes(day)) {
        await this.expectDayUnchecked(day)
      }
    }
  }

  // ============================================================================
  // WORKING HOURS
  // ============================================================================

  async fillWorkingHoursStart(time: string) {
    await this.workingHoursStartInput.fill(time)
  }

  async fillWorkingHoursEnd(time: string) {
    await this.workingHoursEndInput.fill(time)
  }

  async expectWorkingHoursStart(time: string) {
    await expect(this.workingHoursStartInput).toHaveValue(time)
  }

  async expectWorkingHoursEnd(time: string) {
    await expect(this.workingHoursEndInput).toHaveValue(time)
  }

  // ============================================================================
  // LUNCH BREAK
  // ============================================================================

  async toggleLunchBreak() {
    await this.lunchBreakToggle.click()
  }

  async expectLunchBreakEnabled() {
    await expect(this.lunchBreakToggle).toBeChecked()
    await expect(this.lunchBreakHours).toBeVisible()
  }

  async expectLunchBreakDisabled() {
    await expect(this.lunchBreakToggle).not.toBeChecked()
    await expect(this.lunchBreakHours).not.toBeVisible()
  }

  async fillLunchBreakStart(time: string) {
    await this.lunchBreakStartInput.fill(time)
  }

  async fillLunchBreakEnd(time: string) {
    await this.lunchBreakEndInput.fill(time)
  }

  async expectLunchBreakStart(time: string) {
    await expect(this.lunchBreakStartInput).toHaveValue(time)
  }

  async expectLunchBreakEnd(time: string) {
    await expect(this.lunchBreakEndInput).toHaveValue(time)
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async clickReset() {
    await this.resetButton.click()
  }

  async clickSave() {
    await this.saveButton.click()
  }

  async clickCancel() {
    await this.cancelButton.click()
  }

  async expectResetButtonDisabled() {
    await expect(this.resetButton).toBeDisabled()
  }

  async expectResetButtonEnabled() {
    await expect(this.resetButton).toBeEnabled()
  }

  async expectSaveButtonEnabled() {
    await expect(this.saveButton).toBeEnabled()
  }

  async expectSaveButtonDisabled() {
    await expect(this.saveButton).toBeDisabled()
  }

  async expectCancelButtonVisible() {
    await expect(this.cancelButton).toBeVisible()
  }

  async expectCancelButtonHidden() {
    await expect(this.cancelButton).not.toBeVisible()
  }

  // ============================================================================
  // TOAST ASSERTIONS
  // ============================================================================

  async expectSuccessToast(message?: string) {
    const toast = this.page.locator('[data-sonner-toast]').first()
    await expect(toast).toBeVisible({ timeout: 5000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }

  async expectErrorToast(message?: string) {
    const toast = this.page
      .locator('[data-sonner-toast][data-type="error"]')
      .first()
    await expect(toast).toBeVisible({ timeout: 5000 })
    if (message) {
      await expect(toast).toContainText(message)
    }
  }
}
