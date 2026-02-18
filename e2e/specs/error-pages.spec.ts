/**
 * Tests E2E consolidés — Pages d'erreur (404, 500, Error Boundary)
 *
 * Vérifie le fonctionnement des pages d'erreur : affichage, navigation,
 * accessibilité. Tests allégés par rapport aux specs originales.
 *
 * @ticket SP-302, SP-303, SP-304
 */

import { test, expect } from '../fixtures/consent.fixture'

// =============================================================================
// 404 — Not Found
// =============================================================================

test.describe('Page 404 — Not Found', () => {
  test('affiche la page 404 avec contenu correct', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')

    await expect(page.getByTestId('not-found-page')).toBeVisible()
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Page non trouvée')).toBeVisible()
    await expect(
      page.getByText(/désolé, la page que vous recherchez/i)
    ).toBeVisible()
  })

  test('bouton Accueil navigue vers la homepage', async ({ page }) => {
    await page.goto('/non-existent-page-xyz')
    await expect(page.getByTestId('not-found-page')).toBeVisible()

    await page.getByRole('link', { name: /accueil/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('bouton Dashboard navigue vers dashboard ou login', async ({ page }) => {
    await page.goto('/random-non-existent-route')
    await expect(page.getByTestId('not-found-page')).toBeVisible()

    await page.getByRole('link', { name: /dashboard/i }).click()
    await page.waitForURL(/\/(dashboard|login)/)
    expect(page.url()).toMatch(/\/(dashboard|login)/)
  })

  test('liens rapides présents avec hrefs corrects', async ({ page }) => {
    await page.goto('/unknown-page-404')

    const quickLinksNav = page.getByRole('navigation', {
      name: /liens rapides/i,
    })
    await expect(quickLinksNav).toBeVisible()
    await expect(
      page.getByRole('link', { name: /fonctionnalités/i })
    ).toHaveAttribute('href', '/#features')
    await expect(
      page.getByRole('link', { name: /tarifs/i })
    ).toHaveAttribute('href', '/tarifs')
    await expect(
      page.getByRole('link', { name: /contact/i })
    ).toHaveAttribute('href', '/#contact')
  })

  test('accessibilité : region, aria-labelledby, aria-hidden', async ({
    page,
  }) => {
    await page.goto('/inaccessible-page-test')

    const region = page.getByRole('region', { name: /page non trouvée/i })
    await expect(region).toBeVisible()
    await expect(region).toHaveAttribute('aria-labelledby', 'not-found-title')
    await expect(region).toHaveAttribute(
      'aria-describedby',
      'not-found-description'
    )
    await expect(page.getByText('404')).toHaveAttribute('aria-hidden', 'true')
  })
})

// =============================================================================
// 500 — Server Error
// =============================================================================

test.describe('Page 500 — Server Error', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/server-error')
    await page.waitForSelector('[data-testid="server-error-page"]')
  })

  test('affiche la page 500 avec contenu correct', async ({ page }) => {
    await expect(page.getByTestId('server-error-page')).toBeVisible()
    await expect(page.getByTestId('error-code')).toHaveText('500')
    await expect(page.getByTestId('server-error-icon')).toBeVisible()
    await expect(page.locator('#server-error-title')).toContainText(
      'Une erreur est survenue'
    )
  })

  test('boutons Réessayer, Accueil et Signaler visibles', async ({ page }) => {
    await expect(page.getByTestId('retry-button')).toBeVisible()
    await expect(page.getByTestId('home-button')).toBeVisible()
    await expect(page.getByTestId('report-button')).toBeVisible()
  })

  test('bouton Accueil navigue vers la homepage', async ({ page }) => {
    await page.getByTestId('home-button').click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('bouton Signaler navigue vers contact', async ({ page }) => {
    await page.getByTestId('report-button').click()
    await page.waitForURL('/contact')
    await expect(page).toHaveURL('/contact')
  })

  test('accessibilité : aria-label, aria-labelledby, keyboard nav', async ({
    page,
  }) => {
    const errorRegion = page.getByTestId('server-error-page')
    await expect(errorRegion).toHaveAttribute('aria-label', 'Erreur serveur')
    await expect(errorRegion).toHaveAttribute(
      'aria-labelledby',
      'server-error-title'
    )

    await expect(page.getByTestId('retry-button')).toHaveAttribute(
      'aria-label',
      'Réessayer de charger la page'
    )
    await expect(page.getByTestId('server-error-icon')).toHaveAttribute(
      'aria-hidden',
      'true'
    )
  })

  test('titre de page correct', async ({ page }) => {
    await expect(page).toHaveTitle(/500.*Erreur serveur.*SmartPlanning/i)
  })
})

// =============================================================================
// Error Boundary
// =============================================================================

test.describe('Error Boundary', () => {
  test('affiche le fallback UI quand une erreur survient', async ({ page }) => {
    await page.goto('/test-error')
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()
    await expect(page.getByTestId('working-component')).toBeVisible()

    await page.getByTestId('trigger-error-button').click()

    await expect(page.getByText('Une erreur est survenue')).toBeVisible()
    await expect(page.getByRole('button', { name: /réessayer/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /accueil/i })).toBeVisible()
  })

  test('bouton Réessayer réinitialise le composant', async ({ page }) => {
    await page.goto('/test-error')
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()

    await page.getByTestId('trigger-error-button').click()
    await expect(page.getByText('Une erreur est survenue')).toBeVisible()

    await page.getByRole('button', { name: /réessayer/i }).click()
    await expect(page.getByText('Error Boundary Test Page')).toBeVisible()
    await expect(page.getByTestId('working-component')).toBeVisible()
  })

  test('bouton Accueil navigue vers la homepage', async ({ page }) => {
    await page.goto('/test-error')
    await page.getByTestId('trigger-error-button').click()
    await expect(page.getByText('Une erreur est survenue')).toBeVisible()

    await page.getByRole('button', { name: /accueil/i }).click()
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
  })

  test('navigation normale ne déclenche pas le boundary', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()

    await page.goto('/login')
    await expect(page.getByText('Une erreur est survenue')).not.toBeVisible()
  })
})
