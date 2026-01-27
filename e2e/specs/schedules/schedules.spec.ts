/**
 * Tests E2E - Plannings (Schedules)
 *
 * Tests de bout en bout pour la page des plannings :
 * - Navigation et affichage
 * - RBAC (visibilité boutons par rôle)
 * - Stats rapides
 * - Export PDF/Excel
 * - Modal de création de shift
 * - Filtres et indisponibilités
 *
 * @ticket SP-406
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { SchedulesPage } from '../../pages'

// =============================================================================
// Stabilité (pas de boucle infinie)
// =============================================================================

test.describe('Schedules - Stabilité', () => {
  test('charge la page sans boucle infinie de re-renders', async ({
    managerPage,
  }) => {
    const consoleErrors: string[] = []
    managerPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    // La page doit se charger et afficher le contenu
    await expect(schedulesPage.schedulesPage).toBeVisible()
    await expect(schedulesPage.title).toBeVisible()

    // Aucune erreur de boucle infinie dans la console
    const loopErrors = consoleErrors.filter(
      (e) =>
        e.includes('Maximum update depth exceeded') ||
        e.includes('getServerSnapshot should be cached')
    )
    expect(loopErrors).toHaveLength(0)
  })

  test('les stats se chargent sans spinner infini', async ({
    managerPage,
  }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    // Les 4 stats doivent être visibles (prouve que le chargement se termine)
    await expect(schedulesPage.statsTotal).toBeVisible({ timeout: 10000 })
    await expect(schedulesPage.statsEmployees).toBeVisible()
    await expect(schedulesPage.statsConfirmed).toBeVisible()
    await expect(schedulesPage.statsDraft).toBeVisible()
  })
})

// =============================================================================
// Navigation & Affichage
// =============================================================================

test.describe('Schedules - Navigation & Affichage', () => {
  test('affiche la page plannings pour un manager', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.schedulesPage).toBeVisible()
    await expect(schedulesPage.title).toBeVisible()
    await expect(schedulesPage.title).toContainText(/planning/i)
  })

  test('affiche les contrôles de navigation', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.navPrev).toBeVisible()
    await expect(schedulesPage.navNext).toBeVisible()
    await expect(schedulesPage.navToday).toBeVisible()
    await expect(schedulesPage.dateRangeLabel).toBeVisible()
  })

  test('navigue vers la période suivante', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    const initialLabel = await schedulesPage.dateRangeLabel.textContent()
    await schedulesPage.navigateNext()
    // Attendre que le label change (React state update)
    await expect(schedulesPage.dateRangeLabel).not.toHaveText(initialLabel!)
  })

  test('navigue vers la période précédente', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    const initialLabel = await schedulesPage.dateRangeLabel.textContent()
    await schedulesPage.navigatePrev()
    // Attendre que le label change (React state update)
    await expect(schedulesPage.dateRangeLabel).not.toHaveText(initialLabel!)
  })

  test('change le mode de vue', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    // Par défaut semaine, changer vers jour
    await schedulesPage.setViewMode('day')
    await expect(schedulesPage.scheduleCalendar).toBeVisible()

    // Changer vers mois
    await schedulesPage.setViewMode('month')
    await expect(schedulesPage.scheduleCalendar).toBeVisible()
  })
})

// =============================================================================
// RBAC
// =============================================================================

test.describe('Schedules - RBAC', () => {
  test('affiche le bouton Nouveau créneau pour MANAGER', async ({
    managerPage,
  }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.newShiftButton).toBeVisible()
  })

  test('affiche le bouton Nouveau créneau pour DIRECTOR', async ({
    directorPage,
  }) => {
    const schedulesPage = new SchedulesPage(directorPage)
    await schedulesPage.goto()

    await expect(schedulesPage.newShiftButton).toBeVisible()
  })

  test("n'affiche PAS le bouton Nouveau créneau pour EMPLOYEE", async ({
    employeePage,
  }) => {
    const schedulesPage = new SchedulesPage(employeePage)
    await schedulesPage.goto()

    await expect(schedulesPage.newShiftButton).not.toBeVisible()
  })

  test('affiche le bouton Export pour MANAGER', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.exportButton).toBeVisible()
  })

  test("n'affiche PAS le bouton Export pour EMPLOYEE", async ({
    employeePage,
  }) => {
    const schedulesPage = new SchedulesPage(employeePage)
    await schedulesPage.goto()

    await expect(schedulesPage.exportButton).not.toBeVisible()
  })
})

// =============================================================================
// Stats & Options
// =============================================================================

test.describe('Schedules - Stats & Options', () => {
  test('affiche les 4 cards de stats rapides', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.statsTotal).toBeVisible()
    await expect(schedulesPage.statsEmployees).toBeVisible()
    await expect(schedulesPage.statsConfirmed).toBeVisible()
    await expect(schedulesPage.statsDraft).toBeVisible()
  })

  test('affiche le toggle indisponibilités', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.availabilityToggle).toBeVisible()
  })

})

// =============================================================================
// Export
// =============================================================================

test.describe('Schedules - Export', () => {
  test('ouvre le dropdown export et affiche PDF et Excel', async ({
    managerPage,
  }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await schedulesPage.openExportDropdown()

    await expect(schedulesPage.exportPdf).toBeVisible()
    await expect(schedulesPage.exportExcel).toBeVisible()
  })
})

// =============================================================================
// Modal
// =============================================================================

test.describe('Schedules - Modal', () => {
  test('ouvre le modal de création de shift', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await schedulesPage.clickNewShift()

    await expect(schedulesPage.shiftModal).toBeVisible()
  })
})

// =============================================================================
// Filtres
// =============================================================================

test.describe('Schedules - Filtres', () => {
  test('affiche les filtres directement sur la page', async ({
    managerPage,
  }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    // Les filtres sont toujours visibles (pas de bouton toggle)
    await expect(
      managerPage.locator('[class*="border-t"]').first()
    ).toBeVisible()
  })
})
