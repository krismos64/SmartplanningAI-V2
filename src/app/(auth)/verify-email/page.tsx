/**
 * Verify Email Page - Page de vérification d'adresse email
 *
 * @description Server Component avec metadata SEO.
 * Récupère le token depuis les query params.
 * La vérification est gérée par le Client Component VerifyEmailContent.
 *
 * @ticket SP-299
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { VerifyEmailContent } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Vérification email | SmartPlanning',
  description:
    'Vérifiez votre adresse email pour activer votre compte SmartPlanning',
}

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
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
            Ce lien de vérification est invalide. Veuillez vérifier votre boîte
            mail ou demander un nouveau lien.
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
          Vérification de votre email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Validation de votre adresse email en cours...
        </p>
      </div>

      {/* Verify Email Content Component */}
      <VerifyEmailContent token={token} />
    </div>
  )
}
