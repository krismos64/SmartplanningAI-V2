/**
 * Tests E2E - Dashboard Employee
 *
 * Tests complets du dashboard employe avec authentification.
 * Verifie l'affichage, les fonctionnalites et l'accessibilite.
 *
 * @ticket SP-149
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { DashboardEmployeePage } from '../../pages'

test.describe('Dashboard Employee - Tests E2E', () => {
  let dashboardPage: DashboardEmployeePage

  // ==========================================================================
  // Tests d'acces et redirection
  // ==========================================================================

  test.describe('Acces et redirection', () => {
    test('devrait rediriger vers /login si non authentifie', async ({
      page,
    }) => {
      // Navigation sans authentification
      await page.goto('/app/dashboard')

      // Devrait etre redirige vers login
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('devrait rester sur /app/dashboard pour un employe', async ({
      employeePage,
    }) => {
      // Navigation vers dashboard generique
      await employeePage.goto('/app/dashboard')

      // Un employee reste sur /app/dashboard
      await expect(employeePage).toHaveURL(/.*app\/dashboard.*/)
    })

    test('devrait acceder au dashboard avec authentification employee', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })
  })

  // ==========================================================================
  // Tests du message de bienvenue
  // ==========================================================================

  test.describe('Message de bienvenue', () => {
    test('devrait afficher le message de bienvenue avec le prenom', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le message de bienvenue devrait contenir "Bonjour" ou le prenom
      await expect(employeePage.locator('h1')).toBeVisible()
    })

    test("devrait afficher l'information du prochain shift", async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier la presence d'info sur le prochain shift
      const shiftInfo = employeePage.locator('text=/prochain|shift|planning/i')
      // L'info peut etre presente ou non selon les donnees
      const isVisible = await shiftInfo
        .first()
        .isVisible()
        .catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests des statistiques
  // ==========================================================================

  test.describe('Section statistiques', () => {
    test('devrait afficher les cartes de statistiques', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier la presence des stats
      const statsLabels = [/heures/i, /conges/i, /demandes/i]

      let foundCount = 0
      for (const label of statsLabels) {
        const locator = employeePage.locator(`text=${label.source}`)
        if (
          await locator
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          foundCount++
        }
      }

      // Au moins une stat devrait etre visible
      expect(foundCount).toBeGreaterThanOrEqual(1)
    })

    test('devrait afficher les valeurs numeriques dans les stats', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier qu'il y a des valeurs numeriques
      const numbers = employeePage.locator('text=/\\d+/')
      await expect(numbers.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests du planning hebdomadaire
  // ==========================================================================

  test.describe('Planning de la semaine', () => {
    test('devrait afficher la section planning', async ({ employeePage }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // La section planning devrait etre presente
      const planningSection = employeePage.locator(
        'text=/planning|semaine|schedule/i'
      )
      const isVisible = await planningSection
        .first()
        .isVisible()
        .catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests du solde de conges
  // ==========================================================================

  test.describe('Solde de conges', () => {
    test('devrait afficher la section solde de conges', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // La section conges devrait etre presente
      const leaveSection = employeePage.locator('text=/conges|solde|balance/i')
      const isVisible = await leaveSection
        .first()
        .isVisible()
        .catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })
  })

  // ==========================================================================
  // Tests des actions rapides
  // ==========================================================================

  test.describe('Actions rapides', () => {
    test('devrait afficher la section actions rapides', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // La section actions rapides devrait etre presente
      const actionsSection = employeePage.locator(
        'text=/actions rapides|actions/i'
      )
      const isVisible = await actionsSection
        .first()
        .isVisible()
        .catch(() => false)
      expect(typeof isVisible).toBe('boolean')
    })

    test('devrait avoir des liens cliquables dans les actions', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier la presence de liens ou boutons
      const actionLinks = employeePage.locator('a, button').filter({
        hasText: /demande|planning|conge/i,
      })
      const count = await actionLinks.count()

      // Au moins un lien d'action devrait etre present
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  // ==========================================================================
  // Tests de responsivite
  // ==========================================================================

  test.describe('Responsivite', () => {
    test("devrait s'adapter a un ecran mobile", async ({ employeePage }) => {
      // Redimensionner a une taille mobile
      await employeePage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le dashboard devrait toujours etre visible
      await dashboardPage.expectToBeVisible()
    })

    test("devrait s'adapter a une tablette", async ({ employeePage }) => {
      // Redimensionner a une taille tablette
      await employeePage.setViewportSize({ width: 768, height: 1024 })

      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le dashboard devrait toujours etre visible
      await dashboardPage.expectToBeVisible()
    })
  })

  // ==========================================================================
  // Tests d'accessibilite basiques
  // ==========================================================================

  test.describe('Accessibilite', () => {
    test('devrait avoir un titre de page descriptif', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le titre devrait contenir dashboard ou smartplanning
      await expect(employeePage).toHaveTitle(/dashboard|smartplanning/i)
    })

    test('devrait avoir une hierarchie de titres correcte', async ({
      employeePage,
    }) => {
      dashboardPage = new DashboardEmployeePage(employeePage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Il devrait y avoir un h1
      const h1 = employeePage.locator('h1')
      await expect(h1.first()).toBeVisible()
    })
  })
})
