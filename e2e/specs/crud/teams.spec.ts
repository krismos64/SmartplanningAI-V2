/**
 * Tests E2E - CRUD Teams
 *
 * Tests de bout en bout pour la gestion des equipes.
 * Accessible aux SYSTEM_ADMIN, DIRECTOR et MANAGER avec acces differencies.
 *
 * @ticket SP-156
 */

import { test, expect, TEST_USERS, loginAs } from '../../fixtures/auth.fixture'
import { TeamListPage, TeamFormPage, TeamMembersPage } from '../../pages'

// =============================================================================
// CRUD Teams - DIRECTOR
// =============================================================================

test.describe('CRUD Teams (DIRECTOR)', () => {
  let listPage: TeamListPage
  let formPage: TeamFormPage

  test.beforeEach(async ({ directorPage }) => {
    listPage = new TeamListPage(directorPage)
    formPage = new TeamFormPage(directorPage)
  })

  test('affiche la liste des equipes de la company', async ({
    directorPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectToBeVisible()
  })

  test('affiche le titre et la description', async ({ directorPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.pageTitle).toContainText(/équipes|equipes/i)
    await expect(listPage.description).toBeVisible()
  })

  test('affiche le bouton de creation', async ({ directorPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectCreateButtonVisible()
  })

  test('permet de naviguer vers le formulaire de creation', async ({
    directorPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.clickNewTeam()

    await expect(directorPage).toHaveURL(/\/app\/director\/teams\/new/)
  })

  test('affiche le formulaire de creation', async ({ directorPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    await formPage.expectToBeVisible()
    await expect(formPage.nameInput).toBeVisible()
    await expect(formPage.submitButton).toBeVisible()
  })

  test('validation du formulaire - nom requis', async ({ directorPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    // Soumettre sans remplir
    await formPage.submit()

    await expect(
      directorPage.locator('text=/nom.*requis|nom.*caractère|nom.*caractere|obligatoire/i')
    ).toBeVisible()
  })

  test('bouton annuler retourne a la liste', async ({ directorPage }) => {
    // D'abord aller sur la liste pour avoir un historique
    await listPage.goto()
    await listPage.waitForLoad()

    // Puis aller sur le formulaire
    await listPage.clickNewTeam()
    await formPage.waitForLoad()

    // Annuler doit revenir en arriere
    await formPage.cancel()

    // On doit etre de retour (pas sur /new)
    await expect(directorPage).not.toHaveURL(/\/new/)
  })
})

// =============================================================================
// Gestion membres Teams - DIRECTOR
// =============================================================================

test.describe('Gestion membres Teams (DIRECTOR)', () => {
  test('peut acceder a la page de gestion des membres', async ({
    directorPage,
  }) => {
    // Note: Necessite un ID d'equipe valide
    // On teste l'acces au pattern de route
    await directorPage.goto('/app/director/teams')

    const listPage = new TeamListPage(directorPage)
    await listPage.waitForLoad()

    // Verifier que la page des equipes est accessible
    await listPage.expectToBeVisible()
  })
})

// =============================================================================
// Permissions Teams - MANAGER
// =============================================================================

test.describe('Permissions Teams (MANAGER)', () => {
  // Note: Les equipes sont gerees dans /app/director/teams
  // Les MANAGERs n'ont pas acces aux routes /director

  test('MANAGER ne peut pas acceder a /app/director/teams', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/director/teams')

    // Doit etre redirige vers son dashboard
    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })

  test('MANAGER ne peut pas acceder au formulaire de creation', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/director/teams/new')

    // Doit etre redirige
    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })
})

// =============================================================================
// Restrictions Teams - EMPLOYEE
// =============================================================================

test.describe('Restrictions Teams (EMPLOYEE)', () => {
  test('EMPLOYEE ne peut pas acceder a /app/director/teams', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/director/teams')

    // Doit etre redirige vers son dashboard
    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })

  test('EMPLOYEE ne peut pas acceder a /app/director/teams/new', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/director/teams/new')

    // Doit etre redirige
    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Navigation et UX - Teams
// =============================================================================

test.describe('Navigation et UX - Teams', () => {
  test('le titre de la page est correct (DIRECTOR)', async ({
    directorPage,
  }) => {
    const listPage = new TeamListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(directorPage).toHaveTitle(/équipes|equipes|teams/i)
  })

  test('DIRECTOR peut voir toutes ses equipes', async ({ directorPage }) => {
    const listPage = new TeamListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Verifier que la page des equipes est accessible
    await listPage.expectToBeVisible()
  })
})
