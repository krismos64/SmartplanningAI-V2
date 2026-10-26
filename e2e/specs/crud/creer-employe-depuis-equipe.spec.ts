/**
 * SP-613 : créer un employé depuis une équipe, et revenir à ses membres.
 *
 * Les deux dirigeants inscrits en octobre 2026 ont créé une équipe, ouvert
 * « Ajouter un membre », et trouvé une liste vide qui leur disait que « tous
 * les employés sont déjà dans une équipe ». Ils n'en avaient aucun. Le
 * dialogue propose désormais « Créer un employé », qui ouvre le formulaire
 * avec l'équipe choisie et ramène à ses membres après la création.
 *
 * Compte DIRECTOR de TechCorp, souscription active dans le seed.
 */
import { test, expect, type Page } from '@playwright/test'

import { loginAs, TEST_USERS } from '../../fixtures/auth.fixture'

const DIRECTEUR = TEST_USERS.DIRECTOR!

/**
 * La bannière de consentement est modale : tant qu'elle est ouverte, le reste
 * de la page sort de l'arbre d'accessibilité et aucun sélecteur par rôle ne
 * trouve rien (SP-600). Elle s'affiche après l'hydratation, d'où l'attente.
 */
async function refuserLesCookies(page: Page): Promise<void> {
  const refuser = page.getByTestId('cookie-reject-all')
  await refuser.waitFor({ timeout: 5000 }).catch(() => {})
  if (await refuser.isVisible()) await refuser.click()
}

test.describe('SP-613 : création d employé depuis une équipe', () => {
  test("le formulaire reprend l'équipe et ramène à ses membres", async ({
    page,
  }) => {
    await loginAs(page, DIRECTEUR)

    // Première équipe de la liste : son identifiant vient de l'URL de détail
    await page.goto('/app/director/teams')
    await refuserLesCookies(page)
    const lienEquipe = page
      .locator('a[href^="/app/director/teams/"]')
      .filter({ hasNotText: /nouvelle|créer/i })
      .first()
    const href = await lienEquipe.getAttribute('href')
    const teamId = href?.split('/')[4]
    expect(teamId).toBeTruthy()

    await page.goto(`/app/dashboard/employees/new?teamId=${teamId}`)
    await refuserLesCookies(page)
    // Le combobox n'a pas de nom accessible : le libellé « Équipe » ne lui
    // est pas rattaché. On le retrouve par son conteneur.
    const equipe = page
      .getByText('Équipe', { exact: true })
      .locator('..')
      .getByRole('combobox')
      .first()
    await expect(equipe).toBeVisible({ timeout: 30000 })
    await expect(equipe).not.toContainText(/sélectionner|aucune/i)

    // Le nom n'accepte que des lettres : le suffixe unique est donc écrit
    // en lettres, un chiffre étant refusé côté serveur.
    const suffixe = Date.now()
      .toString()
      .slice(-6)
      .replace(/\d/g, (c) => 'abcdefghij'[Number(c)] ?? 'a')
    await page.getByLabel('Prénom *', { exact: true }).first().fill('Laura')
    await page
      .getByLabel('Nom *', { exact: true })
      .first()
      .fill(`Equipe${suffixe}`)
    await page.getByRole('button', { name: "Créer l'employé" }).click()

    // Souscription active dans le seed : le dirigeant confirme le coût du
    // siège dans une boîte de dialogue.
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: 'Confirmer la création' })
      .click()

    await expect(page).toHaveURL(
      new RegExp(`/app/director/teams/${teamId}/members$`),
      { timeout: 30000 }
    )
    await expect(page.getByText(`Laura Equipe${suffixe}`)).toBeVisible({
      timeout: 15000,
    })
  })

  test("un identifiant d'équipe inconnu est ignoré", async ({ page }) => {
    await loginAs(page, DIRECTEUR)

    await page.goto(
      '/app/dashboard/employees/new?teamId=cl000000000000000000xxxx1'
    )
    await refuserLesCookies(page)
    const retour = page.getByRole('link', { name: /retour/i })
    await expect(retour).toHaveAttribute('href', '/app/dashboard/employees', {
      timeout: 30000,
    })
  })
})
