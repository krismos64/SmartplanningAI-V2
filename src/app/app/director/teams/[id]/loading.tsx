import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TeamDetailLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du detail equipe"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-36" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-28" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <span className="sr-only">Chargement du detail equipe...</span>
    </div>
  )
}
