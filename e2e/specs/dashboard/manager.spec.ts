/**
 * Tests E2E - Dashboard Manager
 *
 * Tests complets du dashboard manager avec authentification.
 * Verifie l'affichage, les fonctionnalites de gestion d'equipe.
 *
 * @ticket SP-149
 */

import { test, expect, TEST_USERS } from '../../fixtures/auth.fixture'
import { DashboardManagerPage } from '../../pages'

test.describe('Dashboard Manager - Tests E2E', () => {
  let dashboardPage: DashboardManagerPage

  // ==========================================================================
  // Tests d'acces et redirection
  // ==========================================================================

  test.describe('Acces et redirection', () => {
    test('devrait rediriger vers /login si non authentifie', async ({
      page,
    }) => {
      await page.goto('/manager')
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('devrait acceder au dashboard avec authentification manager', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait afficher le titre Dashboard Manager', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(managerPage.locator('h1')).toContainText(
        /dashboard manager/i
      )
    })
  })

  // ==========================================================================
  // Tests des statistiques d'equipe
  // ==========================================================================

  test.describe("Statistiques d'equipe", () => {
    test("devrait afficher le nombre de membres d'equipe", async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(managerPage.locator("text=Membres d'equipe")).toBeVisible()
    })

    test('devrait afficher le nombre de shifts cette semaine', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.locator('text=Shifts cette semaine')
      ).toBeVisible()
    })

    test('devrait afficher les demandes en attente', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.locator('text=Demandes en attente')
      ).toBeVisible()
    })

    test('devrait afficher des valeurs numeriques dans les stats', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier qu'il y a des chiffres
      const statsNumbers = managerPage.locator('.text-3xl')
      await expect(statsNumbers.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des actions rapides
  // ==========================================================================

  test.describe('Actions rapides', () => {
    test('devrait afficher la section actions rapides', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(managerPage.locator('text=Actions rapides')).toBeVisible()
    })

    test('devrait avoir le bouton Creer un shift', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.getByRole('button', { name: /creer un shift/i })
      ).toBeVisible()
    })

    test('devrait avoir le bouton Valider des conges', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.getByRole('button', { name: /valider des conges/i })
      ).toBeVisible()
    })

    test('devrait avoir le bouton Vue equipe', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.getByRole('button', { name: /vue equipe/i })
      ).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests du planning d'equipe
  // ==========================================================================

  test.describe("Planning d'equipe", () => {
    test('devrait afficher le titre du planning', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.locator("text=Planning de l'equipe cette semaine")
      ).toBeVisible()
    })

    test('devrait afficher un tableau avec les jours de la semaine', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const table = managerPage.locator('table')
      await expect(table).toBeVisible()

      // Verifier les en-tetes de jours
      await expect(managerPage.locator('th:has-text("Lun")')).toBeVisible()
      await expect(managerPage.locator('th:has-text("Mar")')).toBeVisible()
      await expect(managerPage.locator('th:has-text("Mer")')).toBeVisible()
      await expect(managerPage.locator('th:has-text("Jeu")')).toBeVisible()
      await expect(managerPage.locator('th:has-text("Ven")')).toBeVisible()
    })

    test('devrait afficher les noms des employes', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Au moins un nom d'employe devrait etre visible
      const employeeNames = managerPage.locator('tbody td.font-medium')
      await expect(employeeNames.first()).toBeVisible()
    })

    test('devrait afficher des badges de statut', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Verifier qu'il y a des badges (horaires, Remote, Conge)
      const badges = managerPage.locator(
        '[class*="badge"], [class*="bg-green"], [class*="bg-blue"], [class*="bg-red"]'
      )
      await expect(badges.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests des demandes de conges
  // ==========================================================================

  test.describe('Demandes de conges', () => {
    test('devrait afficher la section demandes de conges', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(
        managerPage.locator('text=Demandes de conges a valider')
      ).toBeVisible()
    })

    test('devrait afficher les boutons Approuver', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const approveButtons = managerPage.getByRole('button', {
        name: /approuver/i,
      })
      await expect(approveButtons.first()).toBeVisible()
    })

    test('devrait afficher les boutons Rejeter', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      const rejectButtons = managerPage.getByRole('button', {
        name: /rejeter/i,
      })
      await expect(rejectButtons.first()).toBeVisible()
    })

    test('devrait afficher les initiales des employes', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Les avatars avec initiales
      const avatars = managerPage.locator(
        '[class*="rounded-full"][class*="bg-secondary"]'
      )
      await expect(avatars.first()).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests de responsivite
  // ==========================================================================

  test.describe('Responsivite', () => {
    test("devrait s'adapter a un ecran mobile", async ({ managerPage }) => {
      await managerPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await dashboardPage.expectToBeVisible()
    })

    test('devrait garder le tableau scrollable sur mobile', async ({
      managerPage,
    }) => {
      await managerPage.setViewportSize({ width: 375, height: 667 })

      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Le conteneur du tableau devrait avoir overflow-x-auto
      const tableContainer = managerPage.locator('.overflow-x-auto')
      await expect(tableContainer).toBeVisible()
    })
  })

  // ==========================================================================
  // Tests d'accessibilite
  // ==========================================================================

  test.describe('Accessibilite', () => {
    test('devrait avoir un titre de page descriptif', async ({
      managerPage,
    }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      await expect(managerPage).toHaveTitle(/manager|dashboard/i)
    })

    test('devrait avoir des boutons accessibles', async ({ managerPage }) => {
      dashboardPage = new DashboardManagerPage(managerPage)
      await dashboardPage.goto()
      await dashboardPage.waitForLoad()

      // Les boutons devraient etre accessibles par role
      const buttons = managerPage.getByRole('button')
      expect(await buttons.count()).toBeGreaterThan(0)
    })
  })
})
