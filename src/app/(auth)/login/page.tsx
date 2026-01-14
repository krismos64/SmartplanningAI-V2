/**
 * Login Page - Page de connexion
 *
 * @description Server Component avec metadata SEO.
 * Le formulaire est géré par le Client Component LoginForm.
 * Design dark cohérent avec la landing page.
 *
 * @ticket SP-137
 * @see Context7 - Next.js 15 App Router patterns
 */

import Link from 'next/link'
import type { Metadata } from 'next'

import { LoginForm } from '@/components/auth'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte SmartPlanning',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bon retour !
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Connectez-vous à votre compte pour accéder au dashboard
        </p>
      </div>

      {/* Login Form Component */}
      <LoginForm variant="dark" />

      {/* Link to register */}
      <p className="text-center text-sm text-white/60">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Créer un compte
        </Link>
      </p>

      {/* Demo accounts (pour développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-4">
          <p className="mb-2 text-xs font-medium text-white">
            🧪 Comptes de test
          </p>
          <div className="space-y-1 text-xs text-white/60">
            <p>Director: john.doe@techcorp.com</p>
            <p>Manager: jane.smith@techcorp.com</p>
            <p>Employee: bob.wilson@techcorp.com</p>
            <p className="mt-2 font-medium text-cyan-400">
              Mot de passe : Password123!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
