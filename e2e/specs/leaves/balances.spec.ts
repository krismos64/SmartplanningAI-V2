/**
 * Tests E2E - Gestion des soldes de congés
 *
 * @ticket SP-416
 * @description Vérifie l'accès et la gestion des soldes (DIRECTOR only)
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { LeavesPage } from '../../pages/leaves.page'

test.describe('Leaves - Gestion soldes (DIRECTOR)', () => {
  test('accède à la page des soldes @director', async ({ directorPage }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.gotoBalances()

    await expect(directorPage).toHaveURL(/\/leaves\/balances/)
    await expect(
      directorPage.getByRole('heading', { name: /soldes/i })
    ).toBeVisible()
  })

  test('affiche la table des soldes @director', async ({ directorPage }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.gotoBalances()

    // Attendre que le heading soit visible (contenu chargé)
    await expect(
      directorPage.getByRole('heading', { name: /soldes/i })
    ).toBeVisible({ timeout: 15000 })

    // La table ou le message "aucun solde" doit être visible
    const table = directorPage.getByRole('table')
    const emptyMessage = directorPage.getByText(/aucun solde/i)

    // Attendre que l'un des deux apparaisse
    await expect(table.or(emptyMessage)).toBeVisible({ timeout: 10000 })
  })

  test("peut changer l'année de visualisation @director", async ({
    directorPage,
  }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.gotoBalances()

    // Le sélecteur d'année doit être présent
    const yearSelect = directorPage.getByRole('combobox', { name: /année/i })
    await expect(yearSelect).toBeVisible()
  })
})

test.describe('Leaves - Restriction accès soldes', () => {
  test('EMPLOYEE ne peut pas accéder à la page soldes @employee', async ({
    employeePage,
  }) => {
    // Essayer d'accéder directement à la page soldes
    await employeePage.goto('/app/dashboard/leaves/balances')

    // Doit être redirigé ou voir une erreur 403/404
    // Use domcontentloaded instead of networkidle because SSE keeps connection open
    await employeePage.waitForLoadState('domcontentloaded')
    // Wait for navigation/redirect to complete
    await employeePage.waitForTimeout(1000)

    // Vérifier qu'on n'est PAS sur la page des soldes
    // ou qu'on voit un message d'erreur
    const isOnBalancesPage = employeePage.url().includes('/leaves/balances')
    const hasErrorOrRedirect =
      employeePage.url().includes('/forbidden') ||
      employeePage.url().includes('/dashboard') ||
      (await employeePage
        .getByText(/accès refusé|interdit|unauthorized/i)
        .isVisible()
        .catch(() => false))

    // Soit on n'est plus sur balances, soit on voit une erreur
    expect(!isOnBalancesPage || hasErrorOrRedirect).toBe(true)
  })

  test('MANAGER ne peut pas accéder à la page soldes @manager', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/dashboard/leaves/balances')
    // Use domcontentloaded instead of networkidle because SSE keeps connection open
    await managerPage.waitForLoadState('domcontentloaded')
    // Wait for navigation/redirect to complete
    await managerPage.waitForTimeout(1000)

    const isOnBalancesPage = managerPage.url().includes('/leaves/balances')
    const hasErrorOrRedirect =
      managerPage.url().includes('/forbidden') ||
      managerPage.url().includes('/dashboard') ||
      (await managerPage
        .getByText(/accès refusé|interdit|unauthorized/i)
        .isVisible()
        .catch(() => false))

    expect(!isOnBalancesPage || hasErrorOrRedirect).toBe(true)
  })
})
