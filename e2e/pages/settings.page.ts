/**
 * Page Object pour les tests E2E de la page Paramètres
 *
 * @ticket SP-274
 */

import { Page, Locator, expect } from '@playwright/test'

export class SettingsPage {
  readonly page: Page

  // Page container
  readonly settingsPage: Locator
  readonly settingsHeader: Locator

  // Sections
  readonly profileSection: Locator
  readonly appearanceSection: Locator
  readonly notificationsSection: Locator
  readonly securitySection: Locator
  readonly companySection: Locator

  // Section titles
  readonly profileTitle: Locator
  readonly appearanceTitle: Locator
  readonly notificationsTitle: Locator
  readonly securityTitle: Locator
  readonly companyTitle: Locator

  // Badges
  // Note: appearanceBadge removed - SP-276 implemented
  readonly notificationsBadge: Locator
  readonly companyBadge: Locator

  constructor(page: Page) {
    this.page = page

    // Page container
    this.settingsPage = page.getByTestId('settings-page')
    this.settingsHeader = page.getByTestId('settings-header')

    // Sections by testid
    this.profileSection = page.getByTestId('settings-section-profile')
    this.appearanceSection = page.getByTestId('settings-section-appearance')
    this.notificationsSection = page.getByTestId('settings-section-notifications')
    this.securitySection = page.getByTestId('settings-section-security')
    this.companySection = page.getByTestId('settings-section-company')

    // Section titles
    this.profileTitle = this.profileSection.locator('h3')
    this.appearanceTitle = this.appearanceSection.locator('h3')
    this.notificationsTitle = this.notificationsSection.locator('h3')
    this.securityTitle = this.securitySection.locator('h3')
    this.companyTitle = this.companySection.locator('h3')

    // Badges "Bientôt"
    // Note: appearanceBadge removed - SP-276 implemented
    this.notificationsBadge = this.notificationsSection.locator('text=Bientôt')
    this.companyBadge = this.companySection.locator('text=Bientôt')
  }

  async goto() {
    await this.page.goto('/app/settings')
  }

  async waitForPageLoad() {
    await expect(this.settingsPage).toBeVisible({ timeout: 10000 })
    await expect(this.settingsHeader).toBeVisible()
  }

  async expectHeaderDisplayed() {
    await expect(this.settingsHeader).toBeVisible()
    await expect(this.page.getByRole('heading', { level: 1 })).toHaveText(
      'Paramètres'
    )
  }

  async expectCommonSectionsDisplayed() {
    await expect(this.profileSection).toBeVisible()
    await expect(this.appearanceSection).toBeVisible()
    await expect(this.notificationsSection).toBeVisible()
    await expect(this.securitySection).toBeVisible()
  }

  async expectCompanySectionDisplayed() {
    await expect(this.companySection).toBeVisible()
  }

  async expectCompanySectionHidden() {
    await expect(this.companySection).not.toBeVisible()
  }

  async expectSectionCount(count: number) {
    const sections = this.page.locator('[data-testid^="settings-section-"]')
    await expect(sections).toHaveCount(count)
  }

  async expectBadgesDisplayed() {
    // Note: Appearance badge has been removed (SP-276)
    // Only Notifications badge remains
    await expect(this.notificationsBadge).toBeVisible()
  }

  async expectProfileSectionClickable() {
    // Le Link enveloppe la Card, donc on cherche le lien parent
    const link = this.page.locator('a[href="/app/profile"]')
    await expect(link).toBeVisible()
  }

  async expectSecuritySectionClickable() {
    // Le Link enveloppe la Card, donc on cherche le lien parent
    const link = this.page.locator('a[href="/app/profile/password"]')
    await expect(link).toBeVisible()
  }

  async expectAppearanceSectionClickable() {
    // SP-276: Appearance section is now active (no longer disabled)
    const link = this.page.locator('a[href="/app/settings/appearance"]')
    await expect(link).toBeVisible()
  }

  async clickAppearanceSection() {
    await this.page.locator('a[href="/app/settings/appearance"]').click()
  }

  async expectNotificationsSectionDisabled() {
    await expect(this.notificationsSection).toHaveClass(/opacity-60/)
    // Should not have a link
    const link = this.notificationsSection.locator('a')
    await expect(link).toHaveCount(0)
  }

  async clickProfileSection() {
    // Click sur le lien parent qui contient la Card
    await this.page.locator('a[href="/app/profile"]').click()
  }

  async clickSecuritySection() {
    // Click sur le lien parent qui contient la Card
    await this.page.locator('a[href="/app/profile/password"]').click()
  }

  async expectGridLayout() {
    const grid = this.settingsPage.locator('.grid')
    await expect(grid).toBeVisible()
  }

  async expectSectionTitles() {
    await expect(this.profileTitle).toHaveText('Profil')
    await expect(this.appearanceTitle).toHaveText('Apparence')
    await expect(this.notificationsTitle).toHaveText('Notifications')
    await expect(this.securityTitle).toHaveText('Sécurité')
  }

  async expectSectionDescriptions() {
    // Utilise des sélecteurs plus spécifiques pour éviter les doublons
    await expect(
      this.profileSection.locator('p', { hasText: 'informations personnelles' })
    ).toBeVisible()
    await expect(
      this.appearanceSection.locator('p', { hasText: 'thème' })
    ).toBeVisible()
    await expect(
      this.notificationsSection.locator('p', { hasText: 'préférences' })
    ).toBeVisible()
    await expect(
      this.securitySection.locator('p', { hasText: 'Mot de passe' })
    ).toBeVisible()
  }
}
