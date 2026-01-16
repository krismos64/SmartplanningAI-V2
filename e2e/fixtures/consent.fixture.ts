/**
 * Fixture pour la gestion du consentement cookies en E2E
 *
 * Pre-configure le cookie de consentement pour eviter que la banniere
 * bloque les interactions dans les tests E2E.
 *
 * @ticket SP-283
 */

import { test as base, BrowserContext } from '@playwright/test'

// =============================================================================
// Cookie Consent Configuration
// =============================================================================

/**
 * Nom du cookie de consentement (doit correspondre a CONSENT_COOKIE_NAME dans types.ts)
 */
export const CONSENT_COOKIE_NAME = 'cookie-consent'

/**
 * Cree la valeur du cookie de consentement pour les tests E2E
 * Simule un utilisateur ayant deja accepte tous les cookies
 */
export function createConsentCookieValue(): string {
  const consent = {
    version: 1,
    timestamp: new Date().toISOString(),
    preferences: {
      essential: true,
      analytics: true,
      functional: true,
    },
  }
  return encodeURIComponent(JSON.stringify(consent))
}

/**
 * Ajoute le cookie de consentement au contexte Playwright
 * @param context - Contexte Playwright
 */
export async function setConsentCookie(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: CONSENT_COOKIE_NAME,
      value: createConsentCookieValue(),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])
}

/**
 * Supprime le cookie de consentement du contexte
 * Utile pour tester l'affichage de la banniere
 * @param context - Contexte Playwright
 */
export async function clearConsentCookie(
  context: BrowserContext
): Promise<void> {
  await context.clearCookies({ name: CONSENT_COOKIE_NAME })
}

// =============================================================================
// Extended Test Fixture
// =============================================================================

/**
 * Fixture de test avec consentement cookies pre-configure
 *
 * Utilise cette fixture au lieu de `test` de @playwright/test
 * pour avoir automatiquement le cookie de consentement configure,
 * evitant ainsi que la banniere bloque les clics.
 *
 * @example
 * ```ts
 * import { test, expect } from '../fixtures/consent.fixture'
 *
 * test('mon test', async ({ page }) => {
 *   await page.goto('/')
 *   // La banniere ne s'affiche pas car le cookie est pre-configure
 * })
 * ```
 */
export const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext()
    await setConsentCookie(context)
    await use(context)
    await context.close()
  },
})

export { expect } from '@playwright/test'
