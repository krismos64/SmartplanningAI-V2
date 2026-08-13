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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="mb-6 flex h-14 w-14 items-center justify-center bg-public-accent-surface">
            <AlertCircle className="h-7 w-7 text-public-content-on-vivid" />
          </div>
          <h1 className="font-geist text-3xl font-bold tracking-[-0.02em] text-public-content">
            Lien invalide
          </h1>
          <p className="mt-3 font-geist text-base text-public-content-muted">
            Ce lien d&apos;activation est invalide. Veuillez contacter votre
            administrateur pour obtenir un nouveau lien.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-public-content underline underline-offset-4 transition-colors hover:text-public-accent"
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-geist text-3xl font-bold tracking-[-0.02em] text-public-content">
          Activer votre compte
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Choisissez un mot de passe sécurisé pour accéder à SmartPlanning
        </p>
      </div>

      {/* Activate Account Form Component */}
      <ActivateAccountForm token={token} />
    </div>
  )
}
