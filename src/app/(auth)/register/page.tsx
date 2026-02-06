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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Créer votre compte
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Commencez gratuitement, sans carte bancaire
        </p>
      </div>

      {/* Register Form Component */}
      <RegisterForm />

      {/* Link to login */}
      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-medium text-cyan-600 transition-colors hover:text-cyan-500 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          Se connecter
        </Link>
      </p>

      {/* Info essai gratuit */}
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="mb-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          21 jours d&apos;essai gratuit
        </p>
        <p className="text-xs text-muted-foreground">
          Toutes les fonctionnalités incluses, sans carte bancaire. 2,90 € par
          employé par mois après l&apos;essai.
        </p>
      </div>
    </div>
  )
}
