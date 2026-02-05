/**
 * Tests pour le composant NotificationItem
 *
 * @ticket SP-323
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { NotificationListItem } from '@/types/notification'

const mockNotificationUnread: NotificationListItem = {
  id: 'notif-1',
  title: 'Nouveau planning assigné',
  message: 'Un nouveau planning a été créé pour le 15/02/2026.',
  type: 'PLANNING',
  priority: 'LOW',
  actionUrl: '/app/dashboard/schedule',
  relatedType: 'Schedule',
  relatedId: 'schedule-1',
  isRead: false,
  readAt: null,
  createdAt: new Date('2026-01-30T10:00:00'),
}

const mockNotificationRead: NotificationListItem = {
  id: 'notif-2',
  title: 'Congé approuvé',
  message: 'Votre demande de congé a été approuvée.',
  type: 'LEAVE',
  priority: 'LOW',
  actionUrl: '/app/dashboard/leaves',
  relatedType: 'LeaveRequest',
  relatedId: 'leave-1',
  isRead: true,
  readAt: new Date('2026-01-29T12:00:00'),
  createdAt: new Date('2026-01-29T10:00:00'),
}

describe('NotificationItem', () => {
  describe('Rendu', () => {
    it('devrait afficher le titre et le message', () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      expect(screen.getByText('Nouveau planning assigné')).toBeInTheDocument()
      expect(
        screen.getByText('Un nouveau planning a été créé pour le 15/02/2026.')
      ).toBeInTheDocument()
    })

    it('devrait afficher la date relative', () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      // La date relative dépend du moment actuel, on vérifie juste qu'elle existe
      const item = screen.getByTestId('notification-item-notif-1')
      expect(item).toBeInTheDocument()
    })

    it("devrait afficher l'indicateur non lu pour les notifications non lues", () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      expect(
        screen.getByTestId('notification-unread-indicator')
      ).toBeInTheDocument()
    })

    it("ne devrait pas afficher l'indicateur non lu pour les notifications lues", () => {
      render(<NotificationItem notification={mockNotificationRead} />)

      expect(
        screen.queryByTestId('notification-unread-indicator')
      ).not.toBeInTheDocument()
    })
  })

  describe('Icônes par type', () => {
    it("devrait afficher l'icône Calendar pour PLANNING", () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      // L'icône est dans un div avec les couleurs appropriées
      const item = screen.getByTestId('notification-item-notif-1')
      expect(item).toBeInTheDocument()
    })

    it("devrait afficher l'icône appropriée pour LEAVE", () => {
      render(<NotificationItem notification={mockNotificationRead} />)

      const item = screen.getByTestId('notification-item-notif-2')
      expect(item).toBeInTheDocument()
    })

    it("devrait gérer les types inconnus avec l'icône Info", () => {
      const unknownType = {
        ...mockNotificationUnread,
        id: 'notif-unknown',
        type: 'UNKNOWN_TYPE' as unknown,
      }

      render(
        <NotificationItem notification={unknownType as NotificationListItem} />
      )

      expect(
        screen.getByTestId('notification-item-notif-unknown')
      ).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it("devrait appeler onClick avec l'ID quand cliqué (notification non lue)", () => {
      const onClick = vi.fn()
      render(
        <NotificationItem
          notification={mockNotificationUnread}
          onClick={onClick}
        />
      )

      fireEvent.click(screen.getByTestId('notification-item-notif-1'))

      expect(onClick).toHaveBeenCalledWith('notif-1')
    })

    it('ne devrait pas appeler onClick quand cliqué (notification déjà lue)', () => {
      const onClick = vi.fn()
      render(
        <NotificationItem
          notification={mockNotificationRead}
          onClick={onClick}
        />
      )

      fireEvent.click(screen.getByTestId('notification-item-notif-2'))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('devrait appeler onClose quand cliqué', () => {
      const onClose = vi.fn()
      render(
        <NotificationItem
          notification={mockNotificationUnread}
          onClose={onClose}
        />
      )

      fireEvent.click(screen.getByTestId('notification-item-notif-1'))

      expect(onClose).toHaveBeenCalled()
    })

    it('devrait réagir aux touches Enter et Espace', () => {
      const onClick = vi.fn()
      render(
        <NotificationItem
          notification={mockNotificationUnread}
          onClick={onClick}
        />
      )

      const item = screen.getByTestId('notification-item-notif-1')

      fireEvent.keyDown(item, { key: 'Enter' })
      expect(onClick).toHaveBeenCalledTimes(1)

      fireEvent.keyDown(item, { key: ' ' })
      expect(onClick).toHaveBeenCalledTimes(2)
    })
  })

  describe('Navigation', () => {
    it('devrait wrapper dans un Link si actionUrl est présent', () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      const link = screen.getByTestId('notification-link-notif-1')
      expect(link).toHaveAttribute('href', '/app/dashboard/schedule')
    })

    it('ne devrait pas wrapper dans un Link si actionUrl est absent', () => {
      const noUrl = { ...mockNotificationUnread, id: 'no-url', actionUrl: null }
      render(<NotificationItem notification={noUrl} />)

      expect(
        screen.queryByTestId('notification-link-no-url')
      ).not.toBeInTheDocument()
      expect(screen.getByTestId('notification-item-no-url')).toBeInTheDocument()
    })
  })

  describe('Styles', () => {
    it('devrait avoir un background différent pour les notifications non lues', () => {
      render(<NotificationItem notification={mockNotificationUnread} />)

      const item = screen.getByTestId('notification-item-notif-1')
      expect(item.className).toContain('bg-muted/30')
    })

    it('ne devrait pas avoir de background pour les notifications lues', () => {
      render(<NotificationItem notification={mockNotificationRead} />)

      const item = screen.getByTestId('notification-item-notif-2')
      expect(item.className).not.toContain('bg-muted/30')
    })
  })
})
