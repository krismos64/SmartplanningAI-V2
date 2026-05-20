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
    await page.goto('/')
    // S'assurer qu'on est bien en light (pas de classe dark sur <html>)
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark')
    })
    await page.waitForLoadState('networkidle')

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
    await page.goto('/')
    await page.evaluate(() => {
      document.documentElement.classList.add('dark')
    })
    await page.waitForLoadState('networkidle')

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
