/**
 * Loading state pour la page de changement de mot de passe
 *
 * Affiche un skeleton pendant le chargement.
 *
 * @ticket SP-273
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export default function ChangePasswordLoading() {
  return (
    <div className="container max-w-2xl py-8">
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 3 champs de formulaire */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          {/* Boutons */}
          <div className="flex justify-end gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-44" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
