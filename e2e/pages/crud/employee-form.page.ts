/**
 * Page Object - Employee Form (CRUD)
 *
 * Encapsule les selecteurs et actions pour le formulaire d'employe.
 * Utilise pour creation et edition.
 *
 * @ticket SP-156
 */

import { Page, Locator, expect } from '@playwright/test'

export interface EmployeeFormData {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  position?: string
  department?: string
  teamId?: string
  contractType?: 'CDI' | 'CDD' | 'INTERIM' | 'FREELANCE' | 'APPRENTICE' | 'INTERN'
  employmentType?: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'INTERN'
  hireDate?: string
  endDate?: string
  weeklyHours?: number
  isActive?: boolean
}

export class EmployeeFormPage {
  readonly page: Page

  // ==========================================================================
  // Locators - Elements du formulaire
  // ==========================================================================

  /** Titre de la page */
  readonly pageTitle: Locator

  /** Input prenom */
  readonly firstNameInput: Locator

  /** Input nom */
  readonly lastNameInput: Locator

  /** Input email */
  readonly emailInput: Locator

  /** Input telephone */
  readonly phoneInput: Locator

  /** Input poste */
  readonly positionInput: Locator

  /** Select departement */
  readonly departmentSelect: Locator

  /** Select equipe */
  readonly teamSelect: Locator

  /** Select type contrat */
  readonly contractTypeSelect: Locator

  /** Select type emploi */
  readonly employmentTypeSelect: Locator

  /** Input date embauche */
  readonly hireDateInput: Locator

  /** Input date fin */
  readonly endDateInput: Locator

  /** Input heures hebdomadaires */
  readonly weeklyHoursInput: Locator

  /** Switch actif */
  readonly isActiveSwitch: Locator

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
      name: /nouvel employe|modifier|edition.*employe/i,
    })

    // Champs
    this.firstNameInput = page.getByLabel(/prenom/i)
    this.lastNameInput = page.getByLabel(/nom(?!bre)/i)
    this.emailInput = page.getByLabel(/email/i)
    this.phoneInput = page.getByLabel(/telephone/i)
    this.positionInput = page.getByLabel(/poste|fonction/i)
    this.departmentSelect = page.getByRole('combobox', { name: /departement/i })
    this.teamSelect = page.getByRole('combobox', { name: /equipe/i })
    this.contractTypeSelect = page.getByRole('combobox', { name: /type.*contrat/i })
    this.employmentTypeSelect = page.getByRole('combobox', { name: /type.*emploi/i })
    this.hireDateInput = page.getByLabel(/date.*embauche|debut/i)
    this.endDateInput = page.getByLabel(/date.*fin/i)
    this.weeklyHoursInput = page.getByLabel(/heures.*hebdo/i)
    this.isActiveSwitch = page.getByRole('switch', { name: /actif/i })

    // Actions
    this.submitButton = page.getByRole('button', {
      name: /creer|enregistrer|sauvegarder/i,
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
    await this.page.goto('/app/dashboard/employees/new')
  }

  /**
   * Navigue vers le formulaire d'edition
   */
  async gotoEdit(employeeId: string): Promise<void> {
    await this.page.goto(`/app/dashboard/employees/${employeeId}/edit`)
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
    await expect(this.firstNameInput).toBeVisible()
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
      this.page.locator('text=/employe.*cree|succes|enregistre/i, [data-sonner-toast]')
    ).toBeVisible({ timeout: 10000 })
  }

  // ==========================================================================
  // Actions
  // ==========================================================================

  /**
   * Remplit le formulaire
   */
  async fillForm(data: EmployeeFormData): Promise<void> {
    if (data.firstName) {
      await this.firstNameInput.fill(data.firstName)
    }
    if (data.lastName) {
      await this.lastNameInput.fill(data.lastName)
    }
    if (data.email) {
      await this.emailInput.fill(data.email)
    }
    if (data.phone) {
      await this.phoneInput.fill(data.phone)
    }
    if (data.position) {
      await this.positionInput.fill(data.position)
    }
    if (data.department) {
      await this.departmentSelect.click()
      await this.page.getByRole('option', { name: data.department }).click()
    }
    if (data.teamId) {
      await this.teamSelect.click()
      await this.page.getByRole('option').nth(0).click() // Premier disponible
    }
    if (data.contractType) {
      await this.contractTypeSelect.click()
      await this.page
        .getByRole('option', { name: new RegExp(data.contractType, 'i') })
        .click()
    }
    if (data.employmentType) {
      await this.employmentTypeSelect.click()
      await this.page
        .getByRole('option', { name: new RegExp(data.employmentType, 'i') })
        .click()
    }
    if (data.hireDate) {
      await this.hireDateInput.fill(data.hireDate)
    }
    if (data.endDate) {
      await this.endDateInput.fill(data.endDate)
    }
    if (data.weeklyHours) {
      await this.weeklyHoursInput.fill(data.weeklyHours.toString())
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
   * Annule
   */
  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }

  /**
   * Remplit et soumet
   */
  async fillAndSubmit(data: EmployeeFormData): Promise<void> {
    await this.fillForm(data)
    await this.submit()
  }
}
