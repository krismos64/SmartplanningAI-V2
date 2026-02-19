/**
 * Tests E2E - Pages legales
 *
 * Valide les pages legales obligatoires (RGPD) :
 * - CGU (/cgu)
 * - CGV (/cgv)
 * - Politique de confidentialite (/confidentialite)
 * - Mentions legales (/mentions-legales)
 *
 * Chaque page doit afficher son titre, contenu principal,
 * table des matieres et etre responsive.
 */

import { test, expect } from '../../fixtures/consent.fixture'

// =============================================================================
// Configuration des pages legales a tester
// =============================================================================

const LEGAL_PAGES = [
  {
    path: '/cgu',
    title: /conditions générales d'utilisation/i,
    contentMatch: /article/i,
  },
  {
    path: '/cgv',
    title: /conditions générales de vente/i,
    contentMatch: /article/i,
  },
  {
    path: '/confidentialite',
    title: /politique de confidentialité/i,
    contentMatch: /données|rgpd/i,
  },
  {
    path: '/mentions-legales',
    title: /mentions légales/i,
    contentMatch: /éditeur|hébergeur|siret/i,
  },
] as const

// =============================================================================
// Tests parametriques pour chaque page legale
// =============================================================================

for (const legalPage of LEGAL_PAGES) {
  test.describe(`Page legale : ${legalPage.path}`, () => {
    test(`titre h1 visible`, async ({ page }) => {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      await expect(
        page.getByRole('heading', { level: 1 })
      ).toBeVisible()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        legalPage.title
      )
    })

    test(`contenu principal present`, async ({ page }) => {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      // Verifie qu'il y a du contenu textuel correspondant
      await expect(
        page.getByText(legalPage.contentMatch).first()
      ).toBeVisible()
    })

    test(`badge "Document légal" visible`, async ({ page }) => {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/document légal/i)).toBeVisible()
    })

    test(`footer copyright visible`, async ({ page }) => {
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByText(/© \d{4} SmartPlanning/)).toBeVisible()
    })

    test(`responsive : titre visible en mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto(legalPage.path)
      await page.waitForLoadState('domcontentloaded')

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    })
  })
}
