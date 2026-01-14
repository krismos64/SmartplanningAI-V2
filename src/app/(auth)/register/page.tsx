/**
 * Register Page - Page d'inscription
 *
 * @description Server Component avec metadata SEO.
 * Le formulaire est géré par le Client Component RegisterForm.
 * Design dark cohérent avec la landing page.
 *
 * @ticket SP-139
 * @see Context7 - Next.js 15 App Router patterns
 */

import Link from 'next/link'
import type { Metadata } from 'next'

import { RegisterForm } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Inscrivez-vous sur SmartPlanning et créez votre organisation',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Créer votre compte
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Commencez gratuitement, sans carte bancaire
        </p>
      </div>

      {/* Register Form Component */}
      <RegisterForm variant="dark" />

      {/* Link to login */}
      <p className="text-center text-sm text-white/60">
        Vous avez déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Se connecter
        </Link>
      </p>

      {/* Info plan FREE */}
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="mb-1 text-xs font-medium text-emerald-400">
          ✨ Plan FREE inclus
        </p>
        <p className="text-xs text-white/60">
          Jusqu&apos;à 5 employés, fonctionnalités complètes, sans limite de
          temps. Pas de carte bancaire requise.
        </p>
      </div>
    </div>
  )
}
