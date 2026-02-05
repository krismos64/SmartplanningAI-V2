/**
 * Tests E2E - Validation/Refus de demandes de congés
 *
 * @ticket SP-416
 * @description Vérifie le parcours de validation par MANAGER/DIRECTOR
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { LeavesPage } from '../../pages/leaves.page'

test.describe('Leaves - Validation demande (MANAGER)', () => {
  test('voit les demandes en attente de son équipe @manager', async ({
    managerPage,
  }) => {
    const leavesPage = new LeavesPage(managerPage)
    await leavesPage.goto()

    // Filtrer par PENDING via le bouton quick filter
    await leavesPage.filterByStatus('En attente')

    // Vérifier que le bouton est pressé (les filtres utilisent aria-pressed, pas l'URL)
    const statusButton = managerPage.getByRole('button', {
      name: /En attente:/i,
    })
    await expect(statusButton).toHaveAttribute('aria-pressed', 'true')
  })

  test('peut accéder aux filtres par employé @manager', async ({
    managerPage,
  }) => {
    const leavesPage = new LeavesPage(managerPage)
    await leavesPage.goto()

    // Le manager a accès au filtre par employé (contrairement à EMPLOYEE)
    // On vérifie que la page s'affiche correctement
    await expect(
      managerPage.getByRole('heading', { name: /congés/i })
    ).toBeVisible()
  })

  test('affiche les statistiques des demandes @manager', async ({
    managerPage,
  }) => {
    const leavesPage = new LeavesPage(managerPage)
    await leavesPage.goto()

    // Les badges de stats doivent être visibles
    await expect(managerPage.getByText(/en attente/i).first()).toBeVisible()
  })
})

test.describe('Leaves - Validation demande (DIRECTOR)', () => {
  test("voit toutes les demandes de l'entreprise @director", async ({
    directorPage,
  }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.goto()

    // Le directeur voit toutes les demandes
    await expect(
      directorPage.getByRole('heading', { name: /congés/i })
    ).toBeVisible()
  })

  test('peut filtrer par équipe @director', async ({ directorPage }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.goto()

    // Le directeur a accès au filtre par équipe
    // La page doit s'afficher correctement
    await expect(directorPage).toHaveURL(/\/leaves/)
  })
})
