/**
 * Composant NotificationEmptyState - État vide des notifications
 *
 * @ticket SP-323
 * @description Affiche un message quand il n'y a pas de notifications
 */

'use client'

import { Bell } from 'lucide-react'

interface NotificationEmptyStateProps {
  /** Titre du message (défaut: "Aucune notification") */
  title?: string
  /** Description du message */
  description?: string
}

export function NotificationEmptyState({
  title = 'Aucune notification',
  description = 'Vous êtes à jour !',
}: NotificationEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-8 text-center"
      data-testid="notification-empty-state"
    >
      <div className="mb-3 rounded-full bg-muted p-3">
        <Bell className="h-6 w-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/70">{description}</p>
    </div>
  )
}
