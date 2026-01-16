/**
 * Tests E2E pour le système de consentement cookies RGPD
 *
 * @ticket SP-283
 * @description Vérifie le comportement de la bannière cookies et du modal de préférences
 */

import { test, expect, Page } from '@playwright/test'

const CONSENT_COOKIE_NAME = 'cookie-consent'

/**
 * Helper pour supprimer le cookie de consentement
 */
async function clearConsentCookie(page: Page) {
  await page.context().clearCookies()
}

/**
 * Helper pour récupérer le cookie de consentement
 */
async function getConsentCookie(page: Page) {
  const cookies = await page.context().cookies()
  return cookies.find((c) => c.name === CONSENT_COOKIE_NAME)
}

test.describe('Cookie Banner - Affichage initial', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page)
  })

  test('affiche la bannière au premier chargement', async ({ page }) => {
    await page.goto('/')

    // La bannière doit être visible
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).toBeVisible()

    // Vérifie le contenu
    await expect(
      page.getByText('Nous respectons votre vie privée')
    ).toBeVisible()
    await expect(page.getByText('Tout accepter')).toBeVisible()
    await expect(page.getByText('Tout refuser')).toBeVisible()
    await expect(page.getByText('Personnaliser')).toBeVisible()
  })

  test("n'affiche pas la bannière si déjà consenti", async ({ page }) => {
    // Simule un consentement existant
    await page.goto('/')
    await page.getByText('Tout accepter').click()

    // Recharge la page
    await page.reload()

    // La bannière ne doit plus être visible
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).not.toBeVisible()
  })
})

test.describe('Cookie Banner - Actions', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')
    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })
  })

  test('"Tout accepter" ferme la bannière et sauvegarde le consentement', async ({
    page,
  }) => {
    // Utilise le texte visible dans la bannière (pas l'aria-label)
    await page.locator('div[role="dialog"]').getByText('Tout accepter').click()

    // La bannière disparaît
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).not.toBeVisible()

    // Le cookie est créé
    const cookie = await getConsentCookie(page)
    expect(cookie).toBeDefined()

    // Vérifie le contenu du cookie
    const cookieValue = JSON.parse(decodeURIComponent(cookie!.value))
    expect(cookieValue.preferences.essential).toBe(true)
    expect(cookieValue.preferences.analytics).toBe(true)
    expect(cookieValue.preferences.functional).toBe(true)
  })

  test('"Tout refuser" ferme la bannière et sauvegarde le consentement minimal', async ({
    page,
  }) => {
    // Utilise le texte visible dans la bannière
    await page.locator('div[role="dialog"]').getByText('Tout refuser').click()

    // La bannière disparaît
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).not.toBeVisible()

    // Le cookie est créé
    const cookie = await getConsentCookie(page)
    expect(cookie).toBeDefined()

    // Vérifie le contenu du cookie (essentiels uniquement)
    const cookieValue = JSON.parse(decodeURIComponent(cookie!.value))
    expect(cookieValue.preferences.essential).toBe(true)
    expect(cookieValue.preferences.analytics).toBe(false)
    expect(cookieValue.preferences.functional).toBe(false)
  })

  test('"Personnaliser" ouvre le modal de préférences', async ({ page }) => {
    // Utilise le texte visible dans la bannière
    await page.locator('div[role="dialog"]').getByText('Personnaliser').click()

    // Le modal s'ouvre - attendre que le titre soit visible
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).toBeVisible()

    // Vérifie les éléments du modal (utilise le label exact)
    await expect(
      page.getByText('Cookies essentiels', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('Cookies analytiques', { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText('Cookies fonctionnels', { exact: true })
    ).toBeVisible()
  })
})

test.describe('Cookie Preferences Modal', () => {
  test.beforeEach(async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')
    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })
    // Cliquer sur Personnaliser dans la bannière
    await page.locator('div[role="dialog"]').getByText('Personnaliser').click()
    // Attendre que le modal soit visible
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).toBeVisible()
  })

  test('le switch essential est désactivé et coché', async ({ page }) => {
    // Sélectionner le switch via son ID
    const essentialSwitch = page.locator('#cookie-essential')
    await expect(essentialSwitch).toBeDisabled()
    await expect(essentialSwitch).toHaveAttribute('data-state', 'checked')
  })

  test('les autres switches sont actifs et décochés par défaut', async ({
    page,
  }) => {
    const analyticsSwitch = page.locator('#cookie-analytics')
    const functionalSwitch = page.locator('#cookie-functional')

    await expect(analyticsSwitch).not.toBeDisabled()
    await expect(analyticsSwitch).toHaveAttribute('data-state', 'unchecked')

    await expect(functionalSwitch).not.toBeDisabled()
    await expect(functionalSwitch).toHaveAttribute('data-state', 'unchecked')
  })

  test('peut activer/désactiver les switches analytics et functional', async ({
    page,
  }) => {
    const analyticsSwitch = page.locator('#cookie-analytics')

    // Active analytics
    await analyticsSwitch.click()
    await expect(analyticsSwitch).toHaveAttribute('data-state', 'checked')

    // Désactive analytics
    await analyticsSwitch.click()
    await expect(analyticsSwitch).toHaveAttribute('data-state', 'unchecked')
  })

  test('"Sauvegarder mes choix" sauvegarde les préférences personnalisées', async ({
    page,
  }) => {
    // Active uniquement functional
    const functionalSwitch = page.locator('#cookie-functional')
    await functionalSwitch.click()

    // Sauvegarde (utilise le texte visible du bouton)
    await page.getByRole('dialog').getByText('Sauvegarder mes choix').click()

    // Le modal se ferme
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).not.toBeVisible()

    // Vérifie le cookie
    const cookie = await getConsentCookie(page)
    const cookieValue = JSON.parse(decodeURIComponent(cookie!.value))
    expect(cookieValue.preferences.essential).toBe(true)
    expect(cookieValue.preferences.analytics).toBe(false)
    expect(cookieValue.preferences.functional).toBe(true)
  })

  test('"Tout accepter" dans le modal accepte tout', async ({ page }) => {
    // Le modal Radix a un rôle dialog, utiliser le texte visible
    await page.getByRole('dialog').getByText('Tout accepter').click()

    const cookie = await getConsentCookie(page)
    const cookieValue = JSON.parse(decodeURIComponent(cookie!.value))
    expect(cookieValue.preferences.analytics).toBe(true)
    expect(cookieValue.preferences.functional).toBe(true)
  })

  test('"Tout refuser" dans le modal refuse les non-essentiels', async ({
    page,
  }) => {
    // Active d'abord quelque chose
    await page.locator('#cookie-analytics').click()

    // Le modal Radix a un rôle dialog
    await page.getByRole('dialog').getByText('Tout refuser').click()

    const cookie = await getConsentCookie(page)
    const cookieValue = JSON.parse(decodeURIComponent(cookie!.value))
    expect(cookieValue.preferences.analytics).toBe(false)
    expect(cookieValue.preferences.functional).toBe(false)
  })
})

test.describe('Cookie Settings Button - Footer', () => {
  test('permet de rouvrir les préférences après consentement', async ({
    page,
  }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Accepte tout (utilise le texte visible)
    await page.locator('div[role="dialog"]').getByText('Tout accepter').click()

    // Scroll jusqu'au footer et clique sur le bouton des paramètres
    const settingsButton = page.getByRole('button', {
      name: /paramètres des cookies/i,
    })
    await settingsButton.scrollIntoViewIfNeeded()
    await settingsButton.click()

    // Le modal s'ouvre
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).toBeVisible()

    // Vérifie que les préférences reflètent "tout accepter"
    const analyticsSwitch = page.locator('#cookie-analytics')
    await expect(analyticsSwitch).toHaveAttribute('data-state', 'checked')
  })

  test('affiche la date du dernier consentement', async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Accepte tout (utilise le texte visible)
    await page.locator('div[role="dialog"]').getByText('Tout accepter').click()

    // Ouvre les préférences depuis le footer
    const settingsButton = page.getByRole('button', {
      name: /paramètres des cookies/i,
    })
    await settingsButton.scrollIntoViewIfNeeded()
    await settingsButton.click()

    // Vérifie que la date du dernier consentement est affichée
    await expect(page.getByText(/Dernier consentement/i)).toBeVisible()
  })
})

test.describe('Persistance du consentement', () => {
  test('le consentement persiste après rechargement de page', async ({
    page,
  }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Accepte tout (utilise le texte visible)
    await page.locator('div[role="dialog"]').getByText('Tout accepter').click()

    // Recharge la page
    await page.reload()

    // Attendre que le hook soit chargé puis vérifier pas de bannière
    await page.waitForLoadState('networkidle')
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).not.toBeVisible()

    // Cookie toujours présent
    const cookie = await getConsentCookie(page)
    expect(cookie).toBeDefined()
  })

  test('le consentement persiste sur différentes pages', async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Accepte tout (utilise le texte visible)
    await page.locator('div[role="dialog"]').getByText('Tout accepter').click()

    // Navigue vers une autre page
    await page.goto('/cookies')
    await page.waitForLoadState('networkidle')

    // Pas de bannière sur la nouvelle page
    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).not.toBeVisible()
  })
})

test.describe('Accessibilité', () => {
  test('la bannière a les attributs ARIA corrects', async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    const banner = page.getByRole('dialog', { name: /paramètres des cookies/i })
    await expect(banner).toBeVisible({ timeout: 10000 })
    await expect(banner).toHaveAttribute('aria-describedby')
  })

  test('le modal peut être fermé avec la touche Escape', async ({ page }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Ouvrir le modal
    await page.locator('div[role="dialog"]').getByText('Personnaliser').click()

    // Attendre que le modal soit visible
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).toBeVisible()

    // Ferme avec la touche Escape (Radix UI gère ça)
    await page.keyboard.press('Escape')

    // Le modal se ferme
    await expect(
      page.getByRole('heading', { name: 'Préférences des cookies' })
    ).not.toBeVisible()
  })

  test('la navigation au clavier fonctionne dans la bannière', async ({
    page,
  }) => {
    await clearConsentCookie(page)
    await page.goto('/')

    // Attendre que la bannière soit visible
    await expect(
      page.getByRole('dialog', { name: /paramètres des cookies/i })
    ).toBeVisible({ timeout: 10000 })

    // Focus sur le premier bouton
    await page.keyboard.press('Tab')

    // Les boutons doivent être focusables
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
