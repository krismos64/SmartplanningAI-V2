import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveFilters } from '../LeaveFilters'
import { UserRole, LeaveRequestStatus, LeaveType } from '@prisma/client'

const mockEmployees = [
  { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
  { id: 'emp-2', firstName: 'Marie', lastName: 'Martin' },
]

const mockTeams = [
  { id: 'team-1', name: 'Équipe A' },
  { id: 'team-2', name: 'Équipe B' },
]

describe('LeaveFilters', () => {
  it('renders status and type selects', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
      />
    )

    expect(screen.getByText('Statut')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
  })

  it('shows employee filter for MANAGER role', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.MANAGER}
        employees={mockEmployees}
      />
    )

    expect(screen.getByText('Employé')).toBeInTheDocument()
  })

  it('hides employee filter for EMPLOYEE role', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
        employees={mockEmployees}
      />
    )

    expect(screen.queryByText('Employé')).not.toBeInTheDocument()
  })

  it('shows team filter for DIRECTOR role', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.DIRECTOR}
        teams={mockTeams}
      />
    )

    expect(screen.getByText('Équipe')).toBeInTheDocument()
  })

  it('hides team filter for MANAGER role', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.MANAGER}
        teams={mockTeams}
      />
    )

    expect(screen.queryByText('Équipe')).not.toBeInTheDocument()
  })

  it('shows reset button with active filters count', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{ status: LeaveRequestStatus.PENDING, type: LeaveType.RTT }}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
      />
    )

    expect(screen.getByText('Réinitialiser')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('hides reset button when no active filters', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
      />
    )

    expect(screen.queryByText('Réinitialiser')).not.toBeInTheDocument()
  })

  it('calls onFiltersChange with empty object on reset', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{ status: LeaveRequestStatus.APPROVED }}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
      />
    )

    fireEvent.click(screen.getByText('Réinitialiser'))
    expect(handleChange).toHaveBeenCalledWith({})
  })

  it('renders date range picker', () => {
    const handleChange = vi.fn()
    render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
      />
    )

    expect(screen.getByText('Période')).toBeInTheDocument()
    expect(screen.getByText('Sélectionner une période')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const handleChange = vi.fn()
    const { container } = render(
      <LeaveFilters
        filters={{}}
        onFiltersChange={handleChange}
        currentUserRole={UserRole.EMPLOYEE}
        className="custom-filters"
      />
    )

    expect(container.firstChild).toHaveClass('custom-filters')
  })
})
