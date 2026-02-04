/**
 * Mobile Test Fixture for E2E Tests
 *
 * @ticket SP-389 - E2E Mobile Tests
 * @see Context7 - Playwright test.extend with isMobile fixture
 *
 * Extends the auth fixture with mobile-specific helpers:
 * - isMobile detection from Playwright device
 * - isTablet detection for iPad-class devices
 * - Touch gesture utilities
 * - Viewport helpers
 */

import { test as authTest } from './auth.fixture'
import type { Page } from '@playwright/test'
import {
  swipe,
  swipeLeftOnElement,
  swipeRightOnElement,
  checkTouchTargetSize,
  scrollHorizontal,
} from '../utils/touch-gestures'
import type { Locator } from '@playwright/test'

// ============================================================================
// TYPES
// ============================================================================

export interface MobileHelpers {
  /** True if running on a mobile device (phone or tablet) */
  isMobile: boolean
  /** True if running on a tablet device (iPad class) */
  isTablet: boolean
  /** True if device has touch support */
  hasTouch: boolean
  /** Current viewport width */
  viewportWidth: number
  /** Current viewport height */
  viewportHeight: number
  /** Device name from Playwright config */
  deviceName: string

  // Touch gesture helpers
  swipeLeft: (distance?: number) => Promise<void>
  swipeRight: (distance?: number) => Promise<void>
  swipeUp: (distance?: number) => Promise<void>
  swipeDown: (distance?: number) => Promise<void>
  swipeLeftOn: (locator: Locator, distance?: number) => Promise<void>
  swipeRightOn: (locator: Locator, distance?: number) => Promise<void>
  scrollHorizontalOn: (
    locator: Locator,
    direction: 'left' | 'right',
    distance?: number
  ) => Promise<void>
  checkTouchTarget: (locator: Locator) => Promise<{
    isValid: boolean
    width: number
    height: number
    minRequired: number
  }>
}

// ============================================================================
// FIXTURE EXTENSION
// ============================================================================

/**
 * Extended test fixture with mobile detection and helpers
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../fixtures/mobile.fixture'
 *
 * test('mobile navigation', async ({ directorPage, mobile }) => {
 *   if (mobile.isMobile) {
 *     await mobile.swipeRight(200) // Open drawer
 *   }
 * })
 * ```
 */
export const test = authTest.extend<{ mobile: MobileHelpers }>({
  mobile: async ({ page }, use, testInfo) => {
    const viewport = page.viewportSize()
    const projectName = testInfo.project.name

    // Detect device characteristics from project name and viewport
    const isMobile =
      projectName.includes('mobile') || projectName.includes('tablet')
    const isTablet = projectName.includes('tablet')

    // Check hasTouch from project use config
    // Playwright sets hasTouch: true for mobile devices automatically
    const hasTouch = testInfo.project.use?.hasTouch ?? isMobile

    const helpers: MobileHelpers = {
      isMobile,
      isTablet,
      hasTouch,
      viewportWidth: viewport?.width ?? 0,
      viewportHeight: viewport?.height ?? 0,
      deviceName: projectName,

      // Gesture helpers
      swipeLeft: (distance = 150) => swipe(page, 'left', { distance }),
      swipeRight: (distance = 150) => swipe(page, 'right', { distance }),
      swipeUp: (distance = 150) => swipe(page, 'up', { distance }),
      swipeDown: (distance = 150) => swipe(page, 'down', { distance }),
      swipeLeftOn: (locator, distance) =>
        swipeLeftOnElement(page, locator, distance),
      swipeRightOn: (locator, distance) =>
        swipeRightOnElement(page, locator, distance),
      scrollHorizontalOn: (locator, direction, distance) =>
        scrollHorizontal(locator, direction, distance),
      checkTouchTarget: (locator) => checkTouchTargetSize(locator),
    }

    await use(helpers)
  },
})

export { expect } from '@playwright/test'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wait for mobile sidebar/drawer to be visible
 */
export async function waitForDrawerOpen(page: Page): Promise<void> {
  await page
    .locator('[data-testid="swipeable-drawer-panel"]')
    .waitFor({ state: 'visible', timeout: 5000 })
}

/**
 * Wait for mobile sidebar/drawer to be hidden
 */
export async function waitForDrawerClosed(page: Page): Promise<void> {
  await page
    .locator('[data-testid="swipeable-drawer-panel"]')
    .waitFor({ state: 'hidden', timeout: 5000 })
}

/**
 * Open command palette on mobile (via search icon)
 */
export async function openCommandPaletteMobile(page: Page): Promise<void> {
  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded')

  // Use data-testid for reliable selection
  const mobileSearchButton = page.locator('[data-testid="mobile-search-button"]')
  const ariaSearchButton = page.locator('button[aria-label="Ouvrir la recherche"]')

  // Wait for a search button to be visible
  await Promise.race([
    mobileSearchButton.waitFor({ state: 'visible', timeout: 10000 }),
    ariaSearchButton.waitFor({ state: 'visible', timeout: 10000 }),
  ]).catch(() => {
    // If neither visible, try keyboard shortcut
  })

  // Click the visible button
  if (await mobileSearchButton.isVisible()) {
    await mobileSearchButton.click()
  } else if (await ariaSearchButton.isVisible()) {
    await ariaSearchButton.click()
  } else {
    // Fallback to keyboard shortcut
    await page.keyboard.press('Control+k')
  }

  // Wait for dialog to be visible
  await page
    .locator('[data-testid="command-palette-dialog"]')
    .waitFor({ state: 'visible', timeout: 5000 })
}

/**
 * Close command palette
 */
export async function closeCommandPalette(page: Page): Promise<void> {
  const closeButton = page.locator('[data-testid="command-palette-close"]')
  if (await closeButton.isVisible()) {
    await closeButton.click()
  } else {
    await page.keyboard.press('Escape')
  }
  await page
    .locator('[data-testid="command-palette-dialog"]')
    .waitFor({ state: 'hidden' })
}

/**
 * Get burger menu button on mobile
 */
export function getBurgerMenuButton(page: Page): Locator {
  return page.locator('button.lg\\:hidden').filter({ has: page.locator('svg') })
}

/**
 * Open mobile navigation drawer via burger menu
 */
export async function openMobileDrawer(page: Page): Promise<void> {
  const burgerButton = getBurgerMenuButton(page)
  await burgerButton.click()
  await waitForDrawerOpen(page)
}

/**
 * Check if we're in mobile viewport (< 1024px for lg breakpoint)
 */
export function isMobileViewport(page: Page): boolean {
  const viewport = page.viewportSize()
  return viewport ? viewport.width < 1024 : false
}
