/**
 * Tests E2E - Écran plannings, vue grille et navigation
 *
 * @ticket SP-585
 * @description Couvre les trois défauts trouvés sur cet écran en deux sessions,
 * dont aucun n'avait été attrapé par un test :
 *
 * - SP-581 : changer de vue jour, semaine ou mois cassait la page entière,
 *   remplacée par l'error boundary sur `Cannot read properties of undefined`
 * - SP-584 : la navigation entre semaines ratait le premier clic après un
 *   changement de période venu d'ailleurs, la grille tenant sa propre semaine
 * - SP-584 : les congés approuvés doivent apparaître dans la grille, qui les
 *   reçoit désormais du parent au lieu de les recharger
 *
 * Ces tests portent sur du comportement, jamais sur du rendu pur ni du passage
 * de props : le projet a supprimé environ 197 fichiers de ce type en mars 2026.
 */

import { test, expect } from '../../fixtures/auth.fixture'
import { SchedulesPage } from '../../pages/schedules.page'

/**
 * Compile la page une fois avant la série.
 *
 * En local, `npm run dev` compile `/app/dashboard/schedules` au premier accès.
 * Avec plusieurs workers, les premiers tests y arrivaient ensemble et
 * attendaient la même compilation : ils échouaient par intermittence sur une
 * page encore vide, sans rapport avec ce qu'ils vérifient. Ce préchauffage
 * paie le coût une seule fois. En CI (`workers: 1`, serveur construit) il ne
 * change rien.
 */
test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage()
  await page
    .goto('/app/dashboard/schedules', { waitUntil: 'domcontentloaded' })
    .catch(() => {
      // La redirection vers /login est attendue : seule la compilation compte.
    })
  await page.close()
})

test.describe('Plannings - vue grille et navigation (DIRECTOR)', () => {
  test('affiche la grille semaine sans error boundary @director', async ({
    directorPage,
  }) => {
    const schedules = new SchedulesPage(directorPage)
    await schedules.goto()

    await expect(schedules.schedulesPage).toBeVisible()
    await schedules.waitForGrid()

    // Le défaut SP-581 remplaçait toute la page par ce message.
    await expect(
      directorPage.getByText('Une erreur est survenue')
    ).toHaveCount(0)
  })

  // SP-581 : le calendrier resynchronisait ses events après le montage et
  // déréférençait un plugin pas encore prêt. La page entière sautait.
  test('changer de vue ne casse pas la page @director', async ({
    directorPage,
  }) => {
    const schedules = new SchedulesPage(directorPage)
    await schedules.goto()

    for (const mode of ['day', 'month', 'week'] as const) {
      await schedules.setViewMode(mode)
      await expect(schedules.schedulesPage).toBeVisible({ timeout: 20000 })
      await expect(
        directorPage.getByText('Une erreur est survenue')
      ).toHaveCount(0)
    }

    // De retour en semaine, la grille doit être là et non un écran d'erreur.
    await schedules.waitForGrid()
  })

  test('la flèche suivante avance d\'une semaine @director', async ({
    directorPage,
  }) => {
    const schedules = new SchedulesPage(directorPage)
    await schedules.goto()

    const avant = await schedules.weekRangeText()
    await schedules.navigateNext()
    await schedules.waitForGrid()

    // Assertion positive plutôt que `not.toHaveText` : cette dernière est
    // satisfaite quand l'élément est absent, donc elle passerait pendant une
    // recompilation du serveur sans rien prouver. On attend que le libellé
    // existe ET diffère.
    await expect
      .poll(() => schedules.weekRangeText(), { timeout: 20000 })
      .not.toBe(avant)
  })

  /*
   * Il n'y a volontairement pas de test tentant de reproduire en E2E le défaut
   * de navigation de SP-584 (le premier clic qui ne naviguait pas).
   *
   * Deux mutations l'ont montré non reproductible à ce niveau : rétablir l'état
   * local de la grille, `setWeekDate` compris, laisse ces tests verts. L'état
   * local et la prop n'y divergent jamais, parce que le seul chemin qui change
   * la période sans démonter la grille est la navigation de la grille
   * elle-même, qui met les deux à jour ensemble. Le passage par la vue mois,
   * lui, démonte le composant et réinitialise son état.
   *
   * Ce défaut est donc couvert là où il est observable, dans le test unitaire
   * `WeeklyGridView.test.tsx`, qui remonte le composant avec une prop changée.
   * Écrire ici un test qui reste vert sur le défaut qu'il prétend attraper
   * donnerait une fausse assurance, ce qui est pire que l'absence de test.
   */

  test('« Aujourd\'hui » ramène sur la semaine courante @director', async ({
    directorPage,
  }) => {
    const schedules = new SchedulesPage(directorPage)
    await schedules.goto()

    const semaineCourante = await schedules.weekRangeText()

    await schedules.navigateNext()
    await schedules.navigateNext()
    await expect
      .poll(() => schedules.weekRangeText(), { timeout: 20000 })
      .not.toBe(semaineCourante)

    await schedules.goToToday()
    await expect
      .poll(() => schedules.weekRangeText(), { timeout: 20000 })
      .toBe(semaineCourante)
  })

  /*
   * L'affichage des congés dans la grille n'est volontairement pas testé ici.
   *
   * Trois approches ont été essayées et écartées. Viser une date du seed
   * (mars 2026) demande de piloter le sélecteur Schedule-X, dont le `fill()`
   * n'est pris en compte qu'à la validation et restait instable un passage sur
   * trois. Y aller au clic est hors de portée, le seed plaçant ses congés à six
   * mois de la semaine courante. Intercepter la Server Action, comme le font
   * les tests billing, demanderait de réécrire une réponse React flight, ce qui
   * coûte plus que ce que le test rapporte.
   *
   * La couverture est portée par deux tests unitaires, chacun prouvé par
   * mutation : `WeeklyGridView.test.tsx` vérifie que la grille n'appelle plus
   * `getTeamAbsences` elle-même, et `ScheduleCalendar.test.tsx` que la prop
   * `leaveRequests` est bien transmise à la grille. Ce second test a été ajouté
   * en SP-585 : ni le premier, qui monte la grille directement, ni l'E2E ne
   * voyaient ce maillon, et c'est précisément là qu'était le défaut de SP-584.
   *
   * Un test E2E qui dépend d'une date écrite en dur dans le seed se périmerait
   * de toute façon, comme les compteurs du README l'ont déjà fait deux fois.
   */
})

test.describe("Plannings - restrictions d'autorisation", () => {
  // Test négatif : un EMPLOYEE consulte son planning mais ne crée rien. Un test
  // qui ne vérifierait que le chemin nominal du DIRECTOR ne prouve pas le refus.
  test('un employé ne voit pas le bouton de création @employee', async ({
    employeePage,
  }) => {
    const schedules = new SchedulesPage(employeePage)
    await schedules.goto()

    await expect(schedules.schedulesPage).toBeVisible()
    await expect(schedules.newShiftButton).toHaveCount(0)
  })

  test('un directeur voit le bouton de création @director', async ({
    directorPage,
  }) => {
    const schedules = new SchedulesPage(directorPage)
    await schedules.goto()

    await expect(schedules.newShiftButton).toBeVisible()
  })
})
