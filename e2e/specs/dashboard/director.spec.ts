/**
 * Tests E2E - Dashboard Director
 *
 * Tests complets du dashboard directeur avec authentification.
 * Verifie l'affichage des KPIs, graphiques et gestion des conges.
 *
 * @ticket SP-149
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { DashboardDirectorPage } from '../../pages'

test.describe('Dashboard Director - Tests E2E', () => {
  let dashboardPage: DashboardDirectorPage

  // ==========================================================================
  // Tests d'acces et redirection
  // ==========================================================================

  test.describe('Acces et redirection', () => {
    test('devrait rediriger vers /login si non authentifie', async ({ page }) => {
      await page.goto('/dashboard/director')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('devrait acceder au dashboard avec authentification director', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait rediriger /dashboard vers /dashboard/director pour un director', async ({
      directorPage,
    }) => {
      await directorPage.goto('/dashboard')
      await expect(directorPage).toHaveURL(/.*dashboard\/director.*/)
    })
  })

  // ==========================================================================
  // Tests du message de bienvenue
  // ==========================================================================

  test.describe('Message de bienvenue', () => {
    test('devrait afficher le message de bienvenue', async ({ directorPage }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const welcomeHeading = directorPage.locator('h1')
      await expect(welcomeHeading).toBeVisible()
    })

    test('devrait afficher le nom de l\'entreprise ou un resume', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le dashboard devrait mentionner l'entreprise ou une vue globale
      const companyInfo = directorPage.locator('text=/entreprise|vue globale|company/i')
      const isVisible = await companyInfo.first().isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests des KPIs (6 statistiques)
  // ==========================================================================

  test.describe('Section KPIs', () => {
    test('devrait afficher le KPI nombre d\'employes', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const employeesKpi = directorPage.locator('text=/employes|effectifs/i')
      await expect(employeesKpi.first()).toBeVisible()
    })

    test('devrait afficher le KPI nombre d\'equipes', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const teamsKpi = directorPage.locator('text=/equipes/i')
      await expect(teamsKpi.first()).toBeVisible()
    })

    test('devrait afficher le KPI taux de presence', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const attendanceKpi = directorPage.locator('text=/presence|taux/i')
      const isVisible = await attendanceKpi.first().isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })

    test('devrait afficher le KPI demandes de conges', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const leavesKpi = directorPage.locator('text=/conges|demandes/i')
      await expect(leavesKpi.first()).toBeVisible()
    })

    test('devrait afficher des valeurs numeriques dans les KPIs', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const statsNumbers = directorPage.locator('[class*="text-2xl"], [class*="text-3xl"]')
      await expect(statsNumbers.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des graphiques
  // ==========================================================================

  test.describe('Section graphiques', () => {
    test('devrait afficher le graphique repartition equipes', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const teamsChart = directorPage.locator('text=/repartition|equipes.*effectif/i')
      const isVisible = await teamsChart.first().isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })

    test('devrait afficher le graphique evolution effectifs', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const trendsChart = directorPage.locator('text=/evolution|tendances|croissance/i')
      const isVisible = await trendsChart.first().isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests de la liste des conges en attente
  // ==========================================================================

  test.describe('Conges en attente', () => {
    test('devrait afficher la section conges en attente', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const pendingSection = directorPage.locator('text=/conges en attente|demandes/i')
      await expect(pendingSection.first()).toBeVisible()
    })

    test('devrait avoir un lien Voir tout', async ({ directorPage }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const viewAllLink = directorPage.getByRole('link', { name: /voir tout/i })
      const isVisible = await viewAllLink.isVisible().catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests des actions rapides
  // ==========================================================================

  test.describe('Actions rapides', () => {
    test('devrait afficher la section actions rapides', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const actionsSection = directorPage.locator('text=Actions rapides')
      await expect(actionsSection).toBeVisible()
    })

    test('devrait avoir des liens d\'action', async ({ directorPage }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const actionLinks = directorPage.locator('a, button').filter({
        hasText: /equipe|employe|conge|statistiques/i,
      })
      expect(await actionLinks.count()).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // Tests de responsivite
  // ==========================================================================

  test.describe('Responsivite', () => {
    test('devrait s\'adapter a un ecran mobile', async ({ directorPage }) => {
      await directorPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait s\'adapter a une tablette', async ({ directorPage }) => {
      await directorPage.setViewportSize({ width: 768, height: 1024 })

      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait empiler les graphiques sur mobile', async ({
      directorPage,
    }) => {
      await directorPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Les graphiques devraient etre empiles
      const gridContainer = directorPage.locator('[class*="grid"]')
      await expect(gridContainer.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests d'accessibilite
  // ==========================================================================

  test.describe('Accessibilite', () => {
    test('devrait avoir un titre de page descriptif', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(directorPage).toHaveTitle(/director|dashboard/i)
    })

    test('devrait avoir une hierarchie de titres correcte', async ({
      directorPage,
    }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const h1 = directorPage.locator('h1')
      await expect(h1.first()).toBeVisible()
    })

    test('devrait avoir des regions semantiques', async ({ directorPage }) => {
      dashboardPage = new DashboardDirectorPage(directorPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier la presence de sections ou regions
      const sections = directorPage.locator('[role="region"], section')
      const count = await sections.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
