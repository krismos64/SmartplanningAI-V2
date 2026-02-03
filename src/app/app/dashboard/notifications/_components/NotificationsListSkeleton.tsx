/**
 * NotificationsListSkeleton - Skeleton pour la liste
 *
 * @ticket SP-324
 * @description Skeleton affiché pendant le chargement des notifications
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export function NotificationsListSkeleton() {
  return (
    <Card data-testid="notifications-list-skeleton">
      <CardContent className="divide-y p-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-4">
            {/* Icon */}
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            {/* Content */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-8 w-8 shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
