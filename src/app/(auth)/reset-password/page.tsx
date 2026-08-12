/**
 * Reset Password Page - Page de réinitialisation du mot de passe
 *
 * @description Server Component avec metadata SEO.
 * Récupère le token depuis les query params.
 * Le formulaire est géré par le Client Component ResetPasswordForm.
 * Design dark cohérent avec la landing page.
 *
 * @ticket SP-263
 * @see Context7 - Next.js 15 App Router patterns, searchParams handling
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowLeft } from 'lucide-react'

import { ResetPasswordForm } from '@/components/auth'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
  description: 'Créez un nouveau mot de passe pour votre compte SmartPlanning',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
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
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/forgot-password" className="block">
            <Button className="w-full rounded-none bg-public-content font-geist font-semibold text-public-content-on-dark transition-colors hover:bg-public-accent">
              Demander un nouveau lien
            </Button>
          </Link>

          <div>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-public-content underline underline-offset-4 transition-colors hover:text-public-accent"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
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
          Nouveau mot de passe
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </div>

      {/* Reset Password Form Component */}
      <ResetPasswordForm token={token} />
    </div>
  )
}
