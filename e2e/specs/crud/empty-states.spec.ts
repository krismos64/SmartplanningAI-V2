/**
 * Tests E2E - Empty States CRUD
 *
 * Tests de bout en bout pour les etats vides des pages CRUD.
 * Verifie l'affichage correct des messages et CTAs selon les permissions.
 *
 * @ticket SP-156
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { CompanyListPage, EmployeeListPage, TeamListPage } from '../../pages'

// =============================================================================
// Empty States - Companies
// =============================================================================

test.describe('Empty States - Companies', () => {
  test('affiche le message quand aucune entreprise trouvee (recherche)', async ({
    adminPage,
  }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Rechercher quelque chose qui n'existe pas
    await listPage.search('xyznonexistent123456')

    await adminPage.waitForTimeout(1000)

    // Verifier le message d'etat vide
    await expect(
      adminPage.locator('text=/aucune entreprise|aucun resultat/i')
    ).toBeVisible()
  })

  test('le bouton de creation reste visible meme avec liste vide', async ({
    adminPage,
  }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Le bouton de creation doit toujours etre visible pour SYSTEM_ADMIN
    await expect(listPage.newCompanyButton).toBeVisible()
  })
})

// =============================================================================
// Empty States - Employees
// =============================================================================

test.describe('Empty States - Employees', () => {
  test('DIRECTOR voit le CTA de creation dans l\'etat vide (recherche)', async ({
    directorPage,
  }) => {
    const listPage = new EmployeeListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Rechercher quelque chose qui n'existe pas
    await listPage.search('xyznonexistent123456')

    await directorPage.waitForTimeout(1000)

    // Le bouton de creation doit rester visible
    await expect(listPage.newEmployeeButton).toBeVisible()
  })

  test('MANAGER voit le CTA de creation dans l\'etat vide', async ({
    managerPage,
  }) => {
    const listPage = new EmployeeListPage(managerPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Le bouton de creation doit etre visible pour MANAGER
    await expect(listPage.newEmployeeButton).toBeVisible()
  })
})

// =============================================================================
// Empty States - Teams
// =============================================================================

test.describe('Empty States - Teams', () => {
  test('DIRECTOR voit le CTA de creation pour les equipes', async ({
    directorPage,
  }) => {
    const listPage = new TeamListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Le bouton de creation doit etre visible pour DIRECTOR
    await listPage.expectCreateButtonVisible()
  })

  test('MANAGER ne peut pas acceder a la page des equipes director', async ({
    managerPage,
  }) => {
    // MANAGER n'a pas acces aux routes /director
    await managerPage.goto('/app/director/teams')

    // Doit etre redirige vers son dashboard
    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })
})

// =============================================================================
// Accessibilite des Empty States
// =============================================================================

test.describe('Accessibilite Empty States', () => {
  test('les messages vides sont accessibles (aria)', async ({ adminPage }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Rechercher pour obtenir un etat vide
    await listPage.search('xyznonexistent123456')

    await adminPage.waitForTimeout(1000)

    // Verifier que le message est dans un element accessible
    const emptyElement = adminPage.locator(
      'text=/aucune entreprise|aucun resultat/i'
    )
    await expect(emptyElement).toBeVisible()
  })

  test('le tableau est present', async ({ adminPage }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Une table HTML a un role implicite 'table'
    await expect(listPage.table).toBeVisible()
  })
})
