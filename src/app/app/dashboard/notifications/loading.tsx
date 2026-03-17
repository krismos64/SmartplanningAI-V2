/**
 * Loading skeleton pour la page Notifications
 *
 * @ticket SP-324
 * @description Affiche un skeleton pendant le chargement des données
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function NotificationsLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement des notifications"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Filters and actions skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      {/* Notifications list skeleton */}
      <Card>
        <CardContent className="divide-y pt-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 py-4">
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

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-10" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* Accessibility */}
      <span className="sr-only">
        Chargement de la page notifications en cours...
      </span>
    </div>
  )
}
