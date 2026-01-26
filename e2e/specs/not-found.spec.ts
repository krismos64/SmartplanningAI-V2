/**
 * Not Found Page E2E Tests - SP-302
 *
 * Tests the custom 404 page functionality in a real browser environment.
 * Validates navigation, animations, responsiveness, and accessibility.
 *
 * @ticket SP-302
 */

import { test, expect } from '../fixtures/consent.fixture'

test.describe('Not Found Page (404)', () => {
  /**
   * Test 1: Displays 404 page when navigating to non-existent route
   *
   * - Navigate to a non-existent URL
   * - Verify 404 page is displayed with correct elements
   */
  test('displays 404 page for non-existent routes', async ({ page }) => {
    // Navigate to a route that doesn't exist
    await page.goto('/this-page-does-not-exist')

    // Verify 404 page is displayed
    await expect(page.getByTestId('not-found-page')).toBeVisible()

    // Verify 404 number
    await expect(page.getByText('404')).toBeVisible()

    // Verify title in French
    await expect(page.getByText('Page non trouvée')).toBeVisible()

    // Verify description
    await expect(
      page.getByText(/désolé, la page que vous recherchez/i)
    ).toBeVisible()
  })

  /**
   * Test 2: Home button navigates to homepage
   *
   * - Navigate to 404 page
   * - Click Home button
   * - Verify navigation to homepage
   */
  test('home button navigates to homepage', async ({ page }) => {
    await page.goto('/non-existent-page-xyz')

    // Verify 404 page is displayed
    await expect(page.getByTestId('not-found-page')).toBeVisible()

    // Click Home button
    await page.getByRole('link', { name: /accueil/i }).click()

    // Verify navigation to homepage
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')

    // Verify homepage content
    await expect(page.getByText(/Planifiez/i).first()).toBeVisible()
  })

  /**
   * Test 3: Dashboard button navigates to dashboard
   *
   * - Navigate to 404 page
   * - Click Dashboard button
   * - Verify navigation to dashboard (may redirect to login if not authenticated)
   */
  test('dashboard button navigates to dashboard or login', async ({ page }) => {
    await page.goto('/random-non-existent-route')

    // Verify 404 page is displayed
    await expect(page.getByTestId('not-found-page')).toBeVisible()

    // Click Dashboard button
    await page.getByRole('link', { name: /dashboard/i }).click()

    // Should navigate to dashboard or redirect to login if not authenticated
    await page.waitForURL(/\/(dashboard|login)/)

    // Verify we're on either dashboard or login page
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/(dashboard|login)/)
  })

  /**
   * Test 4: Quick links navigate correctly
   *
   * - Navigate to 404 page
   * - Test each quick link
   */
  test('quick links navigate to correct sections', async ({ page }) => {
    await page.goto('/unknown-page-404')

    // Verify quick links navigation is present
    const quickLinksNav = page.getByRole('navigation', {
      name: /liens rapides/i,
    })
    await expect(quickLinksNav).toBeVisible()

    // Verify Fonctionnalités link
    const featuresLink = page.getByRole('link', { name: /fonctionnalités/i })
    await expect(featuresLink).toBeVisible()
    await expect(featuresLink).toHaveAttribute('href', '/#features')

    // Verify Tarifs link
    const pricingLink = page.getByRole('link', { name: /tarifs/i })
    await expect(pricingLink).toBeVisible()
    await expect(pricingLink).toHaveAttribute('href', '/#pricing')

    // Verify Contact link
    const contactLink = page.getByRole('link', { name: /contact/i })
    await expect(contactLink).toBeVisible()
    await expect(contactLink).toHaveAttribute('href', '/#contact')
  })

  /**
   * Test 5: Illustration is rendered
   *
   * - Navigate to 404 page
   * - Verify illustration component is present
   */
  test('renders animated illustration', async ({ page }) => {
    await page.goto('/page-not-found-test')

    // Verify illustration is displayed
    await expect(page.getByTestId('not-found-illustration')).toBeVisible()

    // Verify main icon is present
    await expect(page.getByTestId('main-icon')).toBeVisible()

    // Verify decorative icons are present
    await expect(page.getByTestId('search-icon')).toBeVisible()
    await expect(page.getByTestId('arrow-icon')).toBeVisible()
  })

  /**
   * Test 6: Page has proper accessibility attributes
   *
   * - Navigate to 404 page
   * - Verify WCAG 2.1 AA accessibility compliance
   */
  test('has proper accessibility attributes', async ({ page }) => {
    await page.goto('/inaccessible-page-test')

    // Verify region landmark is present (not main, to avoid conflict with layout's <main>)
    const region = page.getByRole('region', { name: /page non trouvée/i })
    await expect(region).toBeVisible()

    // Verify aria-labelledby points to title
    await expect(region).toHaveAttribute('aria-labelledby', 'not-found-title')

    // Verify aria-describedby points to description
    await expect(region).toHaveAttribute(
      'aria-describedby',
      'not-found-description'
    )

    // Verify title has correct id
    const title = page.locator('#not-found-title')
    await expect(title).toBeVisible()
    await expect(title).toHaveText('Page non trouvée')

    // Verify description has correct id
    const description = page.locator('#not-found-description')
    await expect(description).toBeVisible()

    // Verify 404 number is hidden from screen readers
    const number = page.getByText('404')
    await expect(number).toHaveAttribute('aria-hidden', 'true')

    // Verify navigation has aria-label
    const quickLinksNav = page.getByRole('navigation', {
      name: /liens rapides/i,
    })
    await expect(quickLinksNav).toHaveAttribute('aria-label', 'Liens rapides')
  })

  /**
   * Test 7: Responsive design works correctly
   *
   * - Test page on different viewport sizes
   */
  test('displays correctly on different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/test-responsive-404')

    await expect(page.getByTestId('not-found-page')).toBeVisible()
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByRole('link', { name: /accueil/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByTestId('not-found-page')).toBeVisible()
    await expect(page.getByText('Page non trouvée')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page.getByTestId('not-found-page')).toBeVisible()
    await expect(page.getByTestId('not-found-illustration')).toBeVisible()
  })

  /**
   * Test 8: Click on Features quick link navigates correctly
   *
   * - Navigate to 404 page
   * - Click on Fonctionnalités link
   * - Verify navigation to homepage features section
   */
  test('features quick link navigates to homepage features section', async ({
    page,
  }) => {
    await page.goto('/test-quick-link-404')

    // Click on Fonctionnalités link
    await page.getByRole('link', { name: /fonctionnalités/i }).click()

    // Verify navigation to homepage with hash
    await page.waitForURL('/#features')
    expect(page.url()).toContain('/#features')
  })
})
