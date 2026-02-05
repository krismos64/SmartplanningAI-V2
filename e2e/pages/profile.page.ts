/**
 * Page Object pour les tests E2E de la page Profil
 *
 * @ticket SP-270
 */

import { Page, Locator, expect } from '@playwright/test'

export class ProfilePage {
  readonly page: Page

  // Header
  readonly profileName: Locator
  readonly profileEmail: Locator
  readonly profileRole: Locator
  readonly avatarInitials: Locator

  // Personal Info Card
  readonly personalInfoCard: Locator
  readonly personalEmail: Locator
  readonly personalPhone: Locator
  readonly personalFullname: Locator

  // Professional Info Card
  readonly proInfoCard: Locator
  readonly proJobTitle: Locator
  readonly proTeam: Locator
  readonly proHireDate: Locator
  readonly proHours: Locator

  // Account Info Card
  readonly accountInfoCard: Locator
  readonly accountStatus: Locator
  readonly emailVerified: Locator
  readonly emailNotVerified: Locator
  readonly accountCreated: Locator
  readonly accountLastLogin: Locator

  // Actions Card
  readonly actionsCard: Locator
  readonly editProfileButton: Locator
  readonly changePasswordButton: Locator
  readonly exportDataButton: Locator
  readonly deleteAccountButton: Locator

  constructor(page: Page) {
    this.page = page

    // Header
    this.profileName = page.getByTestId('profile-name')
    this.profileEmail = page.getByTestId('profile-email')
    this.profileRole = page.getByTestId('profile-role')
    this.avatarInitials = page.locator('[data-testid="profile-name"]').locator('..')

    // Personal Info Card
    this.personalInfoCard = page.locator('text=Informations personnelles').locator('..')
    this.personalEmail = page.getByTestId('personal-email')
    this.personalPhone = page.getByTestId('personal-phone')
    this.personalFullname = page.getByTestId('personal-fullname')

    // Professional Info Card
    this.proInfoCard = page.locator('text=Informations professionnelles').locator('..')
    this.proJobTitle = page.getByTestId('pro-jobtitle')
    this.proTeam = page.getByTestId('pro-team')
    this.proHireDate = page.getByTestId('pro-hiredate')
    this.proHours = page.getByTestId('pro-hours')

    // Account Info Card
    this.accountInfoCard = page.locator('text=Informations du compte').locator('..')
    this.accountStatus = page.getByTestId('account-status')
    this.emailVerified = page.getByTestId('email-verified')
    this.emailNotVerified = page.getByTestId('email-not-verified')
    this.accountCreated = page.getByTestId('account-created')
    this.accountLastLogin = page.getByTestId('account-lastlogin')

    // Actions Card
    this.actionsCard = page.locator('text=Actions').locator('..')
    this.editProfileButton = page.getByTestId('action-edit-profile')
    this.changePasswordButton = page.getByTestId('action-change-password')
    this.exportDataButton = page.getByTestId('action-export-data')
    this.deleteAccountButton = page.getByTestId('action-delete-account')
  }

  async goto() {
    await this.page.goto('/app/profile')
  }

  async waitForPageLoad() {
    await expect(this.profileName).toBeVisible({ timeout: 10000 })
  }

  async expectHeaderDisplayed(name: string, email: string) {
    await expect(this.profileName).toHaveText(name)
    await expect(this.profileEmail).toHaveText(email)
  }

  async expectRoleDisplayed(role: string) {
    await expect(this.profileRole).toHaveText(role)
  }

  async expectPersonalInfoDisplayed(email: string) {
    await expect(this.personalEmail).toHaveText(email)
  }

  async expectPhoneDisplayed(phone: string) {
    await expect(this.personalPhone).toHaveText(phone)
  }

  async expectPhoneNotSet() {
    await expect(this.personalPhone).toHaveText('Non renseigné')
  }

  async expectProfessionalInfoDisplayed(data: {
    jobTitle?: string | null
    team?: string | null
    hireDate?: string | null
    hours?: string
  }) {
    if (data.jobTitle) {
      await expect(this.proJobTitle).toHaveText(data.jobTitle)
    } else if (data.jobTitle === null) {
      await expect(this.proJobTitle).toHaveText('Non renseigné')
    }

    if (data.team) {
      await expect(this.proTeam).toHaveText(data.team)
    } else if (data.team === null) {
      await expect(this.proTeam).toHaveText('Aucune équipe')
    }

    if (data.hireDate) {
      await expect(this.proHireDate).toHaveText(data.hireDate)
    } else if (data.hireDate === null) {
      await expect(this.proHireDate).toHaveText('Non renseignée')
    }

    if (data.hours) {
      await expect(this.proHours).toHaveText(data.hours)
    }
  }

  async expectAccountStatusActive() {
    await expect(this.accountStatus).toHaveText('Actif')
  }

  async expectAccountStatusInactive() {
    await expect(this.accountStatus).toHaveText('Inactif')
  }

  async expectEmailVerified() {
    await expect(this.emailVerified).toHaveText('Oui')
  }

  async expectEmailNotVerified() {
    await expect(this.emailNotVerified).toHaveText('Non')
  }

  async expectAllActionsDisplayed() {
    await expect(this.editProfileButton).toBeVisible()
    await expect(this.changePasswordButton).toBeVisible()
    await expect(this.exportDataButton).toBeVisible()
    await expect(this.deleteAccountButton).toBeVisible()
  }

  async clickEditProfile() {
    await this.editProfileButton.click()
  }

  async clickChangePassword() {
    await this.changePasswordButton.click()
  }

  async clickExportData() {
    await this.exportDataButton.click()
  }

  async clickDeleteAccount() {
    await this.deleteAccountButton.click()
  }
}
