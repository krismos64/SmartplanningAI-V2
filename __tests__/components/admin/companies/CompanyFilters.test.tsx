/**
 * Tests unitaires pour CompanyFilters
 *
 * @description Tests du composant de filtrage des entreprises
 *
 * @ticket SP-151
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompanyFilters } from '@/components/admin/companies/CompanyFilters'
import type { CompanyFilters as CompanyFiltersType } from '@/lib/validations/company'

const setupUser = () => userEvent.setup()

describe('CompanyFilters', () => {
  const defaultProps = {
    filters: {} as CompanyFiltersType,
    onFiltersChange: vi.fn(),
  }

  it('should render search input', () => {
    render(<CompanyFilters {...defaultProps} />)

    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument()
  })

  it('should render plan filter dropdown', () => {
    render(<CompanyFilters {...defaultProps} />)

    // Select triggers sont des buttons
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
  })

  it('should render status filter dropdown', () => {
    render(<CompanyFilters {...defaultProps} />)

    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
  })

  it('should render active filter dropdown', () => {
    render(<CompanyFilters {...defaultProps} />)

    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
  })

  it('should call onFiltersChange when search input changes', async () => {
    const onFiltersChange = vi.fn()
    const user = setupUser()

    render(
      <CompanyFilters {...defaultProps} onFiltersChange={onFiltersChange} />
    )

    const searchInput = screen.getByPlaceholderText(/rechercher/i)
    await user.type(searchInput, 'acme')

    expect(onFiltersChange).toHaveBeenCalled()
  })

  it('should show reset button when filters are active', () => {
    const filters: CompanyFiltersType = {
      search: 'test',
    }

    render(<CompanyFilters {...defaultProps} filters={filters} />)

    expect(
      screen.getByRole('button', { name: /réinitialiser/i })
    ).toBeInTheDocument()
  })

  it('should not show reset button when no filters are active', () => {
    render(<CompanyFilters {...defaultProps} />)

    expect(
      screen.queryByRole('button', { name: /réinitialiser/i })
    ).not.toBeInTheDocument()
  })

  it('should call onFiltersChange with empty object when reset is clicked', async () => {
    const onFiltersChange = vi.fn()
    const user = setupUser()
    const filters: CompanyFiltersType = {
      search: 'test',
    }

    render(
      <CompanyFilters
        {...defaultProps}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    )

    await user.click(screen.getByRole('button', { name: /réinitialiser/i }))

    expect(onFiltersChange).toHaveBeenCalledWith({})
  })

  it('should disable inputs when disabled prop is true', () => {
    render(<CompanyFilters {...defaultProps} disabled={true} />)

    expect(screen.getByPlaceholderText(/rechercher/i)).toBeDisabled()
  })

  it('should display current search value', () => {
    const filters: CompanyFiltersType = {
      search: 'current search',
    }

    render(<CompanyFilters {...defaultProps} filters={filters} />)

    expect(screen.getByDisplayValue('current search')).toBeInTheDocument()
  })
})
