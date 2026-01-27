/**
 * Tests unitaires pour ScheduleCalendarMobile
 *
 * @description Tests du composant vue mobile/tablette en cards
 * @ticket SP-396
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScheduleCalendarMobile } from '../ScheduleCalendarMobile'
import { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Mock data
// ============================================================================

const mockEmployee = {
  id: 'emp1',
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@test.com',
}

const mockTeam = {
  id: 'team1',
  name: 'Équipe A',
}

const createMockSchedule = (
  overrides: Partial<ScheduleWithRelations> = {}
): ScheduleWithRelations => ({
  id: 'sched1',
  title: 'Shift matin',
  startDate: new Date('2026-01-26'),
  endDate: new Date('2026-01-26'),
  startTime: '08:00',
  endTime: '12:00',
  type: 'WORK',
  status: 'CONFIRMED',
  isRecurring: false,
  recurrenceRule: null,
  recurrenceGroupId: null,
  scheduleGroupId: null,
  description: null,
  location: null,
  color: null,
  employeeId: 'emp1',
  teamId: 'team1',
  companyId: 'comp1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: mockEmployee,
  team: mockTeam,
  ...overrides,
})

const mockSchedules: ScheduleWithRelations[] = [
  createMockSchedule({
    id: 'sched1',
    startTime: '08:00',
    endTime: '12:00',
  }),
  createMockSchedule({
    id: 'sched2',
    title: 'Shift après-midi',
    startTime: '14:00',
    endTime: '18:00',
    employee: {
      ...mockEmployee,
      id: 'emp2',
      firstName: 'Marie',
      lastName: 'Martin',
    },
  }),
]

// ============================================================================
// Tests
// ============================================================================

describe('ScheduleCalendarMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Affichage vide', () => {
    it('affiche un message si aucun schedule', () => {
      render(
        <ScheduleCalendarMobile
          schedules={[]}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('Aucun planning')).toBeInTheDocument()
      expect(
        screen.getByText('Pas de plannings pour cette période')
      ).toBeInTheDocument()
    })
  })

  describe('Affichage des schedules', () => {
    it('affiche les schedules en cards', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it('affiche les horaires des schedules', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('08:00 - 12:00')).toBeInTheDocument()
      expect(screen.getByText('14:00 - 18:00')).toBeInTheDocument()
    })

    it('affiche le titre du schedule si présent', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('Shift matin')).toBeInTheDocument()
      expect(screen.getByText('Shift après-midi')).toBeInTheDocument()
    })

    it("affiche l'équipe si présente", () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getAllByText('Équipe A')).toHaveLength(2)
    })

    it('affiche le statut du schedule', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getAllByText('Confirmé')).toHaveLength(2)
    })

    it('affiche le type de schedule', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getAllByText('Travail')).toHaveLength(2)
    })
  })

  describe('Vue semaine', () => {
    it('groupe les schedules par jour en vue semaine', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
        />
      )

      // Vérifie que le jour est affiché
      expect(screen.getByText(/lundi 26 janvier/i)).toBeInTheDocument()
    })

    it('affiche le nombre de shifts par jour', () => {
      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('2 plannings')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('appelle onScheduleClick au clic sur une card', () => {
      const onScheduleClick = vi.fn()

      render(
        <ScheduleCalendarMobile
          schedules={mockSchedules}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
          onScheduleClick={onScheduleClick}
        />
      )

      // Cliquer sur la première card
      const card = screen.getByText('Jean Dupont').closest('.cursor-pointer')
      if (card) {
        fireEvent.click(card)
        expect(onScheduleClick).toHaveBeenCalledTimes(1)
        expect(onScheduleClick).toHaveBeenCalledWith(
          expect.objectContaining({ id: 'sched1' })
        )
      }
    })
  })

  describe('État de chargement', () => {
    it('affiche le skeleton en état de chargement', () => {
      render(
        <ScheduleCalendarMobile
          schedules={[]}
          viewMode="week"
          currentDate={new Date('2026-01-26')}
          isLoading={true}
        />
      )

      // Le skeleton contient des éléments animés
      const skeletons = document.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('Types de schedules', () => {
    it('affiche les différents types avec les bonnes couleurs', () => {
      const schedulesWithTypes = [
        createMockSchedule({ id: '1', type: 'WORK' }),
        createMockSchedule({ id: '2', type: 'BREAK' }),
        createMockSchedule({ id: '3', type: 'MEETING' }),
        createMockSchedule({ id: '4', type: 'TRAINING' }),
      ]

      render(
        <ScheduleCalendarMobile
          schedules={schedulesWithTypes}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('Travail')).toBeInTheDocument()
      expect(screen.getByText('Pause')).toBeInTheDocument()
      expect(screen.getByText('Réunion')).toBeInTheDocument()
      expect(screen.getByText('Formation')).toBeInTheDocument()
    })
  })

  describe('Statuts de schedules', () => {
    it('affiche les différents statuts', () => {
      const schedulesWithStatuses = [
        createMockSchedule({ id: '1', status: 'DRAFT' }),
        createMockSchedule({ id: '2', status: 'CONFIRMED' }),
      ]

      render(
        <ScheduleCalendarMobile
          schedules={schedulesWithStatuses}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(screen.getByText('Brouillon')).toBeInTheDocument()
      expect(screen.getByText('Confirmé')).toBeInTheDocument()
    })
  })

  describe('Description', () => {
    it('affiche la description si présente', () => {
      const scheduleWithDescription = createMockSchedule({
        description: 'Réunion importante avec le client',
      })

      render(
        <ScheduleCalendarMobile
          schedules={[scheduleWithDescription]}
          viewMode="day"
          currentDate={new Date('2026-01-26')}
        />
      )

      expect(
        screen.getByText('Réunion importante avec le client')
      ).toBeInTheDocument()
    })
  })
})
