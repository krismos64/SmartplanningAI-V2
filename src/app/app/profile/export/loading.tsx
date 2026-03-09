import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function ExportLoading() {
  return (
    <div
      className="container max-w-2xl py-8"
      role="status"
      aria-label="Chargement de la page d'export"
    >
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-center pt-4">
          <Skeleton className="h-10 w-48" />
        </div>
      </div>

      <span className="sr-only">Chargement de la page d&apos;export...</span>
    </div>
  )
}
