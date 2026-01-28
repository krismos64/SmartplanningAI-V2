/**
 * Tests pour LeaveDetailContent
 *
 * @ticket SP-414
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeaveDetailContent } from '../_components/LeaveDetailContent'
import { UserRole, LeaveRequestStatus, LeaveType } from '@prisma/client'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
  })),
}))

// Mock server actions
vi.mock('@/lib/actions/leaves', () => ({
  cancelLeaveRequest: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {},
    })
  ),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const createMockRequest = (overrides = {}) => ({
  id: 'leave-1',
  employeeId: 'emp-1',
  companyId: 'company-1',
  type: LeaveType.PAID_LEAVE,
  status: LeaveRequestStatus.PENDING,
  startDate: new Date('2026-02-10'),
  endDate: new Date('2026-02-14'),
  days: 5,
  halfDay: false,
  halfDayPeriod: null,
  reason: 'Vacances',
  comment: null,
  attachments: [],
  reviewedById: null,
  reviewedAt: null,
  reviewComment: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    teamId: 'team-1',
  },
  ...overrides,
})

const mockTimelineEvents = [
  {
    type: 'created' as const,
    date: new Date('2026-01-15'),
    actor: { name: 'Jean Dupont' },
  },
]

const defaultProps = {
  request: createMockRequest(),
  timelineEvents: mockTimelineEvents,
  currentUser: {
    id: 'user-1',
    role: UserRole.EMPLOYEE,
  },
}

describe('LeaveDetailContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders breadcrumb navigation', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText('Congés')).toBeInTheDocument()
      expect(screen.getByText('Détail de la demande')).toBeInTheDocument()
    })

    it('renders employee name in header', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText(/Demande de Jean Dupont/)).toBeInTheDocument()
    })

    it('renders status badge', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText('En attente')).toBeInTheDocument()
    })

    it('renders back button', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText('Retour')).toBeInTheDocument()
    })

    it('renders employee info card', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('jean@test.com')).toBeInTheDocument()
    })

    it('renders timeline card', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.getByText('Historique')).toBeInTheDocument()
      expect(screen.getByText('Demande créée')).toBeInTheDocument()
    })
  })

  describe('RBAC - Cancel Button', () => {
    it('shows cancel button for owner with PENDING status', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          request={createMockRequest({
            employee: {
              id: 'user-1',
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean@test.com',
              teamId: 'team-1',
            },
          })}
          currentUser={{ id: 'user-1', role: UserRole.EMPLOYEE }}
        />
      )

      expect(screen.getByText('Annuler')).toBeInTheDocument()
    })

    it('hides cancel button for non-owner', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          currentUser={{ id: 'other-user', role: UserRole.EMPLOYEE }}
        />
      )

      expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
    })

    it('hides cancel button for approved request', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          request={createMockRequest({
            status: LeaveRequestStatus.APPROVED,
            employee: {
              id: 'user-1',
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean@test.com',
              teamId: 'team-1',
            },
          })}
          currentUser={{ id: 'user-1', role: UserRole.EMPLOYEE }}
        />
      )

      expect(screen.queryByText('Annuler')).not.toBeInTheDocument()
    })
  })

  describe('RBAC - Review Buttons', () => {
    it('shows approve/reject buttons for MANAGER', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          currentUser={{ id: 'manager-1', role: UserRole.MANAGER }}
        />
      )

      expect(screen.getByText('Approuver')).toBeInTheDocument()
      expect(screen.getByText('Refuser')).toBeInTheDocument()
    })

    it('shows approve/reject buttons for DIRECTOR', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          currentUser={{ id: 'director-1', role: UserRole.DIRECTOR }}
        />
      )

      expect(screen.getByText('Approuver')).toBeInTheDocument()
      expect(screen.getByText('Refuser')).toBeInTheDocument()
    })

    it('hides approve/reject buttons for EMPLOYEE', () => {
      render(<LeaveDetailContent {...defaultProps} />)

      expect(screen.queryByText('Approuver')).not.toBeInTheDocument()
      expect(screen.queryByText('Refuser')).not.toBeInTheDocument()
    })

    it('hides approve/reject buttons for non-PENDING status', () => {
      render(
        <LeaveDetailContent
          {...defaultProps}
          request={createMockRequest({ status: LeaveRequestStatus.APPROVED })}
          currentUser={{ id: 'manager-1', role: UserRole.MANAGER }}
        />
      )

      expect(screen.queryByText('Approuver')).not.toBeInTheDocument()
      expect(screen.queryByText('Refuser')).not.toBeInTheDocument()
    })
  })
})
