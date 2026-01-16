/**
 * Fixture pour la gestion du consentement cookies en E2E
 *
 * Pre-configure le cookie de consentement pour eviter que la banniere
 * bloque les interactions dans les tests E2E.
 *
 * @ticket SP-283
 */

import { test as base, BrowserContext, Page } from '@playwright/test'

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

// =============================================================================
// ConsentFixture Class - Helper pour tests analytics
// =============================================================================

/**
 * Classe helper pour interagir avec la bannière de consentement dans les tests
 *
 * @example
 * ```ts
 * const consent = new ConsentFixture(page)
 * await consent.waitForBanner()
 * await consent.acceptAll()
 * ```
 */
export class ConsentFixture {
  constructor(private page: Page) {}

  /**
   * Attend que la bannière de consentement soit visible
   */
  async waitForBanner(): Promise<void> {
    await this.page
      .locator('[data-testid="cookie-banner"]')
      .waitFor({ state: 'visible', timeout: 10000 })
  }

  /**
   * Attend que la bannière soit masquée
   */
  async waitForBannerHidden(): Promise<void> {
    await this.page
      .locator('[data-testid="cookie-banner"]')
      .waitFor({ state: 'hidden', timeout: 5000 })
  }

  /**
   * Accepte tous les cookies
   */
  async acceptAll(): Promise<void> {
    const acceptButton = this.page.locator(
      '[data-testid="cookie-accept-all"], button:has-text("Accepter tout")'
    )
    await acceptButton.first().click()
  }

  /**
   * Refuse tous les cookies optionnels
   */
  async rejectAll(): Promise<void> {
    const rejectButton = this.page.locator(
      '[data-testid="cookie-reject-all"], button:has-text("Refuser"), button:has-text("Essentiels uniquement")'
    )
    await rejectButton.first().click()
  }

  /**
   * Ouvre les paramètres de cookies depuis la bannière
   */
  async openSettings(): Promise<void> {
    // Cibler spécifiquement le bouton dans la bannière (pas celui du footer)
    const settingsButton = this.page.locator(
      '[data-testid="cookie-banner"] [data-testid="cookie-settings"], [data-testid="cookie-banner"] button:has-text("Personnaliser")'
    )
    await settingsButton.first().click()
  }

  /**
   * Définit la préférence pour une catégorie de cookies
   */
  async setCategoryPreference(
    category: 'analytics' | 'functional' | 'marketing',
    enabled: boolean
  ): Promise<void> {
    const toggle = this.page.locator(
      `[data-testid="cookie-${category}-toggle"], input[name="${category}"], [data-category="${category}"]`
    )

    if ((await toggle.count()) > 0) {
      const isChecked = await toggle
        .first()
        .isChecked()
        .catch(() => false)
      if (isChecked !== enabled) {
        await toggle.first().click()
      }
    }
  }

  /**
   * Sauvegarde les préférences personnalisées
   */
  async savePreferences(): Promise<void> {
    const saveButton = this.page.locator(
      '[data-testid="cookie-save"], button:has-text("Sauvegarder"), button:has-text("Enregistrer")'
    )
    await saveButton.first().click()
  }
}
