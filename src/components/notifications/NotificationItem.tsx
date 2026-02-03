/**
 * Composant NotificationItem - Élément individuel de notification
 *
 * @ticket SP-323
 * @description Affiche une notification avec icône, titre, message et date
 */

'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Settings,
  Calendar,
  Palmtree,
  ListTodo,
  AlertOctagon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import type {
  NotificationListItem,
  NotificationType,
} from '@/types/notification'
import { NOTIFICATION_TYPE_COLORS } from '@/types/notification'

// ============================================================================
// Icon mapping
// ============================================================================

const ICON_MAP: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  INFO: Info,
  SUCCESS: CheckCircle,
  WARNING: AlertTriangle,
  ERROR: XCircle,
  SYSTEM: Settings,
  PLANNING: Calendar,
  LEAVE: Palmtree,
  TASK: ListTodo,
  INCIDENT: AlertOctagon,
}

// ============================================================================
// Props
// ============================================================================

interface NotificationItemProps {
  /** Données de la notification */
  notification: NotificationListItem
  /** Callback appelé au clic sur la notification */
  onClick?: (id: string) => void
  /** Fermer le dropdown après clic */
  onClose?: () => void
}

// ============================================================================
// Component
// ============================================================================

/**
 * Composant NotificationItem
 *
 * Affiche une notification avec :
 * - Icône colorée selon le type
 * - Titre et message
 * - Date relative en français
 * - Indicateur non lu (point bleu)
 * - Navigation vers actionUrl si présent
 */
export const NotificationItem = memo(function NotificationItem({
  notification,
  onClick,
  onClose,
}: NotificationItemProps) {
  const { id, title, message, type, isRead, actionUrl, createdAt } =
    notification

  const Icon = ICON_MAP[type as NotificationType] ?? Info
  const colors =
    NOTIFICATION_TYPE_COLORS[type as NotificationType] ??
    NOTIFICATION_TYPE_COLORS.INFO

  // Formater la date relative (ex: "il y a 5 minutes")
  const relativeTime = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: fr,
  })

  const handleClick = useCallback(() => {
    if (!isRead && onClick) {
      onClick(id)
    }
    if (onClose) {
      onClose()
    }
  }, [id, isRead, onClick, onClose])

  const content = (
    <div
      className={cn(
        'flex gap-3 px-4 py-3 transition-colors',
        'cursor-pointer hover:bg-muted/50',
        !isRead && 'bg-muted/30'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      data-testid={`notification-item-${id}`}
    >
      {/* Icône */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          colors.bg
        )}
      >
        <Icon className={cn('h-5 w-5', colors.icon)} />
      </div>

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              'text-sm font-medium leading-tight',
              !isRead && 'text-foreground',
              isRead && 'text-muted-foreground'
            )}
          >
            {title}
          </p>
          {/* Indicateur non lu */}
          {!isRead && (
            <span
              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-label="Non lu"
              data-testid="notification-unread-indicator"
            />
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
          {message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">{relativeTime}</p>
      </div>
    </div>
  )

  // Si actionUrl, wrapper dans un Link
  if (actionUrl) {
    return (
      <Link
        href={actionUrl}
        className="block"
        data-testid={`notification-link-${id}`}
      >
        {content}
      </Link>
    )
  }

  return content
})
