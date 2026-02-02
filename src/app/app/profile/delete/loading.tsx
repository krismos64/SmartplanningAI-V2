/**
 * Loading skeleton pour la page de suppression de compte
 *
 * @ticket SP-277
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

export default function DeleteAccountLoading() {
  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Navigation retour */}
      <Skeleton className="h-9 w-32" />

      {/* Titre */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Formulaire skeleton */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Alert skeleton */}
          <Skeleton className="h-40 w-full" />
          {/* Champs */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          {/* Checkbox */}
          <Skeleton className="h-20 w-full" />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-48" />
        </CardFooter>
      </Card>
    </div>
  )
}
