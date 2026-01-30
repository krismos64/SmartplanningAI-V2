/**
 * Tests unitaires pour IncidentNotesFilters
 *
 * @ticket SP-426
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncidentNotesFilters } from '../_components/IncidentNotesFilters'
import type { IncidentNotesFiltersState } from '../_components/IncidentNotesPageContent'

describe('IncidentNotesFilters', () => {
  const defaultFilters: IncidentNotesFiltersState = {
    search: '',
    startDate: '',
    endDate: '',
  }

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: vi.fn(),
    onResetFilters: vi.fn(),
  }

  it('affiche le champ de recherche', () => {
    render(<IncidentNotesFilters {...defaultProps} />)
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/Titre, contenu ou employé/)
    ).toBeInTheDocument()
  })

  it('affiche les champs de date', () => {
    render(<IncidentNotesFilters {...defaultProps} />)
    expect(screen.getByTestId('start-date-input')).toBeInTheDocument()
    expect(screen.getByTestId('end-date-input')).toBeInTheDocument()
  })

  it('appelle onFiltersChange quand on tape dans la recherche', () => {
    const onFiltersChange = vi.fn()
    render(
      <IncidentNotesFilters {...defaultProps} onFiltersChange={onFiltersChange} />
    )
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'test' },
    })
    expect(onFiltersChange).toHaveBeenCalledWith({ search: 'test' })
  })

  it('appelle onFiltersChange quand on change la date de début', () => {
    const onFiltersChange = vi.fn()
    render(
      <IncidentNotesFilters {...defaultProps} onFiltersChange={onFiltersChange} />
    )
    fireEvent.change(screen.getByTestId('start-date-input'), {
      target: { value: '2026-01-01' },
    })
    expect(onFiltersChange).toHaveBeenCalledWith({ startDate: '2026-01-01' })
  })

  it('appelle onFiltersChange quand on change la date de fin', () => {
    const onFiltersChange = vi.fn()
    render(
      <IncidentNotesFilters {...defaultProps} onFiltersChange={onFiltersChange} />
    )
    fireEvent.change(screen.getByTestId('end-date-input'), {
      target: { value: '2026-01-31' },
    })
    expect(onFiltersChange).toHaveBeenCalledWith({ endDate: '2026-01-31' })
  })

  it("n'affiche pas le bouton reset quand aucun filtre n'est actif", () => {
    render(<IncidentNotesFilters {...defaultProps} />)
    expect(
      screen.queryByTestId('reset-filters-button')
    ).not.toBeInTheDocument()
  })

  it('affiche le bouton reset quand un filtre est actif', () => {
    render(
      <IncidentNotesFilters
        {...defaultProps}
        filters={{ ...defaultFilters, search: 'test' }}
      />
    )
    expect(screen.getByTestId('reset-filters-button')).toBeInTheDocument()
  })

  it('appelle onResetFilters au clic sur reset', () => {
    const onResetFilters = vi.fn()
    render(
      <IncidentNotesFilters
        {...defaultProps}
        filters={{ ...defaultFilters, search: 'test' }}
        onResetFilters={onResetFilters}
      />
    )
    fireEvent.click(screen.getByTestId('reset-filters-button'))
    expect(onResetFilters).toHaveBeenCalled()
  })

  it('a le data-testid incidents-filters', () => {
    render(<IncidentNotesFilters {...defaultProps} />)
    expect(screen.getByTestId('incidents-filters')).toBeInTheDocument()
  })
})
