/**
 * Page de changement de mot de passe
 *
 * Server Component avec vérification d'authentification.
 * Redirige vers /login si non connecté.
 *
 * @ticket SP-273
 */

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { ChangePasswordForm } from './_components/ChangePasswordForm'

export const metadata: Metadata = {
  title: 'Changer mon mot de passe | SmartPlanning',
  description: 'Modifiez votre mot de passe de connexion SmartPlanning',
}

export default async function ChangePasswordPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
  }

  return (
    <div className="container max-w-2xl py-8">
      <ChangePasswordForm />
    </div>
  )
}
