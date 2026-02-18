/**
 * Tests E2E pour la page de changement de mot de passe
 *
 * Allégé : navigation, formulaire, validation, indicateur de force.
 * Les tests multi-rôles (accès identique pour 4 rôles) et les toggle
 * de visibilité redondants ont été retirés.
 *
 * @ticket SP-273
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { ChangePasswordPage } from '../../pages/change-password.page'
import { ProfilePage } from '../../pages/profile.page'

test.describe('Change Password Page', () => {
  // ==========================================================================
  // NAVIGATION ET AFFICHAGE
  // ==========================================================================

  test('accès depuis le profil et affichage du formulaire', async ({
    employeePage,
  }) => {
    const profilePage = new ProfilePage(employeePage)
    await profilePage.goto()
    await profilePage.waitForPageLoad()

    await employeePage.getByTestId('action-change-password').click()
    await expect(employeePage).toHaveURL(/\/app\/profile\/password/)

    const changePwdPage = new ChangePasswordPage(employeePage)
    await expect(changePwdPage.currentPasswordInput).toBeVisible()
    await expect(changePwdPage.newPasswordInput).toBeVisible()
    await expect(changePwdPage.confirmPasswordInput).toBeVisible()
  })

  test('retour vers le profil via bouton back et cancel', async ({
    employeePage,
  }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.goBack()
    await expect(employeePage).toHaveURL(/\/app\/profile$/)

    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()
    await changePwdPage.cancel()
    await expect(employeePage).toHaveURL(/\/app\/profile$/)
  })

  // ==========================================================================
  // TOGGLE VISIBILITÉ
  // ==========================================================================

  test('toggle visibilité du mot de passe', async ({ employeePage }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.expectPasswordType('currentPassword', 'password')
    await changePwdPage.toggleVisibility('currentPassword')
    await changePwdPage.expectPasswordType('currentPassword', 'text')
    await changePwdPage.toggleVisibility('currentPassword')
    await changePwdPage.expectPasswordType('currentPassword', 'password')
  })

  // ==========================================================================
  // INDICATEUR DE FORCE
  // ==========================================================================

  test('indicateur de force : faible → fort → très fort', async ({
    employeePage,
  }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.newPasswordInput.fill('abc')
    await expect(changePwdPage.strengthIndicator).toBeVisible()
    await changePwdPage.expectStrengthLevel('Faible')

    await changePwdPage.newPasswordInput.fill('AbcDef123')
    await changePwdPage.expectStrengthLevel('Fort')

    await changePwdPage.newPasswordInput.fill('AbcDef123!')
    await changePwdPage.expectStrengthLevel('Très fort')
  })

  test('critères mis à jour en temps réel', async ({ employeePage }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.newPasswordInput.fill('a')
    await changePwdPage.expectCriterionMet(2) // Minuscule
    await changePwdPage.expectCriterionNotMet(0) // 8+ caractères

    await changePwdPage.newPasswordInput.fill('aA1!5678')
    await changePwdPage.expectCriterionMet(0) // 8+ caractères
    await changePwdPage.expectCriterionMet(1) // Majuscule
    await changePwdPage.expectCriterionMet(2) // Minuscule
    await changePwdPage.expectCriterionMet(3) // Chiffre
    await changePwdPage.expectCriterionMet(4) // Spécial
  })

  // ==========================================================================
  // VALIDATION
  // ==========================================================================

  test('bouton submit désactivé quand formulaire pristine', async ({
    employeePage,
  }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.expectSubmitDisabled()
  })

  test('erreur quand mot de passe trop faible', async ({ employeePage }) => {
    const changePwdPage = new ChangePasswordPage(employeePage)
    await changePwdPage.goto()
    await changePwdPage.waitForPageLoad()

    await changePwdPage.fillForm('OldPass123!', 'weak', 'weak')
    await changePwdPage.submit()

    await expect(changePwdPage.errorNewPassword).toContainText('8 caractères')
  })

  test('erreur quand les mots de passe ne correspondent pas', async ({
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

  test('erreur quand ancien et nouveau sont identiques', async ({
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
