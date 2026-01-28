/**
 * Tests E2E - Navigation et filtres page Congés
 *
 * @ticket SP-416
 * @description Vérifie la navigation, les tabs et les filtres
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { LeavesPage } from '../../pages/leaves.page'

test.describe('Leaves - Navigation et filtres', () => {
  test('accède à la page congés depuis la sidebar @employee', async ({
    employeePage,
  }) => {
    const leavesPage = new LeavesPage(employeePage)

    // Naviguer vers la page congés
    await leavesPage.goto()

    // Vérifier l'URL et le titre
    await expect(employeePage).toHaveURL(/\/leaves/)
    await expect(employeePage.getByRole('heading', { name: /congés/i })).toBeVisible()
  })

  test('bascule entre Liste et Calendrier @employee', async ({
    employeePage,
  }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    // Par défaut sur Liste
    await expect(leavesPage.leavesListTab).toBeVisible()

    // Switch vers Calendrier
    await leavesPage.switchToCalendarView()
    await expect(leavesPage.leavesCalendarTab).toBeVisible()

    // Retour vers Liste
    await leavesPage.switchToListView()
    await expect(leavesPage.leavesListTab).toBeVisible()
  })

  test('filtre par statut En attente @employee', async ({ employeePage }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    await leavesPage.filterByStatus('En attente')

    // Vérifier que l'URL contient le paramètre
    await expect(employeePage).toHaveURL(/status=PENDING/)
  })

  test('filtre par type Congés payés @employee', async ({ employeePage }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    await leavesPage.filterByType('Congés payés')

    await expect(employeePage).toHaveURL(/type=PAID_LEAVE/)
  })

  test('reset les filtres @employee', async ({ employeePage }) => {
    const leavesPage = new LeavesPage(employeePage)
    await leavesPage.goto()

    // Appliquer des filtres
    await leavesPage.filterByStatus('En attente')
    await expect(employeePage).toHaveURL(/status=PENDING/)

    // Reset
    await leavesPage.resetFilters()

    // URL ne contient plus de filtres
    await expect(employeePage).not.toHaveURL(/status=/)
  })
})
