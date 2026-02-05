/**
 * Tests E2E pour la page Settings Hub
 *
 * Vérifie l'affichage des sections de paramètres selon les rôles RBAC,
 * la navigation vers les sous-pages et le comportement des sections désactivées.
 *
 * @ticket SP-274
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { SettingsPage } from '../../pages/settings.page'

test.describe('Settings Hub Page', () => {
  test.describe('Page Rendering', () => {
    test('should display settings page with header', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectHeaderDisplayed()
    })

    test('should display sections in grid layout', async ({ employeePage }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectGridLayout()
    })

    test('should display section titles correctly', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectSectionTitles()
    })

    test('should display section descriptions', async ({ employeePage }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectSectionDescriptions()
    })

    test('should not display "Bientôt" badges (all sections implemented)', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      // SP-276: Appearance implemented
      // SP-275: Notifications implemented
      // SP-435: Company implemented
      // No badges should be visible for any section
      await settingsPage.expectNoBadges()
    })

    test('should not display "Bientôt" badges for Director (SP-435)', async ({
      directorPage,
    }) => {
      const settingsPage = new SettingsPage(directorPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      // SP-435: Company section implemented, no more badges
      await settingsPage.expectNoBadges()
    })
  })

  test.describe('RBAC - Employee', () => {
    test('should display 4 sections for Employee', async ({ employeePage }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectCommonSectionsDisplayed()
      await settingsPage.expectCompanySectionHidden()
      await settingsPage.expectSectionCount(4)
    })
  })

  test.describe('RBAC - Manager', () => {
    test('should display 4 sections for Manager (no company)', async ({
      managerPage,
    }) => {
      const settingsPage = new SettingsPage(managerPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectCommonSectionsDisplayed()
      await settingsPage.expectCompanySectionHidden()
      await settingsPage.expectSectionCount(4)
    })
  })

  test.describe('RBAC - Director', () => {
    test('should display 5 sections for Director (with company)', async ({
      directorPage,
    }) => {
      const settingsPage = new SettingsPage(directorPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectCommonSectionsDisplayed()
      await settingsPage.expectCompanySectionDisplayed()
      await settingsPage.expectSectionCount(5)
    })
  })

  test.describe('RBAC - System Admin', () => {
    test('should display 5 sections for System Admin (with company)', async ({
      adminPage,
    }) => {
      const settingsPage = new SettingsPage(adminPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectCommonSectionsDisplayed()
      await settingsPage.expectCompanySectionDisplayed()
      await settingsPage.expectSectionCount(5)
    })
  })

  test.describe('Section Navigation', () => {
    test('should navigate to profile page when clicking Profile section', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.clickProfileSection()
      await expect(employeePage).toHaveURL(/\/app\/profile/)
    })

    test('should navigate to password page when clicking Security section', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.clickSecuritySection()
      await expect(employeePage).toHaveURL(/\/app\/profile\/password/)
    })

    test('should have correct href on Profile section link', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectProfileSectionClickable()
    })

    test('should have correct href on Security section link', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectSecuritySectionClickable()
    })
  })

  test.describe('Disabled and Active Sections', () => {
    test('should show Appearance section as clickable (SP-276)', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectAppearanceSectionClickable()
    })

    test('should navigate to Appearance page when clicking', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.clickAppearanceSection()
      await expect(employeePage).toHaveURL(/\/app\/settings\/appearance/)
    })

    test('should show Notifications section as clickable (SP-275)', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectNotificationsSectionClickable()
    })

    test('should navigate to Notifications page when clicking', async ({
      employeePage,
    }) => {
      const settingsPage = new SettingsPage(employeePage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.clickNotificationsSection()
      await expect(employeePage).toHaveURL(/\/app\/settings\/notifications/)
    })

    test('should show Company section as clickable for Director (SP-435)', async ({
      directorPage,
    }) => {
      const settingsPage = new SettingsPage(directorPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.expectCompanySectionClickable()
    })

    test('should navigate to Company settings page when clicking (SP-435)', async ({
      directorPage,
    }) => {
      const settingsPage = new SettingsPage(directorPage)
      await settingsPage.goto()
      await settingsPage.waitForPageLoad()

      await settingsPage.clickCompanySection()
      await expect(directorPage).toHaveURL(/\/app\/settings\/company/)
    })
  })
})
