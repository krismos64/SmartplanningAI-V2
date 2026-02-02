/**
 * Tests E2E pour la page d'édition du profil
 *
 * Vérifie les fonctionnalités d'édition des informations personnelles
 * pour les différents rôles utilisateurs.
 *
 * IMPORTANT: Ces tests sont idempotents - les valeurs originales sont
 * restaurées après les tests qui modifient les données.
 *
 * @ticket SP-271
 */

import { Page } from '@playwright/test'

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { EditProfilePage } from '../../pages/edit-profile.page'
import { ProfilePage } from '../../pages/profile.page'

// ============================================================================
// HELPERS POUR RESTAURER LES VALEURS ORIGINALES
// ============================================================================

/**
 * Valeurs originales des utilisateurs de test (seed)
 * À maintenir synchronisé avec prisma/seed.ts
 */
const ORIGINAL_VALUES = {
  EMPLOYEE: { firstName: 'Bob', lastName: 'Wilson', phone: '' },
  MANAGER: { firstName: 'Jane', lastName: 'Smith', phone: '' },
  DIRECTOR: { firstName: 'John', lastName: 'Doe', phone: '' },
  SYSTEM_ADMIN: { firstName: 'Super', lastName: 'Admin', phone: '' },
}

/**
 * Restaure le profil d'un utilisateur à ses valeurs originales
 * Utilisé pour garantir l'idempotence des tests E2E
 */
async function restoreProfile(
  page: Page,
  role: keyof typeof ORIGINAL_VALUES
): Promise<void> {
  const editPage = new EditProfilePage(page)

  // Navigate et attendre
  await editPage.goto()

  // Attendre que la page soit chargée avec un timeout plus long
  await editPage.page.waitForTimeout(500)

  try {
    await editPage.waitForPageLoad()
  } catch {
    // Si le chargement échoue, on abandonne silencieusement
    return
  }

  const originalValues = ORIGINAL_VALUES[role]

  // Vérifier si les valeurs sont déjà correctes
  const currentFirstName = await editPage.firstNameInput.inputValue()
  const currentLastName = await editPage.lastNameInput.inputValue()

  if (
    currentFirstName === originalValues.firstName &&
    currentLastName === originalValues.lastName
  ) {
    return // Pas besoin de restaurer
  }

  // Restaurer les valeurs
  await editPage.fillForm({
    firstName: originalValues.firstName,
    lastName: originalValues.lastName,
  })

  // Restaurer le téléphone si le champ est visible (employés avec profil Employee)
  const isPhoneVisible = await editPage.phoneInput.isVisible()
  if (isPhoneVisible) {
    await editPage.fillForm({ phone: originalValues.phone })
  }

  await editPage.submit()

  // Attendre la redirection vers le profil
  await editPage.page.waitForURL(/\/app\/profile$/, { timeout: 5000 }).catch(() => {})
}

test.describe('Edit Profile Page', () => {
  // ==========================================================================
  // NAVIGATION ET ACCÈS
  // ==========================================================================
  test.describe('Navigation and Access', () => {
    test('should navigate to edit page from profile', async ({ employeePage }) => {
      const profilePage = new ProfilePage(employeePage)
      await profilePage.goto()
      await profilePage.waitForPageLoad()

      await profilePage.clickEditProfile()
      await expect(employeePage).toHaveURL(/\/app\/profile\/edit/)
    })

    test('should display edit form with current values', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Vérifier que les champs sont pré-remplis
      await expect(editPage.firstNameInput).not.toHaveValue('')
      await expect(editPage.lastNameInput).not.toHaveValue('')
    })

    test('should display phone field for employee', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await expect(editPage.phoneInput).toBeVisible()
    })

    test('should navigate back to profile via back link', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.goBack()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })

    test('should navigate back to profile via cancel button', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.cancel()
      await expect(employeePage).toHaveURL(/\/app\/profile$/)
    })
  })

  // ==========================================================================
  // MODIFICATION DU PROFIL - EMPLOYEE
  // ==========================================================================
  test.describe('Edit Profile - Employee', () => {
    test('should update firstName and lastName successfully', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Modifier les champs (uniquement lettres, pas de chiffres)
      const newFirstName = 'Pierre'
      const newLastName = 'Martin'

      await editPage.fillForm({
        firstName: newFirstName,
        lastName: newLastName,
      })

      // Le bouton devrait être activé après modification
      await editPage.expectSubmitEnabled()

      // Soumettre
      await editPage.submit()

      // Vérifier le toast et la redirection
      await editPage.expectSuccessToast()
      await editPage.expectRedirectToProfile()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(employeePage, 'EMPLOYEE')
    })

    test('should update phone number successfully', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Modifier le prénom aussi pour activer le bouton (le téléphone préexistant peut être invalide)
      await editPage.fillForm({
        firstName: 'Marcel',
        phone: '0698765432',
      })

      await editPage.expectSubmitEnabled()
      await editPage.submit()

      await editPage.expectSuccessToast()
      await editPage.expectRedirectToProfile()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(employeePage, 'EMPLOYEE')
    })

    test('should allow clearing phone number', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Modifier un autre champ pour pouvoir soumettre puis effacer le téléphone
      await editPage.fillForm({
        firstName: 'Jacques',
        phone: '',
      })

      await editPage.submit()
      await editPage.expectSuccessToast()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(employeePage, 'EMPLOYEE')
    })
  })

  // ==========================================================================
  // VALIDATION
  // ==========================================================================
  test.describe('Form Validation', () => {
    test('should show error for firstName too short', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.fillForm({ firstName: 'J' })
      await editPage.lastNameInput.focus() // Trigger blur

      await editPage.expectValidationError('firstName', 'Minimum 2 caractères')
    })

    test('should show error for empty lastName', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.fillForm({ lastName: '' })
      await editPage.firstNameInput.focus() // Trigger blur

      await editPage.expectValidationError('lastName', 'Minimum 2 caractères')
    })

    test('should show error for invalid phone format', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.fillForm({ phone: '123' })
      await editPage.firstNameInput.focus() // Trigger blur

      await editPage.expectValidationError('phone', 'Numéro invalide')
    })

    test('should accept valid phone format with +33', async ({ employeePage }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // D'abord effacer le téléphone existant (qui peut avoir des espaces)
      await editPage.fillForm({
        firstName: 'François',
        phone: '+33612345678',
      })

      // Attendre un peu que la validation se fasse
      await editPage.page.waitForTimeout(500)

      // Pas d'erreur affichée pour le téléphone
      const phoneError = editPage.page.getByTestId('error-phone')
      await expect(phoneError).not.toBeVisible()
      // Note: Ce test ne soumet pas, donc pas de modification persistante
    })

    test('should disable submit button when form is unchanged', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Sans modification, le bouton doit être désactivé
      await editPage.expectSubmitDisabled()
    })
  })

  // ==========================================================================
  // SYSTEM ADMIN (SANS EMPLOYEE)
  // ==========================================================================
  test.describe('System Admin Profile', () => {
    test('should hide phone field for system admin', async ({ adminPage }) => {
      const editPage = new EditProfilePage(adminPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.expectPhoneFieldHidden()
    })

    test('should display system admin notice', async ({ adminPage }) => {
      const editPage = new EditProfilePage(adminPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await editPage.expectSystemAdminNotice()
    })

    test('should update firstName and lastName for system admin', async ({
      adminPage,
    }) => {
      const editPage = new EditProfilePage(adminPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Get current values first
      const currentFirstName = await editPage.firstNameInput.inputValue()
      const currentLastName = await editPage.lastNameInput.inputValue()

      // Use different values to trigger form dirty state
      const newFirstName =
        currentFirstName === 'Administrateur' ? 'Admin' : 'Administrateur'
      const newLastName =
        currentLastName === 'Système' ? 'System' : 'Système'

      await editPage.fillForm({
        firstName: newFirstName,
        lastName: newLastName,
      })

      await editPage.submit()
      await editPage.expectSuccessToast()
      await editPage.expectRedirectToProfile()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(adminPage, 'SYSTEM_ADMIN')
    })
  })

  // ==========================================================================
  // DIRECTOR
  // ==========================================================================
  test.describe('Director Profile', () => {
    test('should display phone field for director', async ({ directorPage }) => {
      const editPage = new EditProfilePage(directorPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await expect(editPage.phoneInput).toBeVisible()
    })

    test('should update profile successfully', async ({ directorPage }) => {
      const editPage = new EditProfilePage(directorPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Get current values and use different ones to trigger dirty state
      const currentFirstName = await editPage.firstNameInput.inputValue()
      const newFirstName =
        currentFirstName === 'Directeur' ? 'DirecteurTest' : 'Directeur'

      await editPage.fillForm({
        firstName: newFirstName,
        phone: '0611111111',
      })

      await editPage.submit()
      await editPage.expectSuccessToast()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(directorPage, 'DIRECTOR')
    })
  })

  // ==========================================================================
  // MANAGER
  // ==========================================================================
  test.describe('Manager Profile', () => {
    test('should display phone field for manager', async ({ managerPage }) => {
      const editPage = new EditProfilePage(managerPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      await expect(editPage.phoneInput).toBeVisible()
    })

    test('should update profile successfully', async ({ managerPage }) => {
      const editPage = new EditProfilePage(managerPage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Get current values and use different ones to trigger dirty state
      const currentFirstName = await editPage.firstNameInput.inputValue()
      const newFirstName =
        currentFirstName === 'Responsable' ? 'ResponsableTest' : 'Responsable'

      await editPage.fillForm({
        firstName: newFirstName,
        phone: '0622222222',
      })

      await editPage.submit()
      await editPage.expectSuccessToast()

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(managerPage, 'MANAGER')
    })
  })

  // ==========================================================================
  // ANNULATION ET RETOUR
  // ==========================================================================
  test.describe('Cancel and Return', () => {
    test('should not save changes when clicking cancel', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Noter la valeur initiale
      const initialFirstName = await editPage.firstNameInput.inputValue()

      // Modifier
      await editPage.fillForm({ firstName: 'ShouldNotSave' })

      // Annuler
      await editPage.cancel()

      // Revenir à l'édition
      await editPage.goto()
      await editPage.waitForPageLoad()

      // La valeur devrait être l'initiale
      await expect(editPage.firstNameInput).toHaveValue(initialFirstName)
      // Note: Ce test ne soumet pas, donc pas de modification persistante
    })

    test('should preserve form values during session', async ({
      employeePage,
    }) => {
      const editPage = new EditProfilePage(employeePage)
      await editPage.goto()
      await editPage.waitForPageLoad()

      // Sauvegarder une modification (nom valide sans chiffres)
      const newName = 'Préservé'
      await editPage.fillForm({ firstName: newName })
      await editPage.submit()

      await editPage.expectRedirectToProfile()

      // Revenir à l'édition
      await editPage.goto()
      await editPage.waitForPageLoad()

      // La nouvelle valeur devrait être chargée
      await expect(editPage.firstNameInput).toHaveValue(newName)

      // RESTAURATION: Remettre les valeurs originales
      await restoreProfile(employeePage, 'EMPLOYEE')
    })
  })
})
