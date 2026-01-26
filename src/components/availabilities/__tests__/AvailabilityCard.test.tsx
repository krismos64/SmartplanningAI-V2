/**
 * Tests unitaires pour AvailabilityCard
 *
 * @description Tests du composant de carte d'indisponibilité
 * @ticket SP-401
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvailabilityCard } from '../AvailabilityCard'
import type { AvailabilityWithRelations } from '@/lib/actions/availabilities'

// ============================================================================
// Données de test
// ============================================================================

const mockAvailability: AvailabilityWithRelations = {
  id: 'clxxxxxxxxxxxxxxxxxx1',
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type: 'VACATION',
  reason: 'Vacances annuelles',
  isRecurring: false,
  recurrenceRule: null,
  employeeId: 'clxxxxxxxxxxxxxxxxxx2',
  companyId: 'clxxxxxxxxxxxxxxxxxx3',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'clxxxxxxxxxxxxxxxxxx2',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
}

const mockAvailabilityWithTime: AvailabilityWithRelations = {
  ...mockAvailability,
  id: 'clxxxxxxxxxxxxxxxxxx4',
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-10'),
  startTime: '09:00',
  endTime: '12:00',
  type: 'UNAVAILABLE',
  reason: 'Rendez-vous médical',
}

// ============================================================================
// Tests
// ============================================================================

describe('AvailabilityCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it("affiche le type d'indisponibilité", () => {
      render(<AvailabilityCard availability={mockAvailability} />)

      expect(screen.getByText('Conges / Vacances')).toBeInTheDocument()
    })

    it('affiche la période de dates', () => {
      render(<AvailabilityCard availability={mockAvailability} />)

      // Vérifie que les dates sont affichées
      expect(screen.getByText(/01 févr. 2026/i)).toBeInTheDocument()
      expect(screen.getByText(/05 févr. 2026/i)).toBeInTheDocument()
    })

    it('affiche "Journée entière" quand pas d\'heures', () => {
      render(<AvailabilityCard availability={mockAvailability} />)

      expect(screen.getByText('Journée entière')).toBeInTheDocument()
    })

    it('affiche les heures quand spécifiées', () => {
      render(<AvailabilityCard availability={mockAvailabilityWithTime} />)

      expect(screen.getByText('09:00 - 12:00')).toBeInTheDocument()
    })

    it('affiche la raison si fournie', () => {
      render(<AvailabilityCard availability={mockAvailability} />)

      expect(screen.getByText('Vacances annuelles')).toBeInTheDocument()
    })

    it("affiche le nom de l'employé si showEmployee=true", () => {
      render(
        <AvailabilityCard availability={mockAvailability} showEmployee={true} />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it("n'affiche pas le nom si showEmployee=false", () => {
      render(
        <AvailabilityCard
          availability={mockAvailability}
          showEmployee={false}
        />
      )

      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument()
    })
  })

  describe('Mode compact', () => {
    it('affiche une version compacte', () => {
      render(
        <AvailabilityCard availability={mockAvailability} compact={true} />
      )

      // La version compacte montre juste le label du type
      expect(screen.getByText('Conges / Vacances')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('appelle onEdit quand on clique sur Modifier', async () => {
      const onEdit = vi.fn()
      render(
        <AvailabilityCard availability={mockAvailability} onEdit={onEdit} />
      )

      // Ouvrir le menu
      await userEvent.click(screen.getByRole('button', { name: /actions/i }))

      // Cliquer sur Modifier (attendre que le menu soit ouvert)
      const modifierButton = await screen.findByText('Modifier')
      await userEvent.click(modifierButton)

      expect(onEdit).toHaveBeenCalledWith(mockAvailability)
    })

    it('appelle onDelete quand on clique sur Supprimer', async () => {
      const onDelete = vi.fn()
      render(
        <AvailabilityCard availability={mockAvailability} onDelete={onDelete} />
      )

      // Ouvrir le menu
      await userEvent.click(screen.getByRole('button', { name: /actions/i }))

      // Cliquer sur Supprimer (attendre que le menu soit ouvert)
      const supprimerButton = await screen.findByText('Supprimer')
      await userEvent.click(supprimerButton)

      expect(onDelete).toHaveBeenCalledWith(mockAvailability)
    })

    it("n'affiche pas le menu si aucune action", () => {
      render(<AvailabilityCard availability={mockAvailability} />)

      expect(
        screen.queryByRole('button', { name: /actions/i })
      ).not.toBeInTheDocument()
    })

    it('désactive les actions quand disabled=true', () => {
      const onEdit = vi.fn()
      const onDelete = vi.fn()
      render(
        <AvailabilityCard
          availability={mockAvailability}
          onEdit={onEdit}
          onDelete={onDelete}
          disabled={true}
        />
      )

      // Le menu ne devrait pas être visible
      expect(
        screen.queryByRole('button', { name: /actions/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('Types', () => {
    const types: Array<{
      type: AvailabilityWithRelations['type']
      label: string
    }> = [
      { type: 'UNAVAILABLE', label: 'Indisponible' },
      { type: 'PREFERRED', label: 'Preference horaire' },
      { type: 'VACATION', label: 'Conges / Vacances' },
      { type: 'SICK', label: 'Maladie' },
      { type: 'TRAINING', label: 'Formation' },
      { type: 'OTHER', label: 'Autre' },
    ]

    types.forEach(({ type, label }) => {
      it(`affiche correctement le type ${type}`, () => {
        render(
          <AvailabilityCard availability={{ ...mockAvailability, type }} />
        )

        expect(screen.getByText(label)).toBeInTheDocument()
      })
    })
  })
})
