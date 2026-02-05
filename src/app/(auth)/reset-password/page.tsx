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
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/forgot-password" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500">
              Demander un nouveau lien
            </Button>
          </Link>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 transition-colors hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </div>

      {/* Reset Password Form Component */}
      <ResetPasswordForm token={token} />
    </div>
  )
}
