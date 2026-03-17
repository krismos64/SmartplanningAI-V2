/**
 * Page Object - Team Form (CRUD)
 *
 * Encapsule les selecteurs et actions pour le formulaire d'equipe.
 * Utilise pour creation et edition.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export interface TeamFormData {
  name: string
  description?: string
  color?: string
  managerId?: string
}

export class TeamFormPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements du formulaire
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Input nom */
  readonly nameInput: Locator

  /** Textarea description */
  readonly descriptionInput: Locator

  /** Select couleur */
  readonly colorSelect: Locator

  /** Select manager */
  readonly managerSelect: Locator

  /** Bouton soumettre */
  readonly submitButton: Locator

  /** Bouton annuler */
  readonly cancelButton: Locator

  /** Message d'erreur global */
  readonly globalError: Locator

  constructor(page: Page) {
    this.page = page

    // Titre
    this.pageTitle = page.getByRole('heading', {
      name: /nouvelle équipe|nouvelle equipe|modifier.*équipe|modifier.*equipe|edition/i,
    })

    // Champs - utiliser un sélecteur plus précis pour éviter les doublons
    this.nameInput = page.getByRole('textbox', {
      name: /nom de l'équipe|nom de l.équipe/i,
    })
    this.descriptionInput = page.getByLabel(/description/i)
    this.colorSelect = page.getByRole('combobox', { name: /couleur/i })
    this.managerSelect = page.getByRole('combobox', {
      name: /manager|responsable/i,
    })

    // Actions
    this.submitButton = page.getByRole('button', {
      name: /créer|creer|modifier|enregistrer|sauvegarder/i,
    })
    this.cancelButton = page.getByRole('button', { name: /annuler/i })

    // Messages
    this.globalError = page.locator('[role="alert"]')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le formulaire de creation
   */
  async gotoNew(): Promise<void> {
    await this.page.goto('/app/director/teams/new')
  }

  /**
   * Navigue vers le formulaire d'edition
   */
  async gotoEdit(teamId: string): Promise<void> {
    await this.page.goto(`/app/director/teams/${teamId}/edit`)
  }

  /**
   * Attend que le formulaire soit charge
   */
  async waitForLoad(): Promise<void> {
    await expect(this.submitButton).toBeVisible({ timeout: 15000 })
  }

  // ==========================================================================
  // Assertions
  // ==========================================================================

  /**
   * Verifie que le formulaire est affiche
   */
  async expectToBeVisible(): Promise<void> {
    await expect(this.submitButton).toBeVisible()
    await expect(this.nameInput).toBeVisible()
  }

  /**
   * Verifie une erreur de validation
   */
  async expectValidationError(message?: string): Promise<void> {
    const errorLocator = this.page.locator('text=/erreur|invalide|requis/i')
    if (message) {
      await expect(errorLocator.filter({ hasText: message })).toBeVisible()
    } else {
      await expect(errorLocator.first()).toBeVisible()
    }
  }

  /**
   * Verifie une erreur globale
   */
  async expectGlobalError(message?: string): Promise<void> {
    if (message) {
      await expect(this.globalError.filter({ hasText: message })).toBeVisible()
    } else {
      await expect(this.globalError).toBeVisible()
    }
  }

  /**
   * Verifie le succes
   */
  async expectSuccess(): Promise<void> {
    await expect(
      this.page.locator(
        'text=/[eé]quipe.*cr[eé][eé]|succ[eè]s|enregistr[eé]/i, [data-sonner-toast]'
      )
    ).toBeVisible({ timeout: 10000 })
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Remplit le formulaire
   */
  async fillForm(data: TeamFormData): Promise<void> {
    if (data.name) {
      await this.nameInput.fill(data.name)
    }
    if (data.description) {
      await this.descriptionInput.fill(data.description)
    }
    if (data.color) {
      await this.colorSelect.click()
      await this.page.getByRole('option', { name: data.color }).click()
    }
    if (data.managerId) {
      await this.managerSelect.click()
      await this.page.getByRole('option').nth(0).click() // Premier disponible
    }
  }

  /**
   * Soumet le formulaire
   */
  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Annule
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  /**
   * Remplit et soumet
   */
  async fillAndSubmit(data: TeamFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }
}
