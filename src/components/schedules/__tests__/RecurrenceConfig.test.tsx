/**
 * Tests unitaires pour RecurrenceConfig
 *
 * @description Tests du composant de configuration de récurrence
 * @ticket SP-399
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecurrenceConfig } from '../RecurrenceConfig'
import type { RecurrenceRule } from '@/lib/utils/recurrence'

// ============================================================================
// Données de test
// ============================================================================

// Utiliser des dates toujours dans le futur pour éviter
// les échecs de validation "date de fin dans le passé"
const futureDate = new Date()
futureDate.setMonth(futureDate.getMonth() + 1)

const defaultProps = {
  value: null as RecurrenceRule | null,
  onChange: vi.fn(),
  isEnabled: false,
  onEnabledChange: vi.fn(),
  startDate: futureDate,
  endDate: futureDate,
  employeeCount: 1,
  disabled: false,
}

// ============================================================================
// Tests
// ============================================================================

describe('RecurrenceConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('affiche le switch de récurrence désactivé par défaut', () => {
      render(<RecurrenceConfig {...defaultProps} />)

      expect(screen.getByText('Créneau récurrent')).toBeInTheDocument()
      expect(screen.getByRole('switch')).toBeInTheDocument()
      expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it("n'affiche pas les options de configuration quand désactivé", () => {
      render(<RecurrenceConfig {...defaultProps} isEnabled={false} />)

      expect(screen.queryByText('Fréquence')).not.toBeInTheDocument()
      expect(screen.queryByText('Jours de répétition')).not.toBeInTheDocument()
    })

    it('affiche les options de configuration quand activé', () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.getByText('Fréquence')).toBeInTheDocument()
      expect(screen.getByText('Jours de répétition')).toBeInTheDocument()
      expect(screen.getByText('Fin de la récurrence')).toBeInTheDocument()
    })

    it('affiche le nombre de créneaux qui seront créés', () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          employeeCount={2}
        />
      )

      // 4 occurrences × 2 employés = 8 créneaux
      expect(screen.getByText(/8 créneaux seront créés/i)).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('appelle onEnabledChange quand le switch est cliqué', () => {
      const onEnabledChange = vi.fn()

      render(
        <RecurrenceConfig {...defaultProps} onEnabledChange={onEnabledChange} />
      )

      fireEvent.click(screen.getByRole('switch'))

      expect(onEnabledChange).toHaveBeenCalledWith(true)
    })

    it('appelle onChange quand activé', () => {
      const onChange = vi.fn()
      const onEnabledChange = vi.fn()

      render(
        <RecurrenceConfig
          {...defaultProps}
          onChange={onChange}
          onEnabledChange={onEnabledChange}
        />
      )

      fireEvent.click(screen.getByRole('switch'))

      // onChange devrait être appelé avec une règle par défaut
      expect(onChange).toHaveBeenCalled()
    })

    it('permet de toggle les jours de la semaine', () => {
      const onChange = vi.fn()
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          onChange={onChange}
        />
      )

      // Cliquer sur Mercredi
      fireEvent.click(screen.getByText('Mer'))

      // onChange devrait être appelé avec MONDAY et WEDNESDAY
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          daysOfWeek: expect.arrayContaining(['MONDAY', 'WEDNESDAY']),
        })
      )
    })
  })

  describe('Validation', () => {
    it('affiche un warning quand trop de créneaux', () => {
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 1,
        occurrences: 52,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          employeeCount={5}
        />
      )

      // 52 × 5 = 260 créneaux > 200 max
      expect(screen.getByText(/Maximum autorisé/i)).toBeInTheDocument()
    })

    it("n'affiche pas de warning quand dans les limites", () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          employeeCount={2}
        />
      )

      expect(screen.queryByText(/Maximum autorisé/i)).not.toBeInTheDocument()
    })
  })

  describe('Mode de fin', () => {
    it('affiche le champ occurrences par défaut', () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.getByText("Nombre d'occurrences")).toHaveClass('bg-primary')
    })

    it('permet de changer vers mode date de fin', () => {
      const onChange = vi.fn()
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByText('Date de fin'))

      // onChange devrait être appelé avec endDate et sans occurrences
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          endDate: expect.any(Date),
          occurrences: undefined,
        })
      )
    })
  })

  describe('Fréquences', () => {
    it("n'affiche pas les jours pour DAILY", () => {
      const rule: RecurrenceRule = {
        frequency: 'DAILY',
        interval: 1,
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.queryByText('Jours de répétition')).not.toBeInTheDocument()
    })

    it("n'affiche pas les jours pour MONTHLY", () => {
      const rule: RecurrenceRule = {
        frequency: 'MONTHLY',
        interval: 1,
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.queryByText('Jours de répétition')).not.toBeInTheDocument()
    })

    it('affiche les jours pour WEEKLY', () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.getByText('Jours de répétition')).toBeInTheDocument()
      expect(screen.getByText('Lun')).toBeInTheDocument()
      expect(screen.getByText('Mar')).toBeInTheDocument()
    })

    it('affiche les jours pour BIWEEKLY', () => {
      const rule: RecurrenceRule = {
        frequency: 'BIWEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig {...defaultProps} isEnabled={true} value={rule} />
      )

      expect(screen.getByText('Jours de répétition')).toBeInTheDocument()
    })
  })

  describe('Disabled state', () => {
    it('désactive tous les contrôles quand disabled=true', () => {
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: ['MONDAY'],
        occurrences: 4,
      }

      render(
        <RecurrenceConfig
          {...defaultProps}
          isEnabled={true}
          value={rule}
          disabled={true}
        />
      )

      expect(screen.getByRole('switch')).toBeDisabled()
    })
  })
})
