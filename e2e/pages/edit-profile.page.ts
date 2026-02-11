/**
 * Page Object pour les tests E2E de la page d'édition du profil
 *
 * @ticket SP-271
 */

import { Page, Locator, expect } from '@playwright/test'

export class EditProfilePage {
  readonly page: Page

  // Formulaire
  readonly form: Locator
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly phoneInput: Locator

  // Erreurs
  readonly firstNameError: Locator
  readonly lastNameError: Locator
  readonly phoneError: Locator

  // Messages
  readonly systemAdminNotice: Locator

  // Actions
  readonly backLink: Locator
  readonly cancelButton: Locator
  readonly submitButton: Locator

  // Page
  readonly pageContainer: Locator
  readonly loadingSkeleton: Locator

  constructor(page: Page) {
    this.page = page

    // Formulaire
    this.form = page.getByTestId('edit-profile-form-element')
    this.firstNameInput = page.getByTestId('input-firstName')
    this.lastNameInput = page.getByTestId('input-lastName')
    this.phoneInput = page.getByTestId('input-phone')

    // Erreurs
    this.firstNameError = page.getByTestId('error-firstName')
    this.lastNameError = page.getByTestId('error-lastName')
    this.phoneError = page.getByTestId('error-phone')

    // Messages
    this.systemAdminNotice = page.getByTestId('system-admin-notice')

    // Actions
    this.backLink = page.getByTestId('back-to-profile')
    this.cancelButton = page.getByTestId('cancel-button')
    this.submitButton = page.getByTestId('submit-button')

    // Page
    this.pageContainer = page.getByTestId('edit-profile-page')
    this.loadingSkeleton = page.getByTestId('edit-profile-loading')
  }

  /**
   * Naviguer vers la page d'édition du profil
   */
  async goto() {
    await this.page.goto('/app/profile/edit')
  }

  /**
   * Attendre que la page soit chargée
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded')
    await expect(this.pageContainer).toBeVisible({ timeout: 15000 })
    await expect(this.firstNameInput).toBeVisible()
  }

  /**
   * Remplir le formulaire complet
   */
  async fillForm(data: {
    firstName?: string
    lastName?: string
    phone?: string
  }) {
    if (data.firstName !== undefined) {
      await this.firstNameInput.clear()
      if (data.firstName) {
        await this.firstNameInput.fill(data.firstName)
      }
    }
    if (data.lastName !== undefined) {
      await this.lastNameInput.clear()
      if (data.lastName) {
        await this.lastNameInput.fill(data.lastName)
      }
    }
    if (data.phone !== undefined) {
      await this.phoneInput.clear()
      if (data.phone) {
        await this.phoneInput.fill(data.phone)
      }
    }
  }

  /**
   * Soumettre le formulaire
   */
  async submit() {
    await this.submitButton.click()
  }

  /**
   * Annuler et retourner au profil
   */
  async cancel() {
    await this.cancelButton.click()
  }

  /**
   * Cliquer sur le lien retour
   */
  async goBack() {
    await this.backLink.click()
  }

  /**
   * Vérifier les valeurs des champs
   */
  async expectFormValues(data: {
    firstName: string
    lastName: string
    phone?: string
  }) {
    await expect(this.firstNameInput).toHaveValue(data.firstName)
    await expect(this.lastNameInput).toHaveValue(data.lastName)
    if (data.phone !== undefined) {
      await expect(this.phoneInput).toHaveValue(data.phone)
    }
  }

  /**
   * Vérifier qu'une erreur de validation s'affiche
   */
  async expectValidationError(
    field: 'firstName' | 'lastName' | 'phone',
    message: string
  ) {
    const errorLocator =
      field === 'firstName'
        ? this.firstNameError
        : field === 'lastName'
          ? this.lastNameError
          : this.phoneError

    await expect(errorLocator).toContainText(message)
  }

  /**
   * Vérifier que le champ téléphone n'est pas visible (SYSTEM_ADMIN)
   */
  async expectPhoneFieldHidden() {
    await expect(this.phoneInput).not.toBeVisible()
  }

  /**
   * Vérifier que le message SYSTEM_ADMIN est affiché
   */
  async expectSystemAdminNotice() {
    await expect(this.systemAdminNotice).toBeVisible()
    await expect(this.systemAdminNotice).toContainText(
      "En tant qu'administrateur système"
    )
  }

  /**
   * Vérifier que le bouton submit est désactivé
   */
  async expectSubmitDisabled() {
    await expect(this.submitButton).toBeDisabled()
  }

  /**
   * Vérifier que le bouton submit est activé
   */
  async expectSubmitEnabled() {
    await expect(this.submitButton).toBeEnabled()
  }

  /**
   * Vérifier l'état de chargement
   */
  async expectLoadingState() {
    await expect(this.submitButton).toContainText('Enregistrement...')
    await expect(this.submitButton).toBeDisabled()
  }

  /**
   * Attendre un toast de succès
   * Note: Le timeout est augmenté pour les environnements CI qui peuvent être plus lents.
   * On utilise aussi une regex pour être plus flexible sur le texte exact.
   */
  async expectSuccessToast() {
    await expect(
      this.page.getByText(/Profil mis à jour avec succès/i)
    ).toBeVisible({ timeout: 15000 })
  }

  /**
   * Attendre la redirection vers le profil
   * Note: Le timeout est augmenté pour les environnements CI qui peuvent être plus lents.
   */
  async expectRedirectToProfile() {
    await expect(this.page).toHaveURL(/\/app\/profile$/, { timeout: 15000 })
  }

  /**
   * Attendre le succès de la mise à jour (toast OU redirection)
   *
   * Cette méthode est plus robuste car elle attend soit le toast de succès,
   * soit la redirection vers le profil. Cela gère les cas où la redirection
   * est plus rapide que l'affichage du toast.
   */
  async expectUpdateSuccess() {
    // Attendre soit le toast, soit la redirection (premier qui arrive)
    // Note: On utilise domcontentloaded car SSE maintient la connexion ouverte
    // Timeout augmenté à 30s pour les environnements CI lents (nightly)
    await Promise.race([
      this.page
        .getByText(/Profil mis à jour avec succès/i)
        .waitFor({ state: 'visible', timeout: 30000 }),
      this.page.waitForURL(/\/app\/profile$/, {
        timeout: 30000,
        waitUntil: 'domcontentloaded',
      }),
    ])
  }
}
