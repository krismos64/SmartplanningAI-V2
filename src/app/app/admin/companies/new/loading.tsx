import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function NewCompanyLoading() {
  return (
    <div
      className="container max-w-2xl py-8"
      role="status"
      aria-label="Chargement du formulaire de creation"
    >
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      <span className="sr-only">Chargement du formulaire...</span>
    </div>
  )
}
