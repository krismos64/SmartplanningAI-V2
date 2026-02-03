/**
 * NotificationToast - Toast pour notifications temps réel
 *
 * @ticket SP-327
 * @description Affiche un toast sonner avec action pour nouvelle notification
 */

'use client'

import { toast } from 'sonner'
import {
  Bell,
  Calendar,
  CalendarOff,
  FileText,
  AlertTriangle,
  Info,
  type LucideIcon,
} from 'lucide-react'

import type { NotificationListItem } from '@/types/notification'

/**
 * Icônes par type de notification
 */
const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  PLANNING: Calendar,
  LEAVE: CalendarOff,
  INCIDENT: AlertTriangle,
  REPORT: FileText,
  SYSTEM: Info,
  OTHER: Bell,
}

/**
 * Couleurs par priorité pour le style du toast
 */
const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'border-l-4 border-l-destructive',
  MEDIUM: 'border-l-4 border-l-warning',
  LOW: '',
}

interface NotificationToastContentProps {
  notification: NotificationListItem
}

/**
 * Contenu personnalisé du toast
 */
function NotificationToastContent({
  notification,
}: NotificationToastContentProps) {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{notification.title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
          {notification.message}
        </p>
      </div>
    </div>
  )
}

/**
 * Affiche un toast pour une nouvelle notification
 *
 * @param notification - La notification à afficher
 * @param onAction - Callback quand l'utilisateur clique sur l'action
 *
 * @example
 * showNotificationToast(notification, () => {
 *   router.push(notification.actionUrl)
 * })
 */
export function showNotificationToast(
  notification: NotificationListItem,
  onAction?: () => void
): void {
  const priorityStyle = PRIORITY_STYLES[notification.priority] || ''

  toast.custom(
    (t) => (
      <div
        className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-background shadow-lg ring-1 ring-black ring-opacity-5 ${priorityStyle}`}
        data-testid="notification-toast"
      >
        <div className="p-4">
          <NotificationToastContent notification={notification} />
        </div>
        {notification.actionUrl && onAction && (
          <div className="flex border-t border-border">
            <button
              onClick={() => {
                onAction()
                toast.dismiss(t)
              }}
              className="flex w-full items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-muted focus:outline-none"
              data-testid="notification-toast-action"
            >
              Voir les détails
            </button>
          </div>
        )}
      </div>
    ),
    {
      duration: 5000,
      position: 'top-right',
    }
  )
}

/**
 * Affiche un toast simple pour une notification (version compacte)
 */
export function showNotificationToastSimple(
  notification: NotificationListItem
): void {
  const Icon = NOTIFICATION_ICONS[notification.type] || Bell

  toast(notification.title, {
    description: notification.message,
    icon: <Icon className="h-4 w-4" />,
    duration: 5000,
    position: 'top-right',
  })
}
