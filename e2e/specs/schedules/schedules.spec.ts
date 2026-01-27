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
    const newLabel = await schedulesPage.dateRangeLabel.textContent()

    expect(newLabel).not.toBe(initialLabel)
  })

  test('navigue vers la période précédente', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    const initialLabel = await schedulesPage.dateRangeLabel.textContent()
    await schedulesPage.navigatePrev()
    const newLabel = await schedulesPage.dateRangeLabel.textContent()

    expect(newLabel).not.toBe(initialLabel)
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

  test('affiche le bouton filtres', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await expect(schedulesPage.filtersButton).toBeVisible()
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
  test('ouvre les filtres au clic sur le bouton', async ({ managerPage }) => {
    const schedulesPage = new SchedulesPage(managerPage)
    await schedulesPage.goto()

    await schedulesPage.openFilters()

    // Le panel de filtres doit apparaître (contient des selects/inputs)
    await expect(
      managerPage.locator('[class*="border-t"]').first()
    ).toBeVisible()
  })
})
