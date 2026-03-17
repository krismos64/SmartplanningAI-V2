/**
 * Page Mon Profil - Route /app/profile
 *
 * Server Component qui affiche les informations complètes de l'utilisateur.
 * Combine les données User (compte) et Employee (profil RH) si disponible.
 *
 * @ticket SP-270
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getProfile } from '@/lib/actions/profile'
import { ProfilePageContent } from './_components/ProfilePageContent'

export const metadata: Metadata = {
  title: 'Mon Profil | SmartPlanning',
  description: 'Gérez vos informations personnelles et paramètres de compte',
}

/**
 * Composant d'état d'erreur
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-destructive"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default async function ProfilePage() {
  // 1. Vérifier l'authentification
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // 2. Récupérer les données du profil
  const result = await getProfile()

  // 3. Gérer les erreurs
  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  // 4. Afficher le contenu du profil
  return <ProfilePageContent profile={result.data} />
}
