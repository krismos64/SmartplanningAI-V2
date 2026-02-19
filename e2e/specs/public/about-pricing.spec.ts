/**
 * Tests E2E - Pages A propos et Tarifs
 *
 * Valide les pages marketing publiques :
 * - A propos (/a-propos) : mission, valeurs, cibles
 * - Tarifs (/tarifs) : hero, simulateur, features, FAQ
 */

import { test, expect } from '../../fixtures/consent.fixture'

// =============================================================================
// Bloc 1 — Page A propos (/a-propos)
// =============================================================================

test.describe('Page A propos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/a-propos')
    await page.waitForLoadState('domcontentloaded')
  })

  test('affiche le titre h1 principal', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /mission/i
    )
  })

  test('affiche la section valeurs', async ({ page }) => {
    await expect(page.getByText(/nos.*valeurs/i).first()).toBeVisible()
    // Les 3 valeurs
    await expect(page.getByText(/simplicité/i).first()).toBeVisible()
    await expect(page.getByText(/proximité/i).first()).toBeVisible()
    await expect(page.getByText(/fiabilité/i).first()).toBeVisible()
  })

  test('affiche un CTA vers /register', async ({ page }) => {
    // Le CTA a aria-label="Créer un compte SmartPlanning gratuitement"
    const ctaLink = page.locator('a[href="/register"]').first()
    await expect(ctaLink).toBeVisible()
  })

  test('footer copyright visible', async ({ page }) => {
    await expect(page.getByText(/© \d{4} SmartPlanning/)).toBeVisible()
  })

  test('responsive : titre visible en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

// =============================================================================
// Bloc 2 — Page Tarifs (/tarifs)
// =============================================================================

test.describe('Page Tarifs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tarifs')
    await page.waitForLoadState('domcontentloaded')
  })

  test('affiche le titre h1 principal', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /tarif/i
    )
  })

  test('affiche le prix 2,90€', async ({ page }) => {
    await expect(page.getByText(/2[,.]90/i).first()).toBeVisible()
  })

  test('affiche la section "Ce qui est inclus"', async ({ page }) => {
    await expect(page.getByText(/ce qui est inclus/i).first()).toBeVisible()
  })

  test('affiche un CTA vers /register', async ({ page }) => {
    const ctaButton = page.locator('[data-testid="cta-register"]')
    const hasTestId = await ctaButton.isVisible().catch(() => false)

    if (hasTestId) {
      await expect(ctaButton).toBeVisible()
    } else {
      // Fallback : chercher le lien par texte
      const link = page.getByRole('link', { name: /démarrer|essayer|commencer/i }).first()
      await expect(link).toBeVisible()
    }
  })

  test('affiche la section FAQ', async ({ page }) => {
    await expect(page.getByText(/questions/i).first()).toBeVisible()
  })

  test('footer copyright visible', async ({ page }) => {
    await expect(page.getByText(/© \d{4} SmartPlanning/)).toBeVisible()
  })

  test('responsive : titre visible en mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
