/**
 * Mobile Command Palette E2E Tests
 *
 * @ticket SP-389 - E2E Mobile Tests
 * @see SP-264 - Command Palette implementation
 * @see Context7 - Playwright mobile testing patterns
 *
 * Tests covering:
 * - Full-screen mode on mobile
 * - Search icon button trigger (mobile-specific)
 * - Close button (X) instead of ESC badge
 * - Input font size 16px (prevents iOS zoom)
 * - Touch target validation
 * - Search and navigation functionality
 */

import { test, expect } from '../../fixtures/mobile.fixture'
import {
  openCommandPaletteMobile,
  closeCommandPalette,
} from '../../fixtures/mobile.fixture'

test.describe('Mobile Command Palette', () => {
  // Skip all tests in this file if not on mobile
  test.beforeEach(async ({ mobile }) => {
    test.skip(!mobile.isMobile, 'Test only runs on mobile devices')
  })

  // =========================================================================
  // OPENING COMMAND PALETTE
  // =========================================================================

  test.describe('Opening', () => {
    test('should open command palette via search icon button', async ({
      directorPage,
    }) => {
      // Mobile search icon should be visible
      const searchButton = directorPage.locator(
        'button[aria-label="Ouvrir la recherche"]'
      )
      await expect(searchButton).toBeVisible()

      // Click to open
      await searchButton.click()

      // Verify dialog is open
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).toBeVisible()
    })

    test('should open command palette via keyboard shortcut Ctrl+K', async ({
      directorPage,
    }) => {
      // Press keyboard shortcut
      await directorPage.keyboard.press('Control+k')

      // Verify dialog is open
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).toBeVisible({ timeout: 5000 })
    })

    test('search icon should have proper touch target (44px)', async ({
      directorPage,
      mobile,
    }) => {
      const searchButton = directorPage.locator(
        'button[aria-label="Ouvrir la recherche"]'
      )
      const result = await mobile.checkTouchTarget(searchButton)

      expect(result.isValid).toBe(true)
      expect(result.width).toBeGreaterThanOrEqual(44)
      expect(result.height).toBeGreaterThanOrEqual(44)
    })
  })

  // =========================================================================
  // FULL-SCREEN MODE
  // =========================================================================

  test.describe('Full-Screen Mode', () => {
    test('command palette should be full-screen on mobile', async ({
      directorPage,
      mobile,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      const box = await dialog.boundingBox()

      expect(box).not.toBeNull()
      if (box) {
        // Should cover full viewport width (with small margin tolerance)
        expect(box.width).toBeGreaterThanOrEqual(mobile.viewportWidth - 20)
        // Should cover most of viewport height
        expect(box.height).toBeGreaterThanOrEqual(mobile.viewportHeight * 0.8)
      }
    })

    test('should show close button (X) instead of ESC badge', async ({
      directorPage,
    }) => {
      await openCommandPaletteMobile(directorPage)

      // Close button should be visible on mobile
      const closeButton = directorPage.locator(
        '[data-testid="command-palette-close"]'
      )
      await expect(closeButton).toBeVisible()

      // ESC badge should not be visible (it's for desktop)
      const escBadge = directorPage.locator('kbd:has-text("ESC")')
      await expect(escBadge).not.toBeVisible()
    })
  })

  // =========================================================================
  // CLOSING COMMAND PALETTE
  // =========================================================================

  test.describe('Closing', () => {
    test('should close via close button (X)', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      // Click close button
      const closeButton = directorPage.locator(
        '[data-testid="command-palette-close"]'
      )
      await closeButton.click()

      // Verify dialog is closed
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).not.toBeVisible()
    })

    test('should close via Escape key', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      // Press Escape
      await directorPage.keyboard.press('Escape')

      // Verify dialog is closed
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).not.toBeVisible()
    })

    test('close button should have proper touch target', async ({
      directorPage,
      mobile,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const closeButton = directorPage.locator(
        '[data-testid="command-palette-close"]'
      )
      const result = await mobile.checkTouchTarget(closeButton)

      expect(result.isValid).toBe(true)
      expect(result.width).toBeGreaterThanOrEqual(44)
      expect(result.height).toBeGreaterThanOrEqual(44)
    })
  })

  // =========================================================================
  // INPUT BEHAVIOR
  // =========================================================================

  test.describe('Input Behavior', () => {
    test('input should have font-size >= 16px to prevent iOS zoom', async ({
      directorPage,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.locator('[data-testid="command-palette-input"]')

      // Get computed font-size
      const fontSize = await input.evaluate((el) => {
        return window.getComputedStyle(el).fontSize
      })

      // Parse the font-size value (e.g., "16px" -> 16)
      const fontSizeValue = parseFloat(fontSize)
      expect(fontSizeValue).toBeGreaterThanOrEqual(16)
    })

    test('input should be focused when palette opens', async ({
      directorPage,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.locator('[data-testid="command-palette-input"]')
      await expect(input).toBeFocused()
    })

    test('input should have proper placeholder', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.getByPlaceholder(
        'Rechercher ou exécuter une commande...'
      )
      await expect(input).toBeVisible()
    })
  })

  // =========================================================================
  // SEARCH & NAVIGATION
  // =========================================================================

  test.describe('Search & Navigation', () => {
    test('should filter results when typing', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.locator('[data-testid="command-palette-input"]')
      await input.fill('collabor')

      // Should show filtered result
      const option = directorPage.getByRole('option', {
        name: /collaborateurs/i,
      })
      await expect(option).toBeVisible()
    })

    test('should show "Aucun résultat" for no matches', async ({
      directorPage,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.locator('[data-testid="command-palette-input"]')
      await input.fill('xyznonexistent123')

      // Should show no results message
      await expect(
        directorPage.getByText('Aucun résultat trouvé.')
      ).toBeVisible()
    })

    test('should navigate when selecting an item', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      const input = directorPage.locator('[data-testid="command-palette-input"]')
      await input.fill('collabor')

      // Click on the result
      await directorPage
        .getByRole('option', { name: /collaborateurs/i })
        .click()

      // Verify navigation
      await expect(directorPage).toHaveURL(/\/employees/)

      // Palette should be closed
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).not.toBeVisible()
    })

    test('result items should have adequate touch targets', async ({
      directorPage,
      mobile,
    }) => {
      await openCommandPaletteMobile(directorPage)

      // Wait for list to be populated
      const list = directorPage.locator('[data-testid="command-palette-list"]')
      await expect(list).toBeVisible()

      // Check first few options
      const options = directorPage.getByRole('option')
      const count = await options.count()

      for (let i = 0; i < Math.min(count, 3); i++) {
        const option = options.nth(i)
        if (await option.isVisible()) {
          const result = await mobile.checkTouchTarget(option)
          // Options should have adequate height for touch
          expect(result.height).toBeGreaterThanOrEqual(40)
        }
      }
    })
  })

  // =========================================================================
  // ACCESSIBILITY
  // =========================================================================

  test.describe('Accessibility', () => {
    test('dialog should have proper ARIA attributes', async ({
      directorPage,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )

      // Check for combobox role on the command container
      const container = directorPage.locator(
        '[data-testid="command-palette-container"]'
      )
      await expect(container).toHaveAttribute('role', 'combobox')
    })

    test('keyboard navigation should work', async ({ directorPage }) => {
      await openCommandPaletteMobile(directorPage)

      // Navigate with arrow keys
      await directorPage.keyboard.press('ArrowDown')
      await directorPage.keyboard.press('ArrowDown')
      await directorPage.keyboard.press('Enter')

      // Should have navigated somewhere (palette closed)
      const dialog = directorPage.locator(
        '[data-testid="command-palette-dialog"]'
      )
      await expect(dialog).not.toBeVisible()
    })
  })
})
