/**
 * Loading state global pour /dashboard
 *
 * Affiche un skeleton pendant le chargement de la page dashboard.
 * Utilise les composants Skeleton existants.
 *
 * @ticket SP-145
 */
import { Skeleton } from '@/components/loading'

export default function DashboardLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du dashboard"
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton variant="title" width={250} />
        <Skeleton variant="text" width={180} />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="avatar" width={32} height={32} />
            </div>
            <div className="mt-4">
              <Skeleton variant="title" width={80} />
            </div>
            <div className="mt-2">
              <Skeleton variant="text" width={120} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton variant="text" width={180} className="mb-4" />
          <Skeleton height={200} borderRadius={8} />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton variant="text" width={180} className="mb-4" />
          <Skeleton height={200} borderRadius={8} />
        </div>
      </div>

      {/* Quick actions skeleton */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton variant="text" width={150} className="mb-4" />
        <div className="flex flex-wrap gap-3">
          <Skeleton variant="button" width={140} />
          <Skeleton variant="button" width={120} />
          <Skeleton variant="button" width={130} />
        </div>
      </div>

      <span className="sr-only">Chargement en cours...</span>
    </div>
  )
}
