/**
 * E2E pages secteur — /solutions/[slug]
 *
 * Vérifie le rendu de la première page secteur (restauration, SP-553) :
 * contenu SSR visible, FAQ interactive, JSON-LD FAQPage, maillage interne
 * depuis le footer, 404 sur slug inconnu, et accessibilité axe-core.
 *
 * @ticket SP-552, SP-553
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const A11Y_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
const SECTOR_URL = '/solutions/planning-restaurant'

test.describe('Page secteur restauration', () => {
  test('affiche le H1, la réponse directe et le titre SEO', async ({
    page,
  }) => {
    await page.goto(SECTOR_URL)

    await expect(page).toHaveTitle(
      /Logiciel de planning pour restaurant et hôtel/
    )
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /restauration et l'hôtellerie/,
      })
    ).toBeVisible()
    // Réponse directe (GEO) visible dès le chargement
    await expect(
      page.getByText(/SmartPlanning permet aux restaurants, bars et hôtels/)
    ).toBeVisible()
  })

  test('expose un JSON-LD avec FAQPage et BreadcrumbList', async ({ page }) => {
    await page.goto(SECTOR_URL)

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    expect(jsonLd).not.toBeNull()

    const graph = JSON.parse(jsonLd as string)['@graph'] as Array<{
      '@type': string
      mainEntity?: unknown[]
    }>
    const types = graph.map((node) => node['@type'])
    expect(types).toContain('WebPage')
    expect(types).toContain('FAQPage')
    expect(types).toContain('SoftwareApplication')

    const faq = graph.find((node) => node['@type'] === 'FAQPage')
    expect(faq?.mainEntity?.length).toBeGreaterThanOrEqual(4)
  })

  test('la FAQ révèle une réponse au clic', async ({ page }) => {
    await page.goto(SECTOR_URL)

    const question = page.getByRole('heading', {
      name: /horaires en coupure d'un restaurant/,
    })
    await question.scrollIntoViewIfNeeded()

    // La réponse reste dans le DOM pour le SEO (SP-552) : l'état
    // ouvert/fermé s'observe via aria-hidden, pas via la visibilité
    const answer = page
      .locator('div[aria-hidden]')
      .filter({ hasText: 'deux créneaux distincts' })
    await expect(answer).toHaveAttribute('aria-hidden', 'true')

    await question.click()
    await expect(answer).toHaveAttribute('aria-hidden', 'false')
  })

  test('le fil d’Ariane ramène à l’accueil', async ({ page }) => {
    await page.goto(SECTOR_URL)

    await page
      .getByRole('navigation', { name: /Fil d'Ariane/ })
      .getByRole('link', { name: 'Accueil' })
      .click()
    await expect(page).toHaveURL('/')
  })

  test('le footer de l’accueil pointe vers la page secteur', async ({
    page,
  }) => {
    await page.goto('/')

    const footerLink = page
      .locator('footer')
      .getByRole('link', { name: /Planning restauration/ })
    await footerLink.scrollIntoViewIfNeeded()
    await expect(footerLink).toHaveAttribute('href', SECTOR_URL)
  })

  test('un slug inconnu retourne un 404', async ({ page }) => {
    const response = await page.goto('/solutions/secteur-inconnu')
    expect(response?.status()).toBe(404)
  })

  test('la page commerce est servie avec son H1 et sa FAQ JSON-LD', async ({
    page,
  }) => {
    await page.goto('/solutions/planning-commerce')

    await expect(page).toHaveTitle(
      /Logiciel de planning pour commerce et retail/
    )
    await expect(
      page.getByRole('heading', { level: 1, name: /commerce et le retail/ })
    ).toBeVisible()

    const jsonLd = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent()
    const graph = JSON.parse(jsonLd as string)['@graph'] as Array<{
      '@type': string
    }>
    expect(graph.map((node) => node['@type'])).toContain('FAQPage')

    // Maillage : le footer de la page commerce référence les deux secteurs
    await expect(
      page.locator('footer').getByRole('link', { name: /Planning commerce/ })
    ).toHaveAttribute('href', '/solutions/planning-commerce')
  })

  test('aucune violation WCAG AA sur la page secteur', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('theme', 'light')
    })
    await page.goto(SECTOR_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(
      () => !document.documentElement.classList.contains('dark')
    )

    // Déclencher toutes les animations whileInView avant l'audit : axe
    // mesure sinon des contrastes faussés sur les éléments en cours de
    // fondu (opacité partielle)
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(1000)
    // Forcer l'état final des éléments animés par Framer (styles inline) :
    // l'audit doit mesurer les couleurs réellement perçues, pas un fondu
    await page.addStyleTag({
      content:
        'main [style] { opacity: 1 !important; transform: none !important; }',
    })
    await page.waitForTimeout(100)

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
