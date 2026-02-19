/**
 * Tests E2E - Page Admin Monitoring
 *
 * Valide la page Coming Soon de monitoring (/app/admin/monitoring) :
 * - Acces SYSTEM_ADMIN uniquement
 * - Affichage du titre, description, features planifiees
 * - Protection RBAC (redirection pour DIRECTOR et EMPLOYEE)
 * - Responsive
 */

import { test, expect } from '../../fixtures/auth.fixture'

// =============================================================================
// Bloc 1 — SYSTEM_ADMIN : acces autorise
// =============================================================================

test.describe('Monitoring — SYSTEM_ADMIN', () => {
  test('page se charge avec le titre "Monitoring système"', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible()
  })

  test('description visible', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByText(/performances|disponibilité|santé/i).first()
    ).toBeVisible()
  })

  test('4 features planifiees listees', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByText(/uptime/i)
    ).toBeVisible()
    await expect(
      adminPage.getByText(/métriques/i)
    ).toBeVisible()
    await expect(
      adminPage.getByText(/alertes/i)
    ).toBeVisible()
    await expect(
      adminPage.getByText(/historique/i)
    ).toBeVisible()
  })

  test('badge "Version 2" visible', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(adminPage.getByText(/version 2/i)).toBeVisible()
  })
})

// =============================================================================
// Bloc 2 — Protection RBAC
// =============================================================================

test.describe('Monitoring — RBAC Protection', () => {
  test('DIRECTOR est redirige depuis /app/admin/monitoring', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/monitoring')

    // Doit etre redirige vers un dashboard (pas admin)
    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })

  test('EMPLOYEE est redirige depuis /app/admin/monitoring', async ({
    employeePage,
  }) => {
    await employeePage.goto('/app/admin/monitoring')

    // Doit etre redirige vers le dashboard employee
    await expect(employeePage).toHaveURL(/\/app\/dashboard/)
  })
})

// =============================================================================
// Bloc 3 — Responsive
// =============================================================================

test.describe('Monitoring — Responsive', () => {
  test('contenu visible sur mobile', async ({ adminPage }) => {
    await adminPage.setViewportSize({ width: 375, height: 667 })
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible()
  })
})
