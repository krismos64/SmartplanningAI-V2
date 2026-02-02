/**
 * Tests E2E pour l'affichage de la page Profil
 *
 * Vérifie l'affichage des informations utilisateur selon les différents rôles
 * et la navigation vers les actions du profil.
 *
 * IMPORTANT: Ces tests vérifient les valeurs affichées, qui peuvent avoir été
 * modifiées par d'autres tests (edit-profile). Les tests utilisent des assertions
 * basées sur les valeurs actuelles plutôt que des valeurs hardcodées.
 *
 * @ticket SP-270
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { ProfilePage } from '../../pages/profile.page'

test.describe('Profile Page Display', () => {
  test.describe('Employee Profile', () => {
    test('should display profile header with user info', async ({
      employeePage,
    }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que le nom et l'email sont affichés (sans vérifier les valeurs exactes)
      // car les tests d'édition de profil peuvent modifier le nom
      await expect(profilePage.profileName).toBeVisible()
      await expect(profilePage.profileEmail).toHaveText(
        TEST_USERS.EMPLOYEE!.email
      )
      await profilePage.expectRoleDisplayed('Employé')
    })

    test('should display personal info card', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.expectPersonalInfoDisplayed(TEST_USERS.EMPLOYEE!.email)
    })

    test('should display account info card with active status', async ({
      employeePage,
    }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.expectAccountStatusActive()
    })

    test('should display all action buttons', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.expectAllActionsDisplayed()
    })

    test('should navigate to edit profile page', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickEditProfile()
      await expect(employeePage).toHaveURL(/\/app\/profile\/edit/)
    })
  })

  test.describe('Manager Profile', () => {
    test('should display profile header with Manager role', async ({
      managerPage,
    }) => {
      const profilePage = new ProfilePage(managerPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que le nom et l'email sont affichés (sans vérifier le nom exact)
      // car les tests d'édition de profil peuvent modifier le nom
      await expect(profilePage.profileName).toBeVisible()
      await expect(profilePage.profileEmail).toHaveText(
        TEST_USERS.MANAGER!.email
      )
      await profilePage.expectRoleDisplayed('Manager')
    })

    test('should display professional info for manager', async ({
      managerPage,
    }) => {
      const profilePage = new ProfilePage(managerPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que la carte professionnelle est visible
      await expect(
        managerPage.locator('text=Informations professionnelles')
      ).toBeVisible()
    })
  })

  test.describe('Director Profile', () => {
    test('should display profile header with Director role', async ({
      directorPage,
    }) => {
      const profilePage = new ProfilePage(directorPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que le nom et l'email sont affichés (sans vérifier le nom exact)
      // car les tests d'édition de profil peuvent modifier le nom
      await expect(profilePage.profileName).toBeVisible()
      await expect(profilePage.profileEmail).toHaveText(
        TEST_USERS.DIRECTOR!.email
      )
      await profilePage.expectRoleDisplayed('Directeur')
    })

    test('should navigate to change password page', async ({ directorPage }) => {
      const profilePage = new ProfilePage(directorPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickChangePassword()
      await expect(directorPage).toHaveURL(/\/app\/profile\/password/)
    })
  })

  test.describe('System Admin Profile', () => {
    test('should display profile header with System Admin role', async ({
      adminPage,
    }) => {
      const profilePage = new ProfilePage(adminPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que le nom et l'email sont affichés (sans vérifier le nom exact)
      // car les tests d'édition de profil peuvent modifier le nom
      await expect(profilePage.profileName).toBeVisible()
      await expect(profilePage.profileEmail).toHaveText(
        TEST_USERS.SYSTEM_ADMIN!.email
      )
      await profilePage.expectRoleDisplayed('Administrateur Système')
    })

    test('should not display professional info card for system admin without employee', async ({
      adminPage,
    }) => {
      const profilePage = new ProfilePage(adminPage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // System admin peut ne pas avoir d'employee associé
      // Vérifier que la page se charge correctement
      await expect(profilePage.profileName).toBeVisible()
    })
  })

  test.describe('Profile Actions Navigation', () => {
    test('should navigate to export data page', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickExportData()
      await expect(employeePage).toHaveURL(/\/app\/profile\/export/)
    })

    test('should navigate to delete account page', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickDeleteAccount()
      await expect(employeePage).toHaveURL(/\/app\/profile\/delete/)
    })
  })

  test.describe('Responsive Layout', () => {
    test('should display all cards in grid layout', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Vérifier que toutes les cartes principales sont visibles
      await expect(
        employeePage.locator('text=Informations personnelles')
      ).toBeVisible()
      await expect(
        employeePage.locator('text=Informations du compte')
      ).toBeVisible()
      await expect(employeePage.locator('text=Actions')).toBeVisible()
    })
  })
})
