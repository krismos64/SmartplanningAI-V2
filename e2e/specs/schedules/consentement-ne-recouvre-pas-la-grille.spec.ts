/**
 * SP-600 : le consentement cookies ne doit plus recouvrir le back-office.
 *
 * Defaut mesure le 19 septembre 2026 sur `/app/dashboard/schedules` : la
 * banniere fixe occupait 235,5 px en bas d'ecran et recouvrait 158,5 px des
 * 179 px de la grille, soit 89 pour cent. Le recouvrement absorbait les clics,
 * `elementFromPoint` renvoyant la banniere sur les quatre points testes.
 *
 * Ces specs verifient les deux moities du correctif : la grille est libre, et
 * le consentement reste recueilli, par une modale qui se traite en un clic.
 *
 * Elles n'utilisent volontairement PAS les fixtures `directorPage` : celles-ci
 * posent le cookie de consentement au demarrage (`consent.fixture.ts`), alors
 * que ces tests doivent observer l'etat d'un visiteur qui n'a pas encore
 * tranche. Elles reutilisent en revanche `loginAs`, qui porte les attentes
 * d'hydratation et les reprises necessaires en CI.
 */
import { test, expect, type Page } from '@playwright/test'

import { loginAs, TEST_USERS } from '../../fixtures/auth.fixture'

/** Points echantillonnes dans la zone de grille autrefois recouverte. */
const POINTS_DE_GRILLE = [500, 550, 600, 640]

/**
 * Compte DIRECTOR de TechCorp, dont la souscription est active dans le seed.
 * StartupInc ne convient pas : son `trialEndsAt` y vaut le 31 decembre 2025,
 * donc le garde d'abonnement detourne vers la facturation et l'ecran des
 * plannings n'est jamais rendu.
 */
const DIRECTEUR = TEST_USERS.DIRECTOR!

async function ouvrirLesPlannings(page: Page): Promise<void> {
  await loginAs(page, DIRECTEUR)

  await page.goto('/app/dashboard/schedules')
  await page.waitForLoadState('domcontentloaded')
  await page.getByTestId('new-shift-button').waitFor({ timeout: 60000 })
}

test.describe('SP-600 : consentement cookies dans le back-office', () => {
  test("la banniere fixe ne s'affiche plus dans l'application privee", async ({
    page,
  }) => {
    await ouvrirLesPlannings(page)

    // C'est la banniere `fixed bottom-0` qui recouvrait la grille.
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0)
  })

  test('le consentement est bien demande, par une modale', async ({ page }) => {
    await ouvrirLesPlannings(page)

    // Umami n'exclut aucune route : le consentement reste du ici.
    await expect(page.getByTestId('cookie-consent-dialog')).toBeVisible()
  })

  test("a l'arrivee, le consentement n'intercepte aucun clic sur la grille", async ({
    page,
  }) => {
    await ouvrirLesPlannings(page)

    // Mesure faite AVANT de repondre, c'est-a-dire dans l'etat exact ou se
    // trouvait le dirigeant de bureau vallee vichy. La banniere `fixed
    // bottom-0` interceptait alors les quatre points ; la modale, centree et
    // bien plus petite, n'en intercepte aucun.
    for (const y of POINTS_DE_GRILLE) {
      const intercepte = await page.evaluate((coordonneeY) => {
        const element = document.elementFromPoint(640, coordonneeY as number)
        if (!element) return false
        return !!element.closest('[data-testid="cookie-banner"]')
      }, y)

      expect(
        intercepte,
        `un clic en (640, ${y}) est intercepte par la banniere de consentement`
      ).toBe(false)
    }

    // Et le consentement se traite en un seul clic, qui libere l'ecran.
    await page.getByTestId('cookie-reject-all').click()
    await expect(page.getByTestId('cookie-consent-dialog')).toHaveCount(0)
  })

  test('le choix est memorise et la modale ne revient pas au rechargement', async ({
    page,
  }) => {
    await ouvrirLesPlannings(page)

    await page.getByTestId('cookie-reject-all').click()
    await expect(page.getByTestId('cookie-consent-dialog')).toHaveCount(0)

    await page.reload()
    await page.getByTestId('new-shift-button').waitFor({ timeout: 60000 })

    await expect(page.getByTestId('cookie-consent-dialog')).toHaveCount(0)
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0)
  })

  test('le site public garde sa banniere, et non la modale', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    await expect(page.getByTestId('cookie-banner')).toBeVisible()
    await expect(page.getByTestId('cookie-consent-dialog')).toHaveCount(0)
  })
})
