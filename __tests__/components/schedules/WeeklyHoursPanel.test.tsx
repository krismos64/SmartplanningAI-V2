/**
 * Tests unitaires pour WeeklyHoursPanel
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  WeeklyHoursPanel,
  type EmployeeWithHours,
  type WeeklyHoursPanelProps,
} from '@/components/schedules/WeeklyHoursPanel'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Fixtures
// ============================================================================

const mockEmployees: EmployeeWithHours[] = [
  {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    weeklyHours: 35,
    image: null,
  },
  {
    id: 'emp-2',
    firstName: 'Marie',
    lastName: 'Martin',
    weeklyHours: 35,
    image: 'https://example.com/avatar.jpg',
  },
  {
    id: 'emp-3',
    firstName: 'Pierre',
    lastName: 'Bernard',
    weeklyHours: 35,
    image: null,
  },
]

const mockSchedules: Partial<ScheduleWithRelations>[] = [
  {
    employeeId: 'emp-1',
    startTime: '09:00',
    endTime: '17:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-1',
    startTime: '09:00',
    endTime: '17:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-1',
    startTime: '09:00',
    endTime: '17:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-1',
    startTime: '09:00',
    endTime: '17:00',
    type: 'SHIFT',
  },
  // emp-1: 4 shifts * 8h = 32h (sur 35h contractuelles)
  {
    employeeId: 'emp-2',
    startTime: '08:00',
    endTime: '18:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-2',
    startTime: '08:00',
    endTime: '18:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-2',
    startTime: '08:00',
    endTime: '18:00',
    type: 'SHIFT',
  },
  {
    employeeId: 'emp-2',
    startTime: '08:00',
    endTime: '18:00',
    type: 'SHIFT',
  },
  // emp-2: 4 shifts * 10h = 40h (sur 35h → dépassement)
  {
    employeeId: 'emp-3',
    startTime: '09:00',
    endTime: '12:00',
    type: 'REST',
  },
  // emp-3: REST shift → ne compte pas
]

const defaultProps: WeeklyHoursPanelProps = {
  schedules: mockSchedules as ScheduleWithRelations[],
  employees: mockEmployees,
  isOpen: true,
  onToggle: vi.fn(),
}

// ============================================================================
// Tests
// ============================================================================

describe('WeeklyHoursPanel', () => {
  describe('Visibilité', () => {
    it('ne rend rien quand isOpen=false', () => {
      render(<WeeklyHoursPanel {...defaultProps} isOpen={false} />)
      expect(screen.queryByTestId('weekly-hours-panel')).not.toBeInTheDocument()
    })

    it('rend le panneau quand isOpen=true', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      expect(screen.getByTestId('weekly-hours-panel')).toBeInTheDocument()
    })
  })

  describe('Affichage de base', () => {
    it('affiche le titre "Heures semaine"', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      expect(screen.getByText('Heures semaine')).toBeInTheDocument()
    })

    it('affiche les noms des employés planifiés', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it('n affiche pas les employés sans shift non-REST', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      // emp-3 a seulement un REST, il ne doit pas apparaître
      expect(screen.queryByText('Pierre Bernard')).not.toBeInTheDocument()
    })

    it('affiche les initiales dans les avatars', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  describe('Calcul des heures', () => {
    it('affiche les heures planifiées / contractuelles', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      // emp-1: 32h / 35h
      expect(screen.getByText(/32h \/ 35h/)).toBeInTheDocument()
      // emp-2: 40h / 35h
      expect(screen.getByText(/40h \/ 35h/)).toBeInTheDocument()
    })

    it('affiche la différence négative', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      // emp-1: 32 - 35 = -3h
      expect(screen.getByText('-3h')).toBeInTheDocument()
    })

    it('affiche la différence positive avec +', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      // emp-2: 40 - 35 = +5h
      expect(screen.getByText('+5h')).toBeInTheDocument()
    })
  })

  describe('Tri', () => {
    it('trie les employés par déficit décroissant (sous-staffés en haut)', () => {
      render(<WeeklyHoursPanel {...defaultProps} />)
      const names = screen.getAllByText(/Dupont|Martin/).map(
        (el) => el.textContent
      )
      // Jean Dupont (-3h) doit être avant Marie Martin (+5h)
      expect(names[0]).toContain('Dupont')
      expect(names[1]).toContain('Martin')
    })
  })

  describe('Exclusion REST', () => {
    it('ne compte pas les shifts REST dans les heures', () => {
      const schedulesWithRest: Partial<ScheduleWithRelations>[] = [
        { employeeId: 'emp-1', startTime: '09:00', endTime: '17:00', type: 'SHIFT' },
        { employeeId: 'emp-1', startTime: '09:00', endTime: '17:00', type: 'REST' },
      ]

      render(
        <WeeklyHoursPanel
          {...defaultProps}
          schedules={schedulesWithRest as ScheduleWithRelations[]}
        />
      )

      // Seulement 8h (le REST est ignoré)
      expect(screen.getByText(/8h \/ 35h/)).toBeInTheDocument()
    })
  })

  describe('État vide', () => {
    it('affiche le message quand aucun employé planifié', () => {
      render(
        <WeeklyHoursPanel {...defaultProps} schedules={[]} />
      )
      expect(screen.getByText('Aucun employé planifié')).toBeInTheDocument()
    })

    it('affiche le message quand tous les shifts sont REST', () => {
      const restOnly: Partial<ScheduleWithRelations>[] = [
        { employeeId: 'emp-1', startTime: '09:00', endTime: '17:00', type: 'REST' },
      ]
      render(
        <WeeklyHoursPanel
          {...defaultProps}
          schedules={restOnly as ScheduleWithRelations[]}
        />
      )
      expect(screen.getByText('Aucun employé planifié')).toBeInTheDocument()
    })
  })

  describe('Barre de progression', () => {
    it('applique la couleur verte pour < 90%', () => {
      // emp-1: 32/35 = 91.4% → orange
      // Créons un employé à 70%
      const lowSchedules: Partial<ScheduleWithRelations>[] = [
        { employeeId: 'emp-1', startTime: '09:00', endTime: '17:00', type: 'SHIFT' },
        { employeeId: 'emp-1', startTime: '09:00', endTime: '17:00', type: 'SHIFT' },
        { employeeId: 'emp-1', startTime: '09:00', endTime: '12:30', type: 'SHIFT' },
      ]
      // 8 + 8 + 3.5 = 19.5h / 35h = 55.7%
      const { container } = render(
        <WeeklyHoursPanel
          {...defaultProps}
          schedules={lowSchedules as ScheduleWithRelations[]}
        />
      )
      const greenBar = container.querySelector('.bg-green-500')
      expect(greenBar).toBeTruthy()
    })

    it('applique la couleur rouge pour > 100%', () => {
      // emp-2: 40/35 = 114% → rouge
      const { container } = render(
        <WeeklyHoursPanel {...defaultProps} />
      )
      const redBar = container.querySelector('.bg-red-500')
      expect(redBar).toBeTruthy()
    })
  })

  describe('Heures exactes (0 diff)', () => {
    it('affiche "0h" quand les heures correspondent exactement', () => {
      const exactSchedules: Partial<ScheduleWithRelations>[] = Array.from(
        { length: 5 },
        () => ({
          employeeId: 'emp-1',
          startTime: '09:00',
          endTime: '16:00',
          type: 'SHIFT' as const,
        })
      )
      // 5 * 7h = 35h = 35h contractuelles → diff 0
      render(
        <WeeklyHoursPanel
          {...defaultProps}
          schedules={exactSchedules as ScheduleWithRelations[]}
        />
      )
      expect(screen.getByText('0h')).toBeInTheDocument()
    })
  })
})
