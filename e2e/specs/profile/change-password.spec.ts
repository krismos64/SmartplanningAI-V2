/**
 * Tests E2E pour la page de changement de mot de passe
 *
 * Vérifie les fonctionnalités de changement de mot de passe
 * pour les différents rôles utilisateurs.
 *
 * @ticket SP-273
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { ChangePasswordPage } from '../../pages/change-password.page'
import { ProfilePage } from '../../pages/profile.page'

test.describe('Change Password Page', () => {
  // ==========================================================================
  // NAVIGATION ET ACCÈS
  // ==========================================================================
  test.describe('Navigation and Access', () => {
    test('should access change password page from profile', async ({
      employeePage,
    }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Cliquer sur le bouton de changement de mot de passe
      await employeePage.getByTestId('action-change-password').click()
      await expect(employeePage).toHaveURL(/\/app\/profile\/password/)
    })

    test('should display change password form', async ({ employeePage }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Vérifier que tous les champs sont présents
      await expect(changePwdPage.currentPasswordInput).toBeVisible()
      await expect(changePwdPage.newPasswordInput).toBeVisible()
      await expect(changePwdPage.confirmPasswordInput).toBeVisible()
    })

    test('should navigate back to profile via back button', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.goBack()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })

    test('should navigate back to profile via cancel button', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.cancel()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })
  })

  // ==========================================================================
  // VISIBILITÉ MOT DE PASSE
  // ==========================================================================
  test.describe('Password Visibility', () => {
    test('should toggle current password visibility', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Par défaut, password masqué
      await changePwdPage.expectPasswordType('currentPassword', 'password')

      // Toggle pour afficher
      await changePwdPage.toggleVisibility('currentPassword')
      await changePwdPage.expectPasswordType('currentPassword', 'text')

      // Toggle pour masquer
      await changePwdPage.toggleVisibility('currentPassword')
      await changePwdPage.expectPasswordType('currentPassword', 'password')
    })

    test('should toggle new password visibility', async ({ employeePage }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.expectPasswordType('newPassword', 'password')
      await changePwdPage.toggleVisibility('newPassword')
      await changePwdPage.expectPasswordType('newPassword', 'text')
    })

    test('should toggle confirm password visibility', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.expectPasswordType('confirmNewPassword', 'password')
      await changePwdPage.toggleVisibility('confirmNewPassword')
      await changePwdPage.expectPasswordType('confirmNewPassword', 'text')
    })
  })

  // ==========================================================================
  // INDICATEUR DE FORCE
  // ==========================================================================
  test.describe('Password Strength Indicator', () => {
    test('should show weak strength for simple password', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Taper un mot de passe faible
      await changePwdPage.newPasswordInput.fill('abc')

      // L'indicateur doit s'afficher
      await expect(changePwdPage.strengthIndicator).toBeVisible()
      await changePwdPage.expectStrengthLevel('Faible')
    })

    test('should show strong strength for complex password', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Taper un mot de passe fort (sans caractère spécial)
      await changePwdPage.newPasswordInput.fill('AbcDef123')

      await changePwdPage.expectStrengthLevel('Fort')
    })

    test('should show very strong strength for complete password', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Taper un mot de passe très fort (tous les critères)
      await changePwdPage.newPasswordInput.fill('AbcDef123!')

      await changePwdPage.expectStrengthLevel('Très fort')
    })

    test('should update criteria checkmarks in real-time', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      // Vérifier les critères au fur et à mesure
      await changePwdPage.newPasswordInput.fill('a')
      await changePwdPage.expectCriterionMet(2) // Minuscule
      await changePwdPage.expectCriterionNotMet(0) // 8+ caractères
      await changePwdPage.expectCriterionNotMet(1) // Majuscule

      await changePwdPage.newPasswordInput.fill('aA')
      await changePwdPage.expectCriterionMet(1) // Majuscule

      await changePwdPage.newPasswordInput.fill('aA1')
      await changePwdPage.expectCriterionMet(3) // Chiffre

      await changePwdPage.newPasswordInput.fill('aA1!')
      await changePwdPage.expectCriterionMet(4) // Spécial

      await changePwdPage.newPasswordInput.fill('aA1!5678')
      await changePwdPage.expectCriterionMet(0) // 8+ caractères
    })
  })

  // ==========================================================================
  // VALIDATION
  // ==========================================================================
  test.describe('Form Validation', () => {
    test('should disable submit button when form is pristine', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.expectSubmitDisabled()
    })

    test('should show error when new password is too weak', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.fillForm('OldPass123!', 'weak', 'weak')
      await changePwdPage.submit()

      // Erreur sur newPassword
      await expect(changePwdPage.errorNewPassword).toContainText('8 caractères')
    })

    test('should show error when passwords do not match', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.fillForm(
        'OldPass123!',
        'NewPass123!',
        'DifferentPass123!'
      )
      await changePwdPage.submit()

      await expect(changePwdPage.errorConfirmPassword).toContainText(
        'ne correspondent pas'
      )
    })

    test('should show error when using same password', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await changePwdPage.fillForm(
        'SamePass123!',
        'SamePass123!',
        'SamePass123!'
      )
      await changePwdPage.submit()

      await expect(changePwdPage.errorNewPassword).toContainText(
        "différent de l'ancien"
      )
    })
  })

  // ==========================================================================
  // MULTI-RÔLES
  // ==========================================================================
  test.describe('Multi-role Access', () => {
    test('EMPLOYEE can access change password page', async ({
      employeePage,
    }) => {
      const changePwdPage = new ChangePasswordPage(employeePage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await expect(employeePage).toHaveURL(/\/app\/profile\/password/)
    })

    test('MANAGER can access change password page', async ({ managerPage }) => {
      const changePwdPage = new ChangePasswordPage(managerPage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await expect(managerPage).toHaveURL(/\/app\/profile\/password/)
    })

    test('DIRECTOR can access change password page', async ({
      directorPage,
    }) => {
      const changePwdPage = new ChangePasswordPage(directorPage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await expect(directorPage).toHaveURL(/\/app\/profile\/password/)
    })

    test('SYSTEM_ADMIN can access change password page', async ({
      adminPage,
    }) => {
      const changePwdPage = new ChangePasswordPage(adminPage)
      await changePwdPage.goto()
      await changePwdPage.waitForPageLoad()

      await expect(adminPage).toHaveURL(/\/app\/profile\/password/)
    })
  })
})
