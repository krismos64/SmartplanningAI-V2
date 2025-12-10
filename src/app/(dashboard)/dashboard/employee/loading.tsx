/**
 * Loading skeleton pour le dashboard Employee
 *
 * Affiche des placeholders animes pendant le chargement
 * des donnees du dashboard employe.
 *
 * @ticket SP-145
 */
import { Skeleton } from '@/components/loading'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function EmployeeDashboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="Chargement du dashboard employe">
      {/* Welcome skeleton */}
      <Card className="border-none bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Skeleton variant="title" width={280} />
            <Skeleton variant="text" width={200} />
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-background/50 p-3">
            <Skeleton variant="avatar" width={40} height={40} />
            <div className="space-y-1">
              <Skeleton variant="text" width={100} />
              <Skeleton variant="text" width={180} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton variant="text" width={120} />
              <Skeleton variant="avatar" width={32} height={32} borderRadius={8} />
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
        {/* Schedule chart skeleton */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton variant="text" width={200} />
            <Skeleton variant="text" width={80} />
          </CardHeader>
          <CardContent>
            <Skeleton height={200} borderRadius={8} />
          </CardContent>
        </Card>

        {/* Leave balance chart skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <Skeleton variant="text" width={150} />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Skeleton
                width={160}
                height={160}
                circle
                className="mx-auto"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton variant="text" width={60} className="mx-auto" />
                  <Skeleton variant="text" width={40} className="mx-auto mt-1" />
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between">
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={80} />
              </div>
              <Skeleton height={8} borderRadius={4} />
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
            <Skeleton variant="button" width={130} />
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">Chargement du dashboard employe en cours...</span>
    </div>
  )
}
