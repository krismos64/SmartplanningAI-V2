import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

/**
 * Loading state pour la page d'édition du profil
 *
 * @description Affiche un skeleton pendant le chargement du formulaire.
 * Design cohérent avec le formulaire EditProfileForm.
 *
 * @ticket SP-271
 */
export default function EditProfileLoading() {
  return (
    <div
      className="container max-w-2xl py-8"
      data-testid="edit-profile-loading"
    >
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center gap-2">
            {/* Bouton retour */}
            <Skeleton className="h-7 w-7 rounded-md" />
            {/* Titre */}
            <Skeleton className="h-7 w-48" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Champ Prénom */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Champ Nom */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Champ Téléphone */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-56" />
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Skeleton className="h-10 w-full sm:w-24" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
