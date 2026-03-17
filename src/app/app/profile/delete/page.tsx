/**
 * Page de suppression de compte
 *
 * Server Component avec vérification d'authentification.
 * Permet à l'utilisateur d'exercer son droit à l'effacement (RGPD Article 17).
 *
 * @ticket SP-277
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { DeleteAccountForm } from './_components'

export const metadata: Metadata = {
  title: 'Supprimer mon compte | SmartPlanning',
  description: 'Suppression définitive de votre compte et données personnelles',
}

export default async function DeleteAccountPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/connexion')
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Navigation retour */}
      <Button variant="ghost" size="sm" asChild data-testid="back-to-profile">
        <Link href="/app/profile" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au profil
        </Link>
      </Button>

      {/* Titre */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Supprimer mon compte
        </h1>
        <p className="text-muted-foreground">
          Exercez votre droit à l&apos;effacement conformément au RGPD (Article
          17)
        </p>
      </div>

      {/* Formulaire */}
      <DeleteAccountForm userEmail={session.user.email} />
    </div>
  )
}
