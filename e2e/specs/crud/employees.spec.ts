/**
 * Tests E2E - CRUD Employees
 *
 * Tests de bout en bout pour la gestion des employes.
 * Accessible aux SYSTEM_ADMIN, DIRECTOR et MANAGER avec acces differencies.
 *
 * @ticket SP-156
 */

import { test, expect, TEST_USERS, loginAs } from '../../fixtures/auth.fixture'
import { EmployeeListPage, EmployeeFormPage } from '../../pages'

// =============================================================================
// CRUD Employees - DIRECTOR
// =============================================================================

test.describe('CRUD Employees (DIRECTOR)', () => {
  let listPage: EmployeeListPage
  let formPage: EmployeeFormPage

  test.beforeEach(async ({ directorPage }) => {
    listPage = new EmployeeListPage(directorPage)
    formPage = new EmployeeFormPage(directorPage)
  })

  test('affiche la liste des employes de la company', async ({
    directorPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectToBeVisible()
    await expect(listPage.table).toBeVisible()
  })

  test('affiche le titre de la page', async ({ directorPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.pageTitle).toContainText(/employ[ée]s|collaborateurs/i)
  })

  test('affiche le bouton de creation', async ({ directorPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectCreateButtonVisible()
  })

  test('permet de rechercher un employe', async ({ directorPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.search('John')

    await directorPage.waitForTimeout(500)
    await expect(listPage.searchInput).toHaveValue('John')
  })

  test('permet de naviguer vers le formulaire de creation', async ({
    directorPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.clickNewEmployee()

    await expect(directorPage).toHaveURL(/\/app\/dashboard\/employees\/new/)
  })

  test('affiche le formulaire de creation', async ({ directorPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    await formPage.expectToBeVisible()
    await expect(formPage.firstNameInput).toBeVisible()
    await expect(formPage.lastNameInput).toBeVisible()
    await expect(formPage.submitButton).toBeVisible()
  })

  test('validation du formulaire - prenom requis', async ({ directorPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    // Remplir seulement le nom
    await formPage.fillForm({ firstName: '', lastName: 'Test' })
    await formPage.submit()

    await expect(
      directorPage.locator(
        'text=/pr[eé]nom.*requis|pr[eé]nom.*caract[eè]re|obligatoire|minimum 2 caract/i'
      )
    ).toBeVisible()
  })

  test('validation du formulaire - nom requis', async ({ directorPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    // Remplir seulement le prenom
    await formPage.fillForm({ firstName: 'Test', lastName: '' })
    await formPage.submit()

    await expect(
      directorPage.locator(
        'text=/le nom.*requis|le nom.*caract[eè]re|obligatoire|minimum 2 caract/i'
      )
    ).toBeVisible()
  })

  test('bouton annuler retourne a la liste', async ({ directorPage }) => {
    // D'abord aller sur la liste pour avoir un historique
    await listPage.goto()
    await listPage.waitForLoad()

    // Puis aller sur le formulaire
    await listPage.clickNewEmployee()
    await formPage.waitForLoad()

    // Annuler doit revenir en arriere
    await formPage.cancel()

    // On doit etre de retour (pas sur /new)
    await expect(directorPage).not.toHaveURL(/\/new/)
  })
})

// =============================================================================
// Permissions Employees - MANAGER
// =============================================================================

test.describe('Permissions Employees (MANAGER)', () => {
  let listPage: EmployeeListPage

  test.beforeEach(async ({ managerPage }) => {
    listPage = new EmployeeListPage(managerPage)
  })

  test('MANAGER peut acceder a la liste des employes', async ({
    managerPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectToBeVisible()
  })

  test('MANAGER voit le bouton de creation', async ({ managerPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    // MANAGER peut creer des employes dans ses equipes
    await listPage.expectCreateButtonVisible()
  })

  test('MANAGER peut naviguer vers le formulaire de creation', async ({
    managerPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.clickNewEmployee()

    await expect(managerPage).toHaveURL(/\/app\/dashboard\/employees\/new/)
  })

  test('MANAGER peut rechercher dans la liste', async ({ managerPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.search('Test')

    await expect(listPage.searchInput).toHaveValue('Test')
  })
})

// =============================================================================
// Restrictions Employees - EMPLOYEE
// =============================================================================

test.describe('Restrictions Employees (EMPLOYEE)', () => {
  test('EMPLOYEE ne peut pas acceder a /app/tableau-de-bord/employees', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/tableau-de-bord/employes')

    // Doit rester sur son dashboard ou etre redirige
    // L'EMPLOYEE n'a pas acces a la gestion des employes
    await expect(employeePage).toHaveURL(/\/app\/dashboard(?!\/employees)/)
  })

  test('EMPLOYEE ne peut pas acceder a /app/tableau-de-bord/employees/new', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/tableau-de-bord/employes/new')

    // Doit etre redirige
    await expect(employeePage).toHaveURL(/\/app\/dashboard(?!\/employees)/)
  })
})

// =============================================================================
// Navigation et UX - Employees
// =============================================================================

test.describe('Navigation et UX - Employees', () => {
  test('le titre de la page est correct (DIRECTOR)', async ({
    directorPage,
  }) => {
    const listPage = new EmployeeListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(directorPage).toHaveTitle(/employ[ée]s|collaborateurs/i)
  })

  test('les filtres sont visibles (DIRECTOR)', async ({ directorPage }) => {
    const listPage = new EmployeeListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.searchInput).toBeVisible()
  })

  test('la pagination est fonctionnelle (DIRECTOR)', async ({
    directorPage,
  }) => {
    const listPage = new EmployeeListPage(directorPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Verifier la presence des boutons de pagination
    await expect(listPage.prevPageButton).toBeVisible()
    await expect(listPage.nextPageButton).toBeVisible()
  })
})
