/**
 * SP-614 : les brouillons de la période sont signalés, et se publient d'un clic.
 *
 * Le 22 octobre 2026, Patisserie CARL a posé 40 créneaux en brouillon sur un
 * mois. Rien ne disait que ses employées ne les verraient pas, et aucun bouton
 * ne permettait de les publier d'un coup.
 *
 * Compte DIRECTOR de TechCorp, souscription active dans le seed (voir SP-601).
 */
import { test, expect, type Page } from '@playwright/test'

import { loginAs, TEST_USERS } from '../../fixtures/auth.fixture'

const DIRECTEUR = TEST_USERS.DIRECTOR!

async function ouvrirLaGrille(page: Page): Promise<void> {
  await loginAs(page, DIRECTEUR)

  await page.goto('/app/dashboard/schedules')
  await page.waitForLoadState('domcontentloaded')
  // .first() : pendant l'hydratation, deux rendus du bouton coexistent un
  // instant, y compris en build de production (mesuré le 26/10/2026)
  await page.getByTestId('new-shift-button').first().waitFor({ timeout: 60000 })

  await page
    .getByTestId('cookie-reject-all')
    .click()
    .catch(() => {})
  await page.waitForTimeout(1500)
}

test.describe('SP-614 : publication des brouillons', () => {
  test('un brouillon fait apparaître le bandeau, Publier le fait disparaître', async ({
    page,
  }) => {
    await ouvrirLaGrille(page)

    // Une case libre : aucun créneau ni congé ce jour-là pour cet employé,
    // donc aucun conflit possible, même après plusieurs exécutions locales.
    await page.getByTestId('empty-cell-button').first().click({ force: true })
    const modale = page.getByTestId('shift-modal')
    await expect(modale).toBeVisible()

    // Le formulaire crée en « Confirmé » par défaut : choisir « Brouillon »,
    // comme l'a fait le dirigeant de Patisserie CARL.
    await modale
      .getByText('Statut', { exact: true })
      .locator('..')
      .getByRole('combobox')
      .click()
    await page.getByRole('option', { name: 'Brouillon' }).click()
    await modale.getByTestId('shift-save-button').click()
    await expect(modale).toBeHidden({ timeout: 15000 })

    const bandeau = page.getByTestId('drafts-banner')
    await expect(bandeau).toBeVisible({ timeout: 15000 })
    await expect(bandeau).toContainText('en brouillon sur cette période')

    await page.getByTestId('publish-drafts-button').click()

    await expect(page.getByText(/créneaux? publiés?/)).toBeVisible({
      timeout: 15000,
    })
    await expect(bandeau).toBeHidden({ timeout: 15000 })
  })
})
