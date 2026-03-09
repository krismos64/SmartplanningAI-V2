import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TeamMembersLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement des membres de l'equipe"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>

      <span className="sr-only">Chargement des membres...</span>
    </div>
  )
}
