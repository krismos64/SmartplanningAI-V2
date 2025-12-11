/**
 * Loading skeleton pour le dashboard Director
 *
 * Affiche des placeholders animes pendant le chargement
 * des donnees du dashboard directeur.
 *
 * @ticket SP-147
 */
import { Skeleton } from '@/components/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function DirectorDashboardLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du dashboard directeur"
    >
      {/* Welcome skeleton */}
      <Card className="border-none bg-gradient-to-r from-violet-500/10 to-violet-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton variant="title" width={280} />
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={180} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton width={120} height={36} borderRadius={8} />
              <Skeleton width={160} height={36} borderRadius={8} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid skeleton (6 KPIs) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Teams chart skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton variant="text" width={180} />
            <Skeleton variant="text" width={100} />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Skeleton width={160} height={160} circle className="mx-auto" />
            </div>
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton width={12} height={12} circle />
                    <Skeleton variant="text" width={80} />
                  </div>
                  <Skeleton variant="text" width={60} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trends chart skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" width={160} />
                <Skeleton variant="text" width={100} />
              </div>
              <Skeleton width={50} height={24} borderRadius={12} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton height={200} borderRadius={8} />
          </CardContent>
        </Card>
      </div>

      {/* Pending leaves skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={180} />
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
                  <Skeleton variant="text" width={140} />
                  <Skeleton variant="text" width={100} />
                </div>
                <Skeleton variant="text" width={80} />
              </div>
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
            <Skeleton variant="button" width={150} />
            <Skeleton variant="button" width={140} />
            <Skeleton variant="button" width={160} />
            <Skeleton variant="button" width={120} />
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">
        Chargement du dashboard directeur en cours...
      </span>
    </div>
  )
}
