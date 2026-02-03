/**
 * Composant NotificationSkeleton - Skeleton loading pour les notifications
 *
 * @ticket SP-323
 * @description Affiche un placeholder pendant le chargement
 */

import { Skeleton } from '@/components/ui/skeleton'

interface NotificationSkeletonProps {
  /** Nombre de skeletons à afficher (défaut: 3) */
  count?: number
}

export function NotificationSkeleton({ count = 3 }: NotificationSkeletonProps) {
  return (
    <div data-testid="notification-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 px-4 py-3"
          data-testid={`notification-skeleton-item-${index}`}
        >
          {/* Icône */}
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          {/* Contenu */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
