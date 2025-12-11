/**
 * Tests E2E - Protection RBAC des dashboards
 *
 * Tests de securite verifiant que chaque role ne peut acceder
 * qu'aux dashboards autorises (Role-Based Access Control).
 *
 * @ticket SP-149
 */

import { test, expect, TEST_USERS, loginAs } from '../../fixtures/auth.fixture'

test.describe('RBAC Protection - Tests E2E', () => {
  // ==========================================================================
  // Tests Employee - Acces restreint
  // ==========================================================================

  test.describe('Employee RBAC', () => {
    test('Employee devrait acceder a /dashboard/employee', async ({
      employeePage,
    }) => {
      await employeePage.goto('/dashboard/employee')

      // Devrait rester sur employee dashboard
      await expect(employeePage).toHaveURL(/.*dashboard\/employee.*/)
      await expect(employeePage.locator('h1')).toBeVisible()
    })

    test('Employee NE devrait PAS acceder a /manager', async ({
      employeePage,
    }) => {
      await employeePage.goto('/manager')

      // Devrait etre redirige vers son dashboard ou page d'erreur
      await expect(employeePage).not.toHaveURL(/.*\/manager$/)
    })

    test('Employee NE devrait PAS acceder a /dashboard/director', async ({
      employeePage,
    }) => {
      await employeePage.goto('/dashboard/director')

      // Devrait etre redirige
      await expect(employeePage).not.toHaveURL(/.*dashboard\/director.*/)
    })

    test('Employee NE devrait PAS acceder a /dashboard/admin', async ({
      employeePage,
    }) => {
      await employeePage.goto('/dashboard/admin')

      // Devrait etre redirige
      await expect(employeePage).not.toHaveURL(/.*dashboard\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests Manager - Acces intermediaire
  // ==========================================================================

  test.describe('Manager RBAC', () => {
    test('Manager devrait acceder a /manager', async ({ managerPage }) => {
      await managerPage.goto('/manager')

      await expect(managerPage).toHaveURL(/.*manager.*/)
      await expect(managerPage.locator('h1')).toBeVisible()
    })

    test('Manager NE devrait PAS acceder a /dashboard/director', async ({
      managerPage,
    }) => {
      await managerPage.goto('/dashboard/director')

      // Devrait etre redirige vers son dashboard
      await expect(managerPage).not.toHaveURL(/.*dashboard\/director.*/)
    })

    test('Manager NE devrait PAS acceder a /dashboard/admin', async ({
      managerPage,
    }) => {
      await managerPage.goto('/dashboard/admin')

      // Devrait etre redirige
      await expect(managerPage).not.toHaveURL(/.*dashboard\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests Director - Acces elargi
  // ==========================================================================

  test.describe('Director RBAC', () => {
    test('Director devrait acceder a /dashboard/director', async ({
      directorPage,
    }) => {
      await directorPage.goto('/dashboard/director')

      await expect(directorPage).toHaveURL(/.*dashboard\/director.*/)
      await expect(directorPage.locator('h1')).toBeVisible()
    })

    test('Director NE devrait PAS acceder a /dashboard/admin', async ({
      directorPage,
    }) => {
      await directorPage.goto('/dashboard/admin')

      // Devrait etre redirige
      await expect(directorPage).not.toHaveURL(/.*dashboard\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests System Admin - Acces complet
  // ==========================================================================

  test.describe('System Admin RBAC', () => {
    test('Admin devrait acceder a /dashboard/admin', async ({ adminPage }) => {
      await adminPage.goto('/dashboard/admin')

      await expect(adminPage).toHaveURL(/.*dashboard\/admin.*/)
      await expect(adminPage.locator('h1')).toBeVisible()
    })

    test('Admin devrait etre redirige vers /dashboard/admin depuis /dashboard', async ({
      adminPage,
    }) => {
      await adminPage.goto('/dashboard')

      // Devrait etre redirige vers admin dashboard
      await expect(adminPage).toHaveURL(/.*dashboard\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests de redirection generique /dashboard
  // ==========================================================================

  test.describe('Redirection /dashboard selon role', () => {
    test('Employee redirige vers /dashboard/employee', async ({
      employeePage,
    }) => {
      await employeePage.goto('/dashboard')
      await expect(employeePage).toHaveURL(/.*dashboard\/employee.*/)
    })

    test('Director redirige vers /dashboard/director', async ({
      directorPage,
    }) => {
      await directorPage.goto('/dashboard')
      await expect(directorPage).toHaveURL(/.*dashboard\/director.*/)
    })

    test('Admin redirige vers /dashboard/admin', async ({ adminPage }) => {
      await adminPage.goto('/dashboard')
      await expect(adminPage).toHaveURL(/.*dashboard\/admin.*/)
    })
  })

  // ==========================================================================
  // Tests de protection sans authentification
  // ==========================================================================

  test.describe('Protection sans authentification', () => {
    test('/dashboard redirige vers /login', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/dashboard/employee redirige vers /login', async ({ page }) => {
      await page.goto('/dashboard/employee')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/manager redirige vers /login', async ({ page }) => {
      await page.goto('/manager')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/dashboard/director redirige vers /login', async ({ page }) => {
      await page.goto('/dashboard/director')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('/dashboard/admin redirige vers /login', async ({ page }) => {
      await page.goto('/dashboard/admin')
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
      await loginAs(page, TEST_USERS.EMPLOYEE)

      // Le message de connexion reussie devrait apparaitre
      await expect(page.getByText(/connexion reussie/i)).toBeVisible()
    })

    test('devrait rediriger apres login vers le bon dashboard', async ({
      page,
      loginAs,
    }) => {
      await loginAs(page, TEST_USERS.DIRECTOR)

      // Devrait etre sur le dashboard director
      await expect(page).toHaveURL(
        new RegExp(`.*${TEST_USERS.DIRECTOR.expectedDashboard}.*`)
      )
    })
  })
})
