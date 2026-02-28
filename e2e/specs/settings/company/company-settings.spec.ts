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

    test('should redirect Employee to settings hub', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/settings/company')

      // Should be redirected to settings hub
      await expect(employeePage).toHaveURL(/\/app\/settings$/, {
        timeout: 15000,
      })
    })

    test('should redirect Manager to settings hub', async ({ managerPage }) => {
      await managerPage.goto('/app/settings/company')

      // Should be redirected to settings hub
      await expect(managerPage).toHaveURL(/\/app\/settings$/, {
        timeout: 15000,
      })
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

    test('should display save button disabled initially', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectSaveButtonDisabled()
    })

    test('should not display cancel button when no changes', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.expectCancelButtonHidden()
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

    test('should toggle day when clicking checkbox', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Saturday is likely unchecked, toggle it
      const saturdayCheckbox = companySettings.getDayCheckbox('SATURDAY')
      const saturdayInitial = await saturdayCheckbox.isChecked()

      await companySettings.toggleDay('SATURDAY')

      // Wait for state update
      await directorPage.waitForTimeout(300)

      // State should have changed locally
      const saturdayFinal = await saturdayCheckbox.isChecked()
      expect(saturdayFinal).not.toBe(saturdayInitial)

      // Save button should be enabled now
      await companySettings.expectSaveButtonEnabled()
    })

    test('should apply Mon-Fri preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // S'assurer que l'etat sauvegarde est Mon-Sat pour que Mon-Fri le rende dirty
      const saturdayAlreadyChecked = await companySettings.getDayCheckbox('SATURDAY').isChecked()
      if (!saturdayAlreadyChecked) {
        // L'etat sauvegarde n'est pas Mon-Sat, on le force
        await companySettings.selectPresetMonSat()
        await expect(companySettings.getDayCheckbox('SATURDAY')).toBeChecked({ timeout: 5000 })
        // Verifier que le save button est enabled avant de cliquer
        await companySettings.expectSaveButtonEnabled()
        await companySettings.clickSave()
        await companySettings.expectSuccessToast()
        await expect(directorPage.locator('[data-sonner-toast]').first()).not.toBeVisible({ timeout: 10000 }).catch(() => {})
        await directorPage.reload()
        await directorPage.waitForLoadState('domcontentloaded')
        await companySettings.waitForPageLoad()
      }

      // L'etat sauvegarde est Mon-Sat, verifier
      await expect(companySettings.getDayCheckbox('SATURDAY')).toBeChecked({ timeout: 5000 })

      // Selectionner Mon-Fri (differe de l'etat sauvegarde Mon-Sat)
      await companySettings.selectPresetMonFri()
      await expect(companySettings.getDayCheckbox('SATURDAY')).not.toBeChecked({ timeout: 5000 })

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
      ])

      // Save button should be enabled (Mon-Fri != saved Mon-Sat)
      await companySettings.expectSaveButtonEnabled()

      // Save to restore Mon-Fri as default for other tests
      await companySettings.clickSave()
      await companySettings.expectSuccessToast()
    })

    test('should apply Mon-Sat preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // S'assurer que l'etat initial est Mon-Fri (sauvegarder si necessaire)
      const saturdayChecked = await companySettings.getDayCheckbox('SATURDAY').isChecked()
      if (saturdayChecked) {
        // L'etat sauvegarde est deja Mon-Sat, sauvegarder Mon-Fri d'abord
        await companySettings.selectPresetMonFri()
        await expect(companySettings.getDayCheckbox('SATURDAY')).not.toBeChecked({ timeout: 5000 })
        await companySettings.clickSave()
        await companySettings.expectSuccessToast()
        await expect(directorPage.locator('[data-sonner-toast]').first()).not.toBeVisible({ timeout: 10000 }).catch(() => {})
        await directorPage.reload()
        await directorPage.waitForLoadState('domcontentloaded')
        await companySettings.waitForPageLoad()
      }

      await companySettings.selectPresetMonSat()
      // Attendre que SATURDAY soit cochee (preuve que le preset a ete applique)
      await expect(companySettings.getDayCheckbox('SATURDAY')).toBeChecked({ timeout: 5000 })

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ])

      // Save button should be enabled
      await companySettings.expectSaveButtonEnabled()
    })

    test('should apply All Week preset', async ({ directorPage }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      await companySettings.selectPresetAllWeek()
      await directorPage.waitForTimeout(300)

      await companySettings.expectWorkingDays([
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
        'SUNDAY',
      ])

      // Save button should be enabled
      await companySettings.expectSaveButtonEnabled()
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

  test.describe('Save Functionality', () => {
    test('should enable save button when making changes', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Initially save should be disabled
      await companySettings.expectSaveButtonDisabled()

      // Make a change
      await companySettings.fillCompanyName('Test Company Name')
      await directorPage.waitForTimeout(300)

      // Save button should now be enabled
      await companySettings.expectSaveButtonEnabled()

      // Cancel button should appear
      await companySettings.expectCancelButtonVisible()
    })

    test('should save changes when clicking save button', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Make a change
      await companySettings.selectPresetMonSat()
      await directorPage.waitForTimeout(300)

      // Click save
      await companySettings.clickSave()

      // Wait for save to complete
      await companySettings.expectSuccessToast('Paramètres enregistrés')

      // Save button should be disabled again
      await companySettings.expectSaveButtonDisabled()
    })

    test('should cancel changes when clicking cancel button', async ({
      directorPage,
    }) => {
      const companySettings = new CompanySettingsPage(directorPage)
      await companySettings.goto()
      await companySettings.waitForPageLoad()

      // Get initial name
      const initialName = await companySettings.companyNameInput.inputValue()

      // Make a change
      await companySettings.fillCompanyName('Different Name')
      await directorPage.waitForTimeout(300)

      // Click cancel
      await companySettings.clickCancel()
      await directorPage.waitForTimeout(300)

      // Should revert to initial value
      await companySettings.expectCompanyName(initialName)

      // Save button should be disabled again
      await companySettings.expectSaveButtonDisabled()
    })
  })
})
