/**
 * Loading skeleton pour la page Facturation
 *
 * @ticket SP-360
 */
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* SubscriptionStatus skeleton */}
      <Card className="glass-strong">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-7 w-20" />
              <Skeleton className="mt-1 h-3 w-28" />
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-7 w-12" />
              <Skeleton className="mt-1 h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-4 w-64" />
        </CardContent>
        <CardFooter className="gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>

      {/* UsageIndicator + InvoiceHistory skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* UsageIndicator */}
        <Card className="glass-strong">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="mt-2 h-6 w-16" />
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-6 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* InvoiceHistory */}
        <Card className="glass-strong">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-48" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-14 rounded-md" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
