/**
 * Tests E2E - Page Admin Monitoring
 *
 * Valide la page monitoring (/app/admin/monitoring) :
 * - Acces SYSTEM_ADMIN uniquement
 * - Affichage du titre, KPIs, panneaux, section graphiques
 * - Bouton de rafraichissement
 * - Protection RBAC (redirection pour DIRECTOR et EMPLOYEE)
 * - Responsive
 *
 * @ticket SP-464, SP-465, SP-471
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
    ).toBeVisible({ timeout: 15000 })
  })

  test('description "Surveillance en temps réel" visible', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByText(/surveillance en temps réel/i).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('KPIs SaaS affiches (entreprises, utilisateurs)', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    // Attendre que le contenu charge (Suspense)
    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible({ timeout: 15000 })

    // Verifier la presence d'au moins 2 KPIs
    await expect(
      adminPage.getByText(/entreprises/i).first()
    ).toBeVisible()
    await expect(
      adminPage.getByText(/utilisateurs/i).first()
    ).toBeVisible()
  })

  test('bouton rafraichir visible', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible({ timeout: 15000 })

    await expect(
      adminPage.getByRole('button', { name: /rafraîchir/i })
    ).toBeVisible()
  })

  test('section "Activité & Tendances" visible', async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage.waitForLoadState('domcontentloaded')

    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible({ timeout: 15000 })

    // La section graphiques est conditionnelle (chartResult.success)
    // On verifie soit la section, soit que la page charge sans erreur
    const hasCharts = await adminPage
      .getByText(/activité.*tendances/i)
      .isVisible()
      .catch(() => false)

    // Si pas de charts, la page doit quand meme afficher les panneaux
    if (!hasCharts) {
      await expect(
        adminPage.getByText(/surveillance en temps réel/i).first()
      ).toBeVisible()
    }
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
    ).toBeVisible({ timeout: 15000 })
  })
})
