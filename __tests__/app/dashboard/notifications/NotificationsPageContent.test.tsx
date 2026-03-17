/**
 * Tests pour NotificationsPageContent
 *
 * @ticket SP-324
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock du hook
vi.mock('@/hooks/use-notifications-paginated', () => ({
  useNotificationsPaginated: vi.fn(),
}))

// Mock des composants enfants
vi.mock('@/components/notifications', () => ({
  NotificationEmptyState: () => (
    <div data-testid="notification-empty-state">Empty</div>
  ),
}))

vi.mock(
  '@/app/app/dashboard/notifications/_components/NotificationsFilters',
  () => ({
    NotificationsFilters: () => (
      <div data-testid="notifications-filters">Filters</div>
    ),
  })
)

vi.mock(
  '@/app/app/dashboard/notifications/_components/NotificationsBulkActions',
  () => ({
    NotificationsBulkActions: () => (
      <div data-testid="notifications-bulk-actions">Bulk Actions</div>
    ),
  })
)

vi.mock(
  '@/app/app/dashboard/notifications/_components/NotificationsTable',
  () => ({
    NotificationsTable: () => (
      <div data-testid="notifications-table">Table</div>
    ),
  })
)

vi.mock(
  '@/app/app/dashboard/notifications/_components/NotificationsListSkeleton',
  () => ({
    NotificationsListSkeleton: () => (
      <div data-testid="notifications-skeleton">Loading...</div>
    ),
  })
)

import { useNotificationsPaginated } from '@/hooks/use-notifications-paginated'
import { NotificationsPageContent } from '@/app/app/dashboard/notifications/_components/NotificationsPageContent'

const mockHookReturn = {
  notifications: [],
  pagination: null,
  isLoading: false,
  error: null,
  page: 1,
  goToPage: vi.fn(),
  nextPage: vi.fn(),
  prevPage: vi.fn(),
  filters: { type: 'ALL', isRead: 'ALL' },
  setTypeFilter: vi.fn(),
  setReadFilter: vi.fn(),
  clearFilters: vi.fn(),
  hasActiveFilters: false,
  unreadCount: 0,
  readCount: 0,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  deleteAllRead: vi.fn(),
}

describe('NotificationsPageContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNotificationsPaginated).mockReturnValue(mockHookReturn)
  })

  it('devrait afficher le titre et la description', () => {
    render(<NotificationsPageContent />)

    expect(
      screen.getByRole('heading', { name: 'Notifications' })
    ).toBeInTheDocument()
    expect(
      screen.getByText('Historique complet de vos notifications')
    ).toBeInTheDocument()
  })

  it('devrait afficher les filtres et actions', () => {
    render(<NotificationsPageContent />)

    expect(screen.getByTestId('notifications-filters')).toBeInTheDocument()
    expect(screen.getByTestId('notifications-bulk-actions')).toBeInTheDocument()
  })

  it('devrait afficher le skeleton pendant le chargement', () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    })

    render(<NotificationsPageContent />)

    expect(screen.getByTestId('notifications-skeleton')).toBeInTheDocument()
  })

  it("devrait afficher l'état vide si aucune notification", () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      notifications: [],
      isLoading: false,
    })

    render(<NotificationsPageContent />)

    expect(screen.getByTestId('notifications-empty')).toBeInTheDocument()
  })

  it('devrait afficher le message de reset filtres si filtres actifs et vide', () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      notifications: [],
      isLoading: false,
      hasActiveFilters: true,
    })

    render(<NotificationsPageContent />)

    expect(screen.getByText(/réinitialiser les filtres/i)).toBeInTheDocument()
  })

  it('devrait afficher la table si notifications présentes', () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      notifications: [
        {
          id: 'notif-1',
          title: 'Test',
          message: 'Test message',
          type: 'INFO',
          priority: 'LOW',
          actionUrl: null,
          relatedType: null,
          relatedId: null,
          isRead: false,
          readAt: null,
          createdAt: new Date(),
        },
      ],
      isLoading: false,
    })

    render(<NotificationsPageContent />)

    expect(screen.getByTestId('notifications-table')).toBeInTheDocument()
  })

  it("devrait afficher l'erreur si présente", () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      error: 'Erreur de chargement',
    })

    render(<NotificationsPageContent />)

    expect(screen.getByTestId('notifications-error')).toBeInTheDocument()
    expect(screen.getByText(/erreur de chargement/i)).toBeInTheDocument()
  })

  it("devrait afficher le bouton réessayer en cas d'erreur", () => {
    vi.mocked(useNotificationsPaginated).mockReturnValue({
      ...mockHookReturn,
      error: 'Erreur',
    })

    render(<NotificationsPageContent />)

    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })

  it('devrait afficher les breadcrumbs', () => {
    render(<NotificationsPageContent />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
