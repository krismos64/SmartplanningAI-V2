/**
 * E2E visual regression — landing page
 *
 * Capture la landing full-page en mode clair et sombre.
 * Génère la baseline au premier run, compare aux runs suivants.
 *
 * Baselines stockées sous e2e/specs/landing/visual.spec.ts-snapshots/
 * Tolérance fixée à 1 % de pixels divergents (largement permissif pour
 * absorber les animations fluides — float, pulse — sans masquer les vrais
 * écarts visuels).
 */

import { test, expect } from '@playwright/test'

// Stabiliser le viewport pour la comparaison
const VIEWPORT = { width: 1440, height: 900 }

test.describe('Landing — visual regression', () => {
  test.use({ viewport: VIEWPORT })

  test('snapshot full-page mode clair', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
    })
    await page.waitForLoadState('networkidle')

    // Désactiver les animations CSS et Framer Motion pour stabiliser la capture
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    await expect(page).toHaveScreenshot('landing-light.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    })
  })

  test('snapshot full-page mode sombre', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await page.waitForLoadState('networkidle')

    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    })

    await expect(page).toHaveScreenshot('landing-dark.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    })
  })
})
