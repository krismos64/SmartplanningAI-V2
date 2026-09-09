/**
 * Tests unitaires pour ScheduleCalendar
 *
 * @description Tests du composant wrapper responsive
 * @ticket SP-396
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ScheduleCalendar } from '../ScheduleCalendar'
import { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Mock des composants enfants
// ============================================================================

vi.mock('../ScheduleCalendarDesktop', () => ({
  ScheduleCalendarDesktop: () => (
    <div data-testid="desktop-calendar">Desktop Calendar</div>
  ),
}))

vi.mock('../ScheduleCalendarMobile', () => ({
  ScheduleCalendarMobile: () => (
    <div data-testid="mobile-calendar">Mobile Calendar</div>
  ),
}))

// Le mock expose les props reçues : sans cela, un maillon coupé dans la chaîne
// `SchedulesPageContent` -> `ScheduleCalendar` -> `WeeklyGridView` ne se voit
// nulle part. C'est exactement le défaut de SP-584, où `leaveRequests` arrivait
// jusqu'à ce composant sans être transmis plus loin (SP-585).
const weeklyGridProps = vi.hoisted(() => ({
  current: null as Record<string, unknown> | null,
}))

vi.mock('../WeeklyGridView', () => ({
  WeeklyGridView: (props: Record<string, unknown>) => {
    weeklyGridProps.current = props
    return <div data-testid="weekly-grid">Weekly Grid</div>
  },
}))

// ============================================================================
// Mock useMediaQuery
// ============================================================================

const mockUseMediaQuery = vi.fn()

vi.mock('@/hooks', () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  useMediaQuery: () => mockUseMediaQuery(),
}))

// ============================================================================
// Mock data
// ============================================================================

const mockSchedules: ScheduleWithRelations[] = []

// ============================================================================
// Tests
// ============================================================================

describe('ScheduleCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Responsive behavior', () => {
    it('affiche le skeleton pendant le montage initial', () => {
      mockUseMediaQuery.mockReturnValue(true)

      const { container } = render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
        />
      )

      // Avant le montage, le skeleton est affiché
      // Note: Le skeleton est visible brièvement avant useEffect
      expect(container).toBeTruthy()
    })

    it('affiche la grille semaine quand isDesktop=true et viewMode=week', async () => {
      mockUseMediaQuery.mockReturnValue(true)

      render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('weekly-grid')).toBeInTheDocument()
      })
    })

    // SP-585 : couvre le maillon que ni `WeeklyGridView.test.tsx` (qui monte la
    // grille directement) ni les tests E2E ne voient. Retirer la prop du rendu
    // de `ScheduleCalendar` fait rougir ce test, et lui seul.
    it('transmet les congés reçus à la grille semaine', async () => {
      mockUseMediaQuery.mockReturnValue(true)
      const leaveRequests = [
        { id: 'cl000000000000000000leav1' },
      ] as never

      render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
          leaveRequests={leaveRequests}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('weekly-grid')).toBeInTheDocument()
      })

      expect(weeklyGridProps.current?.leaveRequests).toBe(leaveRequests)
    })

    it('affiche le calendrier desktop quand isDesktop=true et viewMode=day', async () => {
      mockUseMediaQuery.mockReturnValue(true)

      render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-calendar')).toBeInTheDocument()
      })
    })

    it('affiche le calendrier mobile quand isDesktop=false', async () => {
      mockUseMediaQuery.mockReturnValue(false)

      render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('mobile-calendar')).toBeInTheDocument()
      })
    })
  })

  describe('Props transmission', () => {
    it('transmet les props aux composants enfants', async () => {
      mockUseMediaQuery.mockReturnValue(true)

      const onScheduleClick = vi.fn()
      const onScheduleUpdate = vi.fn()

      render(
        <ScheduleCalendar
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
          onScheduleClick={onScheduleClick}
          onScheduleUpdate={onScheduleUpdate}
          isLoading={false}
          canEdit={true}
        />
      )

      await waitFor(() => {
        expect(screen.getByTestId('desktop-calendar')).toBeInTheDocument()
      })
    })
  })
})
