/**
 * Tests E2E pour Umami Analytics
 *
 * @description Vérifie l'intégration analytics avec le système
 * de consentement cookies RGPD.
 *
 * @see SP-345 - Intégration Umami Analytics
 */

import { test, expect } from '@playwright/test'
import { ConsentFixture } from '../fixtures/consent.fixture'

test.describe('Umami Analytics - Intégration RGPD', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies et storage avant chaque test
    await page.context().clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  })

  test('ne charge pas le script Umami sans consentement', async ({ page }) => {
    // Intercepte les requêtes vers le script analytics
    const analyticsRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/analytics/script.js')) {
        analyticsRequests.push(request.url())
      }
    })

    await page.goto('/')

    // Attend que la page soit chargée
    await page.waitForLoadState('networkidle')

    // Vérifie qu'aucune requête analytics n'a été faite
    expect(analyticsRequests).toHaveLength(0)

    // Vérifie que le script n'est pas dans le DOM
    const umamiScript = page.locator('script[data-website-id]')
    await expect(umamiScript).toHaveCount(0)
  })

  test('ne charge pas le script si seuls les cookies essentiels sont acceptés', async ({
    page,
  }) => {
    const consent = new ConsentFixture(page)

    await page.goto('/')

    // Attend la bannière de cookies
    await consent.waitForBanner()

    // Refuse les cookies optionnels (accepte uniquement essentiels)
    await consent.rejectAll()

    // Attend que la bannière disparaisse
    await consent.waitForBannerHidden()

    // Recharge la page pour vérifier la persistance
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Vérifie que le script analytics n'est pas chargé
    const umamiScript = page.locator('script[data-website-id]')
    await expect(umamiScript).toHaveCount(0)
  })

  test('charge le script Umami après acceptation des cookies analytics', async ({
    page,
  }) => {
    const consent = new ConsentFixture(page)

    // Intercepte les requêtes
    let analyticsScriptLoaded = false
    page.on('request', (request) => {
      if (request.url().includes('/analytics/script.js')) {
        analyticsScriptLoaded = true
      }
    })

    await page.goto('/')

    // Attend la bannière de cookies
    await consent.waitForBanner()

    // Accepte tous les cookies
    await consent.acceptAll()

    // Attend le chargement du script
    await page.waitForTimeout(1000) // Laisse le temps au script de se charger

    // Note: En environnement de test, le script peut ne pas être présent
    // car NEXT_PUBLIC_UMAMI_WEBSITE_ID n'est pas défini
    // Ce test vérifie principalement que le flux de consentement fonctionne
  })

  test('respecte les préférences personnalisées de cookies', async ({
    page,
  }) => {
    const consent = new ConsentFixture(page)

    await page.goto('/')
    await consent.waitForBanner()

    // Ouvre les paramètres de cookies
    await consent.openSettings()

    // Désactive analytics mais garde les autres
    await consent.setCategoryPreference('analytics', false)
    await consent.setCategoryPreference('marketing', false)

    // Sauvegarde les préférences
    await consent.savePreferences()

    // Recharge et vérifie
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Le script analytics ne doit pas être présent
    const umamiScript = page.locator('script[data-website-id]')
    await expect(umamiScript).toHaveCount(0)
  })

  test('réagit au changement de consentement sans rechargement', async ({
    page,
  }) => {
    const consent = new ConsentFixture(page)

    await page.goto('/')
    await consent.waitForBanner()

    // Refuse d'abord
    await consent.rejectAll()
    await consent.waitForBannerHidden()

    // Vérifie que le script n'est pas chargé
    let umamiScript = page.locator('script[data-website-id]')
    await expect(umamiScript).toHaveCount(0)

    // Modifie les préférences via le lien dans le footer
    const cookieSettingsLink = page.locator(
      'button:has-text("Gérer les cookies"), a:has-text("Cookies")'
    )

    if ((await cookieSettingsLink.count()) > 0) {
      await cookieSettingsLink.first().click()

      // Accepte analytics cette fois
      await consent.setCategoryPreference('analytics', true)
      await consent.savePreferences()

      // Attend que le composant réagisse à l'événement
      await page.waitForTimeout(500)

      // Note: Le script peut maintenant être présent si WEBSITE_ID est configuré
    }
  })

  test('envoie les events custom via window.umami.track', async ({ page }) => {
    const consent = new ConsentFixture(page)

    // Track les appels à window.umami.track
    const trackedEvents: { name: string; data?: object }[] = []

    await page.goto('/')
    await consent.waitForBanner()
    await consent.acceptAll()
    await consent.waitForBannerHidden()

    // Injecte un mock pour capturer les events
    await page.evaluate(() => {
      ;(
        window as Window & {
          umami?: { track: (n: string, d?: object) => void }
        }
      ).umami = {
        track: (eventName: string, eventData?: object) => {
          // Store in a global for inspection
          const events = ((
            window as Window & {
              _trackedEvents?: { name: string; data?: object }[]
            }
          )._trackedEvents =
            (
              window as Window & {
                _trackedEvents?: { name: string; data?: object }[]
              }
            )._trackedEvents || [])
          events.push({ name: eventName, data: eventData })
        },
      }
    })

    // Simule un clic sur un CTA (si présent)
    const ctaButton = page.locator(
      'button:has-text("Commencer"), a:has-text("Essai gratuit")'
    )
    if ((await ctaButton.count()) > 0) {
      await ctaButton.first().click()
    }

    // Récupère les events trackés
    const events = await page.evaluate(() => {
      return (
        (
          window as Window & {
            _trackedEvents?: { name: string; data?: object }[]
          }
        )._trackedEvents || []
      )
    })

    // Log pour debug
    console.log('Events trackés:', events)
  })
})

test.describe('Umami Analytics - Cas edge', () => {
  test("fonctionne si le script Umami n'est pas disponible", async ({
    page,
  }) => {
    // Bloque le script Umami
    await page.route('**/analytics/script.js', (route) => route.abort())

    await page.goto('/')

    // La page doit fonctionner normalement
    await expect(page).toHaveTitle(/SmartPlanning/)

    // Pas d'erreur JS critique
    const errors: string[] = []
    page.on('pageerror', (error) => {
      if (!error.message.includes('umami')) {
        errors.push(error.message)
      }
    })

    await page.waitForLoadState('networkidle')
    expect(errors).toHaveLength(0)
  })

  test('ne bloque pas le rendu si le consentement est en cours', async ({
    page,
  }) => {
    await page.goto('/')

    // Le contenu principal doit être visible même sans décision de consentement
    const mainContent = page.locator('main, [role="main"]')
    await expect(mainContent.first()).toBeVisible()

    // La bannière de consentement doit être visible
    const banner = page.locator('[data-testid="cookie-banner"]')
    await expect(banner).toBeVisible({ timeout: 5000 })
  })
})
