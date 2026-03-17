/**
 * Page Object pour la page de suppression de compte
 *
 * @ticket SP-277
 */

import { type Page, type Locator, expect } from '@playwright/test'

export class DeleteAccountPage {
  readonly page: Page

  // Navigation
  readonly backToProfileButton: Locator
  readonly pageTitle: Locator
  readonly pageDescription: Locator

  // Alerte RGPD
  readonly rgpdAlert: Locator
  readonly rgpdAlertTitle: Locator

  // Formulaire
  readonly confirmEmailInput: Locator
  readonly passwordInput: Locator
  readonly togglePasswordButton: Locator
  readonly confirmDeletionCheckbox: Locator

  // Boutons
  readonly cancelButton: Locator
  readonly deleteButton: Locator

  // Erreurs
  readonly confirmEmailError: Locator
  readonly passwordError: Locator
  readonly confirmDeletionError: Locator

  constructor(page: Page) {
    this.page = page

    // Navigation
    this.backToProfileButton = page.getByTestId('back-to-profile')
    this.pageTitle = page.getByRole('heading', { name: 'Supprimer mon compte' })
    this.pageDescription = page.getByText(/Exercez votre droit à l'effacement/)

    // Alerte RGPD
    this.rgpdAlert = page.getByRole('alert')
    this.rgpdAlertTitle = page.getByText('Attention - Suppression définitive')

    // Formulaire
    this.confirmEmailInput = page.getByTestId('confirm-email-input')
    this.passwordInput = page.getByTestId('password-input')
    this.togglePasswordButton = page.getByTestId('toggle-password-visibility')
    this.confirmDeletionCheckbox = page.getByTestId('confirm-deletion-checkbox')

    // Boutons
    this.cancelButton = page.getByTestId('cancel-button')
    this.deleteButton = page.getByTestId('delete-account-button')

    // Erreurs
    this.confirmEmailError = page.getByTestId('confirm-email-error')
    this.passwordError = page.getByTestId('password-error')
    this.confirmDeletionError = page.getByTestId('confirm-deletion-error')
  }

  /**
   * Navigation vers la page de suppression de compte
   */
  async goto() {
    await this.page.goto('/app/profil/delete')
  }

  /**
   * Attend que la page soit chargée
   */
  async waitForPageLoad() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.confirmEmailInput).toBeVisible()
  }

  /**
   * Remplit le champ email
   */
  async fillEmail(email: string) {
    await this.confirmEmailInput.fill(email)
  }

  /**
   * Remplit le champ mot de passe
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  /**
   * Coche la checkbox de confirmation
   */
  async checkConfirmDeletion() {
    await this.confirmDeletionCheckbox.click()
  }

  /**
   * Toggle la visibilité du mot de passe
   */
  async togglePasswordVisibility() {
    await this.togglePasswordButton.click()
  }

  /**
   * Remplit et soumet le formulaire
   */
  async fillAndSubmit(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.checkConfirmDeletion()
    await this.deleteButton.click()
  }

  /**
   * Clique sur le bouton annuler
   */
  async cancel() {
    await this.cancelButton.click()
  }

  /**
   * Retourne au profil
   */
  async goBackToProfile() {
    await this.backToProfileButton.click()
  }

  /**
   * Vérifie que le bouton de suppression est désactivé
   */
  async expectDeleteButtonDisabled() {
    await expect(this.deleteButton).toBeDisabled()
  }

  /**
   * Vérifie que le bouton de suppression est activé
   */
  async expectDeleteButtonEnabled() {
    await expect(this.deleteButton).toBeEnabled()
  }

  /**
   * Vérifie que le mot de passe est masqué
   */
  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute('type', 'password')
  }

  /**
   * Vérifie que le mot de passe est visible
   */
  async expectPasswordVisible() {
    await expect(this.passwordInput).toHaveAttribute('type', 'text')
  }

  /**
   * Vérifie la redirection vers login avec paramètre deleted
   */
  async expectRedirectToLogin() {
    await expect(this.page).toHaveURL(/\/connexion\?deleted=true/)
  }

  /**
   * Vérifie la redirection vers le profil
   */
  async expectRedirectToProfile() {
    await expect(this.page).toHaveURL(/\/app\/profile$/)
  }

  /**
   * Vérifie qu'une erreur est affichée sur le champ email
   */
  async expectEmailError(message?: string) {
    await expect(this.confirmEmailError).toBeVisible()
    if (message) {
      await expect(this.confirmEmailError).toContainText(message)
    }
  }

  /**
   * Vérifie qu'une erreur est affichée sur le champ password
   */
  async expectPasswordError(message?: string) {
    await expect(this.passwordError).toBeVisible()
    if (message) {
      await expect(this.passwordError).toContainText(message)
    }
  }

  /**
   * Vérifie que l'alerte RGPD est visible
   */
  async expectRgpdAlertVisible() {
    await expect(this.rgpdAlertTitle).toBeVisible()
    await expect(this.page.getByText(/RGPD.*Article 17/)).toBeVisible()
  }

  /**
   * Vérifie que la liste des données supprimées est affichée
   */
  async expectDataListVisible() {
    await expect(
      this.page.getByText(/profil et informations personnelles/)
    ).toBeVisible()
    await expect(this.page.getByText(/plannings et historique/)).toBeVisible()
    await expect(this.page.getByText(/demandes de congés/)).toBeVisible()
    await expect(
      this.page.getByText(/notes et tâches personnelles/)
    ).toBeVisible()
    await expect(this.page.getByText(/notifications/)).toBeVisible()
  }
}
