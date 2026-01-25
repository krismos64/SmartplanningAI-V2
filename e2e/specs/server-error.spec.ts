/**
 * Server Error Page E2E Tests - SP-303
 *
 * End-to-end tests for the custom 500 error page.
 * Tests navigation, accessibility, interactions, and responsiveness.
 *
 * @see Context7 Documentation:
 * - Playwright: page.goto(), locator assertions, accessibility testing
 * - Testing: E2E patterns for error pages
 *
 * @ticket SP-303
 */

import { test, expect } from '../fixtures/consent.fixture'

test.describe('Server Error Page (500)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the /server-error test route
    // Note: consent.fixture automatically sets cookie consent to avoid banner blocking clicks
    await page.goto('/server-error')
    // Wait for the page to be fully loaded
    await page.waitForSelector('[data-testid="server-error-page"]')
  })

  test.describe('Content Display', () => {
    test('should display the server error page container', async ({ page }) => {
      const container = page.getByTestId('server-error-page')
      await expect(container).toBeVisible()
    })

    test('should display the error code 500', async ({ page }) => {
      const errorCode = page.getByTestId('error-code')
      await expect(errorCode).toBeVisible()
      await expect(errorCode).toHaveText('500')
    })

    test('should display the ServerCrash icon', async ({ page }) => {
      const icon = page.getByTestId('server-error-icon')
      await expect(icon).toBeVisible()
    })

    test('should display the error title in French', async ({ page }) => {
      const title = page.locator('#server-error-title')
      await expect(title).toBeVisible()
      await expect(title).toContainText('Une erreur est survenue')
    })

    test('should display the error description in French', async ({ page }) => {
      const description = page.locator('#server-error-description')
      await expect(description).toBeVisible()
      await expect(description).toContainText('serveur')
    })
  })

  test.describe('Navigation Buttons', () => {
    test('should display the Retry button', async ({ page }) => {
      const retryButton = page.getByTestId('retry-button')
      await expect(retryButton).toBeVisible()
      await expect(retryButton).toHaveText(/réessayer/i)
    })

    test('should display the Home button', async ({ page }) => {
      const homeButton = page.getByTestId('home-button')
      await expect(homeButton).toBeVisible()
      await expect(homeButton).toHaveText(/accueil/i)
    })

    test('should display the Report button', async ({ page }) => {
      const reportButton = page.getByTestId('report-button')
      await expect(reportButton).toBeVisible()
      await expect(reportButton).toHaveText(/signaler/i)
    })

    test('should navigate to home page when clicking Home button', async ({
      page,
    }) => {
      const homeButton = page.getByTestId('home-button')
      await homeButton.click()
      await page.waitForURL('/')
      await expect(page).toHaveURL('/')
    })

    test('should navigate to contact page when clicking Report button', async ({
      page,
    }) => {
      const reportButton = page.getByTestId('report-button')
      await reportButton.click()
      await page.waitForURL('/contact')
      await expect(page).toHaveURL('/contact')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on error region', async ({
      page,
    }) => {
      const errorRegion = page.getByTestId('server-error-page')
      await expect(errorRegion).toHaveAttribute('aria-label', 'Erreur serveur')
      await expect(errorRegion).toHaveAttribute(
        'aria-labelledby',
        'server-error-title'
      )
      await expect(errorRegion).toHaveAttribute(
        'aria-describedby',
        'server-error-description'
      )
    })

    test('should have accessible button labels', async ({ page }) => {
      const retryButton = page.getByTestId('retry-button')
      const homeButton = page.getByTestId('home-button')
      const reportButton = page.getByTestId('report-button')

      await expect(retryButton).toHaveAttribute(
        'aria-label',
        'Réessayer de charger la page'
      )
      await expect(homeButton).toHaveAttribute(
        'aria-label',
        "Retourner à la page d'accueil"
      )
      await expect(reportButton).toHaveAttribute(
        'aria-label',
        'Signaler le problème'
      )
    })

    test('should hide decorative icons from screen readers', async ({
      page,
    }) => {
      const icon = page.getByTestId('server-error-icon')
      await expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    test('should be keyboard navigable', async ({ page }) => {
      // First Tab goes to skip-link (from root layout)
      await page.keyboard.press('Tab')
      const skipLink = page.getByTestId('skip-link')
      await expect(skipLink).toBeFocused()

      // Tab through the buttons
      await page.keyboard.press('Tab')
      const retryButton = page.getByTestId('retry-button')
      await expect(retryButton).toBeFocused()

      await page.keyboard.press('Tab')
      const homeButton = page.getByTestId('home-button')
      await expect(homeButton).toBeFocused()

      await page.keyboard.press('Tab')
      const reportButton = page.getByTestId('report-button')
      await expect(reportButton).toBeFocused()
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/server-error')

      const container = page.getByTestId('server-error-page')
      await expect(container).toBeVisible()

      const errorCode = page.getByTestId('error-code')
      await expect(errorCode).toBeVisible()
    })

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/server-error')

      const container = page.getByTestId('server-error-page')
      await expect(container).toBeVisible()
    })

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/server-error')

      const container = page.getByTestId('server-error-page')
      await expect(container).toBeVisible()
    })
  })

  test.describe('Visual Elements', () => {
    test('should have gradient styling on error code', async ({ page }) => {
      const errorCode = page.getByTestId('error-code')
      const classAttribute = await errorCode.getAttribute('class')
      expect(classAttribute).toContain('bg-gradient')
      expect(classAttribute).toContain('bg-clip-text')
    })

    test('should have Card component with destructive styling', async ({
      page,
    }) => {
      // Check that the card has destructive border and background
      const card = page.locator('.border-destructive\\/20')
      await expect(card).toBeVisible()
    })
  })

  test.describe('Page Metadata', () => {
    test('should have correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/500.*Erreur serveur.*SmartPlanning/i)
    })
  })
})
