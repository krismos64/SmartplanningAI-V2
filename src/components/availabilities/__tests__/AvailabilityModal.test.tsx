/**
 * Tests unitaires pour AvailabilityModal
 *
 * @description Tests du composant modal de création/édition d'indisponibilité
 * @ticket SP-401
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvailabilityModal } from '../AvailabilityModal'
import type { AvailabilityWithRelations } from '@/lib/actions/availabilities'

// ============================================================================
// Mocks
// ============================================================================

// Mock des actions
vi.mock('@/lib/actions/availabilities', () => ({
  createAvailability: vi.fn(),
  updateAvailability: vi.fn(),
}))

import {
  createAvailability,
  updateAvailability,
} from '@/lib/actions/availabilities'

// ============================================================================
// Données de test
// ============================================================================

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  mode: 'create' as const,
  employeeId: 'clxxxxxxxxxxxxxxxxxx1',
  companyId: 'clxxxxxxxxxxxxxxxxxx2',
  employeeName: 'Jean Dupont',
  onSuccess: vi.fn(),
}

const mockAvailability: AvailabilityWithRelations = {
  id: 'clxxxxxxxxxxxxxxxxxx3',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION',
  reason: 'Vacances annuelles',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'clxxxxxxxxxxxxxxxxxx1',
  companyId: 'clxxxxxxxxxxxxxxxxxx2',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'clxxxxxxxxxxxxxxxxxx1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('AvailabilityModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Mode création', () => {
    it('affiche le titre de création', () => {
      render(<AvailabilityModal {...defaultProps} />)

      expect(
        screen.getByText('Ajouter une indisponibilité')
      ).toBeInTheDocument()
    })

    it("affiche le nom de l'employé", () => {
      render(<AvailabilityModal {...defaultProps} />)

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('affiche les champs du formulaire', () => {
      render(<AvailabilityModal {...defaultProps} />)

      expect(screen.getByText("Type d'indisponibilité")).toBeInTheDocument()
      expect(screen.getByText('Date de début')).toBeInTheDocument()
      expect(screen.getByText('Date de fin')).toBeInTheDocument()
      expect(screen.getByText('Journée entière')).toBeInTheDocument()
      expect(screen.getByText('Raison (optionnelle)')).toBeInTheDocument()
    })

    it('le switch "Journée entière" est activé par défaut', () => {
      render(<AvailabilityModal {...defaultProps} />)

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toBeChecked()
    })

    it('affiche les champs d\'heures quand "Journée entière" est désactivé', async () => {
      render(<AvailabilityModal {...defaultProps} />)

      const switchElement = screen.getByRole('switch')
      await userEvent.click(switchElement)

      expect(screen.getByText('Heure de début')).toBeInTheDocument()
      expect(screen.getByText('Heure de fin')).toBeInTheDocument()
    })

    it('appelle createAvailability lors de la soumission', async () => {
      vi.mocked(createAvailability).mockResolvedValue({
        success: true,
        data: mockAvailability,
      })

      render(<AvailabilityModal {...defaultProps} />)

      // Soumettre le formulaire
      fireEvent.click(screen.getByText('Ajouter'))

      await waitFor(() => {
        expect(createAvailability).toHaveBeenCalledWith(
          expect.objectContaining({
            employeeId: 'clxxxxxxxxxxxxxxxxxx1',
            companyId: 'clxxxxxxxxxxxxxxxxxx2',
            type: 'UNAVAILABLE', // Type par défaut
          })
        )
      })
    })

    it('appelle onSuccess et onClose après création réussie', async () => {
      vi.mocked(createAvailability).mockResolvedValue({
        success: true,
        data: mockAvailability,
      })

      render(<AvailabilityModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Ajouter'))

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled()
        expect(defaultProps.onClose).toHaveBeenCalled()
      })
    })

    it("affiche une erreur en cas d'échec", async () => {
      vi.mocked(createAvailability).mockResolvedValue({
        success: false,
        error: 'Erreur de création',
      })

      render(<AvailabilityModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Ajouter'))

      await waitFor(() => {
        expect(screen.getByText('Erreur de création')).toBeInTheDocument()
      })
    })
  })

  describe('Mode édition', () => {
    const editProps = {
      ...defaultProps,
      mode: 'edit' as const,
      availability: mockAvailability,
    }

    it("affiche le titre d'édition", () => {
      render(<AvailabilityModal {...editProps} />)

      expect(screen.getByText("Modifier l'indisponibilité")).toBeInTheDocument()
    })

    it('pré-remplit les champs avec les données existantes', () => {
      render(<AvailabilityModal {...editProps} />)

      // Le type devrait être pré-sélectionné (peut apparaître plusieurs fois)
      expect(screen.getAllByText('Conges / Vacances').length).toBeGreaterThan(0)
    })

    it('appelle updateAvailability lors de la soumission', async () => {
      vi.mocked(updateAvailability).mockResolvedValue({
        success: true,
        data: mockAvailability,
      })

      render(<AvailabilityModal {...editProps} />)

      fireEvent.click(screen.getByText('Enregistrer'))

      await waitFor(() => {
        expect(updateAvailability).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'clxxxxxxxxxxxxxxxxxx3',
          })
        )
      })
    })
  })

  describe('Interactions', () => {
    it('ferme le modal quand on clique sur Annuler', () => {
      render(<AvailabilityModal {...defaultProps} />)

      fireEvent.click(screen.getByText('Annuler'))

      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('appelle la fonction de soumission au clic sur le bouton', async () => {
      vi.mocked(createAvailability).mockResolvedValue({
        success: true,
        data: mockAvailability,
      })

      render(<AvailabilityModal {...defaultProps} />)

      const submitButton = screen.getByText('Ajouter')
      fireEvent.click(submitButton)

      // Vérifier que createAvailability a été appelé
      await waitFor(() => {
        expect(createAvailability).toHaveBeenCalled()
      })
    })
  })

  describe('Validation', () => {
    it('affiche le select de type avec la valeur par défaut', () => {
      render(<AvailabilityModal {...defaultProps} />)

      // Vérifier que le combobox existe
      const typeSelect = screen.getByRole('combobox')
      expect(typeSelect).toBeInTheDocument()
    })
  })
})
