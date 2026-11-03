/**
 * Tests unitaires pour RecurrenceConfig (version simplifiée)
 *
 * @ticket SP-399, SP-623
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecurrenceConfig } from '../RecurrenceConfig'
import type { RecurrenceRule } from '@/lib/utils/recurrence'

const defaultProps = {
  value: null as RecurrenceRule | null,
  onChange: vi.fn(),
  isEnabled: false,
  onEnabledChange: vi.fn(),
  startDate: new Date(),
  endDate: new Date(),
  employeeCount: 1,
  disabled: false,
}

describe('RecurrenceConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche le switch de récurrence', () => {
    render(<RecurrenceConfig {...defaultProps} />)
    expect(screen.getByText('Répéter ce créneau')).toBeInTheDocument()
  })

  it('n affiche pas les options quand désactivé', () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={false} />)
    expect(screen.queryByText('Jours')).not.toBeInTheDocument()
  })

  it('affiche les jours et semaines quand activé', () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={true} />)
    expect(screen.getByText('Jours')).toBeInTheDocument()
    expect(screen.getByText('Pendant')).toBeInTheDocument()
    expect(screen.getByText('Lun')).toBeInTheDocument()
    expect(screen.getByText('Ven')).toBeInTheDocument()
  })

  it('affiche le résumé du nombre de créneaux', () => {
    render(
      <RecurrenceConfig {...defaultProps} isEnabled={true} employeeCount={2} />
    )
    // 5 jours × 4 semaines × 2 employés = 40
    expect(screen.getByText(/40 créneaux seront créés/)).toBeInTheDocument()
  })

  it('appelle onChange quand on toggle un jour', () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={true} />)

    // Cliquer sur Sam (pas sélectionné par défaut)
    fireEvent.click(screen.getByText('Sam'))

    expect(defaultProps.onChange).toHaveBeenCalled()
  })

  it('propose le raccourci du lundi au vendredi', () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={true} />)
    expect(screen.getByText('Lun à ven')).toBeInTheDocument()
  })

  it("sans jours d'ouverture connus, propose le lundi au vendredi", () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={true} />)
    expect(screen.getByText(/5 jours × 4 semaines/)).toBeInTheDocument()
    expect(screen.queryByText("Jours d'ouverture")).not.toBeInTheDocument()
  })

  it("propose les jours d'ouverture de l'entreprise (SP-623)", () => {
    render(
      <RecurrenceConfig
        {...defaultProps}
        isEnabled={true}
        defaultDays={[
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
          'SATURDAY',
        ]}
      />
    )
    // Commerce ouvert le samedi : 6 jours × 4 semaines
    expect(screen.getByText(/6 jours × 4 semaines/)).toBeInTheDocument()
    expect(screen.getByText("Jours d'ouverture")).toBeInTheDocument()
  })

  it('propose le raccourci Tous', () => {
    render(<RecurrenceConfig {...defaultProps} isEnabled={true} />)
    expect(screen.getByText('Tous')).toBeInTheDocument()
  })
})
