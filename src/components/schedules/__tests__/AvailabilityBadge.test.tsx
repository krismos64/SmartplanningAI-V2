/**
 * Tests unitaires pour AvailabilityBadge
 *
 * @description Tests du composant badge d'indisponibilité
 * @ticket SP-402
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  AvailabilityBadge,
  AVAILABILITY_TYPE_CONFIG,
  HARD_AVAILABILITY_TYPES,
} from '../AvailabilityBadge'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'
import type { AvailabilityType, Prisma } from '@prisma/client'

// ============================================================================
// Données de test
// ============================================================================

const createMockAvailability = (
  type: AvailabilityType,
  firstName = 'Jean',
  lastName = 'Dupont'
): AvailabilityWithEmployee => ({
  id: `avail-${type.toLowerCase()}`,
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  startTime: null,
  endTime: null,
  type,
  reason: 'Test',
  isRecurring: false,
  recurrenceRule: null as Prisma.JsonValue,
  employeeId: 'emp-1',
  companyId: 'company-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: { id: 'emp-1', firstName, lastName },
})

// ============================================================================
// Tests
// ============================================================================

describe('AvailabilityBadge', () => {
  describe('Affichage', () => {
    it("affiche le nom de l'employé", () => {
      const availability = createMockAvailability('VACATION', 'Marie', 'Martin')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('Marie Martin')).toBeInTheDocument()
    })

    it("affiche l'emoji du type VACATION", () => {
      const availability = createMockAvailability('VACATION')

      render(<AvailabilityBadge availability={availability} />)

      // L'emoji est dans un élément avec aria-hidden
      expect(screen.getByText('🏖️')).toBeInTheDocument()
    })

    it("affiche l'emoji du type SICK", () => {
      const availability = createMockAvailability('SICK')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('🤒')).toBeInTheDocument()
    })

    it("affiche l'emoji du type TRAINING", () => {
      const availability = createMockAvailability('TRAINING')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('📚')).toBeInTheDocument()
    })

    it("affiche l'emoji du type UNAVAILABLE", () => {
      const availability = createMockAvailability('UNAVAILABLE')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('⛔')).toBeInTheDocument()
    })

    it("affiche l'emoji du type PREFERRED", () => {
      const availability = createMockAvailability('PREFERRED')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('⭐')).toBeInTheDocument()
    })

    it("affiche l'emoji du type OTHER", () => {
      const availability = createMockAvailability('OTHER')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.getByText('📝')).toBeInTheDocument()
    })

    it('affiche le label du type en mode non compact', () => {
      const availability = createMockAvailability('VACATION')

      render(<AvailabilityBadge availability={availability} compact={false} />)

      expect(screen.getByText('Vacances')).toBeInTheDocument()
    })

    it("n'affiche pas le nom si showEmployee=false", () => {
      const availability = createMockAvailability('VACATION', 'Jean', 'Dupont')

      render(
        <AvailabilityBadge availability={availability} showEmployee={false} />
      )

      expect(screen.queryByText('Jean Dupont')).not.toBeInTheDocument()
    })
  })

  describe('Mode compact', () => {
    it('rend en mode compact par défaut quand compact=true', () => {
      const availability = createMockAvailability('VACATION')

      const { container } = render(
        <AvailabilityBadge availability={availability} compact />
      )

      // En mode compact, c'est un span
      expect(container.querySelector('span')).toBeInTheDocument()
    })

    it('rend en mode normal par défaut quand compact=false', () => {
      const availability = createMockAvailability('VACATION')

      const { container } = render(
        <AvailabilityBadge availability={availability} compact={false} />
      )

      // En mode normal, c'est un div
      const badge = container.firstChild as HTMLElement
      expect(badge.tagName).toBe('DIV')
    })
  })

  describe('Interaction', () => {
    it('appelle onClick au clic', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const availability = createMockAvailability('VACATION')

      render(
        <AvailabilityBadge availability={availability} onClick={onClick} />
      )

      const badge = screen.getByRole('button')
      await user.click(badge)

      expect(onClick).toHaveBeenCalledWith(availability)
    })

    it('appelle onClick au clavier (Enter)', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const availability = createMockAvailability('VACATION')

      render(
        <AvailabilityBadge availability={availability} onClick={onClick} />
      )

      const badge = screen.getByRole('button')
      badge.focus()
      await user.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledWith(availability)
    })

    it('appelle onClick au clavier (Space)', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const availability = createMockAvailability('VACATION')

      render(
        <AvailabilityBadge availability={availability} onClick={onClick} />
      )

      const badge = screen.getByRole('button')
      badge.focus()
      await user.keyboard(' ')

      expect(onClick).toHaveBeenCalledWith(availability)
    })

    it("n'a pas de role button sans onClick", () => {
      const availability = createMockAvailability('VACATION')

      render(<AvailabilityBadge availability={availability} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('Configuration des types', () => {
    it('a une configuration pour tous les types', () => {
      const types: AvailabilityType[] = [
        'VACATION',
        'SICK',
        'TRAINING',
        'UNAVAILABLE',
        'PREFERRED',
        'OTHER',
      ]

      types.forEach((type) => {
        expect(AVAILABILITY_TYPE_CONFIG[type]).toBeDefined()
        expect(AVAILABILITY_TYPE_CONFIG[type].emoji).toBeDefined()
        expect(AVAILABILITY_TYPE_CONFIG[type].label).toBeDefined()
        expect(AVAILABILITY_TYPE_CONFIG[type].bgColor).toBeDefined()
        expect(AVAILABILITY_TYPE_CONFIG[type].textColor).toBeDefined()
        expect(AVAILABILITY_TYPE_CONFIG[type].borderColor).toBeDefined()
      })
    })

    it('définit les types hard correctement', () => {
      expect(HARD_AVAILABILITY_TYPES).toContain('VACATION')
      expect(HARD_AVAILABILITY_TYPES).toContain('SICK')
      expect(HARD_AVAILABILITY_TYPES).toContain('UNAVAILABLE')
      expect(HARD_AVAILABILITY_TYPES).not.toContain('TRAINING')
      expect(HARD_AVAILABILITY_TYPES).not.toContain('PREFERRED')
      expect(HARD_AVAILABILITY_TYPES).not.toContain('OTHER')
    })
  })

  describe('Accessibilité', () => {
    it('a un aria-label approprié', () => {
      const availability = createMockAvailability('VACATION', 'Jean', 'Dupont')

      render(
        <AvailabilityBadge availability={availability} onClick={vi.fn()} />
      )

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('aria-label', 'Vacances - Jean Dupont')
    })

    it('a un aria-label sans nom si showEmployee=false', () => {
      const availability = createMockAvailability('VACATION', 'Jean', 'Dupont')

      render(
        <AvailabilityBadge
          availability={availability}
          showEmployee={false}
          onClick={vi.fn()}
        />
      )

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('aria-label', 'Vacances')
    })

    it('a tabIndex=0 quand cliquable', () => {
      const availability = createMockAvailability('VACATION')

      render(
        <AvailabilityBadge availability={availability} onClick={vi.fn()} />
      )

      const badge = screen.getByRole('button')
      expect(badge).toHaveAttribute('tabIndex', '0')
    })
  })
})
