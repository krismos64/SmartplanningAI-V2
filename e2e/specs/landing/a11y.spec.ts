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

  /**
   * La page /contact porte le seul formulaire du site public. Labels,
   * messages d'erreur relies par `aria-describedby` et contraste des champs
   * sont exactement ce qu'un audit statique attrape, et ce qu'une reprise
   * visuelle casse le plus facilement.
   *
   * Un seul mode ici : les pages publiques n'ont plus de variante sombre
   * depuis SP-573, le theme de l'application ne les atteint pas.
   *
   * @see SP-574
   */
  test('aucune violation WCAG AA sur la page contact', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')
    // Le formulaire s'anime au montage : attendre qu'il soit visible, sinon
    // axe auditerait un arbre encore a `opacity: 0`.
    await page.getByLabel(/nom complet/i).waitFor({ state: 'visible' })

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations sur /contact :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })
})
