/**
 * Tests unitaires pour AvailabilityPopover
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AvailabilityPopover,
  type AvailabilityPopoverProps,
} from '@/components/schedules/AvailabilityPopover'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'

// ============================================================================
// Fixtures
// ============================================================================

const baseAvailability: AvailabilityWithEmployee = {
  id: 'avail-1',
  employeeId: 'emp-1',
  companyId: 'clcmp0001',
  type: 'VACATION',
  startDate: new Date('2026-01-15'),
  endDate: new Date('2026-01-20'),
  startTime: null,
  endTime: null,
  isRecurring: false,
  reason: 'Vacances familiales',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
  },
} as AvailabilityWithEmployee

const halfDayAvailability: AvailabilityWithEmployee = {
  ...baseAvailability,
  id: 'avail-2',
  type: 'SICK',
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-10'),
  startTime: '09:00',
  endTime: '12:00',
  reason: null,
} as AvailabilityWithEmployee

// ============================================================================
// Tests
// ============================================================================

describe('AvailabilityPopover', () => {
  const defaultProps: AvailabilityPopoverProps = {
    availability: baseAvailability,
    open: true,
    onOpenChange: vi.fn(),
    children: <button>Trigger</button>,
  }

  describe('Affichage header', () => {
    it('affiche le label du type', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(screen.getByText('Vacances')).toBeInTheDocument()
    })

    it('affiche le badge Bloquant pour type hard', () => {
      render(
        <AvailabilityPopover
          {...defaultProps}
          availability={{ ...baseAvailability, type: 'VACATION' } as AvailabilityWithEmployee}
        />
      )
      expect(screen.getByText('Bloquant')).toBeInTheDocument()
    })

    it('affiche le badge Avertissement pour type soft', () => {
      render(
        <AvailabilityPopover
          {...defaultProps}
          availability={{ ...baseAvailability, type: 'PREFERRED' } as AvailabilityWithEmployee}
        />
      )
      expect(screen.getByText('Avertissement')).toBeInTheDocument()
    })

    it('affiche le bouton Fermer', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(
        screen.getByRole('button', { name: 'Fermer' })
      ).toBeInTheDocument()
    })
  })

  describe('Contenu', () => {
    it('affiche le nom de l employe', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('affiche la plage de dates multi-jours', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(
        screen.getByText(/15 janv\. 2026 - 20 janv\. 2026/)
      ).toBeInTheDocument()
    })

    it('affiche une seule date quand meme jour', () => {
      render(
        <AvailabilityPopover
          {...defaultProps}
          availability={halfDayAvailability}
        />
      )
      // Doit afficher la date une seule fois (pas de range)
      const dateText = screen.getByText(/10 févr\. 2026/)
      expect(dateText).toBeInTheDocument()
      expect(dateText.textContent).not.toContain('-')
    })

    it('affiche "Journee entiere" sans horaires', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(screen.getByText('Journee entiere')).toBeInTheDocument()
    })

    it('affiche les horaires quand specifiques', () => {
      render(
        <AvailabilityPopover
          {...defaultProps}
          availability={halfDayAvailability}
        />
      )
      expect(screen.getByText('09:00 - 12:00')).toBeInTheDocument()
    })

    it('affiche la raison quand fournie', () => {
      render(<AvailabilityPopover {...defaultProps} />)
      expect(screen.getByText('Vacances familiales')).toBeInTheDocument()
    })

    it('n affiche pas la raison si absente', () => {
      render(
        <AvailabilityPopover
          {...defaultProps}
          availability={halfDayAvailability}
        />
      )
      expect(screen.queryByText('Raison')).not.toBeInTheDocument()
    })
  })

  describe('Fermeture', () => {
    it('appelle onOpenChange(false) au clic sur Fermer', async () => {
      const onOpenChange = vi.fn()
      const user = userEvent.setup()
      render(
        <AvailabilityPopover
          {...defaultProps}
          onOpenChange={onOpenChange}
        />
      )

      await user.click(
        screen.getByRole('button', { name: 'Fermer' })
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Visibilite', () => {
    it('n affiche pas le contenu quand open=false', () => {
      render(
        <AvailabilityPopover {...defaultProps} open={false} />
      )
      // Le popover content n'est pas rendu
      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument()
    })
  })
})
