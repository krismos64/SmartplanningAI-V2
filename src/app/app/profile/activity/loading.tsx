import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function ActivityLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement de l'historique d'activite"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <div className="flex gap-3">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start gap-4 py-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-72" />
                <Skeleton className="h-3 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-9 w-32" />
      </div>

      <span className="sr-only">Chargement de l'historique d'activite...</span>
    </div>
  )
}
