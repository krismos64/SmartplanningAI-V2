/**
 * Loading skeleton pour la page Paramètres
 *
 * Affiche un skeleton avec header + grille de 5 cards
 * pendant le chargement de la page.
 *
 * @ticket SP-274
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="glass-strong flex items-center gap-4 rounded-xl p-6">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Cards grid skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="glass">
            <CardContent className="flex items-center gap-4 p-6">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-5 w-5 shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
