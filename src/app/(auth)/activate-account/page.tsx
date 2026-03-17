/**
 * Activate Account Page - Page d'activation de compte invite
 *
 * @description Server Component avec metadata SEO.
 * Recupere le token depuis les query params.
 * Le formulaire est gere par le Client Component ActivateAccountForm.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { ActivateAccountForm } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Activer votre compte | SmartPlanning',
  description:
    'Activez votre compte SmartPlanning en choisissant un mot de passe sécurisé',
}

interface ActivateAccountPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ActivateAccountPage({
  searchParams,
}: ActivateAccountPageProps) {
  const params = await searchParams
  const token = params.token

  // Si pas de token, afficher un message d'erreur
  if (!token) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Lien invalide
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce lien d&apos;activation est invalide. Veuillez contacter votre
            administrateur pour obtenir un nouveau lien.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Aller à la connexion
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Activer votre compte
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choisissez un mot de passe sécurisé pour accéder à SmartPlanning
        </p>
      </div>

      {/* Activate Account Form Component */}
      <ActivateAccountForm token={token} />
    </div>
  )
}
