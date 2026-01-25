/**
 * Forbidden Page E2E Tests - SP-305
 *
 * End-to-end tests for the custom 403 forbidden page.
 * Tests navigation, accessibility, interactions, and responsiveness.
 *
 * @see Context7 Documentation:
 * - Playwright: page.goto(), locator assertions, accessibility testing
 * - Testing: E2E patterns for error pages
 *
 * @ticket SP-305
 */

import { test, expect } from '../fixtures/consent.fixture'

test.describe('Forbidden Page (403)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the /access-denied test route
    // Note: consent.fixture automatically sets cookie consent to avoid banner blocking clicks
    await page.goto('/access-denied')
    // Wait for the page to be fully loaded
    await page.waitForSelector('[data-testid="forbidden-page"]')
  })

  test.describe('Content Display', () => {
    test('should display the forbidden page container', async ({ page }) => {
      const container = page.getByTestId('forbidden-page')
      await expect(container).toBeVisible()
    })

    test('should display the error code 403', async ({ page }) => {
      const errorCode = page.getByTestId('error-code')
      await expect(errorCode).toBeVisible()
      await expect(errorCode).toHaveText('403')
    })

    test('should display the ShieldAlert icon', async ({ page }) => {
      const icon = page.getByTestId('forbidden-icon')
      await expect(icon).toBeVisible()
    })

    test('should display the error title in French', async ({ page }) => {
      const title = page.locator('#forbidden-title')
      await expect(title).toBeVisible()
      await expect(title).toContainText('Accès non autorisé')
    })

    test('should display the error description in French', async ({ page }) => {
      const description = page.locator('#forbidden-description')
      await expect(description).toBeVisible()
      await expect(description).toContainText('permissions')
    })

    test('should display helpful message', async ({ page }) => {
      const message = page.getByText(/tableau de bord ou à l'accueil/i)
      await expect(message).toBeVisible()
    })
  })

  test.describe('Navigation Buttons', () => {
    test('should display the Dashboard button', async ({ page }) => {
      const dashboardButton = page.getByTestId('dashboard-button')
      await expect(dashboardButton).toBeVisible()
      await expect(dashboardButton).toContainText('Dashboard')
    })

    test('should display the Home button', async ({ page }) => {
      const homeButton = page.getByTestId('home-button')
      await expect(homeButton).toBeVisible()
      await expect(homeButton).toContainText('Accueil')
    })

    test('should display the Contact Admin button', async ({ page }) => {
      const contactButton = page.getByTestId('contact-admin-button')
      await expect(contactButton).toBeVisible()
      await expect(contactButton).toContainText("Contacter l'administrateur")
    })

    test('should navigate to dashboard when clicking Dashboard button', async ({
      page,
    }) => {
      const dashboardButton = page.getByTestId('dashboard-button')
      await dashboardButton.click()
      await page.waitForURL('/dashboard')
      await expect(page).toHaveURL('/dashboard')
    })

    test('should navigate to home page when clicking Home button', async ({
      page,
    }) => {
      const homeButton = page.getByTestId('home-button')
      await homeButton.click()
      await page.waitForURL('/')
      await expect(page).toHaveURL('/')
    })

    test('should navigate to contact page when clicking Contact Admin button', async ({
      page,
    }) => {
      const contactButton = page.getByTestId('contact-admin-button')
      await contactButton.click()
      await page.waitForURL('/contact')
      await expect(page).toHaveURL('/contact')
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes on error region', async ({
      page,
    }) => {
      const errorRegion = page.getByTestId('forbidden-page')
      await expect(errorRegion).toHaveAttribute('aria-label', 'Accès refusé')
      await expect(errorRegion).toHaveAttribute('aria-labelledby', 'forbidden-title')
      await expect(errorRegion).toHaveAttribute(
        'aria-describedby',
        'forbidden-description'
      )
    })

    test('should have accessible button labels', async ({ page }) => {
      const dashboardButton = page.getByTestId('dashboard-button')
      const homeButton = page.getByTestId('home-button')
      const contactButton = page.getByTestId('contact-admin-button')

      await expect(dashboardButton).toHaveAttribute(
        'aria-label',
        'Retourner au tableau de bord'
      )
      await expect(homeButton).toHaveAttribute(
        'aria-label',
        "Retourner à la page d'accueil"
      )
      await expect(contactButton).toHaveAttribute(
        'aria-label',
        "Contacter l'administrateur"
      )
    })

    test('should hide decorative icons from screen readers', async ({
      page,
    }) => {
      const icon = page.getByTestId('forbidden-icon')
      await expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    test('should be keyboard navigable', async ({ page }) => {
      // First Tab goes to skip-link (from root layout)
      await page.keyboard.press('Tab')
      const skipLink = page.getByTestId('skip-link')
      await expect(skipLink).toBeFocused()

      // Tab through the buttons
      await page.keyboard.press('Tab')
      const dashboardButton = page.getByTestId('dashboard-button')
      await expect(dashboardButton).toBeFocused()

      await page.keyboard.press('Tab')
      const homeButton = page.getByTestId('home-button')
      await expect(homeButton).toBeFocused()

      await page.keyboard.press('Tab')
      const contactButton = page.getByTestId('contact-admin-button')
      await expect(contactButton).toBeFocused()
    })

    test('should activate button with Enter key', async ({ page }) => {
      // First Tab goes to skip-link, then to buttons
      await page.keyboard.press('Tab') // Skip link
      await page.keyboard.press('Tab') // Dashboard button
      await page.keyboard.press('Tab') // Home button
      await page.keyboard.press('Enter')
      await page.waitForURL('/')
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/access-denied')

      const container = page.getByTestId('forbidden-page')
      await expect(container).toBeVisible()

      const errorCode = page.getByTestId('error-code')
      await expect(errorCode).toBeVisible()
    })

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/access-denied')

      const container = page.getByTestId('forbidden-page')
      await expect(container).toBeVisible()
    })

    test('should display correctly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/access-denied')

      const container = page.getByTestId('forbidden-page')
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

    test('should have orange styling on icon container', async ({ page }) => {
      // Check that the icon container has orange background
      const iconContainer = page.locator('.bg-orange-500\\/10')
      await expect(iconContainer).toBeVisible()
    })

    test('should have Card component with orange border', async ({ page }) => {
      // Check that the card has orange border styling
      const card = page.locator('.border-orange-500\\/20')
      await expect(card).toBeVisible()
    })
  })

  test.describe('Page Metadata', () => {
    test('should have correct page title', async ({ page }) => {
      await expect(page).toHaveTitle(/403.*Accès refusé.*SmartPlanning/i)
    })
  })
})
