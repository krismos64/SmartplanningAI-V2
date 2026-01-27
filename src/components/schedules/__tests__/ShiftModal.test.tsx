/**
 * Tests unitaires pour ShiftModal
 *
 * @description Tests du composant modal de création/édition de créneaux
 * @ticket SP-397
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ShiftModal } from '../ShiftModal'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Mocks
// ============================================================================

// Mock useShiftFormData hook
const mockEmployees = [
  { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont', teamId: 'team-1' },
  { id: 'emp-2', firstName: 'Marie', lastName: 'Martin', teamId: 'team-1' },
  { id: 'emp-3', firstName: 'Pierre', lastName: 'Durand', teamId: 'team-2' },
]

const mockTeams = [
  { id: 'team-1', name: 'Équipe A' },
  { id: 'team-2', name: 'Équipe B' },
]

vi.mock('../useShiftFormData', () => ({
  useShiftFormData: () => ({
    employees: mockEmployees,
    teams: mockTeams,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

// Mock Server Actions
const mockCreateSchedule = vi.fn()
const mockUpdateSchedule = vi.fn()

vi.mock('@/lib/actions/schedules', () => ({
  createSchedule: (data: unknown) =>
    mockCreateSchedule(data) as Promise<unknown>,
  updateSchedule: (data: unknown) =>
    mockUpdateSchedule(data) as Promise<unknown>,
}))

// Mock checkAvailabilityConflicts Server Action
const mockCheckAvailabilityConflicts = vi.fn()

vi.mock('@/lib/actions/availabilities', () => ({
  checkAvailabilityConflicts: (...args: unknown[]) =>
    mockCheckAvailabilityConflicts(...args) as Promise<unknown>,
}))

// ============================================================================
// Données de test
// ============================================================================

const mockSchedule: ScheduleWithRelations = {
  id: 'schedule-1',
  startDate: new Date('2026-01-26'),
  endDate: new Date('2026-01-26'),
  startTime: '09:00',
  endTime: '17:00',
  type: 'WORK',
  status: 'DRAFT',
  title: 'Test Schedule',
  description: 'Test description',
  location: 'Bureau A',
  color: '#10B981',
  isRecurring: false,
  recurrenceRule: null,
  recurrenceGroupId: null,
  scheduleGroupId: null,
  employeeId: 'emp-1',
  teamId: 'team-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
  team: {
    id: 'team-1',
    name: 'Équipe A',
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('ShiftModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateSchedule.mockResolvedValue({ success: true, data: [] })
    mockUpdateSchedule.mockResolvedValue({ success: true, data: mockSchedule })
    mockCheckAvailabilityConflicts.mockResolvedValue({
      success: true,
      data: {
        hasConflict: false,
        hasHardConflict: false,
        hasSoftConflict: false,
        conflicts: [],
        hardConflicts: [],
        softConflicts: [],
      },
    })
  })

  describe('Rendering', () => {
    it('affiche le modal en mode création', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.getByText('Créer un planning')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Remplissez les informations pour créer un nouveau planning'
        )
      ).toBeInTheDocument()
    })

    it('affiche le modal en mode édition', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="edit"
          schedule={mockSchedule}
          companyId="company-1"
        />
      )

      expect(screen.getByText('Modifier le planning')).toBeInTheDocument()
      expect(
        screen.getByText('Modifiez les informations du planning')
      ).toBeInTheDocument()
    })

    it("n'affiche rien quand isOpen est false", () => {
      render(
        <ShiftModal
          isOpen={false}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.queryByText('Créer un planning')).not.toBeInTheDocument()
    })

    it('affiche la liste des employés en mode création', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
      expect(screen.getByText('Pierre Durand')).toBeInTheDocument()
    })

    it("affiche l'employé concerné en mode édition", () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="edit"
          schedule={mockSchedule}
          companyId="company-1"
        />
      )

      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })
  })

  describe('Employee selection', () => {
    it('affiche la liste des employés', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      // Vérifier que les employés sont affichés
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
      expect(screen.getByText('Pierre Durand')).toBeInTheDocument()
    })

    it('affiche le champ de recherche', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(
        screen.getByPlaceholderText('Rechercher un employé...')
      ).toBeInTheDocument()
    })

    it('affiche le bouton tout sélectionner', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.getByText('Tout sélectionner')).toBeInTheDocument()
    })
  })

  describe('Form submission', () => {
    it('affiche le bouton de soumission en mode création', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(
        screen.getByRole('button', { name: 'Créer le planning' })
      ).toBeInTheDocument()
    })

    it('affiche le bouton de soumission en mode édition', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="edit"
          schedule={mockSchedule}
          companyId="company-1"
        />
      )

      expect(
        screen.getByRole('button', { name: 'Enregistrer' })
      ).toBeInTheDocument()
    })

    it('affiche le bouton Annuler', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(
        screen.getByRole('button', { name: 'Annuler' })
      ).toBeInTheDocument()
    })
  })

  describe('Type and Status selectors', () => {
    it('affiche les sélecteurs de type et statut', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      // Vérifier la présence des labels
      expect(screen.getByText('Type de planning')).toBeInTheDocument()
      expect(screen.getByText('Statut')).toBeInTheDocument()

      // Vérifier la présence des selects (combobox)
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Date and Time pickers', () => {
    it('affiche les champs de date et heure', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.getByText('Date de début')).toBeInTheDocument()
      expect(screen.getByText('Date de fin')).toBeInTheDocument()
      expect(screen.getByText('Heure de début')).toBeInTheDocument()
      expect(screen.getByText('Heure de fin')).toBeInTheDocument()
    })

    it('pré-remplit les dates en mode édition', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="edit"
          schedule={mockSchedule}
          companyId="company-1"
        />
      )

      // Vérifier que les heures sont pré-remplies
      const startTimeInput = screen.getByDisplayValue('09:00')
      const endTimeInput = screen.getByDisplayValue('17:00')

      expect(startTimeInput).toBeInTheDocument()
      expect(endTimeInput).toBeInTheDocument()
    })
  })

  describe('Optional fields', () => {
    it('affiche les champs optionnels', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="create"
          companyId="company-1"
        />
      )

      expect(screen.getByText('Titre (optionnel)')).toBeInTheDocument()
      expect(screen.getByText('Description (optionnelle)')).toBeInTheDocument()
      expect(screen.getByText('Lieu (optionnel)')).toBeInTheDocument()
    })

    it('pré-remplit les champs optionnels en mode édition', () => {
      render(
        <ShiftModal
          isOpen={true}
          onClose={vi.fn()}
          mode="edit"
          schedule={mockSchedule}
          companyId="company-1"
        />
      )

      expect(screen.getByDisplayValue('Test Schedule')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Bureau A')).toBeInTheDocument()
    })
  })

  describe('Close behavior', () => {
    it('appelle onClose quand on clique sur Annuler', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <ShiftModal
          isOpen={true}
          onClose={onClose}
          mode="create"
          companyId="company-1"
        />
      )

      const cancelButton = screen.getByRole('button', { name: 'Annuler' })
      await user.click(cancelButton)

      expect(onClose).toHaveBeenCalled()
    })
  })
})
