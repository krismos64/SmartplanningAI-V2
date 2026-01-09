/**
 * Login Page - Page de connexion
 *
 * @description Server Component avec metadata SEO.
 * Le formulaire est géré par le Client Component LoginForm.
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Bon retour !
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connectez-vous à votre compte pour accéder au dashboard
        </p>
      </div>

      {/* Login Form Component */}
      <LoginForm />

      {/* Link to register */}
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Créer un compte
        </Link>
      </p>

      {/* Demo accounts (pour développement) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-4">
          <p className="mb-2 text-xs font-medium text-foreground">
            🧪 Comptes de test
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Director: john.doe@techcorp.com</p>
            <p>Manager: jane.smith@techcorp.com</p>
            <p>Employee: bob.wilson@techcorp.com</p>
            <p className="mt-2 font-medium">Mot de passe : Password123!</p>
          </div>
        </div>
      )}
    </div>
  )
}
