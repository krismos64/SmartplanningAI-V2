/**
 * E2E accessibilité — landing page
 *
 * Vérifie via axe-core l'absence de violations WCAG 2.1 AA sur la landing,
 * en mode clair ET en mode sombre. Cible le périmètre du refactor de
 * discipline chromatique (token primary unique).
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

test.describe('Landing — accessibilité axe-core', () => {
  test('aucune violation WCAG AA en mode clair', async ({ page }) => {
    // Forcer le thème clair AVANT le chargement : next-themes lit cette clé
    // au boot et applique `light`. Retirer `.dark` après coup ne suffit pas,
    // car le provider (defaultTheme="dark") la réapplique à l'hydration.
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Garde-fou : vérifier qu'on est bien en mode clair avant l'audit.
    await page.waitForFunction(
      () => !document.documentElement.classList.contains('dark')
    )

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      // Exclusions hors périmètre de ce sprint (composants partagés
      // non touchés par le refactor de discipline chromatique).
      .exclude('iframe[src*="youtube"]')
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations en mode clair :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })

  test('aucune violation WCAG AA en mode sombre', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'dark')
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('dark')
    )

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      .exclude('iframe[src*="youtube"]')
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations en mode sombre :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })
})
