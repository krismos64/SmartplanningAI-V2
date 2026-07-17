/**
 * E2E guides pratiques — /guides et /guides/[slug]
 *
 * Vérifie le hub éditorial et le rendu des guides (SP-555) : liste des
 * guides, article complet avec sommaire ancré, JSON-LD Article/HowTo/
 * FAQPage, 404 sur slug inconnu, accessibilité axe-core.
 *
 * @ticket SP-555
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const GUIDE_URL = '/guides/faire-un-planning-equipe'

test.describe('Hub des guides', () => {
  test('liste les guides publiés avec leurs liens', async ({ page }) => {
    await page.goto('/guides')

    await expect(page).toHaveTitle(/Guides pratiques planning et RH/)
    await expect(
      page.getByRole('heading', { level: 1, name: /Guides pratiques/ })
    ).toBeVisible()

    const list = page.getByRole('list', {
      name: 'Liste des guides pratiques',
    })
    await expect(
      list.getByRole('link', { name: /faire un planning d'équipe/i })
    ).toHaveAttribute('href', GUIDE_URL)
    await expect(
      list.getByRole('link', { name: /congés payés/i })
    ).toHaveAttribute('href', '/guides/gerer-conges-payes-tpe-pme')
  })

  test('maille vers les pages secteur', async ({ page }) => {
    await page.goto('/guides')

    await expect(
      page
        .getByRole('list', { name: 'Pages solutions par secteur' })
        .getByRole('link', { name: /Restauration et hôtellerie/ })
    ).toHaveAttribute('href', '/solutions/planning-restaurant')
  })
})

test.describe('Page guide planning équipe', () => {
  test('affiche le H1, la réponse directe et le sommaire ancré', async ({
    page,
  }) => {
    await page.goto(GUIDE_URL)

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /Comment faire un planning d'équipe/,
      })
    ).toBeVisible()
    await expect(
      page.getByText(/procédez en 6 étapes/).first()
    ).toBeVisible()

    // Le sommaire pointe vers des sections réellement présentes
    const tocLink = page
      .getByRole('navigation', { name: 'Sommaire du guide' })
      .getByRole('link', { name: /vérifier le cadre légal/i })
    await expect(tocLink).toHaveAttribute('href', '#etape-3-regles-legales')
    await expect(page.locator('#etape-3-regles-legales')).toHaveCount(1)
  })

  test('expose un JSON-LD Article, HowTo et FAQPage', async ({ page }) => {
    await page.goto(GUIDE_URL)

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    const graph = JSON.parse(jsonLd as string)['@graph'] as Array<{
      '@type': string
      step?: unknown[]
    }>
    const types = graph.map((node) => node['@type'])
    expect(types).toContain('Article')
    expect(types).toContain('FAQPage')
    expect(types).toContain('HowTo')

    const howTo = graph.find((node) => node['@type'] === 'HowTo')
    expect(howTo?.step?.length).toBe(6)
  })

  test('la FAQ révèle une réponse au clic', async ({ page }) => {
    await page.goto(GUIDE_URL)

    const question = page.getByRole('heading', {
      name: /Excel suffit-il/,
    })
    await question.scrollIntoViewIfNeeded()

    const answer = page
      .locator('div[aria-hidden]')
      .filter({ hasText: 'Pour une petite équipe stable' })
    await expect(answer).toHaveAttribute('aria-hidden', 'true')

    await question.click()
    await expect(answer).toHaveAttribute('aria-hidden', 'false')
  })

  test('un slug inconnu retourne un 404', async ({ page }) => {
    const response = await page.goto('/guides/guide-inconnu')
    expect(response?.status()).toBe(404)
  })

  test('aucune violation WCAG AA sur le guide', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light')
    })
    await page.goto(GUIDE_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(
      () => !document.documentElement.classList.contains('dark')
    )

    const results = await new AxeBuilder({ page })
      .withTags(A11Y_TAGS)
      .exclude('[data-testid="cookie-accept-all"]')
      .exclude('button[aria-label="Accepter tous les cookies"]')
      .analyze()

    expect(
      results.violations,
      `Violations :\n${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([])
  })
})
