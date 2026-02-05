/**
 * Tests pour le composant NotificationList
 *
 * @ticket SP-323
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { NotificationList } from '@/components/notifications/NotificationList'

// Mock du hook useNotifications
vi.mock('@/hooks/useNotifications', () => ({
  useNotifications: vi.fn(),
}))

import { useNotifications } from '@/hooks/useNotifications'

const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Nouveau planning',
    message: 'Un nouveau planning a été créé',
    type: 'PLANNING',
    priority: 'LOW',
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
    type: 'LEAVE',
    priority: 'LOW',
    actionUrl: '/app/dashboard/leaves',
    relatedType: 'LeaveRequest',
    relatedId: 'leave-1',
    isRead: true,
    readAt: new Date('2026-01-29T12:00:00'),
    createdAt: new Date('2026-01-29T10:00:00'),
  },
]

describe('NotificationList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('État de chargement', () => {
    it('devrait afficher le skeleton pendant le chargement', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: [],
        isLoading: true,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(
        screen.getByTestId('notification-list-loading')
      ).toBeInTheDocument()
      expect(screen.getByTestId('notification-skeleton')).toBeInTheDocument()
    })
  })

  describe("État d'erreur", () => {
    it("devrait afficher le message d'erreur", () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: [],
        isLoading: false,
        isValidating: false,
        isError: true,
        error: 'Erreur serveur',
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(screen.getByTestId('notification-list-error')).toBeInTheDocument()
      expect(
        screen.getByText('Erreur lors du chargement des notifications')
      ).toBeInTheDocument()
    })
  })

  describe('État vide', () => {
    it("devrait afficher l'empty state quand il n'y a pas de notifications", () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: [],
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(screen.getByTestId('notification-empty-state')).toBeInTheDocument()
      expect(screen.getByText('Aucune notification')).toBeInTheDocument()
    })
  })

  describe('Affichage des notifications', () => {
    it('devrait afficher la liste des notifications', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(screen.getByTestId('notification-list')).toBeInTheDocument()
      expect(screen.getByText('Nouveau planning')).toBeInTheDocument()
      expect(screen.getByText('Congé approuvé')).toBeInTheDocument()
    })

    it('devrait afficher le bouton "Tout marquer comme lu" s\'il y a des non lues', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(
        screen.getByTestId('notification-mark-all-read')
      ).toBeInTheDocument()
      expect(screen.getByText('Tout marquer comme lu')).toBeInTheDocument()
    })

    it("ne devrait pas afficher le bouton s'il n'y a pas de non lues", () => {
      const allRead = mockNotifications.map((n) => ({ ...n, isRead: true }))
      vi.mocked(useNotifications).mockReturnValue({
        notifications: allRead,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(
        screen.queryByTestId('notification-mark-all-read')
      ).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('devrait appeler markAsRead quand on clique sur une notification', async () => {
      const markAsRead = vi.fn().mockResolvedValue(true)
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead,
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      fireEvent.click(screen.getByTestId('notification-item-notif-1'))

      await waitFor(() => {
        expect(markAsRead).toHaveBeenCalledWith('notif-1')
      })
    })

    it('devrait appeler markAllAsRead quand on clique sur "Tout marquer comme lu"', async () => {
      const markAllAsRead = vi.fn().mockResolvedValue(true)
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead,
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      fireEvent.click(screen.getByTestId('notification-mark-all-read'))

      await waitFor(() => {
        expect(markAllAsRead).toHaveBeenCalled()
      })
    })

    it('devrait appeler onClose quand on clique sur une notification', async () => {
      const onClose = vi.fn()
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn().mockResolvedValue(true),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList onClose={onClose} />)

      fireEvent.click(screen.getByTestId('notification-item-notif-1'))

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    })
  })

  describe('ScrollArea', () => {
    it('devrait avoir une zone de scroll', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: mockNotifications,
        isLoading: false,
        isValidating: false,
        isError: false,
        error: undefined,
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        mutate: vi.fn(),
      })

      render(<NotificationList />)

      expect(screen.getByTestId('notification-scroll-area')).toBeInTheDocument()
    })
  })
})
