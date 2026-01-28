/**
 * Tests pour BalancesPageContent
 *
 * @ticket SP-414
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BalancesPageContent } from '../_components/BalancesPageContent'

// Mock server actions
vi.mock('@/lib/actions/leaves', () => ({
  getAllLeaveBalances: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
      },
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

const createMockBalance = (overrides = {}) => ({
  id: 'balance-1',
  employeeId: 'emp-1',
  companyId: 'company-1',
  year: 2026,
  paidLeaveTotal: 25,
  paidLeaveUsed: 10,
  rttTotal: 10,
  rttUsed: 3,
  updatedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: 'emp-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@test.com',
    teamId: 'team-1',
    team: { id: 'team-1', name: 'Équipe 1' },
  },
  paidLeaveRemaining: 15,
  rttRemaining: 7,
  ...overrides,
})

const defaultProps = {
  initialBalances: [createMockBalance()],
  initialPagination: { page: 1, pageSize: 20, total: 1 },
  employees: [{ id: 'emp-1', firstName: 'Jean', lastName: 'Dupont' }],
  currentYear: 2026,
}

describe('BalancesPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders page title', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Soldes congés')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(
        screen.getByText(
          'Gérez les soldes de congés payés et RTT de vos employés'
        )
      ).toBeInTheDocument()
    })

    it('renders year selector', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Année')).toBeInTheDocument()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders table headers', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Employé')).toBeInTheDocument()
      expect(screen.getByText('Équipe')).toBeInTheDocument()
      expect(screen.getByText('CP Total')).toBeInTheDocument()
      expect(screen.getByText('CP Utilisés')).toBeInTheDocument()
      expect(screen.getByText('CP Restants')).toBeInTheDocument()
      expect(screen.getByText('RTT Total')).toBeInTheDocument()
      expect(screen.getByText('RTT Utilisés')).toBeInTheDocument()
      expect(screen.getByText('RTT Restants')).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('renders employee name in table', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    })

    it('renders team name badge', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Équipe 1')).toBeInTheDocument()
    })

    it('renders balance values correctly', () => {
      render(<BalancesPageContent {...defaultProps} />)

      // CP values - check that key values exist
      expect(screen.getByText('25')).toBeInTheDocument() // paidLeaveTotal
      expect(screen.getByText('15')).toBeInTheDocument() // paidLeaveRemaining

      // RTT remaining value
      expect(screen.getByText('7')).toBeInTheDocument() // rttRemaining
    })

    it('renders edit button for each row', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(
        screen.getByLabelText('Modifier le solde de Jean Dupont')
      ).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('renders empty state when no balances', () => {
      render(
        <BalancesPageContent
          {...defaultProps}
          initialBalances={[]}
          initialPagination={{ page: 1, pageSize: 20, total: 0 }}
        />
      )

      expect(
        screen.getByText(/Aucun solde trouvé pour 2026/)
      ).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('renders pagination controls', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Précédent')).toBeInTheDocument()
      expect(screen.getByText('Suivant')).toBeInTheDocument()
      expect(screen.getByText('Page 1 sur 1')).toBeInTheDocument()
    })

    it('shows total count', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('1 employé au total')).toBeInTheDocument()
    })

    it('shows plural for multiple employees', () => {
      render(
        <BalancesPageContent
          {...defaultProps}
          initialBalances={[
            createMockBalance(),
            createMockBalance({ id: 'balance-2', employeeId: 'emp-2' }),
          ]}
          initialPagination={{ page: 1, pageSize: 20, total: 2 }}
        />
      )

      expect(screen.getByText('2 employés au total')).toBeInTheDocument()
    })

    it('disables previous button on first page', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Précédent')).toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<BalancesPageContent {...defaultProps} />)

      expect(screen.getByText('Suivant')).toBeDisabled()
    })
  })

  describe('No Team', () => {
    it('renders dash when employee has no team', () => {
      render(
        <BalancesPageContent
          {...defaultProps}
          initialBalances={[
            createMockBalance({
              employee: {
                id: 'emp-1',
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'jean@test.com',
                teamId: null,
                team: null,
              },
            }),
          ]}
        />
      )

      expect(screen.getByText('-')).toBeInTheDocument()
    })
  })
})
