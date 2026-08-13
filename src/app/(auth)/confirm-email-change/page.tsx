/**
 * Confirm Email Change Page - Confirmation d'un changement d'adresse email
 *
 * @description Le collaborateur arrive ici depuis le lien reçu à sa NOUVELLE
 * adresse, après qu'un responsable a corrigé son email. Le changement n'est
 * appliqué qu'ici : tant que la page n'a pas été ouverte, l'ancienne adresse
 * reste l'identifiant de connexion.
 *
 * Server Component : la confirmation s'exécute côté serveur au chargement,
 * sans état client à gérer.
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'

import { confirmEmailChange } from '@/lib/services/email-change.service'

export const metadata: Metadata = {
  title: "Confirmation d'adresse email | SmartPlanning",
  description:
    'Confirmez votre nouvelle adresse email pour vous connecter à SmartPlanning',
  robots: { index: false, follow: false },
}

interface ConfirmEmailChangePageProps {
  searchParams: Promise<{ token?: string }>
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex h-14 w-14 items-center justify-center bg-public-accent-surface">
          <AlertCircle className="h-7 w-7 text-public-content-on-vivid" />
        </div>
        <h1 className="font-geist text-3xl font-bold tracking-[-0.02em] text-public-content">
          Lien invalide
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          {message}
        </p>
      </div>

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
  )
}

export default async function ConfirmEmailChangePage({
  searchParams,
}: ConfirmEmailChangePageProps) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    return (
      <ErrorState message="Ce lien de confirmation est invalide. Vérifiez votre boîte mail ou demandez à votre responsable de renouveler la modification." />
    )
  }

  const result = await confirmEmailChange(token)

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-6 flex h-14 w-14 items-center justify-center bg-public-highlight-surface">
          <CheckCircle2 className="h-7 w-7 text-public-content-on-vivid" />
        </div>
        <h1 className="font-geist text-3xl font-bold tracking-[-0.02em] text-public-content">
          Adresse confirmée
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Vous vous connectez désormais avec{' '}
          <strong className="text-public-content">{result.newEmail}</strong>.
          Votre mot de passe reste inchangé.
        </p>
      </div>

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
  )
}
