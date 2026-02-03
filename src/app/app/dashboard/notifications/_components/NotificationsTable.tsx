/**
 * NotificationsTable - Liste avec pagination
 *
 * @ticket SP-324
 * @description Affiche les notifications avec pagination et actions individuelles
 */

'use client'

import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { NotificationItem } from '@/components/notifications'
import type { NotificationListItem } from '@/types/notification'

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface NotificationsTableProps {
  notifications: NotificationListItem[]
  pagination: Pagination | null
  page: number
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPrevPage: () => void
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}

export function NotificationsTable({
  notifications,
  pagination,
  page,
  onPageChange,
  onNextPage,
  onPrevPage,
  onMarkAsRead,
  onDelete,
}: NotificationsTableProps) {
  return (
    <div className="space-y-4" data-testid="notifications-table">
      {/* Liste */}
      <Card>
        <CardContent className="divide-y p-0">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-2 px-4 py-3"
              data-testid={`notification-row-${notification.id}`}
            >
              {/* NotificationItem existant */}
              <div className="min-w-0 flex-1">
                <NotificationItem
                  notification={notification}
                  onClick={onMarkAsRead}
                />
              </div>

              {/* Bouton supprimer */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    data-testid={`delete-notification-${notification.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Supprimer</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer la notification ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(notification.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
          data-testid="notifications-pagination"
        >
          <p className="text-sm text-muted-foreground">
            Page {page} sur {pagination.totalPages} ({pagination.total}{' '}
            notifications)
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={page <= 1}
              className="gap-1"
              data-testid="pagination-prev"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {/* Numéros de page (max 5) */}
            <div className="flex items-center gap-1">
              {generatePageNumbers(page, pagination.totalPages).map(
                (pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="h-9 w-9"
                    data-testid={`pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={!pagination.hasMore}
              className="gap-1"
              data-testid="pagination-next"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Génère les numéros de page à afficher (max 5)
 */
function generatePageNumbers(current: number, total: number): number[] {
  const pages: number[] = []
  const maxVisible = 5

  let start = Math.max(1, current - Math.floor(maxVisible / 2))
  const end = Math.min(total, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}
