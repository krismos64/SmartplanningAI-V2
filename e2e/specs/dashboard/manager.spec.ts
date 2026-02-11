/**
 * Tests E2E - Dashboard Manager
 *
 * Tests du dashboard manager basés sur l'UI réelle :
 * ManagerWelcome, ManagerStats, ManagerTeamChart,
 * ManagerPendingLeaves, ManagerQuickActions
 *
 * @ticket SP-149
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardManagerPage } from '../../pages'

test.describe('Dashboard Manager', () => {
  // ==========================================================================
  // Accès et redirection
  // ==========================================================================

  test.describe('Accès et redirection', () => {
    test('devrait rediriger vers /login si non authentifié', async ({
      page,
    }) => {
      await page.goto('/app/manager/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('devrait accéder au dashboard avec authentification manager', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectWelcomeVisible()
    })
  })

  // ==========================================================================
  // Welcome
  // ==========================================================================

  test.describe('Welcome', () => {
    test('devrait afficher le greeting avec le nom du manager', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectGreetingContainsName('Jane')
    })

    test('devrait afficher au moins un badge contextuel', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      // Au moins un des 3 badges doit être visible
      const hasPendingLeaves = await dashboard.pendingLeavesBadge
        .isVisible()
        .catch(() => false)
      const hasAbsences = await dashboard.absencesBadge
        .isVisible()
        .catch(() => false)
      const hasAllGood = await dashboard.allGoodBadge
        .isVisible()
        .catch(() => false)

      expect(hasPendingLeaves || hasAbsences || hasAllGood).toBe(true)
    })
  })

  // ==========================================================================
  // Statistiques
  // ==========================================================================

  test.describe('Statistiques', () => {
    test('devrait afficher 4 cartes KPI', async ({ managerPage }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectStatsVisible()
    })

    test('la section stats devrait avoir le role region', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      const statsRegion = managerPage.locator(
        '[role="region"][aria-label="Statistiques équipe"]'
      )
      await expect(statsRegion).toBeVisible()
    })
  })

  // ==========================================================================
  // Performance équipe (Chart)
  // ==========================================================================

  test.describe('Performance équipe', () => {
    test('devrait afficher la carte performance', async ({ managerPage }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectTeamChartVisible()
    })
  })

  // ==========================================================================
  // Congés en attente
  // ==========================================================================

  test.describe('Congés en attente', () => {
    test('devrait afficher la section congés', async ({ managerPage }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectPendingLeavesVisible()
    })
  })

  // ==========================================================================
  // Actions rapides
  // ==========================================================================

  test.describe('Actions rapides', () => {
    test('devrait afficher les 4 boutons d\'action', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.expectQuickActionsVisible()
    })

    test('devrait naviguer vers /employees au clic sur Voir l\'équipe', async ({
      managerPage,
    }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      await dashboard.clickViewTeam()
      await expect(managerPage).toHaveURL(/\/employees/, { timeout: 15000 })
    })
  })

  // ==========================================================================
  // Accessibilité
  // ==========================================================================

  test.describe('Accessibilité', () => {
    test('devrait avoir un heading h1 visible', async ({ managerPage }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      const h1 = managerPage.locator('h1')
      await expect(h1.first()).toBeVisible()
    })

    test('devrait avoir des boutons accessibles', async ({ managerPage }) => {
      const dashboard = new DashboardManagerPage(managerPage)
      await dashboard.goto()
      await dashboard.waitForLoad()

      const buttons = managerPage.getByRole('link')
      expect(await buttons.count()).toBeGreaterThan(0)
    })
  })
})
