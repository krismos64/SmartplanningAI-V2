import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeavesList } from '../LeavesList'
import { UserRole, LeaveRequestStatus, LeaveType } from '@prisma/client'

const createMockRequest = (overrides = {}) => ({
  id: 'leave-1',
  employeeId: 'emp-1',
  companyId: 'company-1',
  type: LeaveType.PAID_LEAVE,
  status: LeaveRequestStatus.PENDING,
  startDate: new Date('2026-02-01'),
  endDate: new Date('2026-02-05'),
  days: 5,
  halfDay: false,
  halfDayPeriod: null,
  reason: 'Vacances',
  comment: null,
  attachments: [],
  reviewedById: null,
  reviewedAt: null,
  reviewComment: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    teamId: 'team-1',
  },
  ...overrides,
})

const defaultProps = {
  requests: [createMockRequest()],
  pagination: { page: 1, pageSize: 10, total: 1 },
  onPaginationChange: vi.fn(),
  currentUserRole: UserRole.EMPLOYEE,
  currentUserId: 'emp-1',
}

describe('LeavesList', () => {
  it('renders table headers', () => {
    render(<LeavesList {...defaultProps} />)

    expect(screen.getByText('Employé')).toBeInTheDocument()
    expect(screen.getByText('Type')).toBeInTheDocument()
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Jours')).toBeInTheDocument()
    expect(screen.getByText('Statut')).toBeInTheDocument()
  })

  it('renders employee name in row', () => {
    render(<LeavesList {...defaultProps} />)
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
  })

  it('renders leave type badge', () => {
    render(<LeavesList {...defaultProps} />)
    expect(screen.getByText('Congés payés')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<LeavesList {...defaultProps} />)
    expect(screen.getByText('En attente')).toBeInTheDocument()
  })

  it('renders days count with half-day indicator', () => {
    render(
      <LeavesList
        {...defaultProps}
        requests={[createMockRequest({ days: 3, halfDay: true })]}
      />
    )
    // Le composant affiche "{days} ½" pour une demi-journée
    const daysCell = screen.getByText(/3.*½/)
    expect(daysCell).toBeInTheDocument()
  })

  it('shows empty state when no requests', () => {
    render(<LeavesList {...defaultProps} requests={[]} />)
    expect(screen.getByText('Aucune demande de congé')).toBeInTheDocument()
  })

  it('shows loading skeletons when isLoading', () => {
    render(<LeavesList {...defaultProps} isLoading />)
    // Le composant Skeleton utilise la classe sp-skeleton
    const skeletons = document.querySelectorAll('.sp-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows pagination info', () => {
    render(
      <LeavesList
        {...defaultProps}
        pagination={{ page: 1, pageSize: 10, total: 25 }}
      />
    )
    expect(screen.getByText(/Page 1 sur 3/)).toBeInTheDocument()
    expect(screen.getByText(/25 résultats/)).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<LeavesList {...defaultProps} />)
    expect(screen.getByText('Précédent')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<LeavesList {...defaultProps} />)
    expect(screen.getByText('Suivant')).toBeDisabled()
  })

  it('renders actions button for owner with pending request', () => {
    const handleEdit = vi.fn()
    render(<LeavesList {...defaultProps} onEdit={handleEdit} />)

    // Le bouton d'actions doit être présent pour le propriétaire d'une demande en attente
    const actionsButton = screen.getByRole('button', { name: 'Actions' })
    expect(actionsButton).toBeInTheDocument()
  })

  it('renders actions button for manager with pending request', () => {
    const handleReview = vi.fn()
    render(
      <LeavesList
        {...defaultProps}
        currentUserRole={UserRole.MANAGER}
        currentUserId="manager-1"
        onReview={handleReview}
      />
    )

    const actionsButton = screen.getByRole('button', { name: 'Actions' })
    expect(actionsButton).toBeInTheDocument()
  })

  it('renders actions button for owner with approved request', () => {
    const handleCancel = vi.fn()
    render(
      <LeavesList
        {...defaultProps}
        requests={[createMockRequest({ status: LeaveRequestStatus.APPROVED })]}
        onCancel={handleCancel}
      />
    )

    const actionsButton = screen.getByRole('button', { name: 'Actions' })
    expect(actionsButton).toBeInTheDocument()
  })
})
