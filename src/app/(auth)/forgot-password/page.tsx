/**
 * Forgot Password Page - Page de demande de réinitialisation
 *
 * @description Server Component avec metadata SEO.
 * Le formulaire est géré par le Client Component ForgotPasswordForm.
 * Design dark cohérent avec la landing page.
 *
 * @ticket SP-263
 * @see Context7 - Next.js 15 App Router patterns
 */

import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description:
    'Demandez un lien de réinitialisation pour votre compte SmartPlanning',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Mot de passe oublié ?
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Pas de panique, nous allons vous aider
        </p>
      </div>

      {/* Forgot Password Form Component */}
      <ForgotPasswordForm variant="dark" />
    </div>
  )
}
