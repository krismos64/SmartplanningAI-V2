/**
 * Tests unitaires pour ConflictAlert
 *
 * @description Tests du composant d'alerte de conflits horaires
 * @ticket SP-400
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConflictAlert } from '../ConflictAlert'
import type { AvailabilityConflict } from '@/lib/actions/availabilities'

// ============================================================================
// Données de test
// ============================================================================

const mockHardConflict: AvailabilityConflict = {
  id: 'conflict-1',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION',
  reason: 'Vacances annuelles',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'emp-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
  isHardConflict: true,
}

const mockSoftConflict: AvailabilityConflict = {
  id: 'conflict-2',
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-10'),
  startTime: '09:00',
  endTime: '12:00',
  type: 'TRAINING',
  reason: 'Formation sécurité',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'emp-2',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-2',
    firstName: 'Marie',
    lastName: 'Martin',
  },
  isHardConflict: false,
}

const mockSickConflict: AvailabilityConflict = {
  ...mockHardConflict,
  id: 'conflict-3',
  type: 'SICK',
  reason: null,
  employee: {
    id: 'emp-3',
    firstName: 'Pierre',
    lastName: 'Bernard',
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('ConflictAlert', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('ne rend rien si aucun conflit', () => {
      const { container } = render(
        <ConflictAlert conflicts={[]} hardConflicts={[]} softConflicts={[]} />
      )

      expect(container.firstChild).toBeNull()
    })

    it('affiche correctement les hard conflicts', () => {
      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
        />
      )

      expect(screen.getByText(/Conflit horaire détecté/i)).toBeInTheDocument()
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText(/Conges \/ Vacances/i)).toBeInTheDocument()
      expect(screen.getByText(/"Vacances annuelles"/i)).toBeInTheDocument()
    })

    it('affiche correctement les soft conflicts', () => {
      render(
        <ConflictAlert
          conflicts={[mockSoftConflict]}
          hardConflicts={[]}
          softConflicts={[mockSoftConflict]}
        />
      )

      expect(screen.getByText(/Avertissement/i)).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
      // Le type Formation apparaît dans le badge et dans la raison
      expect(screen.getAllByText(/Formation/i).length).toBeGreaterThan(0)
      expect(screen.getByText('09:00 - 12:00')).toBeInTheDocument()
    })

    it('affiche les deux types de conflits ensemble', () => {
      render(
        <ConflictAlert
          conflicts={[mockHardConflict, mockSoftConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[mockSoftConflict]}
        />
      )

      // Hard conflict
      expect(screen.getByText(/Conflit horaire détecté/i)).toBeInTheDocument()
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()

      // Soft conflict
      expect(screen.getByText(/Avertissement/i)).toBeInTheDocument()
      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it('affiche plusieurs hard conflicts avec pluriel', () => {
      render(
        <ConflictAlert
          conflicts={[mockHardConflict, mockSickConflict]}
          hardConflicts={[mockHardConflict, mockSickConflict]}
          softConflicts={[]}
        />
      )

      expect(
        screen.getByText(/Conflits horaires détectés/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/2 indisponibilités bloquantes/i)
      ).toBeInTheDocument()
    })

    it('affiche le type SICK correctement', () => {
      render(
        <ConflictAlert
          conflicts={[mockSickConflict]}
          hardConflicts={[mockSickConflict]}
          softConflicts={[]}
        />
      )

      expect(screen.getByText('Pierre Bernard')).toBeInTheDocument()
      expect(screen.getByText(/Maladie/i)).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it("affiche les boutons d'action si showActions=true", () => {
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
          onConfirm={onConfirm}
          onCancel={onCancel}
          showActions={true}
        />
      )

      expect(screen.getByText('Annuler')).toBeInTheDocument()
      expect(screen.getByText(/Créer malgré le conflit/i)).toBeInTheDocument()
    })

    it("n'affiche pas les boutons si showActions=false", () => {
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
          onConfirm={onConfirm}
          onCancel={onCancel}
          showActions={false}
        />
      )

      expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
      expect(
        screen.queryByText(/Créer malgré le conflit/i)
      ).not.toBeInTheDocument()
    })

    it('appelle onConfirm au clic sur le bouton de confirmation', () => {
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
          onConfirm={onConfirm}
          onCancel={onCancel}
          showActions={true}
        />
      )

      fireEvent.click(screen.getByText(/Créer malgré le conflit/i))

      expect(onConfirm).toHaveBeenCalledTimes(1)
      expect(onCancel).not.toHaveBeenCalled()
    })

    it("appelle onCancel au clic sur le bouton d'annulation", () => {
      const onConfirm = vi.fn()
      const onCancel = vi.fn()

      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
          onConfirm={onConfirm}
          onCancel={onCancel}
          showActions={true}
        />
      )

      fireEvent.click(screen.getByText('Annuler'))

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('affiche "Confirmer" pour les soft conflicts uniquement', () => {
      const onConfirm = vi.fn()

      render(
        <ConflictAlert
          conflicts={[mockSoftConflict]}
          hardConflicts={[]}
          softConflicts={[mockSoftConflict]}
          onConfirm={onConfirm}
          showActions={true}
        />
      )

      expect(screen.getByText('Confirmer')).toBeInTheDocument()
      expect(
        screen.queryByText(/Créer malgré le conflit/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Formatage dates', () => {
    it('affiche une seule date si même jour', () => {
      const sameDayConflict: AvailabilityConflict = {
        ...mockSoftConflict,
        startDate: new Date('2026-02-10'),
        endDate: new Date('2026-02-10'),
      }

      render(
        <ConflictAlert
          conflicts={[sameDayConflict]}
          hardConflicts={[]}
          softConflicts={[sameDayConflict]}
        />
      )

      // Ne devrait pas avoir de flèche pour une période d'un jour
      expect(screen.getByText(/10 févr. 2026/i)).toBeInTheDocument()
      expect(screen.queryByText('→')).not.toBeInTheDocument()
    })

    it('affiche la plage de dates si plusieurs jours', () => {
      render(
        <ConflictAlert
          conflicts={[mockHardConflict]}
          hardConflicts={[mockHardConflict]}
          softConflicts={[]}
        />
      )

      expect(screen.getByText(/01 févr. 2026/i)).toBeInTheDocument()
      expect(screen.getByText(/05 févr. 2026/i)).toBeInTheDocument()
    })
  })
})
