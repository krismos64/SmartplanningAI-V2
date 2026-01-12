/**
 * Page Object - Company Form (CRUD)
 *
 * Encapsule les selecteurs et actions pour le formulaire d'entreprise.
 * Utilise pour creation et edition.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export interface CompanyFormData {
  name: string
  slug?: string
  email?: string
  phone?: string
  siret?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  subscriptionPlan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  subscriptionStatus?: 'ACTIVE' | 'TRIAL' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
  maxEmployees?: number
  isActive?: boolean
}

export class CompanyFormPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements du formulaire
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Input nom */
  readonly nameInput: Locator

  /** Input slug */
  readonly slugInput: Locator

  /** Input email */
  readonly emailInput: Locator

  /** Input telephone */
  readonly phoneInput: Locator

  /** Input SIRET */
  readonly siretInput: Locator

  /** Input adresse */
  readonly addressInput: Locator

  /** Input ville */
  readonly cityInput: Locator

  /** Input code postal */
  readonly zipCodeInput: Locator

  /** Input pays */
  readonly countryInput: Locator

  /** Select plan abonnement */
  readonly subscriptionPlanSelect: Locator

  /** Select statut abonnement */
  readonly subscriptionStatusSelect: Locator

  /** Input max employes */
  readonly maxEmployeesInput: Locator

  /** Switch actif */
  readonly isActiveSwitch: Locator

  /** Bouton soumettre */
  readonly submitButton: Locator

  /** Bouton annuler */
  readonly cancelButton: Locator

  /** Message d'erreur global */
  readonly globalError: Locator

  /** Message de succes */
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Titre
    this.pageTitle = page.getByRole('heading', {
      name: /nouvelle entreprise|modifier|edition/i,
    })

    // Champs du formulaire
    this.nameInput = page.getByLabel(/nom.*entreprise|raison sociale/i)
    this.slugInput = page.getByLabel(/slug|identifiant/i)
    this.emailInput = page.getByLabel(/email/i)
    this.phoneInput = page.getByLabel(/telephone/i)
    this.siretInput = page.getByLabel(/siret/i)
    this.addressInput = page.getByLabel(/adresse/i)
    this.cityInput = page.getByLabel(/ville/i)
    this.zipCodeInput = page.getByLabel(/code postal/i)
    this.countryInput = page.getByLabel(/pays/i)
    this.subscriptionPlanSelect = page.getByRole('combobox', { name: /plan/i })
    this.subscriptionStatusSelect = page.getByRole('combobox', {
      name: /statut.*abonnement/i,
    })
    this.maxEmployeesInput = page.getByLabel(/nombre.*max.*employes/i)
    this.isActiveSwitch = page.getByRole('switch', { name: /actif/i })

    // Actions
    this.submitButton = page.getByRole('button', {
      name: /creer|enregistrer|sauvegarder/i,
    })
    this.cancelButton = page.getByRole('button', { name: /annuler/i })

    // Messages
    this.globalError = page.locator('[role="alert"]')
    this.successMessage = page.locator('text=/cree avec succes|modifie/i')
  }

  // ==========================================================================
  // Navigation
  // ==========================================================================

  /**
   * Navigue vers le formulaire de creation
   */
  async gotoNew(): Promise<void> {
    await this.page.goto('/app/admin/companies/new')
  }

  /**
   * Navigue vers le formulaire d'edition
   */
  async gotoEdit(companyId: string): Promise<void> {
    await this.page.goto(`/app/admin/companies/${companyId}`)
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
   * Verifie une erreur de validation sur un champ
   */
  async expectValidationError(
    field: keyof CompanyFormData,
    message?: string
  ): Promise<void> {
    const fieldLocators: Record<keyof CompanyFormData, Locator> = {
      name: this.nameInput,
      slug: this.slugInput,
      email: this.emailInput,
      phone: this.phoneInput,
      siret: this.siretInput,
      address: this.addressInput,
      city: this.cityInput,
      zipCode: this.zipCodeInput,
      country: this.countryInput,
      subscriptionPlan: this.subscriptionPlanSelect,
      subscriptionStatus: this.subscriptionStatusSelect,
      maxEmployees: this.maxEmployeesInput,
      isActive: this.isActiveSwitch,
    }

    const fieldLocator = fieldLocators[field]
    // Chercher le message d'erreur pres du champ
    const errorLocator = fieldLocator
      .locator('..')
      .locator('..')
      .locator('text=/erreur|invalide|requis/i')

    if (message) {
      await expect(errorLocator.filter({ hasText: message })).toBeVisible()
    } else {
      await expect(errorLocator).toBeVisible()
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
    // Soit toast, soit redirection vers liste
    await expect(
      this.page.locator(
        'text=/entreprise.*cree|succes|enregistre/i, [data-sonner-toast]'
      )
    ).toBeVisible({ timeout: 10000 })
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Remplit le formulaire
   */
  async fillForm(data: CompanyFormData): Promise<void> {
    if (data.name) {
      await this.nameInput.fill(data.name)
    }
    if (data.slug) {
      await this.slugInput.fill(data.slug)
    }
    if (data.email) {
      await this.emailInput.fill(data.email)
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone)
    }
    if (data.siret) {
      await this.siretInput.fill(data.siret)
    }
    if (data.address) {
      await this.addressInput.fill(data.address)
    }
    if (data.city) {
      await this.cityInput.fill(data.city)
    }
    if (data.zipCode) {
      await this.zipCodeInput.fill(data.zipCode)
    }
    if (data.country) {
      await this.countryInput.fill(data.country)
    }
    if (data.subscriptionPlan) {
      await this.subscriptionPlanSelect.click()
      await this.page
        .getByRole('option', { name: new RegExp(data.subscriptionPlan, 'i') })
        .click()
    }
    if (data.subscriptionStatus) {
      await this.subscriptionStatusSelect.click()
      await this.page
        .getByRole('option', {
          name: new RegExp(data.subscriptionStatus, 'i'),
        })
        .click()
    }
    if (data.maxEmployees) {
      await this.maxEmployeesInput.fill(data.maxEmployees.toString())
    }
    if (data.isActive !== undefined) {
      const isChecked = await this.isActiveSwitch.isChecked()
      if (isChecked !== data.isActive) {
        await this.isActiveSwitch.click()
      }
    }
  }

  /**
   * Soumet le formulaire
   */
  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Annule et retourne a la liste
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  /**
   * Remplit et soumet le formulaire
   */
  async fillAndSubmit(data: CompanyFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }

  /**
   * Efface un champ
   */
  async clearField(field: keyof CompanyFormData): Promise<void> {
    const fieldLocators: Record<keyof CompanyFormData, Locator> = {
      name: this.nameInput,
      slug: this.slugInput,
      email: this.emailInput,
      phone: this.phoneInput,
      siret: this.siretInput,
      address: this.addressInput,
      city: this.cityInput,
      zipCode: this.zipCodeInput,
      country: this.countryInput,
      subscriptionPlan: this.subscriptionPlanSelect,
      subscriptionStatus: this.subscriptionStatusSelect,
      maxEmployees: this.maxEmployeesInput,
      isActive: this.isActiveSwitch,
    }

    await fieldLocators[field].clear()
  }
}
