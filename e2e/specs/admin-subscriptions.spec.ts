/**
 * Tests E2E - Page Admin Abonnements & Paiements
 *
 * Valide :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage initial (titre, KPIs, tables, filtres)
 * - Navigation depuis les actions rapides du dashboard admin (fix SP-540)
 *
 * @ticket SP-540, SP-542
 */

import { test, expect } from '../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — Acces et protection RBAC
// =============================================================================

test.describe('Admin Subscriptions — RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/subscriptions', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/subscriptions')

    await expect(
      adminPage.getByRole('heading', { name: /abonnements & paiements/i })
    ).toBeVisible()
    await expect(adminPage).toHaveURL(/\/app\/admin\/subscriptions/)
  })

  test('DIRECTOR est redirige depuis /app/admin/subscriptions', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/subscriptions')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('MANAGER est redirige depuis /app/admin/subscriptions', async ({
    managerPage,
  }) => {
    await managerPage.goto('/app/admin/subscriptions')

    await expect(managerPage).toHaveURL(/\/app\/(manager|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/subscriptions', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/subscriptions')

    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 2 — Affichage initial de la page
// =============================================================================

test.describe('Admin Subscriptions — Affichage initial', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/app/admin/subscriptions')
    await adminPage
      .getByTestId('admin-subscriptions-page')
      .waitFor({ state: 'visible' })
  })

  test('affiche les 5 KPIs de synthese', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('kpi-mrr')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-active')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-trial')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-past-due')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-failed-30d')).toBeVisible()
  })

  test('affiche la table des abonnements avec ses filtres', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('subscriptions-table')).toBeVisible()
    await expect(
      adminPage.getByTestId('subscriptions-status-filter')
    ).toBeVisible()
    await expect(
      adminPage.getByTestId('subscriptions-plan-filter')
    ).toBeVisible()
  })

  test('affiche la table des paiements avec son filtre', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('payments-table')).toBeVisible()
    await expect(adminPage.getByTestId('payments-status-filter')).toBeVisible()
  })

  test('filtre les abonnements par statut sans erreur', async ({
    adminPage,
  }) => {
    await adminPage.getByTestId('subscriptions-status-filter').click()
    await adminPage.getByRole('option', { name: /paiement en retard/i }).click()

    // La table reste visible apres application du filtre (vide ou non)
    await expect(adminPage.getByTestId('subscriptions-table')).toBeVisible()
  })
})

// =============================================================================
// Bloc 3 — Navigation depuis le dashboard admin (fix liens morts SP-540)
// =============================================================================

test.describe('Admin Subscriptions — Navigation quick actions', () => {
  test('le bouton Abonnements du dashboard admin mene a la page', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/dashboard')

    await adminPage
      .getByRole('link', { name: /abonnements/i })
      .first()
      .click()

    await expect(adminPage).toHaveURL(/\/app\/admin\/subscriptions/)
    await expect(
      adminPage.getByRole('heading', { name: /abonnements & paiements/i })
    ).toBeVisible()
  })
})
