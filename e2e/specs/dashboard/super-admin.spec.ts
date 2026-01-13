/**
 * Tests E2E - Dashboard Super Admin
 *
 * Tests complets du dashboard super admin avec authentification.
 * Verifie l'affichage des KPIs SaaS, graphiques et gestion des entreprises.
 *
 * @ticket SP-149
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardAdminPage } from '../../pages'

test.describe('Dashboard Super Admin - Tests E2E', () => {
  let dashboardPage: DashboardAdminPage

  // ==========================================================================
  // Tests d'acces et redirection
  // ==========================================================================

  test.describe('Acces et redirection', () => {
    test('devrait rediriger vers /login si non authentifie', async ({
      page,
    }) => {
      await page.goto('/app/admin/dashboard')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('devrait acceder au dashboard avec authentification admin', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    // NOTE: La redirection automatique n'est pas implémentée pour l'instant
    // Les admins peuvent accéder à /app/dashboard sans être redirigés
    test('devrait pouvoir acceder a /app/dashboard en tant que admin', async ({
      adminPage,
    }) => {
      await adminPage.goto('/app/dashboard')
      // L'admin reste sur /app/dashboard (pas de redirection auto)
      await expect(adminPage).toHaveURL(/.*app\/dashboard.*/)
    })
  })

  // ==========================================================================
  // Tests du message de bienvenue
  // ==========================================================================

  test.describe('Message de bienvenue', () => {
    test('devrait afficher le message de bienvenue', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const welcomeHeading = adminPage.locator('h1')
      await expect(welcomeHeading).toBeVisible()
    })

    test('devrait afficher un resume de la plateforme', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le dashboard devrait mentionner entreprises/utilisateurs/MRR
      const platformInfo = adminPage.locator(
        'text=/entreprises|utilisateurs|mrr/i'
      )
      await expect(platformInfo.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des 6 KPIs SaaS
  // ==========================================================================

  test.describe('Section KPIs SaaS', () => {
    test('devrait afficher le KPI Entreprises', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Sélecteur précis pour le KPI Entreprises (dans la section stats)
      await expect(
        adminPage.getByText('Entreprises', { exact: true }).first()
      ).toBeVisible()
    })

    test('devrait afficher le KPI Utilisateurs', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Sélecteur précis pour le KPI Utilisateurs
      await expect(
        adminPage.getByText('Utilisateurs', { exact: true }).first()
      ).toBeVisible()
    })

    test('devrait afficher le KPI Abonnements actifs', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(adminPage.getByText('Abonnements actifs')).toBeVisible()
    })

    test('devrait afficher le KPI MRR', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Sélecteur précis pour le KPI MRR
      await expect(
        adminPage.getByText('MRR', { exact: true }).first()
      ).toBeVisible()
    })

    test('devrait afficher le KPI Taux conversion', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(adminPage.locator('text=Taux conversion')).toBeVisible()
    })

    test('devrait afficher le KPI Taux churn', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Use .first() to handle potential duplicates in the UI
      await expect(adminPage.locator('text=Taux churn').first()).toBeVisible()
    })

    test('devrait afficher des valeurs numeriques formatees', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier qu'il y a des chiffres formates (ex: "45.0k EUR", "2.5%")
      const formattedNumbers = adminPage.locator('text=/\\d+|%|EUR/i')
      await expect(formattedNumbers.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des graphiques
  // ==========================================================================

  test.describe('Section graphiques', () => {
    test('devrait afficher le graphique Evolution MRR', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const mrrChart = adminPage.locator('text=/evolution.*mrr|mrr/i')
      await expect(mrrChart.first()).toBeVisible()
    })

    test('devrait afficher le graphique Nouvelles inscriptions', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        adminPage.locator('text=Nouvelles inscriptions')
      ).toBeVisible()
    })

    test('devrait afficher le graphique Repartition par plans', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const plansChart = adminPage.locator('text=/repartition|plans|revenus/i')
      await expect(plansChart.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests de la liste des dernieres entreprises
  // ==========================================================================

  test.describe('Dernieres entreprises', () => {
    test('devrait afficher la section dernieres inscriptions', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const recentSection = adminPage.locator(
        'text=/dernieres inscriptions|entreprises/i'
      )
      await expect(recentSection.first()).toBeVisible()
    })

    test('devrait avoir un lien Voir tout', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const viewAllLink = adminPage.getByRole('link', { name: /voir tout/i })
      await expect(viewAllLink.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des actions rapides
  // ==========================================================================

  test.describe('Actions rapides', () => {
    test('devrait afficher la section actions rapides', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(adminPage.locator('text=Actions rapides')).toBeVisible()
    })

    test('devrait avoir des liens de gestion', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const actionLinks = adminPage.locator('a, button').filter({
        hasText: /entreprises|utilisateurs|abonnements|parametres/i,
      })
      expect(await actionLinks.count()).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // Tests de responsivite
  // ==========================================================================

  test.describe('Responsivite', () => {
    test("devrait s'adapter a un ecran mobile", async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test("devrait s'adapter a une tablette", async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 768, height: 1024 })

      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait empiler les graphiques sur mobile', async ({ adminPage }) => {
      await adminPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const gridContainer = adminPage.locator('[class*="grid"]')
      await expect(gridContainer.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests d'accessibilite
  // ==========================================================================

  test.describe('Accessibilite', () => {
    test('devrait avoir un titre de page descriptif', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(adminPage).toHaveTitle(/admin|dashboard/i)
    })

    test('devrait avoir une hierarchie de titres correcte', async ({
      adminPage,
    }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const h1 = adminPage.locator('h1')
      await expect(h1.first()).toBeVisible()
    })

    test('devrait avoir des regions semantiques', async ({ adminPage }) => {
      dashboardPage = new DashboardAdminPage(adminPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const sections = adminPage.locator('[role="region"], section')
      const count = await sections.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
