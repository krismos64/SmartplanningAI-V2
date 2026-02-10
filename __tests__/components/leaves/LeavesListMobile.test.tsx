/**
 * Tests unitaires pour LeavesListMobile
 *
 * @ticket SP-460
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LeavesListMobile } from '@/components/leaves/LeavesListMobile'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('@/components/leaves/LeaveRequestCard', () => ({
  LeaveRequestCard: ({ request }: { request: { id: string; employee: { firstName: string; lastName: string } } }) => (
    <div data-testid={`leave-card-${request.id}`}>
      {request.employee.firstName} {request.employee.lastName}
    </div>
  ),
}))

// ============================================================================
// Fixtures
// ============================================================================

const makeRequest = (id: string, first: string, last: string) => ({
  id,
  employeeId: `emp-${id}`,
  type: 'ANNUAL' as const,
  startDate: new Date('2026-01-15'),
  endDate: new Date('2026-01-20'),
  halfDayStart: null,
  halfDayEnd: null,
  reason: 'Vacances',
  status: 'PENDING' as const,
  reviewedBy: null,
  reviewedAt: null,
  reviewNote: null,
  companyId: 'clcmp0001',
  createdAt: new Date(),
  updatedAt: new Date(),
  employee: {
    id: `emp-${id}`,
    firstName: first,
    lastName: last,
    email: `${first.toLowerCase()}@test.com`,
    teamId: null,
    user: null,
  },
})

const mockRequests = [
  makeRequest('1', 'Jean', 'Dupont'),
  makeRequest('2', 'Marie', 'Martin'),
  makeRequest('3', 'Pierre', 'Bernard'),
]

const defaultProps = {
  requests: mockRequests,
  pagination: { page: 1, pageSize: 10, total: 3 },
  currentUserRole: 'MANAGER' as const,
  currentUserId: 'user-1',
}

// ============================================================================
// Tests
// ============================================================================

describe('LeavesListMobile', () => {
  describe('Affichage', () => {
    it('affiche les cartes de chaque demande', () => {
      render(<LeavesListMobile {...defaultProps} />)
      expect(screen.getByTestId('leave-card-1')).toBeInTheDocument()
      expect(screen.getByTestId('leave-card-2')).toBeInTheDocument()
      expect(screen.getByTestId('leave-card-3')).toBeInTheDocument()
    })

    it('affiche le compteur de demandes', () => {
      render(<LeavesListMobile {...defaultProps} />)
      expect(screen.getByText('3 / 3 demandes')).toBeInTheDocument()
    })
  })

  describe('Etat vide', () => {
    it('affiche le message quand aucune demande', () => {
      render(
        <LeavesListMobile
          {...defaultProps}
          requests={[]}
          pagination={{ page: 1, pageSize: 10, total: 0 }}
        />
      )
      expect(
        screen.getByText('Aucune demande de congé')
      ).toBeInTheDocument()
    })

    it('n affiche pas le message vide si isLoading', () => {
      render(
        <LeavesListMobile
          {...defaultProps}
          requests={[]}
          pagination={{ page: 1, pageSize: 10, total: 0 }}
          isLoading
        />
      )
      expect(
        screen.queryByText('Aucune demande de congé')
      ).not.toBeInTheDocument()
    })
  })

  describe('Pagination "Voir plus"', () => {
    it('affiche le bouton quand il y a plus de resultats', () => {
      const onLoadMore = vi.fn()
      render(
        <LeavesListMobile
          {...defaultProps}
          pagination={{ page: 1, pageSize: 10, total: 20 }}
          onLoadMore={onLoadMore}
        />
      )
      expect(screen.getByText('Voir plus')).toBeInTheDocument()
    })

    it('n affiche pas le bouton quand tout est charge', () => {
      render(<LeavesListMobile {...defaultProps} />)
      expect(screen.queryByText('Voir plus')).not.toBeInTheDocument()
    })

    it('appelle onLoadMore au clic', async () => {
      const user = userEvent.setup()
      const onLoadMore = vi.fn()
      render(
        <LeavesListMobile
          {...defaultProps}
          pagination={{ page: 1, pageSize: 10, total: 20 }}
          onLoadMore={onLoadMore}
        />
      )

      await user.click(screen.getByText('Voir plus'))
      expect(onLoadMore).toHaveBeenCalled()
    })

    it('affiche "Chargement..." quand isLoading', () => {
      render(
        <LeavesListMobile
          {...defaultProps}
          pagination={{ page: 1, pageSize: 10, total: 20 }}
          onLoadMore={vi.fn()}
          isLoading
        />
      )
      expect(screen.getByText('Chargement...')).toBeInTheDocument()
    })

    it('desactive le bouton quand isLoading', () => {
      render(
        <LeavesListMobile
          {...defaultProps}
          pagination={{ page: 1, pageSize: 10, total: 20 }}
          onLoadMore={vi.fn()}
          isLoading
        />
      )
      expect(screen.getByText('Chargement...').closest('button')).toBeDisabled()
    })

    it('n affiche pas le bouton sans onLoadMore', () => {
      render(
        <LeavesListMobile
          {...defaultProps}
          pagination={{ page: 1, pageSize: 10, total: 20 }}
        />
      )
      expect(screen.queryByText('Voir plus')).not.toBeInTheDocument()
    })
  })
})
