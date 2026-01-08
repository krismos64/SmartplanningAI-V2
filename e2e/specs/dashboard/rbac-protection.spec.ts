/**
 * Tests E2E - Protection RBAC des dashboards
 *
 * Tests de securite verifiant que chaque role ne peut acceder
 * qu'aux dashboards autorises (Role-Based Access Control).
 *
 * @ticket SP-149
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'

test.describe('RBAC Protection - Tests E2E', () => {
  // ==========================================================================
  // Tests Employee - Acces restreint
  // ==========================================================================

  test.describe('Employee RBAC', () => {
    test('Employee devrait acceder a /app/dashboard', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/dashboard')

      // Devrait rester sur employee dashboard
      await expect(employeePage).toHaveURL(/.*app\/dashboard.*/)
      await expect(employeePage.locator('h1')).toBeVisible()
    })

    test('Employee NE devrait PAS acceder a /app/manager', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/manager/dashboard')

      // Devrait etre redirige vers son dashboard ou page d'erreur
      await expect(employeePage).not.toHaveURL(/.*\/app\/manager.*/)
    })

    test('Employee NE devrait PAS acceder a /app/director', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/director/dashboard')

      // Devrait etre redirige
      await expect(employeePage).not.toHaveURL(/.*app\/director.*/)
    })

    test('Employee NE devrait PAS acceder a /app/admin', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/admin/dashboard')

      // Devrait etre redirige
      await expect(employeePage).not.toHaveURL(/.*app\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests Manager - Acces intermediaire
  // ==========================================================================

  test.describe('Manager RBAC', () => {
    test('Manager devrait acceder a /app/manager', async ({ managerPage }) => {
      await managerPage.goto('/app/manager/dashboard')

      await expect(managerPage).toHaveURL(/.*app\/manager.*/)
      await expect(managerPage.locator('h1')).toBeVisible()
    })

    test('Manager NE devrait PAS acceder a /app/director', async ({
      managerPage,
    }) => {
      await managerPage.goto('/app/director/dashboard')

      // Devrait etre redirige vers son dashboard
      await expect(managerPage).not.toHaveURL(/.*app\/director.*/)
    })

    test('Manager NE devrait PAS acceder a /app/admin', async ({
      managerPage,
    }) => {
      await managerPage.goto('/app/admin/dashboard')

      // Devrait etre redirige
      await expect(managerPage).not.toHaveURL(/.*app\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests Director - Acces elargi
  // ==========================================================================

  test.describe('Director RBAC', () => {
    test('Director devrait acceder a /app/director', async ({
      directorPage,
    }) => {
      await directorPage.goto('/app/director/dashboard')

      await expect(directorPage).toHaveURL(/.*app\/director.*/)
      await expect(directorPage.locator('h1')).toBeVisible()
    })

    test('Director NE devrait PAS acceder a /app/admin', async ({
      directorPage,
    }) => {
      await directorPage.goto('/app/admin/dashboard')

      // Devrait etre redirige
      await expect(directorPage).not.toHaveURL(/.*app\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests System Admin - Acces complet
  // ==========================================================================

  test.describe('System Admin RBAC', () => {
    test('Admin devrait acceder a /app/admin', async ({ adminPage }) => {
      await adminPage.goto('/app/admin/dashboard')

      await expect(adminPage).toHaveURL(/.*app\/admin.*/)
      await expect(adminPage.locator('h1')).toBeVisible()
    })

    test('Admin devrait etre redirige vers /app/admin/dashboard depuis /app/dashboard', async ({
      adminPage,
    }) => {
      await adminPage.goto('/app/dashboard')

      // Devrait etre redirige vers admin dashboard
      await expect(adminPage).toHaveURL(/.*app\/admin\/dashboard.*/)
    })
  })

  // ==========================================================================
  // Tests de redirection generique /app/dashboard
  // ==========================================================================

  test.describe('Redirection /app/dashboard selon role', () => {
    test('Employee reste sur /app/dashboard', async ({
      employeePage,
    }) => {
      await employeePage.goto('/app/dashboard')
      await expect(employeePage).toHaveURL(/.*app\/dashboard.*/)
    })

    test('Director redirige vers /app/director/dashboard', async ({
      directorPage,
    }) => {
      await directorPage.goto('/app/dashboard')
      await expect(directorPage).toHaveURL(/.*app\/director\/dashboard.*/)
    })

    test('Admin redirige vers /app/admin/dashboard', async ({ adminPage }) => {
      await adminPage.goto('/app/dashboard')
      await expect(adminPage).toHaveURL(/.*app\/admin\/dashboard.*/)
    })
  })

  // ==========================================================================
  // Tests de protection sans authentification
  // ==========================================================================

  test.describe('Protection sans authentification', () => {
    test('/app/dashboard redirige vers /login', async ({ page }) => {
      await page.goto('/app/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/app/manager/dashboard redirige vers /login', async ({ page }) => {
      await page.goto('/app/manager/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/app/director/dashboard redirige vers /login', async ({ page }) => {
      await page.goto('/app/director/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/app/admin/dashboard redirige vers /login', async ({ page }) => {
      await page.goto('/app/admin/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  // ==========================================================================
  // Tests de session expiration
  // ==========================================================================

  test.describe('Session et authentification', () => {
    test('devrait afficher message de connexion reussie', async ({
      page,
      loginAs,
    }) => {
      await loginAs(page, TEST_USERS.EMPLOYEE!)

      // Le message de connexion reussie devrait apparaitre
      await expect(page.getByText(/connexion reussie/i)).toBeVisible()
    })

    test('devrait rediriger apres login vers le bon dashboard', async ({
      page,
      loginAs,
    }) => {
      await loginAs(page, TEST_USERS.DIRECTOR!)

      // Devrait etre sur le dashboard director
      await expect(page).toHaveURL(
        new RegExp(`.*${TEST_USERS.DIRECTOR!.expectedDashboard}.*`)
      )
    })
  })
})
