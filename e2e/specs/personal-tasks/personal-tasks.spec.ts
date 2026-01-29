/**
 * Tests E2E - Notes perso (CRUD + Widget)
 *
 * @ticket SP-421
 * @description Vérifie les parcours utilisateur complets pour les notes personnelles
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { PersonalTasksPage } from '../../pages/personal-tasks.page'

// =============================================================================
// Tests Page Notes perso - Navigation et affichage
// =============================================================================

test.describe('Notes perso - Navigation et affichage', () => {
  test('accède à la page Notes perso via la sidebar @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)

    // Aller au dashboard d'abord
    await tasksPage.gotoEmployeeDashboard()

    // Naviguer via la sidebar
    await tasksPage.navigateViaSidebar()

    // Vérifier l'URL et le titre
    await expect(employeePage).toHaveURL(/\/app\/dashboard\/tasks/)
    await expect(tasksPage.pageTitle).toBeVisible()
  })

  test('affiche le titre "Notes perso" et le badge de confidentialité @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Vérifier le titre
    await expect(tasksPage.pageTitle).toBeVisible()
    await expect(tasksPage.pageTitle).toHaveText(/notes perso/i)

    // Vérifier le badge de confidentialité
    await expect(tasksPage.privacyBadge).toBeVisible()
    await expect(tasksPage.privacyBadge).toContainText(/privées/i)
  })

  test("affiche l'empty state quand aucune note @employee", async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Si l'utilisateur n'a pas de notes, l'empty state devrait s'afficher
    // Note: Cela dépend des données de seed
    const count = await tasksPage.getTasksCount()
    if (count === 0) {
      await tasksPage.expectEmptyState()
      await expect(tasksPage.emptyStateCreateButton).toBeVisible()
    }
  })
})

// =============================================================================
// Tests Page Notes perso - Création
// =============================================================================

test.describe('Notes perso - Création', () => {
  test('crée une nouvelle note via le bouton "Nouvelle note" @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    const noteTitle = `Test E2E ${Date.now()}`

    // Créer une note simple
    await tasksPage.openCreateModal()
    await tasksPage.fillTitle(noteTitle)
    await tasksPage.submitForm()

    // Vérifier le toast de succès
    await tasksPage.expectToastSuccess()

    // Vérifier que la note apparaît
    await tasksPage.expectTaskVisible(noteTitle)
  })

  test('crée une note avec titre et description @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    const noteTitle = `Note complète ${Date.now()}`
    const noteDescription = 'Description de test pour la note E2E'

    // Ouvrir le modal
    await tasksPage.openCreateModal()

    // Remplir les champs
    await tasksPage.fillTitle(noteTitle)
    await tasksPage.fillDescription(noteDescription)

    await tasksPage.submitForm()

    // Vérifier le succès
    await tasksPage.expectToastSuccess()
    await tasksPage.expectTaskVisible(noteTitle)
  })

  test('valide que le titre est requis @employee', async ({ employeePage }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Ouvrir le modal et soumettre sans titre
    await tasksPage.openCreateModal()
    await tasksPage.submitForm()

    // Vérifier l'erreur de validation
    await tasksPage.expectValidationError(/titre.*requis/i)
  })
})

// =============================================================================
// Tests Page Notes perso - Modification
// =============================================================================

test.describe('Notes perso - Modification', () => {
  test("modifie le titre d'une note existante @employee", async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // D'abord créer une note
    const originalTitle = `Original ${Date.now()}`
    await tasksPage.createNote({ title: originalTitle })
    await tasksPage.expectToastSuccess()

    // Attendre que la note soit visible
    await tasksPage.expectTaskVisible(originalTitle)

    // Modifier la note
    await tasksPage.editTaskByTitle(originalTitle)

    const newTitle = `Modifié ${Date.now()}`
    await tasksPage.titleInput.clear()
    await tasksPage.fillTitle(newTitle)
    await tasksPage.submitForm()

    // Vérifier le succès
    await tasksPage.expectToastSuccess()
    await tasksPage.expectTaskVisible(newTitle)
    await tasksPage.expectTaskNotVisible(originalTitle)
  })

  test('toggle le statut completed @employee', async ({ employeePage }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Créer une note
    const noteTitle = `Toggle test ${Date.now()}`
    await tasksPage.createNote({ title: noteTitle })
    await tasksPage.expectToastSuccess()

    // Toggle completed
    await tasksPage.toggleTaskByTitle(noteTitle)

    // Vérifier le toast de succès
    await tasksPage.expectToastSuccess()
  })
})

// =============================================================================
// Tests Page Notes perso - Suppression
// =============================================================================

test.describe('Notes perso - Suppression', () => {
  test('supprime une note @employee', async ({ employeePage }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    // Créer une note à supprimer
    const noteTitle = `À supprimer ${Date.now()}`
    await tasksPage.createNote({ title: noteTitle })
    await tasksPage.expectToastSuccess()
    await tasksPage.expectTaskVisible(noteTitle)

    // Supprimer la note
    await tasksPage.deleteTaskByTitle(noteTitle)

    // Vérifier le toast de succès
    await tasksPage.expectToastSuccess()

    // Vérifier que la note n'est plus visible
    await tasksPage.expectTaskNotVisible(noteTitle)
  })
})

// =============================================================================
// Tests Widget Dashboard
// =============================================================================

test.describe('Notes perso - Annulation', () => {
  test('annule la création sans sauvegarder @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.goto()

    const countBefore = await tasksPage.getTasksCount()

    // Ouvrir le modal et remplir
    await tasksPage.openCreateModal()
    await tasksPage.fillTitle('Note à annuler')

    // Annuler
    await tasksPage.cancelForm()

    // Le formulaire devrait être fermé
    await expect(tasksPage.taskForm).not.toBeVisible()

    // Le nombre de notes devrait être le même
    const countAfter = await tasksPage.getTasksCount()
    expect(countAfter).toBe(countBefore)
  })
})

// =============================================================================
// Tests Widget Dashboard
// =============================================================================

test.describe('Notes perso - Widget Dashboard', () => {
  test('affiche le widget sur le dashboard Employee @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.gotoEmployeeDashboard()

    // Vérifier que le widget est visible
    await expect(tasksPage.widget).toBeVisible()
  })

  test('affiche le widget sur le dashboard Director @director', async ({
    directorPage,
  }) => {
    const tasksPage = new PersonalTasksPage(directorPage)
    await tasksPage.gotoDirectorDashboard()

    // Vérifier que le widget est visible
    await expect(tasksPage.widget).toBeVisible()
  })

  test('affiche le widget sur le dashboard Admin @admin', async ({
    adminPage,
  }) => {
    const tasksPage = new PersonalTasksPage(adminPage)
    await tasksPage.gotoAdminDashboard()

    // Vérifier que le widget est visible
    await expect(tasksPage.widget).toBeVisible()
  })

  test('le lien Ajouter redirige vers la page @employee', async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.gotoEmployeeDashboard()

    // Cliquer sur le lien Ajouter du widget
    await tasksPage.clickWidgetAddLink()

    // Vérifier la redirection
    await expect(employeePage).toHaveURL(/\/app\/dashboard\/tasks/)
  })

  test("affiche l'empty state dans le widget si aucune note @employee", async ({
    employeePage,
  }) => {
    const tasksPage = new PersonalTasksPage(employeePage)
    await tasksPage.gotoEmployeeDashboard()

    // Vérifier le widget
    await expect(tasksPage.widget).toBeVisible()

    // Si pas de notes, l'empty state du widget devrait s'afficher
    const widgetCount = await tasksPage.getWidgetTasksCount()
    if (widgetCount === 0) {
      await expect(tasksPage.widgetEmptyState).toBeVisible()
    }
  })
})
