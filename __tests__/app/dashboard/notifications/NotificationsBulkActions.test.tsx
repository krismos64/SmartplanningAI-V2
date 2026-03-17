/**
 * Tests pour NotificationsBulkActions
 *
 * @ticket SP-324
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NotificationsBulkActions } from '@/app/app/tableau-de-bord/notifications/_components/NotificationsBulkActions'

describe('NotificationsBulkActions', () => {
  const defaultProps = {
    unreadCount: 5,
    readCount: 10,
    onMarkAllAsRead: vi.fn(),
    onDeleteAllRead: vi.fn(),
    isLoading: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait afficher le bouton "Tout marquer comme lu" si non-lues > 0', () => {
    render(<NotificationsBulkActions {...defaultProps} />)

    const button = screen.getByTestId('bulk-mark-all-read')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Tout marquer comme lu (5)')
  })

  it('ne devrait pas afficher le bouton "Tout marquer comme lu" si unreadCount = 0', () => {
    render(<NotificationsBulkActions {...defaultProps} unreadCount={0} />)

    expect(screen.queryByTestId('bulk-mark-all-read')).not.toBeInTheDocument()
  })

  it('devrait afficher le bouton "Supprimer les lues" si readCount > 0', () => {
    render(<NotificationsBulkActions {...defaultProps} />)

    const button = screen.getByTestId('bulk-delete-read')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Supprimer les lues (10)')
  })

  it('ne devrait pas afficher le bouton "Supprimer les lues" si readCount = 0', () => {
    render(<NotificationsBulkActions {...defaultProps} readCount={0} />)

    expect(screen.queryByTestId('bulk-delete-read')).not.toBeInTheDocument()
  })

  it('devrait appeler onMarkAllAsRead au clic', async () => {
    const user = userEvent.setup()
    render(<NotificationsBulkActions {...defaultProps} />)

    await user.click(screen.getByTestId('bulk-mark-all-read'))

    expect(defaultProps.onMarkAllAsRead).toHaveBeenCalled()
  })

  it('devrait ouvrir la dialog de confirmation au clic sur supprimer', async () => {
    const user = userEvent.setup()
    render(<NotificationsBulkActions {...defaultProps} />)

    await user.click(screen.getByTestId('bulk-delete-read'))

    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    expect(
      screen.getByText('Supprimer les notifications lues ?')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/cette action supprimera définitivement/i)
    ).toBeInTheDocument()
  })

  it('devrait appeler onDeleteAllRead après confirmation', async () => {
    const user = userEvent.setup()
    render(<NotificationsBulkActions {...defaultProps} />)

    await user.click(screen.getByTestId('bulk-delete-read'))
    await user.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(defaultProps.onDeleteAllRead).toHaveBeenCalled()
  })

  it('ne devrait pas appeler onDeleteAllRead si on annule', async () => {
    const user = userEvent.setup()
    render(<NotificationsBulkActions {...defaultProps} />)

    await user.click(screen.getByTestId('bulk-delete-read'))
    await user.click(screen.getByRole('button', { name: 'Annuler' }))

    expect(defaultProps.onDeleteAllRead).not.toHaveBeenCalled()
  })

  it('devrait désactiver les boutons pendant le chargement', () => {
    render(<NotificationsBulkActions {...defaultProps} isLoading={true} />)

    expect(screen.getByTestId('bulk-mark-all-read')).toBeDisabled()
    expect(screen.getByTestId('bulk-delete-read')).toBeDisabled()
  })
})
