/**
 * Page Object pour les tests E2E d'upload d'avatar
 *
 * @ticket SP-272
 */

import { Page, Locator, expect } from '@playwright/test'
import path from 'path'

export class AvatarUploadPage {
  readonly page: Page

  // Avatar Upload component
  readonly avatarUpload: Locator
  readonly dropZone: Locator
  readonly avatarPreview: Locator
  readonly fileInput: Locator
  readonly uploadButton: Locator
  readonly deleteButton: Locator
  readonly instructions: Locator

  // Profile Header
  readonly profileHeader: Locator
  readonly profileName: Locator
  readonly profileEmail: Locator

  // Toast
  readonly toast: Locator

  constructor(page: Page) {
    this.page = page

    // Avatar Upload component
    this.avatarUpload = page.getByTestId('avatar-upload')
    this.dropZone = page.getByTestId('avatar-drop-zone')
    this.avatarPreview = page.getByTestId('avatar-preview')
    this.fileInput = page.getByTestId('avatar-file-input')
    this.uploadButton = page.getByTestId('avatar-upload-button')
    this.deleteButton = page.getByTestId('avatar-delete-button')
    this.instructions = page.getByTestId('avatar-instructions')

    // Profile Header
    this.profileHeader = page.getByTestId('profile-header')
    this.profileName = page.getByTestId('profile-name')
    this.profileEmail = page.getByTestId('profile-email')

    // Toast
    this.toast = page.locator('[data-sonner-toast]').first()
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  async goto() {
    await this.page.goto('/app/profile')
  }

  async waitForPageLoad() {
    await expect(this.profileHeader).toBeVisible({ timeout: 10000 })
    await expect(this.avatarUpload).toBeVisible()
  }

  // ============================================================================
  // ASSERTIONS
  // ============================================================================

  async expectAvatarUploadVisible() {
    await expect(this.avatarUpload).toBeVisible()
    await expect(this.dropZone).toBeVisible()
    await expect(this.uploadButton).toBeVisible()
    await expect(this.instructions).toBeVisible()
  }

  async expectDeleteButtonVisible() {
    await expect(this.deleteButton).toBeVisible()
  }

  async expectDeleteButtonHidden() {
    await expect(this.deleteButton).not.toBeVisible()
  }

  async expectSuccessToast(message?: string) {
    await expect(this.toast).toBeVisible({ timeout: 5000 })
    if (message) {
      await expect(this.toast).toContainText(message)
    }
  }

  async expectErrorToast(message?: string) {
    const errorToast = this.page
      .locator('[data-sonner-toast][data-type="error"]')
      .first()
    await expect(errorToast).toBeVisible({ timeout: 5000 })
    if (message) {
      await expect(errorToast).toContainText(message)
    }
  }

  async expectAvatarImage() {
    const avatarImage = this.avatarPreview.locator('img')
    await expect(avatarImage).toBeVisible()
  }

  async expectNoAvatarImage() {
    const avatarImage = this.avatarPreview.locator('img')
    await expect(avatarImage).not.toBeVisible()
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  async uploadFile(filename: string) {
    // Le fichier doit être dans e2e/fixtures/
    const filePath = path.join(__dirname, '..', 'fixtures', filename)
    await this.fileInput.setInputFiles(filePath)
  }

  async clickUploadButton() {
    await this.uploadButton.click()
  }

  async clickDeleteButton() {
    await this.deleteButton.click()
  }

  async clickDropZone() {
    await this.dropZone.click()
  }

  // ============================================================================
  // TOUCH TARGET COMPLIANCE (WCAG 2.5.5)
  // ============================================================================

  async expectTouchTargetCompliance() {
    // Upload button should be at least ~44x44px (allowing for sub-pixel rendering)
    // WCAG 2.5.5 requires 44px minimum, we allow 43px for browser rounding
    const minSize = 43

    const uploadBox = await this.uploadButton.boundingBox()
    expect(uploadBox).not.toBeNull()
    if (uploadBox) {
      expect(uploadBox.width).toBeGreaterThanOrEqual(minSize)
      expect(uploadBox.height).toBeGreaterThanOrEqual(minSize)
    }

    // Delete button should be at least ~44x44px (if visible)
    const isDeleteVisible = await this.deleteButton.isVisible()
    if (isDeleteVisible) {
      const deleteBox = await this.deleteButton.boundingBox()
      expect(deleteBox).not.toBeNull()
      if (deleteBox) {
        expect(deleteBox.width).toBeGreaterThanOrEqual(minSize)
        expect(deleteBox.height).toBeGreaterThanOrEqual(minSize)
      }
    }
  }
}
