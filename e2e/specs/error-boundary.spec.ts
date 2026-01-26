/**
 * Error Boundary E2E Tests - SP-304
 *
 * Tests the Error Boundary functionality in a real browser environment.
 * Uses a dedicated test page to trigger errors safely.
 *
 * @ticket SP-304
 */

import { test, expect } from '../fixtures/consent.fixture'

test.describe('Error Boundary', () => {
  /**
   * Test 1: Displays fallback UI when error occurs
   *
   * - Navigate to test error page
   * - Trigger an error by clicking the button
   * - Verify fallback UI is displayed
   */
  test('displays fallback UI when error occurs', async ({ page }) => {
    // Navigate to test error page
    await page.goto('/test-error')

    // Verify page loaded correctly (CardTitle is a div, not a heading)
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()

    // Verify component is working initially
    await expect(page.getByTestId('working-component')).toBeVisible()
    await expect(page.getByText('Component is working normally')).toBeVisible()

    // Trigger the error
    await page.getByTestId('trigger-error-button').click()

    // Verify fallback UI is displayed
    await expect(page.getByText('Une erreur est survenue')).toBeVisible()
    await expect(page.getByText(/nous sommes désolés/i)).toBeVisible()

    // Verify action buttons are visible
    await expect(page.getByRole('button', { name: /réessayer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /accueil/i })).toBeVisible()
  })

  /**
   * Test 2: Retry button resets the error state
   *
   * - Trigger an error
   * - Click retry button
   * - Verify error boundary resets and component re-renders
   */
  test('retry button attempts to recover from error', async ({ page }) => {
    await page.goto('/test-error')

    // Wait for page to be fully loaded
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()

    // Trigger the error
    await page.getByTestId('trigger-error-button').click()

    // Verify error state
    await expect(page.getByText('Une erreur est survenue')).toBeVisible()

    // Click retry button - this resets the error boundary
    // When React re-renders, the component state is reset (useState is called fresh)
    // So the component renders without error
    await page.getByRole('button', { name: /réessayer/i }).click()

    // After retry, the error boundary is reset and component re-renders
    // The useState(false) means shouldThrow is false, so component works normally
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()
    await expect(page.getByTestId('working-component')).toBeVisible()
  })

  /**
   * Test 3: Home button navigates to homepage
   *
   * - Trigger an error
   * - Click home button
   * - Verify navigation to homepage
   */
  test('home button navigates to homepage', async ({ page }) => {
    await page.goto('/test-error')

    // Trigger the error
    await page.getByTestId('trigger-error-button').click()

    // Verify error state
    await expect(page.getByText('Une erreur est survenue')).toBeVisible()

    // Click home button
    await page.getByRole('button', { name: /accueil/i }).click()

    // Verify navigation to homepage
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')

    // Verify homepage content
    await expect(page.getByText(/Planifiez/i).first()).toBeVisible()
  })

  /**
   * Test 4: Normal navigation does not trigger error boundary
   *
   * - Navigate through the app normally
   * - Verify no error fallback is displayed
   */
  test('normal navigation does not trigger error boundary', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()

    // Navigate to login page
    await page.goto('/login')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()
    await expect(page.getByText(/connexion/i).first()).toBeVisible()

    // Navigate to register page
    await page.goto('/register')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()
    await expect(page.getByText(/créer votre compte/i).first()).toBeVisible()

    // Navigate back to homepage
    await page.goto('/')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()
  })

  /**
   * Test 5: Error fallback has proper accessibility
   *
   * - Trigger an error
   * - Verify accessibility attributes
   */
  test('error fallback has proper accessibility attributes', async ({
    page,
  }) => {
    await page.goto('/test-error')

    // Trigger the error
    await page.getByTestId('trigger-error-button').click()

    // Verify alert role is present (use name to distinguish from Next.js route announcer)
    const alertElement = page.getByRole('alert', {
      name: 'Une erreur est survenue',
    })
    await expect(alertElement).toBeVisible()
    await expect(alertElement).toHaveAttribute('aria-live', 'assertive')

    // Verify buttons have accessible labels
    await expect(
      page.getByRole('button', { name: /réessayer de charger la page/i })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: /retourner à la page d'accueil/i })
    ).toBeVisible()
  })
})
