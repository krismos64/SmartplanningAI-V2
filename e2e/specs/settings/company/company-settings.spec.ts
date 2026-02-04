/**
 * Tests E2E pour la page Paramètres Entreprise
 *
 * @ticket SP-435
 */

import { test, expect } from '../../../fixtures/auth.fixture'
import { CompanySettingsPage } from '../../../pages/company-settings.page'

test.describe('Company Settings Page', () => {
  test.describe('Page Access - RBAC', () => {
    test('should display page for Director', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectPageDisplayed()
    })

    test('should display page for System Admin', async ({ adminPage }) => {
      const companySettings = new CompanySettingsPage(adminPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectPageDisplayed()
    })

    test('should redirect Employee to settings hub', async ({ employeePage }) => {
      await employeePage.goto('/app/settings/company')

      // Should be redirected to settings hub
      await expect(employeePage).toHaveURL(/\/app\/settings$/)
    })

    test('should redirect Manager to settings hub', async ({ managerPage }) => {
      await managerPage.goto('/app/settings/company')

      // Should be redirected to settings hub
      await expect(managerPage).toHaveURL(/\/app\/settings$/)
    })
  })

  test.describe('Page Structure', () => {
    test('should display all sections', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectAllSectionsDisplayed()
    })

    test('should display reset button', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectResetButtonVisible()
    })

    test('should display back button', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.backButton).toBeVisible()
    })

    test('should navigate back to settings hub', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.goBack()
      await expect(directorPage).toHaveURL(/\/app\/settings$/)
    })
  })

  test.describe('Company Info Section', () => {
    test('should display company name input', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.companyNameInput).toBeVisible()
    })

    test('should display company address input', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.companyAddressInput).toBeVisible()
    })
  })

  test.describe('Working Days Section', () => {
    test('should display preset buttons', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.presetMonFri).toBeVisible()
      await expect(companySettings.presetMonSat).toBeVisible()
      await expect(companySettings.presetAllWeek).toBeVisible()
    })

    test('should display all day checkboxes', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      const days = [
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ] as const

      for (const day of days) {
        await expect(companySettings.getDayCheckbox(day)).toBeVisible()
      }
    })

    test('should toggle day when clicking checkbox', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Check initial state (Monday should be checked by default)
      const mondayCheckbox = companySettings.getDayCheckbox('MONDAY')
      const initialState = await mondayCheckbox.isChecked()

      // Saturday is likely unchecked, toggle it
      const saturdayCheckbox = companySettings.getDayCheckbox('SATURDAY')
      const saturdayInitial = await saturdayCheckbox.isChecked()

      await companySettings.toggleDay('SATURDAY')

      // Wait for state update
      await directorPage.waitForTimeout(500)

      // State should have changed
      const saturdayFinal = await saturdayCheckbox.isChecked()
      expect(saturdayFinal).not.toBe(saturdayInitial)
    })

    test('should apply Mon-Fri preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.selectPresetMonFri()

      // Wait for state update
      await directorPage.waitForTimeout(500)

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
      ])
    })

    test('should apply Mon-Sat preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.selectPresetMonSat()

      // Wait for state update
      await directorPage.waitForTimeout(500)

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ])
    })

    test('should apply All Week preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.selectPresetAllWeek()

      // Wait for state update
      await directorPage.waitForTimeout(500)

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ])
    })
  })

  test.describe('Working Hours Section', () => {
    test('should display working hours inputs', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.workingHoursStartInput).toBeVisible()
      await expect(companySettings.workingHoursEndInput).toBeVisible()
    })

    test('should display lunch break toggle', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await expect(companySettings.lunchBreakToggle).toBeVisible()
    })

    test('should show lunch break hours when enabled', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Check if lunch break is disabled initially
      const isEnabled = await companySettings.lunchBreakToggle.isChecked()

      if (!isEnabled) {
        await companySettings.toggleLunchBreak()
        await directorPage.waitForTimeout(500)
      }

      await companySettings.expectLunchBreakEnabled()
    })

    test('should hide lunch break hours when disabled', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Enable first if not enabled
      const isEnabled = await companySettings.lunchBreakToggle.isChecked()

      if (isEnabled) {
        await companySettings.toggleLunchBreak()
        await directorPage.waitForTimeout(500)
      }

      await companySettings.expectLunchBreakDisabled()
    })
  })

  test.describe('Reset Functionality', () => {
    test('should reset settings when clicking reset button', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Modify some settings first
      await companySettings.selectPresetMonSat()
      await directorPage.waitForTimeout(500)

      // Click reset
      await companySettings.clickReset()
      await directorPage.waitForTimeout(1000)

      // Should be back to default (Mon-Fri)
      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
      ])
    })
  })
})
