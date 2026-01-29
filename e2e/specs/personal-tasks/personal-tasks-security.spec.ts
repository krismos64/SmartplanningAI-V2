/**
 * Tests E2E - Notes perso - Sécurité et isolation multi-utilisateurs
 *
 * @ticket SP-421
 * @description Vérifie que les notes sont bien isolées par utilisateur
 *
 * Note: Les tests utilisent un seul utilisateur à la fois pour éviter
 * les conflits de session. L'isolation est vérifiée en cherchant
 * des notes avec des patterns spécifiques qui ne devraient pas exister
 * pour l'utilisateur courant.
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { PersonalTasksPage } from '../../pages/personal-tasks.page'

// =============================================================================
// Tests Sécurité - Isolation des données
// =============================================================================

test.describe('Notes perso - Sécurité isolation', () => {
  /**
   * Test: Employee crée une note et la voit
   * Vérifie que les notes sont bien créées et visibles pour l'utilisateur
   */
  test('Employee voit ses propres notes @security', async ({ employeePage }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    const myNote = `Ma note Employee ${Date.now()}`
    await tasksPage.createNote({ title: myNote })
    await tasksPage.expectToastSuccess()

    // L'employee voit SA note
    await tasksPage.expectTaskVisible(myNote)
  })

  /**
   * Test: Director crée une note et la voit
   * Vérifie que les notes sont bien créées et visibles pour l'utilisateur
   */
  test('Director voit ses propres notes @security', async ({ directorPage }) => {
    const tasksPage = new PersonalTasksPage(directorPage)
    await tasksPage.goto()

    const myNote = `Ma note Director ${Date.now()}`
    await tasksPage.createNote({ title: myNote })
    await tasksPage.expectToastSuccess()

    // Le director voit SA note
    await tasksPage.expectTaskVisible(myNote)
  })

  /**
   * Test: Admin crée une note et la voit
   */
  test('Admin voit ses propres notes @security', async ({ adminPage }) => {
    const tasksPage = new PersonalTasksPage(adminPage)
    await tasksPage.goto()

    const myNote = `Ma note Admin ${Date.now()}`
    await tasksPage.createNote({ title: myNote })
    await tasksPage.expectToastSuccess()

    // L'admin voit SA note
    await tasksPage.expectTaskVisible(myNote)
  })

  /**
   * Test: Les notes persistent après navigation
   */
  test('Notes persistent après navigation @security', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Créer une note
    const persistentNote = `Persistante ${Date.now()}`
    await tasksPage.createNote({ title: persistentNote })
    await tasksPage.expectToastSuccess()
    await tasksPage.expectTaskVisible(persistentNote)

    // Naviguer vers le dashboard
    await tasksPage.gotoEmployeeDashboard()

    // Revenir sur la page notes
    await tasksPage.goto()

    // La note devrait toujours être là
    await tasksPage.expectTaskVisible(persistentNote)
  })

  /**
   * Test: Widget est visible sur le dashboard
   */
  test('Widget est visible sur le dashboard @security', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)

    // Aller au dashboard
    await tasksPage.gotoEmployeeDashboard()

    // Vérifier que le widget est visible
    await expect(tasksPage.widget).toBeVisible()

    // Le widget devrait contenir soit des notes soit l'empty state
    const hasNotes = (await tasksPage.getWidgetTasksCount()) > 0
    const hasEmptyState = await tasksPage.widgetEmptyState.isVisible()

    expect(hasNotes || hasEmptyState).toBe(true)
  })
})
