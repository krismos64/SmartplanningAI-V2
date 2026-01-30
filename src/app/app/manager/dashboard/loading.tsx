/**
 * Loading skeleton pour le dashboard Manager
 *
 * Affiche des placeholders animes pendant le chargement
 * des donnees du dashboard manager.
 *
 * @ticket SP-316
 */
import { Skeleton } from '@/components/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ManagerDashboardLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du dashboard manager"
    >
      {/* Welcome skeleton */}
      <Card className="border-none bg-gradient-to-r from-blue-500/10 to-indigo-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton variant="title" width={280} />
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={180} />
            </div>
            <div className="flex gap-2">
              <Skeleton width={140} height={24} borderRadius={12} />
              <Skeleton width={120} height={24} borderRadius={12} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid skeleton - 4 KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton variant="text" width={120} />
              <Skeleton
                variant="avatar"
                width={32}
                height={32}
                borderRadius={8}
              />
            </CardHeader>
            <CardContent>
              <Skeleton variant="title" width={80} />
              <div className="mt-2">
                <Skeleton variant="text" width={100} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton - 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team performance chart skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={180} />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton variant="text" width={80} />
              <Skeleton variant="text" width={100} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton height={200} borderRadius={8} />
          </CardContent>
        </Card>

        {/* Pending leaves skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" width={130} />
                <Skeleton variant="text" width={160} />
              </div>
              <Skeleton width={24} height={24} circle />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton variant="text" width={120} />
                      <Skeleton width={40} height={20} borderRadius={4} />
                    </div>
                    <Skeleton variant="text" width={100} />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton variant="button" width={80} />
                    <Skeleton variant="button" width={70} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal tasks widget skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton variant="text" width={130} />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={40} borderRadius={8} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton variant="text" width={130} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Skeleton variant="button" width={130} />
            <Skeleton variant="button" width={140} />
            <Skeleton variant="button" width={130} />
            <Skeleton variant="button" width={140} />
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">
        Chargement du dashboard manager en cours...
      </span>
    </div>
  )
}
