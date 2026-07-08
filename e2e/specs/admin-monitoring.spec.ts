/**
 * Tests E2E - Page Admin Monitoring (SP-544)
 *
 * Valide :
 * - Protection RBAC (SYSTEM_ADMIN uniquement)
 * - Affichage des panneaux Redis et sessions actives (SP-544)
 *
 * @ticket SP-544
 */

import { test, expect } from '../fixtures/auth.fixture'

test.describe('Admin Monitoring — RBAC Protection', () => {
  test('SYSTEM_ADMIN peut acceder a /app/admin/monitoring', async ({
    adminPage,
  }) => {
    await adminPage.goto('/app/admin/monitoring')

    await expect(
      adminPage.getByRole('heading', { name: /monitoring système/i })
    ).toBeVisible()
  })

  test('DIRECTOR est redirige depuis /app/admin/monitoring', async ({
    directorPage,
  }) => {
    await directorPage.goto('/app/admin/monitoring')

    await expect(directorPage).toHaveURL(/\/app\/(director|dashboard)/)
  })
})

test.describe('Admin Monitoring — Panneaux Redis & sessions (SP-544)', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/app/admin/monitoring')
    await adminPage
      .getByTestId('redis-health-panel')
      .waitFor({ state: 'visible' })
  })

  test('affiche le panneau sante Redis avec le check PING', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('redis-health-panel')).toBeVisible()
    await expect(adminPage.getByTestId('check-redis-ping')).toBeVisible()
    await expect(adminPage.getByTestId('check-redis-impact')).toBeVisible()
  })

  test('affiche le panneau sessions actives', async ({ adminPage }) => {
    await expect(adminPage.getByTestId('active-sessions-panel')).toBeVisible()

    // L'admin connecte pour ce test a lui-meme une session active
    // (Redis up en local) — au moins une ligne ou le compteur est visible
    await expect(adminPage.getByTestId('sessions-count')).toBeVisible()
  })

  test('le panneau DB existant reste affiche a cote de Redis', async ({
    adminPage,
  }) => {
    await expect(adminPage.getByTestId('db-health-panel')).toBeVisible()
    await expect(adminPage.getByTestId('redis-health-panel')).toBeVisible()
  })
})
