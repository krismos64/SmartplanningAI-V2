/**
 * SP-617 : un jour planifié hors des jours d'ouverture est proposé à l'ajout.
 *
 * Patisserie CARL planifiait le week-end avec des jours d'ouverture restés à
 * lundi-vendredi. TechCorp, dans le seed, ouvre du lundi au samedi : un
 * créneau le dimanche doit faire apparaître la proposition.
 *
 * Le test ne clique pas « Ajouter », qui modifierait les jours d'ouverture du
 * seed pour les autres specs. Il vérifie la proposition et son refus, qui
 * tient après rechargement. Le créneau est un brouillon : il ne prévient
 * aucun employé (SP-614).
 */
import { test, expect, type Page } from '@playwright/test'

import { loginAs, TEST_USERS } from '../../fixtures/auth.fixture'

const DIRECTEUR = TEST_USERS.DIRECTOR!

async function ouvrirLaGrille(page: Page): Promise<void> {
  await page.goto('/app/dashboard/schedules')
  await page.waitForLoadState('domcontentloaded')
  await page.getByTestId('new-shift-button').first().waitFor({ timeout: 60000 })
  const refuser = page.getByTestId('cookie-reject-all')
  await refuser.waitFor({ timeout: 5000 }).catch(() => {})
  if (await refuser.isVisible()) await refuser.click()
}

test.describe("SP-617 : jours d'ouverture proposés", () => {
  test('un brouillon le dimanche propose le dimanche, le refus tient', async ({
    page,
  }) => {
    await loginAs(page, DIRECTEUR)
    await ouvrirLaGrille(page)

    // Une case libre du dimanche, quel que soit l'employé
    await page
      .getByRole('button', { name: /Créer un planning pour .* le dimanche/ })
      .first()
      .click({ force: true })
    const modale = page.getByTestId('shift-modal')
    await expect(modale).toBeVisible()
    await modale
      .getByText('Statut', { exact: true })
      .locator('..')
      .getByRole('combobox')
      .click()
    await page.getByRole('option', { name: 'Brouillon' }).click()
    await modale.getByTestId('shift-save-button').click()
    await expect(modale).toBeHidden({ timeout: 15000 })

    const proposition = page.getByTestId('opening-days-suggestion')
    await expect(proposition).toBeVisible({ timeout: 15000 })
    await expect(proposition).toContainText('dimanche')

    await proposition.getByRole('button', { name: 'Ne plus proposer' }).click()
    await expect(proposition).toBeHidden()

    await page.reload()
    await page
      .getByTestId('new-shift-button')
      .first()
      .waitFor({ timeout: 60000 })
    await page.waitForTimeout(2000)
    await expect(page.getByTestId('opening-days-suggestion')).toBeHidden()
  })
})
