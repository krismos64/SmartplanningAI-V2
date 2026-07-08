/**
 * Tests E2E - Page Admin Journal des emails (SP-545)
 *
 * Valide :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage initial (KPIs, filtres, table)
 * - Filtres URL bookmarkables (pattern audit-logs)
 *
 * @ticket SP-545
 */

import { test, expect } from '../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — Acces et protection RBAC
// =============================================================================

test.describe('Admin Emails — RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/emails', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/emails')

    await expect(
      adminPage.getByRole('heading', { name: /journal des emails/i })
    ).toBeVisible()
    await expect(adminPage).toHaveURL(/\/app\/admin\/emails/)
  })

  test('DIRECTOR est redirige depuis /app/admin/emails', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/emails')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/emails', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/emails')

    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 2 — Affichage initial
// =============================================================================

test.describe('Admin Emails — Affichage initial', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/app/admin/emails')
    await adminPage
      .getByTestId('admin-emails-page')
      .waitFor({ state: 'visible' })
  })

  test('affiche les KPIs de deliverabilite', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('kpi-emails-7d')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-failure-rate')).toBeVisible()
    await expect(adminPage.getByTestId('kpi-top-types')).toBeVisible()
  })

  test('affiche les 3 filtres : type, entreprise, statut', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('emails-type-filter')).toBeVisible()
    await expect(adminPage.getByTestId('emails-company-filter')).toBeVisible()
    await expect(adminPage.getByTestId('emails-status-filter')).toBeVisible()
  })

  test('affiche la table des logs (vide ou non)', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('email-logs-table')).toBeVisible()
  })
})

// =============================================================================
// Bloc 3 — Filtres URL bookmarkables
// =============================================================================

test.describe('Admin Emails — Filtres URL', () => {
  test('le filtre statut est pousse dans l URL et reste apres reload', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/emails')
    await adminPage
      .getByTestId('emails-status-filter')
      .waitFor({ state: 'visible' })

    await adminPage.getByTestId('emails-status-filter').click()
    await adminPage.getByRole('option', { name: /échoué/i }).click()

    await expect(adminPage).toHaveURL(/status=FAILED/)

    // Bookmarkability : le filtre survit a un reload
    await adminPage.reload()
    await expect(adminPage).toHaveURL(/status=FAILED/)
    await expect(adminPage.getByTestId('email-logs-table')).toBeVisible()
  })

  test('un filtre direct en URL est applique au chargement', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/emails?status=SENT')

    await expect(adminPage.getByTestId('email-logs-table')).toBeVisible()
    // Le bouton reset apparait quand un filtre est actif
    await expect(adminPage.getByTestId('emails-clear-filters')).toBeVisible()
  })
})
