/**
 * Login Page Object
 *
 * @description Page Object pour la page de connexion
 * Utilisé par les tests E2E pour l'authentification
 *
 * @ticket SP-141
 */

import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page

  // Form elements
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly rememberMeCheckbox: Locator
  readonly passwordToggleButton: Locator

  // Links
  readonly registerLink: Locator
  readonly forgotPasswordLink: Locator

  // Messages
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Form elements
    this.emailInput = page.getByPlaceholder('vous@entreprise.com')
    this.passwordInput = page.getByPlaceholder('••••••••')
    this.submitButton = page.getByRole('button', { name: 'Se connecter' })
    this.rememberMeCheckbox = page.getByText('Se souvenir de moi')
    this.passwordToggleButton = page.getByRole('button', {
      name: /Afficher le mot de passe/i,
    })

    // Links
    this.registerLink = page.getByRole('link', { name: 'Créer un compte' })
    this.forgotPasswordLink = page.getByRole('link', {
      name: /Mot de passe oublié/i,
    })

    // Messages
    this.errorMessage = page.getByText('Email ou mot de passe incorrect')
  }

  /**
   * Navigate to login page
   */
  async goto(): Promise<void> {
    await this.page.goto('/login')
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await expect(this.emailInput).toBeVisible()
    await expect(this.submitButton).toBeVisible()
  }

  /**
   * Fill login form and submit
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email)
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password)
  }

  /**
   * Submit the form
   */
  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggleButton.click()
  }

  /**
   * Check remember me checkbox
   */
  async checkRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.click()
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click()
  }

  /**
   * Navigate to forgot password page
   */
  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click()
  }

  /**
   * Expect login to succeed and redirect to dashboard
   */
  async expectLoginSuccess(): Promise<void> {
    await expect(this.page.getByText(/Connexion réussie/i)).toBeVisible({
      timeout: 15000,
    })
    await this.page.waitForURL(/\/app\//, { timeout: 30000 })
  }

  /**
   * Expect login to fail with error message
   */
  async expectLoginError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 })
  }

  /**
   * Expect validation error for email
   */
  async expectEmailValidationError(): Promise<void> {
    await expect(
      this.page.getByText(/email.*requis|Email invalide/i)
    ).toBeVisible()
  }

  /**
   * Expect password field to be of specific type
   */
  async expectPasswordType(type: 'password' | 'text'): Promise<void> {
    await expect(this.passwordInput).toHaveAttribute('type', type)
  }
}
