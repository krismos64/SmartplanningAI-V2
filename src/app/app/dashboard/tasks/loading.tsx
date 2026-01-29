/**
 * Loading skeleton pour la page Tasks (Tâches personnelles)
 *
 * @description Affiche un skeleton pendant le chargement des données
 * @ticket SP-419
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function TasksLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement des tâches">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Privacy badge skeleton */}
      <Skeleton className="h-8 w-64 rounded-full" />

      {/* Tasks list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              {/* Drag handle */}
              <Skeleton className="h-6 w-6" />
              {/* Checkbox */}
              <Skeleton className="h-5 w-5 rounded" />
              {/* Content */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              {/* Date badge */}
              <Skeleton className="h-6 w-20 rounded-full" />
              {/* Actions */}
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Accessibility */}
      <span className="sr-only">
        Chargement de la page tâches personnelles en cours...
      </span>
    </div>
  )
}
