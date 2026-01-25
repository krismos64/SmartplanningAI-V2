/**
 * Touch Gestures Utilities for Mobile E2E Tests
 *
 * @ticket SP-389 - E2E Mobile Tests
 * @see Context7 - Playwright mouse.move/down/up for swipe simulation
 *
 * Provides helper functions to simulate touch gestures:
 * - Swipe left/right/up/down
 * - Tap with touch target validation
 * - Long press
 */

import type { Page, Locator } from '@playwright/test'

// ============================================================================
// TYPES
// ============================================================================

export interface SwipeOptions {
  /** Starting X position (default: center of element/viewport) */
  startX?: number
  /** Starting Y position (default: center of element/viewport) */
  startY?: number
  /** Distance to swipe in pixels */
  distance?: number
  /** Duration of swipe in milliseconds (affects velocity) */
  duration?: number
  /** Number of steps for the swipe animation */
  steps?: number
}

export interface TapOptions {
  /** Whether to perform a double tap */
  doubleTap?: boolean
  /** Delay between taps for double tap (ms) */
  tapDelay?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_SWIPE_DISTANCE = 150
const DEFAULT_SWIPE_DURATION = 200
const DEFAULT_SWIPE_STEPS = 10
const WCAG_MIN_TOUCH_TARGET = 44

// ============================================================================
// SWIPE HELPERS
// ============================================================================

/**
 * Simulate a swipe gesture on the page or element
 *
 * @param page - Playwright Page object
 * @param direction - Direction of the swipe
 * @param options - Swipe configuration options
 *
 * @example
 * // Swipe left from center of viewport
 * await swipe(page, 'left', { distance: 200 })
 *
 * // Swipe from specific position
 * await swipe(page, 'right', { startX: 50, startY: 300, distance: 250 })
 */
export async function swipe(
  page: Page,
  direction: 'left' | 'right' | 'up' | 'down',
  options: SwipeOptions = {}
): Promise<void> {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('Viewport not available')

  const {
    startX = viewport.width / 2,
    startY = viewport.height / 2,
    distance = DEFAULT_SWIPE_DISTANCE,
    duration = DEFAULT_SWIPE_DURATION,
    steps = DEFAULT_SWIPE_STEPS,
  } = options

  // Calculate end position based on direction
  let endX = startX
  let endY = startY

  switch (direction) {
    case 'left':
      endX = startX - distance
      break
    case 'right':
      endX = startX + distance
      break
    case 'up':
      endY = startY - distance
      break
    case 'down':
      endY = startY + distance
      break
  }

  // Perform the swipe gesture
  await page.mouse.move(startX, startY)
  await page.mouse.down()

  // Animate the swipe with multiple steps for realistic gesture
  const stepDelay = duration / steps
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps
    const currentX = startX + (endX - startX) * progress
    const currentY = startY + (endY - startY) * progress
    await page.mouse.move(currentX, currentY)
    await page.waitForTimeout(stepDelay)
  }

  await page.mouse.up()
}

/**
 * Swipe left on an element
 *
 * @param page - Playwright Page
 * @param locator - Element to swipe on
 * @param distance - Swipe distance in pixels
 */
export async function swipeLeftOnElement(
  page: Page,
  locator: Locator,
  distance: number = DEFAULT_SWIPE_DISTANCE
): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element not visible')

  await swipe(page, 'left', {
    startX: box.x + box.width - 20,
    startY: box.y + box.height / 2,
    distance,
  })
}

/**
 * Swipe right on an element
 *
 * @param page - Playwright Page
 * @param locator - Element to swipe on
 * @param distance - Swipe distance in pixels
 */
export async function swipeRightOnElement(
  page: Page,
  locator: Locator,
  distance: number = DEFAULT_SWIPE_DISTANCE
): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element not visible')

  await swipe(page, 'right', {
    startX: box.x + 20,
    startY: box.y + box.height / 2,
    distance,
  })
}

// ============================================================================
// TOUCH TARGET VALIDATION
// ============================================================================

/**
 * Check if an element meets WCAG 2.5.5 touch target size requirements
 * Minimum touch target size is 44x44 CSS pixels
 *
 * @param locator - Element to check
 * @returns Object with validation result and actual dimensions
 *
 * @example
 * const result = await checkTouchTargetSize(page.locator('button'))
 * expect(result.isValid).toBe(true)
 */
export async function checkTouchTargetSize(locator: Locator): Promise<{
  isValid: boolean
  width: number
  height: number
  minRequired: number
}> {
  const box = await locator.boundingBox()
  if (!box) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      minRequired: WCAG_MIN_TOUCH_TARGET,
    }
  }

  const isValid =
    box.width >= WCAG_MIN_TOUCH_TARGET && box.height >= WCAG_MIN_TOUCH_TARGET

  return {
    isValid,
    width: Math.round(box.width),
    height: Math.round(box.height),
    minRequired: WCAG_MIN_TOUCH_TARGET,
  }
}

/**
 * Get all interactive elements and check their touch target sizes
 *
 * @param page - Playwright Page
 * @returns Array of elements with their touch target validation results
 */
export async function getAllTouchTargets(page: Page): Promise<
  Array<{
    selector: string
    isValid: boolean
    width: number
    height: number
  }>
> {
  const interactiveSelectors = [
    'button',
    'a[href]',
    'input',
    'select',
    'textarea',
    '[role="button"]',
    '[tabindex]:not([tabindex="-1"])',
  ]

  const results: Array<{
    selector: string
    isValid: boolean
    width: number
    height: number
  }> = []

  for (const selector of interactiveSelectors) {
    const elements = page.locator(selector)
    const count = await elements.count()

    for (let i = 0; i < count; i++) {
      const element = elements.nth(i)
      if (await element.isVisible()) {
        const result = await checkTouchTargetSize(element)
        const text = await element.textContent()
        results.push({
          selector: `${selector}[${i}]: ${text?.slice(0, 30) || 'no text'}`,
          isValid: result.isValid,
          width: result.width,
          height: result.height,
        })
      }
    }
  }

  return results
}

// ============================================================================
// LONG PRESS
// ============================================================================

/**
 * Perform a long press gesture on an element
 *
 * @param locator - Element to long press
 * @param duration - Duration of the press in milliseconds (default: 500ms)
 */
export async function longPress(
  locator: Locator,
  duration: number = 500
): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element not visible')

  const page = locator.page()
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2

  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.waitForTimeout(duration)
  await page.mouse.up()
}

// ============================================================================
// TAP HELPERS
// ============================================================================

/**
 * Perform a tap (click) with optional double-tap
 *
 * @param locator - Element to tap
 * @param options - Tap options
 */
export async function tap(
  locator: Locator,
  options: TapOptions = {}
): Promise<void> {
  const { doubleTap = false, tapDelay = 100 } = options

  await locator.click()

  if (doubleTap) {
    await locator.page().waitForTimeout(tapDelay)
    await locator.click()
  }
}

// ============================================================================
// SCROLL HELPERS
// ============================================================================

/**
 * Scroll horizontally within an element (useful for breadcrumbs)
 *
 * @param locator - Scrollable container element
 * @param direction - Scroll direction
 * @param distance - Scroll distance in pixels
 */
export async function scrollHorizontal(
  locator: Locator,
  direction: 'left' | 'right',
  distance: number = 100
): Promise<void> {
  const box = await locator.boundingBox()
  if (!box) throw new Error('Element not visible')

  const page = locator.page()
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2

  await page.mouse.move(centerX, centerY)
  await page.mouse.down()

  const endX = direction === 'left' ? centerX - distance : centerX + distance

  // Smooth scroll with multiple steps
  const steps = 5
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps
    const currentX = centerX + (endX - centerX) * progress
    await page.mouse.move(currentX, centerY)
    await page.waitForTimeout(20)
  }

  await page.mouse.up()
}
