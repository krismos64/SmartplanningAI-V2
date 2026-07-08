import { Skeleton } from '@/components/ui/skeleton'

export default function AdminEmailsLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du journal des emails"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Table */}
      <Skeleton className="h-96 w-full rounded-md" />

      <span className="sr-only">Chargement du journal des emails...</span>
    </div>
  )
}
