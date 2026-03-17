/**
 * Tests pour NotificationsTable
 *
 * @ticket SP-324
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NotificationsTable } from '@/app/app/dashboard/notifications/_components/NotificationsTable'

// Mock du composant NotificationItem
vi.mock('@/components/notifications', () => ({
  NotificationItem: ({
    notification,
    onClick,
  }: {
    notification: { id: string; title: string }
    onClick: (id: string) => void
  }) => (
    <div
      data-testid={`notification-item-${notification.id}`}
      onClick={() => onClick(notification.id)}
    >
      {notification.title}
    </div>
  ),
}))

const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Nouveau planning',
    message: 'Un nouveau planning a été créé',
    type: 'PLANNING' as const,
    priority: 'LOW' as const,
    actionUrl: '/app/dashboard/schedule',
    relatedType: 'Schedule',
    relatedId: 'schedule-1',
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-30T10:00:00'),
  },
  {
    id: 'notif-2',
    title: 'Congé approuvé',
    message: 'Votre demande a été approuvée',
    type: 'LEAVE' as const,
    priority: 'LOW' as const,
    actionUrl: '/app/dashboard/leaves',
    relatedType: 'LeaveRequest',
    relatedId: 'leave-1',
    isRead: true,
    readAt: new Date('2026-01-29T12:00:00'),
    createdAt: new Date('2026-01-29T10:00:00'),
  },
]

const mockPagination = {
  page: 1,
  pageSize: 10,
  total: 25,
  totalPages: 3,
  hasMore: true,
}

describe('NotificationsTable', () => {
  const defaultProps = {
    notifications: mockNotifications,
    pagination: mockPagination,
    page: 1,
    onPageChange: vi.fn(),
    onNextPage: vi.fn(),
    onPrevPage: vi.fn(),
    onMarkAsRead: vi.fn(),
    onDelete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher toutes les notifications', () => {
    render(<NotificationsTable {...defaultProps} />)

    expect(screen.getByTestId('notification-row-notif-1')).toBeInTheDocument()
    expect(screen.getByTestId('notification-row-notif-2')).toBeInTheDocument()
  })

  it('devrait afficher la pagination', () => {
    render(<NotificationsTable {...defaultProps} />)

    expect(screen.getByTestId('notifications-pagination')).toBeInTheDocument()
    expect(screen.getByText(/page 1 sur 3/i)).toBeInTheDocument()
    expect(screen.getByText(/25/)).toBeInTheDocument()
  })

  it('devrait avoir les boutons Précédent et Suivant', () => {
    render(<NotificationsTable {...defaultProps} />)

    expect(screen.getByTestId('pagination-prev')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-next')).toBeInTheDocument()
  })

  it('devrait désactiver Précédent sur la première page', () => {
    render(<NotificationsTable {...defaultProps} page={1} />)

    expect(screen.getByTestId('pagination-prev')).toBeDisabled()
  })

  it('devrait désactiver Suivant sur la dernière page', () => {
    render(
      <NotificationsTable
        {...defaultProps}
        page={3}
        pagination={{ ...mockPagination, hasMore: false }}
      />
    )

    expect(screen.getByTestId('pagination-next')).toBeDisabled()
  })

  it('devrait appeler onNextPage au clic sur Suivant', async () => {
    const user = userEvent.setup()
    render(<NotificationsTable {...defaultProps} />)

    await user.click(screen.getByTestId('pagination-next'))

    expect(defaultProps.onNextPage).toHaveBeenCalled()
  })

  it('devrait appeler onPrevPage au clic sur Précédent', async () => {
    const user = userEvent.setup()
    render(<NotificationsTable {...defaultProps} page={2} />)

    await user.click(screen.getByTestId('pagination-prev'))

    expect(defaultProps.onPrevPage).toHaveBeenCalled()
  })

  it('devrait appeler onPageChange au clic sur un numéro de page', async () => {
    const user = userEvent.setup()
    render(<NotificationsTable {...defaultProps} />)

    await user.click(screen.getByTestId('pagination-page-2'))

    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2)
  })

  it('devrait afficher les boutons de suppression', () => {
    render(<NotificationsTable {...defaultProps} />)

    expect(
      screen.getByTestId('delete-notification-notif-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('delete-notification-notif-2')
    ).toBeInTheDocument()
  })

  it('devrait ouvrir la dialog de suppression au clic', async () => {
    const user = userEvent.setup()
    render(<NotificationsTable {...defaultProps} />)

    await user.click(screen.getByTestId('delete-notification-notif-1'))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(screen.getByText('Supprimer la notification ?')).toBeInTheDocument()
  })

  it('devrait appeler onDelete après confirmation', async () => {
    const user = userEvent.setup()
    render(<NotificationsTable {...defaultProps} />)

    await user.click(screen.getByTestId('delete-notification-notif-1'))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(defaultProps.onDelete).toHaveBeenCalledWith('notif-1')
  })

  it('ne devrait pas afficher la pagination si une seule page', () => {
    render(
      <NotificationsTable
        {...defaultProps}
        pagination={{ ...mockPagination, totalPages: 1 }}
      />
    )

    expect(
      screen.queryByTestId('notifications-pagination')
    ).not.toBeInTheDocument()
  })

  it('ne devrait pas afficher la pagination si null', () => {
    render(<NotificationsTable {...defaultProps} pagination={null} />)

    expect(
      screen.queryByTestId('notifications-pagination')
    ).not.toBeInTheDocument()
  })
})
