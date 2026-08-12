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
            Ce lien de vérification est invalide. Veuillez vérifier votre boîte
            mail ou demander un nouveau lien.
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
          Vérification de votre email
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Validation de votre adresse email en cours...
        </p>
      </div>

      {/* Verify Email Content Component */}
      <VerifyEmailContent token={token} />
    </div>
  )
}
