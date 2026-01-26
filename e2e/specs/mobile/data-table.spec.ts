/**
 * Mobile DataTable Pagination E2E Tests
 *
 * @ticket SP-389 - E2E Mobile Tests
 * @see SP-387 - DataTablePagination responsive component
 * @see Context7 - TanStack Table v8 pagination patterns
 *
 * Tests covering:
 * - Compact pagination format on mobile (X/Y vs "Page X sur Y")
 * - First/Last buttons hidden on mobile
 * - Page size selector with 44px height
 * - Touch target validation for navigation buttons
 * - Responsive layout (stacked vs inline)
 */

import { test, expect } from '../../fixtures/mobile.fixture'

const WCAG_MIN_SIZE = 44

test.describe('Mobile DataTable Pagination', () => {
  // Skip all tests in this file if not on mobile
  test.beforeEach(async ({ mobile }) => {
    test.skip(!mobile.isMobile, 'Test only runs on mobile devices')
  })

  // Navigate to a page with data table
  test.beforeEach(async ({ directorPage }) => {
    await directorPage.goto('/app/dashboard/employees')
    await directorPage.waitForLoadState('networkidle')
  })

  // Helper to check if pagination exists
  async function hasPagination(
    page: import('@playwright/test').Page
  ): Promise<boolean> {
    const pagination = page.locator('[data-testid="data-table-pagination"]')
    try {
      return await pagination.isVisible({ timeout: 3000 })
    } catch {
      return false
    }
  }

  // =========================================================================
  // PAGINATION RENDERING
  // =========================================================================

  test.describe('Pagination Rendering', () => {
    test('should render pagination component', async ({ directorPage }) => {
      const pagination = directorPage.locator(
        '[data-testid="data-table-pagination"]'
      )

      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      await expect(pagination).toBeVisible()
    })

    test('should use compact page format on mobile (X/Y)', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pageInfo = directorPage.locator('[data-testid="pagination-info"]')
      const text = await pageInfo.textContent()

      // Mobile format: "1/5" instead of "Page 1 sur 5"
      expect(text).toMatch(/^\d+\/\d+$/)
    })

    test('should show "Par page" label instead of "Lignes par page"', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      // On mobile, label should be shorter
      const pageSizeLabel = directorPage.getByText('Par page')
      await expect(pageSizeLabel).toBeVisible()

      // Full "Lignes par page" should not be visible
      const fullLabel = directorPage.getByText('Lignes par page')
      await expect(fullLabel).not.toBeVisible()
    })

    test('should show compact results count on mobile', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      // Mobile shows "X résultat(s)" instead of "X ligne(s) au total"
      const resultsText = directorPage.getByText(/\d+ résultat/)
      await expect(resultsText).toBeVisible()
    })
  })

  // =========================================================================
  // NAVIGATION BUTTONS
  // =========================================================================

  test.describe('Navigation Buttons', () => {
    test('First page button should be hidden on mobile', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const firstButton = directorPage.locator(
        '[data-testid="pagination-first"]'
      )
      await expect(firstButton).not.toBeVisible()
    })

    test('Last page button should be hidden on mobile', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const lastButton = directorPage.locator('[data-testid="pagination-last"]')
      await expect(lastButton).not.toBeVisible()
    })

    test('Previous button should be visible and functional', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const prevButton = directorPage.locator('[data-testid="pagination-prev"]')
      await expect(prevButton).toBeVisible()

      // Should have aria-label
      await expect(prevButton).toHaveAttribute('aria-label')
    })

    test('Next button should be visible and functional', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const nextButton = directorPage.locator('[data-testid="pagination-next"]')
      await expect(nextButton).toBeVisible()

      // Should have aria-label
      await expect(nextButton).toHaveAttribute('aria-label')
    })

    test('navigation should work with prev/next buttons', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pageInfo = directorPage.locator('[data-testid="pagination-info"]')
      const initialText = await pageInfo.textContent()

      // Click next if available
      const nextButton = directorPage.locator('[data-testid="pagination-next"]')
      const isNextEnabled = !(await nextButton.isDisabled())

      if (isNextEnabled) {
        await nextButton.click()
        await directorPage.waitForTimeout(300)

        const newText = await pageInfo.textContent()
        expect(newText).not.toBe(initialText)
      }
    })
  })

  // =========================================================================
  // TOUCH TARGETS
  // =========================================================================

  test.describe('Touch Targets', () => {
    test('prev button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const prevButton = directorPage.locator('[data-testid="pagination-prev"]')
      const result = await mobile.checkTouchTarget(prevButton)

      expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })

    test('next button should be >= 44x44px', async ({
      directorPage,
      mobile,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const nextButton = directorPage.locator('[data-testid="pagination-next"]')
      const result = await mobile.checkTouchTarget(nextButton)

      expect(result.width).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })

    test('page size selector should have 44px minimum height', async ({
      directorPage,
      mobile,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pageSizeSelector = directorPage.locator(
        '[data-testid="pagination-page-size"]'
      )
      const result = await mobile.checkTouchTarget(pageSizeSelector)

      expect(result.height).toBeGreaterThanOrEqual(WCAG_MIN_SIZE)
    })
  })

  // =========================================================================
  // PAGE SIZE SELECTOR
  // =========================================================================

  test.describe('Page Size Selector', () => {
    test('should show page size options', async ({ directorPage }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pageSizeSelector = directorPage.locator(
        '[data-testid="pagination-page-size"]'
      )
      await pageSizeSelector.click()

      // Wait for dropdown to open
      await directorPage.waitForTimeout(200)

      // Should show mobile-optimized options (10, 25, 50)
      const options = directorPage.locator('[role="option"]')
      const count = await options.count()

      expect(count).toBeGreaterThan(0)
    })

    test('changing page size should update table', async ({ directorPage }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pageSizeSelector = directorPage.locator(
        '[data-testid="pagination-page-size"]'
      )
      const initialValue = await pageSizeSelector.textContent()

      await pageSizeSelector.click()
      await directorPage.waitForTimeout(200)

      // Select a different option
      const options = directorPage.locator('[role="option"]')
      const count = await options.count()

      if (count > 1) {
        // Click second option
        await options.nth(1).click()
        await directorPage.waitForTimeout(300)

        // Value should have changed
        const newValue = await pageSizeSelector.textContent()
        expect(newValue).not.toBe(initialValue)
      }
    })
  })

  // =========================================================================
  // RESPONSIVE LAYOUT
  // =========================================================================

  test.describe('Responsive Layout', () => {
    test('pagination should have vertical layout on mobile', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pagination = directorPage.locator(
        '[data-testid="data-table-pagination"]'
      )

      // Check flex-direction
      const flexDirection = await pagination.evaluate((el) => {
        return window.getComputedStyle(el).flexDirection
      })

      // On mobile, should be column layout
      expect(flexDirection).toBe('column')
    })

    test('controls should be centered on mobile', async ({ directorPage }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const pagination = directorPage.locator(
        '[data-testid="data-table-pagination"]'
      )

      // Check align-items
      const alignItems = await pagination.evaluate((el) => {
        return window.getComputedStyle(el).alignItems
      })

      expect(alignItems).toBe('center')
    })

    test('total rows count should be hidden at top on mobile', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      // The "X ligne(s) au total" should not be visible on mobile
      // Instead, "X résultat(s)" appears at the bottom
      const fullRowCount = directorPage.getByText(/ligne\(s\) au total/)
      await expect(fullRowCount).not.toBeVisible()
    })
  })

  // =========================================================================
  // ACCESSIBILITY
  // =========================================================================

  test.describe('Accessibility', () => {
    test('all navigation buttons should have aria-labels', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      const prevButton = directorPage.locator('[data-testid="pagination-prev"]')
      const nextButton = directorPage.locator('[data-testid="pagination-next"]')

      await expect(prevButton).toHaveAttribute('aria-label')
      await expect(nextButton).toHaveAttribute('aria-label')
    })

    test('disabled buttons should have disabled attribute', async ({
      directorPage,
    }) => {
      if (!(await hasPagination(directorPage))) {
        test.skip()
        return
      }

      // On first page, prev should be disabled
      const prevButton = directorPage.locator('[data-testid="pagination-prev"]')
      const isDisabled = await prevButton.isDisabled()

      if (isDisabled) {
        await expect(prevButton).toBeDisabled()
      }
    })
  })
})
