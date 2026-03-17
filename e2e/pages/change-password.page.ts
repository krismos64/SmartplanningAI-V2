/**
 * Page Object pour la page de changement de mot de passe
 *
 * @ticket SP-273
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class ChangePasswordPage {
  readonly page: Page

  // Champs de formulaire
  readonly currentPasswordInput: Locator
  readonly newPasswordInput: Locator
  readonly confirmPasswordInput: Locator

  // Toggles de visibilité
  readonly toggleCurrentPassword: Locator
  readonly toggleNewPassword: Locator
  readonly toggleConfirmPassword: Locator

  // Indicateur de force
  readonly strengthIndicator: Locator
  readonly strengthLabel: Locator
  readonly strengthBar: Locator

  // Boutons
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly backButton: Locator

  // Erreurs
  readonly errorCurrentPassword: Locator
  readonly errorNewPassword: Locator
  readonly errorConfirmPassword: Locator

  constructor(page: Page) {
    this.page = page

    // Champs de formulaire
    this.currentPasswordInput = page.getByTestId('input-currentPassword')
    this.newPasswordInput = page.getByTestId('input-newPassword')
    this.confirmPasswordInput = page.getByTestId('input-confirmNewPassword')

    // Toggles de visibilité
    this.toggleCurrentPassword = page.getByTestId('toggle-currentPassword')
    this.toggleNewPassword = page.getByTestId('toggle-newPassword')
    this.toggleConfirmPassword = page.getByTestId('toggle-confirmNewPassword')

    // Indicateur de force
    this.strengthIndicator = page.getByTestId('password-strength-indicator')
    this.strengthLabel = page.getByTestId('password-strength-label')
    this.strengthBar = page.getByTestId('password-strength-bar')

    // Boutons
    this.submitButton = page.getByTestId('submit-button')
    this.cancelButton = page.getByTestId('cancel-button')
    this.backButton = page.getByTestId('back-button')

    // Erreurs
    this.errorCurrentPassword = page.getByTestId('error-currentPassword')
    this.errorNewPassword = page.getByTestId('error-newPassword')
    this.errorConfirmPassword = page.getByTestId('error-confirmNewPassword')
  }

  /**
   * Navigation vers la page de changement de mot de passe
   */
  async goto() {
    await this.page.goto('/app/profile/password')
  }

  /**
   * Attend que la page soit chargée
   */
  async waitForPageLoad() {
    await expect(this.currentPasswordInput).toBeVisible()
    await expect(this.newPasswordInput).toBeVisible()
    await expect(this.confirmPasswordInput).toBeVisible()
  }

  /**
   * Remplit le formulaire complet
   */
  async fillForm(current: string, newPass: string, confirm: string) {
    await this.currentPasswordInput.fill(current)
    await this.newPasswordInput.fill(newPass)
    await this.confirmPasswordInput.fill(confirm)
  }

  /**
   * Soumet le formulaire
   */
  async submit() {
    await this.submitButton.click()
  }

  /**
   * Clique sur annuler
   */
  async cancel() {
    await this.cancelButton.click()
  }

  /**
   * Clique sur le bouton retour
   */
  async goBack() {
    await this.backButton.click()
  }

  /**
   * Vérifie que le bouton submit est désactivé
   */
  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled()
  }

  /**
   * Vérifie que le bouton submit est activé
   */
  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled()
  }

  /**
   * Vérifie qu'un toast de succès est affiché
   */
  async expectSuccessToast() {
    await expect(
      this.page.getByText('Mot de passe modifié avec succès')
    ).toBeVisible()
  }

  /**
   * Vérifie la redirection vers le profil
   */
  async expectRedirectToProfile() {
    await expect(this.page).toHaveURL(/\/app\/profile$/)
  }

  /**
   * Vérifie le niveau de force du mot de passe
   */
  async expectStrengthLevel(level: 'Faible' | 'Moyen' | 'Fort' | 'Très fort') {
    await expect(this.strengthLabel).toHaveText(level)
  }

  /**
   * Vérifie qu'un critère est rempli
   */
  async expectCriterionMet(index: number) {
    const criterion = this.page.getByTestId(`criterion-${index}`)
    await expect(criterion).toHaveClass(/text-green-600/)
  }

  /**
   * Vérifie qu'un critère n'est pas rempli
   */
  async expectCriterionNotMet(index: number) {
    const criterion = this.page.getByTestId(`criterion-${index}`)
    await expect(criterion).toHaveClass(/text-muted-foreground/)
  }

  /**
   * Vérifie qu'une erreur est affichée sur un champ
   */
  async expectFieldError(
    field: 'currentPassword' | 'newPassword' | 'confirmNewPassword',
    message: string
  ) {
    const errorElement =
      field === 'currentPassword'
        ? this.errorCurrentPassword
        : field === 'newPassword'
          ? this.errorNewPassword
          : this.errorConfirmPassword
    await expect(errorElement).toContainText(message)
  }

  /**
   * Toggle la visibilité d'un champ
   */
  async toggleVisibility(
    field: 'currentPassword' | 'newPassword' | 'confirmNewPassword'
  ) {
    const toggle =
      field === 'currentPassword'
        ? this.toggleCurrentPassword
        : field === 'newPassword'
          ? this.toggleNewPassword
          : this.toggleConfirmPassword
    await toggle.click()
  }

  /**
   * Vérifie le type d'un champ password
   */
  async expectPasswordType(
    field: 'currentPassword' | 'newPassword' | 'confirmNewPassword',
    type: 'password' | 'text'
  ) {
    const input =
      field === 'currentPassword'
        ? this.currentPasswordInput
        : field === 'newPassword'
          ? this.newPasswordInput
          : this.confirmPasswordInput
    await expect(input).toHaveAttribute('type', type)
  }
}
