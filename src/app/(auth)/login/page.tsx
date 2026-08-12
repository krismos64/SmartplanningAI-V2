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
        <h1 className="font-geist text-2xl font-bold tracking-tight text-public-content">
          Bon retour !
        </h1>
        <p className="mt-2 font-geist text-sm text-public-content-muted">
          Connectez-vous à votre compte pour accéder au dashboard
        </p>
      </div>

      {/* Login Form Component */}
      <LoginForm />

      {/* Link to register */}
      <p className="text-center font-geist text-sm text-public-content-muted">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-semibold text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  )
}
