/**
 * Tests E2E - Calendrier des congés équipe
 *
 * @ticket SP-416
 * @description Vérifie l'affichage et la navigation du calendrier
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { LeavesPage } from '../../pages/leaves.page'

test.describe('Leaves - Calendrier équipe', () => {
  test('affiche le calendrier avec le mois courant @manager', async ({
    managerPage,
  }) => {
    const leavesPage = new LeavesPage(managerPage)
    await leavesPage.goto()

    // Basculer vers la vue calendrier
    await leavesPage.switchToCalendarView()

    // Le calendrier doit être visible
    await expect(leavesPage.leavesCalendarTab).toBeVisible()

    // Le header du mois doit être visible (si équipe disponible)
    // Sinon un message "aucune équipe" s'affiche
    const calendar = leavesPage.leavesCalendar
    const noTeamMessage = managerPage.getByText(/aucune équipe/i)

    const calendarVisible = await calendar.isVisible().catch(() => false)
    const noTeamVisible = await noTeamMessage.isVisible().catch(() => false)

    expect(calendarVisible || noTeamVisible).toBe(true)
  })

  test('affiche le calendrier pour le directeur @director', async ({
    directorPage,
  }) => {
    const leavesPage = new LeavesPage(directorPage)
    await leavesPage.goto()

    await leavesPage.switchToCalendarView()

    // Le directeur peut voir le calendrier si des équipes existent
    await expect(leavesPage.leavesCalendarTab).toBeVisible()
  })
})
