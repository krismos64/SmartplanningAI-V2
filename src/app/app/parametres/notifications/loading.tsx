import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Loading state pour la page Notifications
 *
 * @ticket SP-275
 */
export default function NotificationsSettingsLoading() {
  return (
    <div className="space-y-6" data-testid="notifications-loading">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* 4 category cards skeleton */}
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-9 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Reset button skeleton */}
      <div className="flex justify-end border-t pt-4">
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  )
}
