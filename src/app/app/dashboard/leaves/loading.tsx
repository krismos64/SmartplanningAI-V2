/**
 * Loading skeleton pour la page Leaves (Congés)
 *
 * @description Affiche un skeleton pendant le chargement des données
 * @ticket SP-413
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function LeavesLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement des congés"
    >
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Stats bar skeleton */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-full" />
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-[160px] space-y-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-[180px] space-y-1.5">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="w-[280px] space-y-1.5">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-1">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardContent className="pt-6">
          {/* Table header */}
          <div className="mb-4 flex gap-4 border-b pb-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table rows */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <span className="sr-only">Chargement de la page congés en cours...</span>
    </div>
  )
}
