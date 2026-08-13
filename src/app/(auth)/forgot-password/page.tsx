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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-geist text-3xl font-bold tracking-[-0.02em] text-public-content">
          Mot de passe oublié ?
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Pas de panique, nous allons vous aider
        </p>
      </div>

      {/* Forgot Password Form Component */}
      <ForgotPasswordForm />
    </div>
  )
}
