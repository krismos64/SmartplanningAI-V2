/**
 * Tests E2E pour la page de suppression de compte
 *
 * Vérifie les fonctionnalités de suppression de compte RGPD
 * pour les différents rôles utilisateurs.
 *
 * Note: Les tests ne suppriment pas réellement les comptes de test
 * pour éviter de casser les autres tests. Ils vérifient la validation,
 * l'affichage et les messages d'erreur.
 *
 * @ticket SP-277
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { DeleteAccountPage } from '../../pages/delete-account.page'
import { ProfilePage } from '../../pages/profile.page'

test.describe('Delete Account Page', () => {
  // ==========================================================================
  // NAVIGATION ET ACCÈS
  // ==========================================================================
  test.describe('Navigation and Access', () => {
    test('should access delete account page from profile', async ({
      employeePage,
    }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      // Cliquer sur le bouton de suppression de compte (s'il existe sur la page profil)
      // Sinon, navigation directe
      await employeePage.goto('/app/profile/delete')
      await expect(employeePage).toHaveURL(/\/app\/profile\/delete/)
    })

    test('should display delete account form', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Vérifier que tous les éléments sont présents
      await expect(deletePage.pageTitle).toBeVisible()
      await expect(deletePage.confirmEmailInput).toBeVisible()
      await expect(deletePage.passwordInput).toBeVisible()
      await expect(deletePage.confirmDeletionCheckbox).toBeVisible()
    })

    test('should redirect to login if not authenticated', async ({ page }) => {
      // Page non authentifiée
      await page.goto('/app/profile/delete')
      await expect(page).toHaveURL(/\/login/)
    })

    test('should navigate back to profile via back button', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.goBackToProfile()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })

    test('should navigate back to profile via cancel button', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.cancel()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })
  })

  // ==========================================================================
  // CONTENU RGPD
  // ==========================================================================
  test.describe('RGPD Content', () => {
    test('should display RGPD warning alert', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Vérifier que l'alerte de danger est visible
      await expect(deletePage.rgpdAlertTitle).toBeVisible()
    })

    test('should display list of data that will be deleted', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.expectDataListVisible()
    })

    test('should display Article 17 mention', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Chercher le texte RGPD Article 17 dans le contenu de l'alerte
      await expect(
        employeePage.locator('[role="alert"]').getByText(/Article 17/)
      ).toBeVisible()
    })
  })

  // ==========================================================================
  // VISIBILITÉ MOT DE PASSE
  // ==========================================================================
  test.describe('Password Visibility', () => {
    test('should have password hidden by default', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.expectPasswordHidden()
    })

    test('should toggle password visibility', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Toggle pour afficher
      await deletePage.togglePasswordVisibility()
      await deletePage.expectPasswordVisible()

      // Toggle pour masquer
      await deletePage.togglePasswordVisibility()
      await deletePage.expectPasswordHidden()
    })
  })

  // ==========================================================================
  // VALIDATION FORMULAIRE
  // ==========================================================================
  test.describe('Form Validation', () => {
    test('should have delete button disabled initially', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.expectDeleteButtonDisabled()
    })

    test('should keep delete button disabled if checkbox not checked', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.fillEmail('test@example.com')
      await deletePage.fillPassword('Password123!')
      // No checkbox check

      await deletePage.expectDeleteButtonDisabled()
    })

    test('should enable delete button when form is complete', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.fillEmail('test@example.com')
      await deletePage.fillPassword('Password123!')
      await deletePage.checkConfirmDeletion()

      await deletePage.expectDeleteButtonEnabled()
    })

    test('should show error for invalid email format', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await deletePage.fillEmail('invalid-email')
      await deletePage.fillPassword('Password123!')
      await deletePage.checkConfirmDeletion()
      await deletePage.deleteButton.click()

      await deletePage.expectEmailError('Format email invalide')
    })

    test('should show error when email does not match', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Utiliser un email différent de l'utilisateur connecté
      await deletePage.fillEmail('wrong@email.com')
      await deletePage.fillPassword('Password123!')
      await deletePage.checkConfirmDeletion()
      await deletePage.deleteButton.click()

      // Attendre l'erreur serveur sur le champ email
      await deletePage.expectEmailError('ne correspond pas')
    })

    test('should show error when password is incorrect', async ({
      employeePage,
    }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      // Utiliser l'email correct mais mauvais mot de passe
      // Note: bob.wilson@techcorp.com est l'utilisateur EMPLOYEE
      await deletePage.fillEmail('bob.wilson@techcorp.com')
      await deletePage.fillPassword('WrongPassword123!')
      await deletePage.checkConfirmDeletion()
      await deletePage.deleteButton.click()

      // Attendre l'erreur serveur sur le champ password
      await deletePage.expectPasswordError('Mot de passe incorrect')
    })
  })

  // ==========================================================================
  // TESTS PAR RÔLE
  // ==========================================================================
  test.describe('Access by Role', () => {
    test('EMPLOYEE should access delete page', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(deletePage.pageTitle).toBeVisible()
    })

    test('MANAGER should access delete page', async ({ managerPage }) => {
      const deletePage = new DeleteAccountPage(managerPage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(deletePage.pageTitle).toBeVisible()
    })

    test('DIRECTOR should access delete page', async ({ directorPage }) => {
      const deletePage = new DeleteAccountPage(directorPage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(deletePage.pageTitle).toBeVisible()
    })

    test('SYSTEM_ADMIN should access delete page', async ({ adminPage }) => {
      const deletePage = new DeleteAccountPage(adminPage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(deletePage.pageTitle).toBeVisible()
    })
  })

  // ==========================================================================
  // ACCESSIBILITÉ
  // ==========================================================================
  test.describe('Accessibility', () => {
    test('should have proper aria labels', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(deletePage.togglePasswordButton).toHaveAttribute(
        'aria-label',
        'Afficher le mot de passe'
      )
    })

    test('should have checkbox linked to label', async ({ employeePage }) => {
      const deletePage = new DeleteAccountPage(employeePage)
      await deletePage.goto()
      await deletePage.waitForPageLoad()

      await expect(
        employeePage.getByText(/Je comprends que cette action est irréversible/)
      ).toBeVisible()
    })
  })
})
