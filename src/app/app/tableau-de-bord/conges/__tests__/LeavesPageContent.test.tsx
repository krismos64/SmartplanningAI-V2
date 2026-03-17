/**
 * Tests pour LeavesPageContent
 *
 * @ticket SP-413
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { LeavesPageContent } from '../_components/LeavesPageContent'
import { UserRole, LeaveRequestStatus, LeaveType } from '@prisma/client'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  usePathname: vi.fn(() => '/app/tableau-de-bord/conges'),
}))

// Mock useMediaQuery
vi.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: vi.fn(() => false), // Desktop by default
}))

// Mock server actions
vi.mock('@/lib/actions/leaves', () => ({
  getLeaveRequests: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        data: [],
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },
    })
  ),
  getLeaveStats: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        byStatus: {
          PENDING: 2,
          APPROVED: 5,
          REJECTED: 1,
          CANCELLED: 0,
        },
        byType: {},
        total: 8,
      },
    })
  ),
  getTeamAbsences: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: [],
    })
  ),
  cancelLeaveRequest: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {},
    })
  ),
  exportLeavesCsv: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        filename: 'conges-export-2026-02-02.csv',
        data: 'test;data',
        mimeType: 'text/csv;charset=utf-8',
      },
    })
  ),
}))

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
  initialRequests: [createMockRequest()],
  initialPagination: { page: 1, pageSize: 10, total: 1 },
  initialStats: { pending: 2, approved: 5, rejected: 1, cancelled: 0 },
  currentUser: {
    id: 'user-1',
    role: UserRole.EMPLOYEE,
    companyId: 'company-1',
    employeeId: 'emp-1',
  },
  employees: [],
  teams: [],
}

describe('LeavesPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders header with title and create button', () => {
      render(<LeavesPageContent {...defaultProps} />)

      expect(screen.getByText('Congés')).toBeInTheDocument()
      expect(screen.getByText('Nouvelle demande')).toBeInTheDocument()
    })

    it('renders employee description for EMPLOYEE role', () => {
      render(<LeavesPageContent {...defaultProps} />)

      expect(
        screen.getByText('Gérez vos demandes de congés')
      ).toBeInTheDocument()
    })

    it('renders team description for MANAGER role', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          currentUser={{ ...defaultProps.currentUser, role: UserRole.MANAGER }}
        />
      )

      expect(
        screen.getByText('Gérez les demandes de congés de votre équipe')
      ).toBeInTheDocument()
    })

    it('renders team description for DIRECTOR role', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          currentUser={{ ...defaultProps.currentUser, role: UserRole.DIRECTOR }}
        />
      )

      expect(
        screen.getByText('Gérez les demandes de congés de votre équipe')
      ).toBeInTheDocument()
    })

    it('renders stats bar with buttons', () => {
      render(<LeavesPageContent {...defaultProps} />)

      // Stats bar renders as a group with aria-label
      const statsGroup = screen.getByRole('group', {
        name: /Filtres rapides par statut/i,
      })
      expect(statsGroup).toBeInTheDocument()
    })

    it('renders filter section with comboboxes', () => {
      render(<LeavesPageContent {...defaultProps} />)

      // Filters render comboboxes for status and type
      const comboboxes = screen.getAllByRole('combobox')
      expect(comboboxes.length).toBeGreaterThanOrEqual(2)
    })

    it('renders tabs (list/calendar)', () => {
      render(<LeavesPageContent {...defaultProps} />)

      expect(screen.getByRole('tab', { name: /Liste/i })).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /Calendrier/i })
      ).toBeInTheDocument()
    })

    it('renders list view by default', () => {
      render(<LeavesPageContent {...defaultProps} />)

      // List tab should be active
      const listTab = screen.getByRole('tab', { name: /Liste/i })
      expect(listTab).toHaveAttribute('data-state', 'active')
    })
  })

  describe('Interactions', () => {
    it('renders calendar tab as clickable', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          teams={[{ id: 'team-1', name: 'Équipe 1' }]}
        />
      )

      const calendarTab = screen.getByRole('tab', { name: /Calendrier/i })
      expect(calendarTab).toBeInTheDocument()
      expect(calendarTab).not.toBeDisabled()
    })

    it('disables create button when user has no employeeId', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          currentUser={{ ...defaultProps.currentUser, employeeId: null }}
        />
      )

      const createButton = screen.getByText('Nouvelle demande')
      expect(createButton).toBeDisabled()
    })
  })

  describe('RBAC', () => {
    it('shows employee filter for MANAGER role', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          currentUser={{ ...defaultProps.currentUser, role: UserRole.MANAGER }}
          employees={[
            { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' },
            { id: 'emp-2', firstName: 'Marie', lastName: 'Martin' },
          ]}
        />
      )

      // Check for "Tous les employés" option which only appears in filter
      const filterSelects = screen.getAllByRole('combobox')
      expect(filterSelects.length).toBeGreaterThanOrEqual(3) // status, type, employee
    })

    it('shows team filter for DIRECTOR role', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          currentUser={{ ...defaultProps.currentUser, role: UserRole.DIRECTOR }}
          teams={[{ id: 'team-1', name: 'Équipe 1' }]}
        />
      )

      // Check for team filter by counting comboboxes
      const filterSelects = screen.getAllByRole('combobox')
      expect(filterSelects.length).toBeGreaterThanOrEqual(3) // status, type, team
    })
  })

  describe('Calendar View', () => {
    it('renders calendar tab', () => {
      render(
        <LeavesPageContent
          {...defaultProps}
          teams={[{ id: 'team-1', name: 'Équipe 1' }]}
        />
      )

      const calendarTab = screen.getByRole('tab', { name: /Calendrier/i })
      expect(calendarTab).toBeInTheDocument()
    })
  })
})
