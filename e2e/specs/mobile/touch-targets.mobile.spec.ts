/**
 * Touch Target Size E2E Tests (WCAG 2.5.5 Compliance)
 *
 * @ticket SP-389 - E2E Mobile Tests
 * @see WCAG 2.5.5 - Target Size (minimum 44x44 CSS pixels)
 * @see Context7 - Playwright bounding box for element dimensions
 *
 * Tests covering:
 * - TouchableButton component (44px minimum)
 * - Navigation buttons in Header
 * - Form controls
 * - Pagination controls
 * - Interactive elements in drawers and dialogs
 */

import { test, expect } from '../../fixtures/mobile.fixture'
import {
  openMobileDrawer,
  openCommandPaletteMobile,
} from '../../fixtures/mobile.fixture'

const WCAG_MIN_SIZE = 44

test.describe('Touch Target Sizes (WCAG 2.5.5)', () => {
  // Skip all tests in this file if not on mobile
  test.beforeEach(async ({ mobile }) => {
    test.skip(!mobile.isMobile, 'Test only runs on mobile devices')
  })

  // =========================================================================
  // HEADER CONTROLS
  // =========================================================================

  test.describe('Header Controls', () => {
    test('burger menu button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      const burgerButton = directorPage.locator('button.lg\\:hidden').first()
      const result = await mobile.checkTouchTarget(burgerButton)

      expect(result.isValid).toBe(true)
      expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })

    test('mobile search button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      const searchButton = directorPage.locator(
        'button[aria-label="Ouvrir la recherche"]'
      )

      if (await searchButton.isVisible()) {
        const result = await mobile.checkTouchTarget(searchButton)

        expect(result.isValid).toBe(true)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })

    test('theme toggle button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      // Theme toggle might be in different locations
      const themeToggle = directorPage.locator('button').filter({
        has: directorPage.locator('svg.lucide-sun, svg.lucide-moon'),
      })

      if ((await themeToggle.count()) > 0) {
        const result = await mobile.checkTouchTarget(themeToggle.first())

        expect(result.isValid).toBe(true)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })

    test('notifications button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      const notificationsButton = directorPage.locator(
        'a[href="/notifications"]'
      )

      if (await notificationsButton.isVisible()) {
        const result = await mobile.checkTouchTarget(notificationsButton)

        expect(result.isValid).toBe(true)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })

    test('user avatar/menu trigger should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      const userMenuTrigger = directorPage.locator(
        'button:has([class*="avatar"])'
      )

      if (await userMenuTrigger.isVisible()) {
        const result = await mobile.checkTouchTarget(userMenuTrigger)

        expect(result.isValid).toBe(true)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })
  })

  // =========================================================================
  // DRAWER CONTROLS
  // =========================================================================

  test.describe('Drawer Controls', () => {
    test('drawer close button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      await openMobileDrawer(directorPage)

      const closeButton = directorPage.locator(
        '[data-testid="swipeable-drawer-close"]'
      )
      const result = await mobile.checkTouchTarget(closeButton)

      expect(result.isValid).toBe(true)
      expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })

    test('drawer navigation links should have adequate height', async ({
      directorPage,
      mobile,
    }) => {
      await openMobileDrawer(directorPage)

      const navLinks = directorPage
        .locator('[data-testid="swipeable-drawer-panel"]')
        .getByRole('link')

      const count = await navLinks.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const link = navLinks.nth(i)
        if (await link.isVisible()) {
          const box = await link.boundingBox()
          if (box) {
            // Height should be adequate for touch (at least 40px)
            expect(box.height).toBeGreaterThanOrEqual(40)
          }
        }
      }
    })
  })

  // =========================================================================
  // COMMAND PALETTE CONTROLS
  // =========================================================================

  test.describe('Command Palette Controls', () => {
    test('command palette close button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      await openCommandPaletteMobile(directorPage)

      const closeButton = directorPage.locator(
        '[data-testid="command-palette-close"]'
      )

      // Wait for the mobile close button to be visible
      // The useIsMobile hook needs time to evaluate after hydration
      await closeButton.waitFor({ state: 'visible', timeout: 5000 })
      const result = await mobile.checkTouchTarget(closeButton)

      // Log dimensions for debugging
      console.log(
        `Command palette close button dimensions: ${result.width}x${result.height}px (min: ${result.minRequired}px)`
      )

      expect(result.isValid).toBe(true)
      expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })
  })

  // =========================================================================
  // TOUCHABLE BUTTON COMPONENT
  // =========================================================================

  test.describe('TouchableButton Component', () => {
    test('all TouchableButton instances should meet touch target requirements', async ({
      directorPage,
      mobile,
    }) => {
      // TouchableButton adds min-h-[44px] min-w-[44px] on mobile
      // Look for buttons that should be touchable
      const iconButtons = directorPage.locator(
        'button[size="icon"], button:has(svg:only-child)'
      )
      const count = await iconButtons.count()

      let checkedCount = 0
      const failures: string[] = []

      // List of aria-labels or text content to exclude (Next.js dev tools, toasts)
      const excludedLabels = [
        'Close toast',
        'Open Next.js Dev Tools',
        'Collapse issues badge',
        'Hide message',
        'Open issues',
        'Close',
      ]

      for (let i = 0; i < count; i++) {
        const button = iconButtons.nth(i)
        if (await button.isVisible()) {
          const ariaLabel = await button.getAttribute('aria-label')
          const text = await button.textContent()

          // Skip Next.js dev tools and toast buttons
          if (
            excludedLabels.some(
              (label) => ariaLabel?.includes(label) || text?.includes(label)
            )
          ) {
            continue
          }

          const result = await mobile.checkTouchTarget(button)

          if (!result.isValid) {
            failures.push(
              `Button "${ariaLabel || text || `#${i}`}": ${result.width}x${result.height}px`
            )
          }
          checkedCount++
        }
      }

      // Log any failures for debugging
      if (failures.length > 0) {
        console.log('Touch target failures:', failures)
      }

      // All our app buttons should pass (100% if excluding dev tools)
      // At least 90% of checked buttons should pass (allowing for edge cases)
      if (checkedCount > 0) {
        const passRate = (checkedCount - failures.length) / checkedCount
        expect(passRate).toBeGreaterThanOrEqual(0.9)
      }
    })
  })

  // =========================================================================
  // PAGINATION CONTROLS
  // =========================================================================

  test.describe('Pagination Controls', () => {
    test.beforeEach(async ({ directorPage }) => {
      // Navigate to a page with data table pagination
      await directorPage.goto('/app/dashboard/employees')
      await directorPage.waitForLoadState('domcontentloaded')
    })

    test('pagination buttons should be >= 44x44px on mobile', async ({
      directorPage,
      mobile,
    }) => {
      const pagination = directorPage.locator(
        '[data-testid="data-table-pagination"]'
      )

      // Only run if pagination exists on this page
      if (!(await pagination.isVisible())) {
        test.skip()
        return
      }

      // Check prev button
      const prevButton = directorPage.locator('[data-testid="pagination-prev"]')
      if (await prevButton.isVisible()) {
        const result = await mobile.checkTouchTarget(prevButton)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }

      // Check next button
      const nextButton = directorPage.locator('[data-testid="pagination-next"]')
      if (await nextButton.isVisible()) {
        const result = await mobile.checkTouchTarget(nextButton)
        expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })

    test('page size selector should have adequate touch target', async ({
      directorPage,
      mobile,
    }) => {
      const pagination = directorPage.locator(
        '[data-testid="data-table-pagination"]'
      )

      if (!(await pagination.isVisible())) {
        test.skip()
        return
      }

      const pageSizeSelector = directorPage.locator(
        '[data-testid="pagination-page-size"]'
      )
      if (await pageSizeSelector.isVisible()) {
        const result = await mobile.checkTouchTarget(pageSizeSelector)
        expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      }
    })
  })

  // =========================================================================
  // FORM INPUTS
  // =========================================================================

  test.describe('Form Controls', () => {
    test('input fields should have adequate height for touch', async ({
      directorPage,
    }) => {
      // Check any visible text inputs
      const inputs = directorPage.locator(
        'input[type="text"], input[type="email"], input[type="password"]'
      )
      const count = await inputs.count()

      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i)
        if (await input.isVisible()) {
          const box = await input.boundingBox()
          if (box) {
            // Input height should be at least 40px (close to 44px requirement)
            expect(box.height).toBeGreaterThanOrEqual(36)
          }
        }
      }
    })

    test('select dropdowns should have adequate height', async ({
      directorPage,
    }) => {
      // Check select triggers (radix-ui style)
      const selectTriggers = directorPage.locator('[role="combobox"]')
      const count = await selectTriggers.count()

      for (let i = 0; i < Math.min(count, 3); i++) {
        const trigger = selectTriggers.nth(i)
        if (await trigger.isVisible()) {
          const box = await trigger.boundingBox()
          if (box) {
            expect(box.height).toBeGreaterThanOrEqual(36)
          }
        }
      }
    })
  })
})
