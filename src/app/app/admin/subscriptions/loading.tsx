import { Skeleton } from '@/components/ui/skeleton'

export default function SubscriptionsLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement des abonnements"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Tables */}
      <Skeleton className="h-96 w-full rounded-md" />
      <Skeleton className="h-72 w-full rounded-md" />

      <span className="sr-only">Chargement des abonnements...</span>
    </div>
  )
}
