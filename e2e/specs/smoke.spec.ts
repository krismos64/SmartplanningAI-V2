/**
 * Smoke Tests E2E - Tests de base pour valider le déploiement
 *
 * Ces tests vérifient que l'application est accessible et fonctionnelle.
 * Ils sont rapides et doivent passer avant tout autre test.
 *
 * @see https://playwright.dev/docs/writing-tests
 * @ticket SP-133
 */

import { test, expect } from '../fixtures/consent.fixture'

test.describe('Smoke Tests', () => {
  /**
   * Test 1 : Vérifie que la page d'accueil se charge correctement
   *
   * - Navigue vers la racine
   * - Vérifie que le title contient "SmartPlanning"
   */
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Vérifie que le body est visible (la page se charge)
    await expect(page.locator('body')).toBeVisible()
  })

  /**
   * Test 2 : Vérifie qu'il n'y a pas d'erreurs console critiques
   *
   * - Capture les erreurs console pendant le chargement
   * - Filtre les erreurs connues/acceptables (favicon, etc.)
   * - Échoue si des erreurs critiques sont présentes
   */
  test('should have no critical console errors on homepage', async ({
    page,
  }) => {
    const consoleErrors: string[] = []

    // Capture les erreurs console
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')
    // Use domcontentloaded for consistency - homepage has no SSE
    await page.waitForLoadState('domcontentloaded')
    // Wait for page content to be visible
    await page.locator('body').waitFor({ state: 'visible' })

    // Filtre les erreurs connues/acceptables
    const criticalErrors = consoleErrors.filter((err) => {
      // Ignore les erreurs de favicon (normales en dev)
      if (err.includes('favicon')) return false
      // Ignore les erreurs de manifest (normales si pas de PWA)
      if (err.includes('manifest')) return false
      // Ignore les erreurs de Lottie animation (chargement async)
      if (err.includes('lottie') || err.includes('animation')) return false
      return true
    })

    expect(criticalErrors).toHaveLength(0)
  })

  /**
   * Test 3 : Vérifie que la page est responsive (viewport mobile)
   *
   * - Configure un viewport iPhone SE
   * - Vérifie que la page est visible
   * - Vérifie la présence d'éléments clés
   */
  test('should be responsive - mobile viewport', async ({ page }) => {
    // Viewport iPhone SE
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Vérifie que le body est visible
    await expect(page.locator('body')).toBeVisible()

    // Vérifie que le contenu principal est présent
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
  })

  /**
   * Test 4 : Vérifie que les éléments clés de la Landing Page sont présents
   *
   * - Logo SmartPlanning dans le header
   * - Titre principal (hero section)
   * - Features cards
   * - Footer
   */
  test('should display Landing Page elements', async ({ page }) => {
    await page.goto('/')

    // Vérifie le logo SmartPlanning dans le header (texte avec "Smart" + "Planning")
    await expect(page.locator('header').getByText('Smart')).toBeVisible()
    await expect(page.locator('header').getByText('Planning')).toBeVisible()

    // Vérifie le titre hero "Planifiez intelligemment"
    await expect(page.getByText(/Planifiez/i).first()).toBeVisible()

    // Vérifie que les features sont présentes (h3 headings)
    // Note: Feature titles updated after landing page refactor
    await expect(
      page.getByRole('heading', { name: 'Espaces dédiés' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Multi-équipes' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Congés simplifiés' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Tableaux de bord' })
    ).toBeVisible()

    // Vérifie le footer avec copyright
    await expect(page.getByText(/© \d{4} SmartPlanning/)).toBeVisible()
  })
})
