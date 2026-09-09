/**
 * WeeklyGridView : congés reçus en prop, et semaine pilotée par le parent
 *
 * @description Deux défauts mesurés sur l'écran plannings, tous deux invisibles
 * au type-check et aux tests existants.
 *
 * Le premier : la grille chargeait les congés elle-même alors que le parent
 * couvrait déjà la même fenêtre, ce qui doublait chaque appel à
 * `getTeamAbsences`. Le test négatif le prouve par l'absence d'appel.
 *
 * Le second : la grille dupliquait la semaine affichée en état local, jamais
 * resynchronisé sur la prop. Les deux états divergeaient dès que la période
 * changeait ailleurs, et le premier clic sur une flèche ne faisait que
 * rattraper l'écart au lieu de naviguer.
 *
 * `ScheduleCalendar.test.tsx` ne pouvait voir ni l'un ni l'autre : il remplace
 * `WeeklyGridView` par un `<div>`. Ce test monte le composant réel.
 *
 * @ticket SP-584
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyGridView } from '../WeeklyGridView'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Mocks
// ============================================================================

// La Server Action que la grille ne doit plus appeler. Le mock existe pour
// pouvoir affirmer qu'il n'est jamais sollicité : sans lui, un appel résiduel
// partirait vers la vraie action et le test échouerait pour une autre raison.
// Le mock renvoie une réponse réaliste plutôt qu'`undefined` : sans cela, un
// appel résiduel ferait échouer le test sur une erreur de mock au lieu de
// l'assertion, ce qui masquerait le vrai motif.
const mockGetTeamAbsences = vi.hoisted(() =>
  vi.fn(() => Promise.resolve({ success: true as const, data: [] }))
)

vi.mock('@/lib/actions/leaves', () => ({
  getTeamAbsences: mockGetTeamAbsences,
}))

// ============================================================================
// Données
// ============================================================================

const MARDI_8_SEPTEMBRE = new Date('2026-09-08T10:00:00.000Z')

/**
 * Date locale au format AAAA-MM-JJ.
 *
 * `toISOString()` ne convient pas ici : `startOfWeek` travaille en heure
 * locale, et minuit à Paris vaut 22h UTC la veille, ce qui décalerait chaque
 * comparaison d'un jour.
 */
function jourLocal(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

const aucunPlanning: ScheduleWithRelations[] = []

// ============================================================================
// Tests
// ============================================================================

describe('WeeklyGridView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('chargement des congés', () => {
    // Test négatif : c'est l'absence d'appel qui est vérifiée, pas la présence
    // d'un affichage. Un test qui ne regarderait que le rendu resterait vert
    // avec le doublon en place.
    it("n'appelle jamais getTeamAbsences elle-même", () => {
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
        />
      )

      expect(mockGetTeamAbsences).not.toHaveBeenCalled()
    })
  })

  describe('navigation entre semaines', () => {
    // Le défaut : la grille tenait `weekDate` en `useState(currentDate)`, jamais
    // resynchronisé. Après un changement de période venu du parent, le premier
    // clic repartait de l'ancienne date locale.
    it('suit la date du parent sans état local à resynchroniser', () => {
      const { rerender } = render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
        />
      )

      expect(screen.getByText(/13 sept/)).toBeInTheDocument()

      // Le parent change de période, par exemple via les filtres ou un retour
      // depuis la vue mois. L'en-tête doit suivre immédiatement.
      rerender(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={new Date('2026-09-22T10:00:00.000Z')}
          leaveRequests={[]}
        />
      )

      expect(screen.getByText(/27 sept/)).toBeInTheDocument()
    })

    // Le cœur du défaut de navigation : après un changement venu du parent, le
    // premier clic doit demander la semaine adjacente à celle affichée. Avec
    // l'état local, il repartait de la date du montage.
    it('le premier clic après un changement de période navigue vraiment', async () => {
      const user = userEvent.setup()
      const onRangeChange = vi.fn()

      const { rerender } = render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          onRangeChange={onRangeChange}
          leaveRequests={[]}
        />
      )

      // La période change ailleurs : on saute deux semaines en avant.
      rerender(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={new Date('2026-09-22T10:00:00.000Z')}
          onRangeChange={onRangeChange}
          leaveRequests={[]}
        />
      )

      await user.click(screen.getByRole('button', { name: /semaine suivante/i }))

      expect(onRangeChange).toHaveBeenCalledTimes(1)
      const [debut] = onRangeChange.mock.calls[0] as [Date, Date]

      // Le 22 septembre est un mardi : la semaine affichée démarre le 21, et
      // la suivante le 28. Avec l'état local, le clic repartait de la semaine
      // du montage et aurait demandé le 14.
      expect(jourLocal(debut)).toBe('2026-09-28')
    })

    it('remonte une semaine normalisée au lundi, pas la date reçue', async () => {
      const user = userEvent.setup()
      const onRangeChange = vi.fn()

      // Un jeudi : le parent peut envoyer n'importe quel jour de la semaine,
      // la grille doit renvoyer le lundi qui l'ouvre.
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={new Date('2026-09-10T15:30:00.000Z')}
          onRangeChange={onRangeChange}
          leaveRequests={[]}
        />
      )

      await user.click(
        screen.getByRole('button', { name: /semaine précédente/i })
      )

      const [debut, fin] = onRangeChange.mock.calls[0] as [Date, Date]

      expect(jourLocal(debut)).toBe('2026-08-31')
      expect(jourLocal(fin)).toBe('2026-09-06')
    })
  })
})
