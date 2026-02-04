/**
 * Tests E2E pour l'upload d'avatar
 *
 * @ticket SP-272
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { AvatarUploadPage } from '../../pages/avatar-upload.page'

test.describe('Avatar Upload', () => {
  test.describe('Component Display', () => {
    test('should display avatar upload component on profile page', async ({
      employeePage,
    }) => {
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectAvatarUploadVisible()
    })

    test('should display instructions text', async ({ employeePage }) => {
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await expect(avatarPage.instructions).toContainText(
        'Glissez une image ou cliquez'
      )
      await expect(avatarPage.instructions).toContainText('Max 5MB')
    })

    test('should meet WCAG 2.5.5 touch target requirements', async ({
      employeePage,
    }) => {
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectTouchTargetCompliance()
    })
  })

  test.describe('File Upload', () => {
    test.skip('should upload valid image file', async ({ employeePage }) => {
      // Skip: Requires actual Cloudinary setup
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.uploadFile('test-avatar.jpg')
      await avatarPage.expectSuccessToast('Photo de profil mise à jour')
      await avatarPage.expectAvatarImage()
      await avatarPage.expectDeleteButtonVisible()
    })

    test.skip('should show error for invalid file type', async ({
      employeePage,
    }) => {
      // Skip: Requires test fixture file
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.uploadFile('invalid-file.txt')
      await avatarPage.expectErrorToast('Format non supporté')
    })

    test.skip('should show error for file too large', async ({
      employeePage,
    }) => {
      // Skip: Requires large test fixture file
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.uploadFile('large-image.jpg')
      await avatarPage.expectErrorToast('trop volumineux')
    })
  })

  test.describe('Delete Avatar', () => {
    test.skip('should delete avatar when clicking delete button', async ({
      employeePage,
    }) => {
      // Skip: Requires user with existing avatar
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      // Assumes user has an avatar
      await avatarPage.expectDeleteButtonVisible()
      await avatarPage.clickDeleteButton()

      await avatarPage.expectSuccessToast('Photo de profil supprimée')
      await avatarPage.expectNoAvatarImage()
      await avatarPage.expectDeleteButtonHidden()
    })
  })

  test.describe('RBAC - All Roles Can Upload', () => {
    test('Employee can access avatar upload', async ({ employeePage }) => {
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectAvatarUploadVisible()
    })

    test('Manager can access avatar upload', async ({ managerPage }) => {
      const avatarPage = new AvatarUploadPage(managerPage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectAvatarUploadVisible()
    })

    test('Director can access avatar upload', async ({ directorPage }) => {
      const avatarPage = new AvatarUploadPage(directorPage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectAvatarUploadVisible()
    })

    test('Admin can access avatar upload', async ({ adminPage }) => {
      const avatarPage = new AvatarUploadPage(adminPage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      await avatarPage.expectAvatarUploadVisible()
    })
  })

  test.describe('Header Avatar Display', () => {
    test.skip('should display avatar in header after upload', async ({
      employeePage,
    }) => {
      // Skip: Requires actual avatar upload
      const avatarPage = new AvatarUploadPage(employeePage)
      await avatarPage.goto()
      await avatarPage.waitForPageLoad()

      // Upload avatar
      await avatarPage.uploadFile('test-avatar.jpg')
      await avatarPage.expectSuccessToast()

      // Check header avatar
      const headerAvatar = employeePage.locator(
        '[data-testid="user-menu-trigger"] img'
      )
      await expect(headerAvatar).toBeVisible()
    })
  })
})
