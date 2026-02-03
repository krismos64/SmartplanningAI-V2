/**
 * NotificationsBulkActions - Actions en masse
 *
 * @ticket SP-324
 * @description Boutons pour marquer tout comme lu et supprimer les lues
 */

'use client'

import { CheckCheck, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface NotificationsBulkActionsProps {
  unreadCount: number
  readCount: number
  onMarkAllAsRead: () => void
  onDeleteAllRead: () => void
  isLoading: boolean
}

export function NotificationsBulkActions({
  unreadCount,
  readCount,
  onMarkAllAsRead,
  onDeleteAllRead,
  isLoading,
}: NotificationsBulkActionsProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="notifications-bulk-actions"
    >
      {/* Tout marquer comme lu */}
      {unreadCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          disabled={isLoading}
          className="gap-1.5"
          data-testid="bulk-mark-all-read"
        >
          <CheckCheck className="h-4 w-4" />
          Tout marquer comme lu ({unreadCount})
        </Button>
      )}

      {/* Supprimer les lues */}
      {readCount > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              data-testid="bulk-delete-read"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer les lues ({readCount})
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Supprimer les notifications lues ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprimera définitivement {readCount}{' '}
                notification(s) lue(s). Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDeleteAllRead}
                className="bg-destructive hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
