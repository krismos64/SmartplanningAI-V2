/**
 * SP-601 : la grille hebdomadaire liste les employes de l'entreprise.
 *
 * Avant, elle deduisait ses lignes des seuls creneaux et conges de la
 * semaine. Une entreprise sans planning n'affichait donc aucune ligne, et il
 * n'existait aucune case ou cliquer pour en creer un : le dirigeant de
 * « bureau vallee vichy » a ouvert cet ecran sept fois sans jamais creer de
 * creneau, avec onze employes en base.
 *
 * Ces specs s'appuient sur les comptes du seed, comme le reste du harnais.
 */
import { test, expect, type Page } from '@playwright/test'

import { loginAs, TEST_USERS } from '../../fixtures/auth.fixture'

/**
 * Compte DIRECTOR de TechCorp, dont la souscription est active dans le seed.
 * StartupInc ne convient pas : son `trialEndsAt` y vaut le 31 decembre 2025,
 * donc le garde d'abonnement detourne vers la facturation et l'ecran des
 * plannings n'est jamais rendu.
 *
 * TechCorp porte 110 employes actifs et aucun creneau, soit exactement le cas
 * du defaut, a plus grande echelle.
 */
const DIRECTEUR = TEST_USERS.DIRECTOR!

async function ouvrirLaGrille(page: Page): Promise<void> {
  await loginAs(page, DIRECTEUR)

  await page.goto('/app/dashboard/schedules')
  await page.waitForLoadState('domcontentloaded')
  await page.getByTestId('new-shift-button').waitFor({ timeout: 60000 })

  // Repondre au consentement, qui sinon recouvre la grille (SP-600)
  await page
    .getByTestId('cookie-reject-all')
    .click()
    .catch(() => {})
  await page.waitForTimeout(1500)
}

test.describe('SP-601 : la grille liste les employes de l entreprise', () => {
  test('une ligne par employe, meme sans aucun creneau', async ({ page }) => {
    await ouvrirLaGrille(page)

    // C'est la mesure du defaut : avant correctif, une seule ligne, celle du
    // message « Aucun planning cette semaine », pour une entreprise qui
    // compte pourtant plusieurs collaborateurs.
    const lignes = page.locator('tbody tr')
    await expect(lignes.first()).toBeVisible()

    const nombre = await lignes.count()
    expect(nombre).toBeGreaterThan(1)

    // Et ce sont bien des employes, pas un message d'etat vide.
    await expect(page.getByText('Aucun collaborateur à planifier')).toHaveCount(
      0
    )
  })

  test('les cases libres sont cliquables pour un role qui peut creer', async ({
    page,
  }) => {
    await ouvrirLaGrille(page)

    // Sans ligne d'employe, il n'existait aucune case ou cliquer : le seul
    // point d'entree etait le bouton en haut de page.
    const cases = page.getByTestId('empty-cell-button')
    expect(await cases.count()).toBeGreaterThan(0)
  })

  test('un clic sur une case libre pre-remplit la creation', async ({
    page,
  }) => {
    await ouvrirLaGrille(page)

    // Le nom de la premiere ligne. La cellule porte aussi les initiales de
    // l'avatar, d'ou la derniere ligne de son texte plutot que le tout.
    const premiereLigne = page.locator('tbody tr').first()
    const cellule = await premiereLigne.locator('td').first().innerText()
    const nomAffiche = cellule.split('\n').filter(Boolean).pop()?.trim() ?? ''

    await page.getByTestId('empty-cell-button').first().click({ force: true })

    const modale = page.getByRole('dialog').last()
    await expect(modale).toBeVisible()
    await expect(modale).toContainText('Créer un planning')

    // L'employe de la ligne cliquee est deja selectionne : la creation part
    // d'un formulaire rempli, et non d'un formulaire vierge. La selection se
    // lit sur les badges, un seul devant etre present.
    expect(nomAffiche.length).toBeGreaterThan(0)
    const badges = modale.getByTestId('selected-employee-badge')
    await expect(badges).toHaveCount(1)
    await expect(badges.first()).toContainText(nomAffiche)
  })
})
