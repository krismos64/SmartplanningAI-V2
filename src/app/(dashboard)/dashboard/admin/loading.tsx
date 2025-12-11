/**
 * Loading skeleton pour le dashboard Super Admin
 *
 * Affiche des placeholders animes pendant le chargement
 * des donnees du dashboard administrateur.
 *
 * @ticket SP-148
 */
import { Skeleton } from '@/components/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AdminDashboardLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du dashboard administrateur"
    >
      {/* Welcome skeleton */}
      <Card className="border-none bg-gradient-to-r from-rose-500/10 to-rose-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton variant="title" width={320} />
              <Skeleton variant="text" width={200} />
              <Skeleton variant="text" width={180} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton width={140} height={36} borderRadius={8} />
              <Skeleton width={120} height={36} borderRadius={8} />
              <Skeleton width={100} height={36} borderRadius={8} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid skeleton (6 KPIs) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton variant="text" width={140} />
              <Skeleton
                variant="avatar"
                width={32}
                height={32}
                borderRadius={8}
              />
            </CardHeader>
            <CardContent>
              <Skeleton variant="title" width={100} />
              <div className="mt-2">
                <Skeleton variant="text" width={120} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts skeleton - row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* MRR chart skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" width={180} />
                <Skeleton variant="text" width={120} />
              </div>
              <Skeleton width={60} height={24} borderRadius={12} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton height={200} borderRadius={8} />
          </CardContent>
        </Card>

        {/* Signups chart skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <Skeleton variant="text" width={160} />
              <Skeleton variant="text" width={100} />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton height={200} borderRadius={8} />
          </CardContent>
        </Card>
      </div>

      {/* Charts skeleton - row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Plans chart skeleton */}
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

        {/* Recent companies skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" width={180} />
                <Skeleton variant="text" width={140} />
              </div>
              <Skeleton width={100} height={32} borderRadius={6} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton width={40} height={40} circle />
                    <div className="space-y-1">
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={80} />
                    </div>
                  </div>
                  <Skeleton variant="text" width={60} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton variant="text" width={130} />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Skeleton variant="button" width={160} />
            <Skeleton variant="button" width={140} />
            <Skeleton variant="button" width={180} />
            <Skeleton variant="button" width={150} />
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">
        Chargement du dashboard administrateur en cours...
      </span>
    </div>
  )
}
