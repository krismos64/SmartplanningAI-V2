/**
 * Tests E2E - CRUD Companies
 *
 * Tests de bout en bout pour la gestion des entreprises.
 * Accessible uniquement aux SYSTEM_ADMIN.
 *
 * @ticket SP-156
 */

import { test, expect, TEST_USERS, loginAs } from '../../fixtures/auth.fixture'
import { CompanyListPage, CompanyFormPage } from '../../pages'

// =============================================================================
// CRUD Companies - SYSTEM_ADMIN
// =============================================================================

test.describe('CRUD Companies (SYSTEM_ADMIN)', () => {
  let listPage: CompanyListPage
  let formPage: CompanyFormPage

  test.beforeEach(async ({ adminPage }) => {
    listPage = new CompanyListPage(adminPage)
    formPage = new CompanyFormPage(adminPage)
  })

  test('affiche la liste des entreprises', async ({ adminPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.expectToBeVisible()
    await expect(listPage.newCompanyButton).toBeVisible()
    await expect(listPage.table).toBeVisible()
  })

  test('affiche le titre et le compteur', async ({ adminPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.pageTitle).toContainText(/entreprises/i)
    await expect(listPage.totalCount).toBeVisible()
  })

  test('affiche la pagination', async ({ adminPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.pageInfo).toBeVisible()
    await expect(listPage.prevPageButton).toBeVisible()
    await expect(listPage.nextPageButton).toBeVisible()
  })

  test('permet de rechercher une entreprise', async ({ adminPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.search('Tech')

    // Attendre le rafraichissement
    await adminPage.waitForTimeout(1000)

    // Verifier que la recherche a ete appliquee
    await expect(listPage.searchInput).toHaveValue('Tech')
  })

  test('permet de naviguer vers le formulaire de creation', async ({
    adminPage,
  }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    await listPage.clickNewCompany()

    await expect(adminPage).toHaveURL(/\/app\/admin\/companies\/new/)
  })

  test('affiche le formulaire de creation', async ({ adminPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    await formPage.expectToBeVisible()
    await expect(formPage.nameInput).toBeVisible()
    await expect(formPage.submitButton).toBeVisible()
    await expect(formPage.cancelButton).toBeVisible()
  })

  test('validation du formulaire - nom requis', async ({ adminPage }) => {
    await formPage.gotoNew()
    await formPage.waitForLoad()

    // Soumettre sans remplir
    await formPage.submit()

    // Verifier l'erreur de validation
    await expect(
      adminPage.locator('text=/nom.*requis|nom.*caractère|nom.*caractere|obligatoire/i')
    ).toBeVisible()
  })

  test('bouton annuler retourne a la liste', async ({ adminPage }) => {
    // D'abord aller sur la liste pour avoir un historique
    await listPage.goto()
    await listPage.waitForLoad()

    // Puis aller sur le formulaire
    await listPage.clickNewCompany()
    await formPage.waitForLoad()

    // Annuler doit revenir en arriere
    await formPage.cancel()

    // On doit etre de retour sur la liste (pas sur /new)
    await expect(adminPage).not.toHaveURL(/\/new/)
  })

  test('le bouton actualiser rafraichit la liste', async ({ adminPage }) => {
    await listPage.goto()
    await listPage.waitForLoad()

    // Cliquer sur actualiser et verifier que la page reste fonctionnelle
    await listPage.refresh()

    // La page doit rester sur la liste
    await expect(adminPage).toHaveURL(/\/app\/admin\/companies/)
  })
})

// =============================================================================
// Restrictions RBAC - Acces Companies
// =============================================================================

test.describe('Restrictions RBAC - Companies', () => {
  test('DIRECTOR ne peut pas acceder a /app/admin/companies', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/companies')

    // Doit etre redirige vers son dashboard
    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('MANAGER ne peut pas acceder a /app/admin/companies', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/admin/companies')

    // Doit etre redirige vers son dashboard
    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })

  test('EMPLOYEE ne peut pas acceder a /app/admin/companies', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/companies')

    // Doit etre redirige vers son dashboard
    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })

  test('DIRECTOR ne peut pas acceder a /app/admin/companies/new', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/companies/new')

    // Doit etre redirige
    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('MANAGER ne peut pas acceder a /app/admin/companies/new', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/admin/companies/new')

    // Doit etre redirige
    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })

  test('EMPLOYEE ne peut pas acceder a /app/admin/companies/new', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/companies/new')

    // Doit etre redirige
    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Navigation et UX - Companies
// =============================================================================

test.describe('Navigation et UX - Companies', () => {
  test('le titre de la page est correct', async ({ adminPage }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(adminPage).toHaveTitle(/entreprises|companies/i)
  })

  test('le breadcrumb est visible', async ({ adminPage }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    // Verifier la presence d'un breadcrumb ou navigation
    await expect(
      adminPage.locator('nav[aria-label="breadcrumb"], [data-testid="breadcrumb"]')
    ).toBeVisible()
  })

  test('les filtres sont visibles', async ({ adminPage }) => {
    const listPage = new CompanyListPage(adminPage)
    await listPage.goto()
    await listPage.waitForLoad()

    await expect(listPage.searchInput).toBeVisible()
  })
})
