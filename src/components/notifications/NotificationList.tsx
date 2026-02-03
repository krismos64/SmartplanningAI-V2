/**
 * Composant NotificationList - Liste des notifications dans le dropdown
 *
 * @ticket SP-323
 * @description Affiche la liste des notifications avec scroll, skeletons et empty state
 */

'use client'

import { CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotifications } from '@/hooks/useNotifications'

import { NotificationItem } from './NotificationItem'
import { NotificationEmptyState } from './NotificationEmptyState'
import { NotificationSkeleton } from './NotificationSkeleton'

interface NotificationListProps {
  /** Fermer le dropdown après clic sur une notification */
  onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { notifications, isLoading, isError, markAsRead, markAllAsRead } =
    useNotifications()

  // Compter les non lues
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = (id: string) => {
    void markAsRead(id)
  }

  const handleMarkAllAsRead = () => {
    void markAllAsRead()
  }

  // État de chargement
  if (isLoading) {
    return (
      <div data-testid="notification-list-loading">
        <NotificationSkeleton count={3} />
      </div>
    )
  }

  // État d'erreur
  if (isError) {
    return (
      <div
        className="px-4 py-8 text-center"
        data-testid="notification-list-error"
      >
        <p className="text-sm text-destructive">
          Erreur lors du chargement des notifications
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Veuillez réessayer plus tard
        </p>
      </div>
    )
  }

  // État vide
  if (notifications.length === 0) {
    return <NotificationEmptyState />
  }

  return (
    <div data-testid="notification-list">
      {/* Bouton "Tout marquer comme lu" */}
      {unreadCount > 0 && (
        <div className="border-b px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleMarkAllAsRead}
            data-testid="notification-mark-all-read"
          >
            <CheckCheck className="h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>
      )}

      {/* Liste scrollable */}
      <ScrollArea
        className="max-h-[300px]"
        data-testid="notification-scroll-area"
      >
        <div className="divide-y">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={handleMarkAsRead}
              onClose={onClose}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
