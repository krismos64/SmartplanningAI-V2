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
    <div className="space-y-8">
      {/*
        En-tete aligne a gauche comme sur le prototype : label en petites
        capitales, titre large, puis une phrase de contexte. Le panneau
        editorial de gauche porte l'accroche, cet en-tete nomme l'action.
      */}
      <div>
        <p className="font-geist text-xs font-semibold uppercase tracking-[0.14em] text-public-brand-on-light">
          Compte existant
        </p>
        <h1 className="mt-4 font-geist text-3xl font-bold tracking-[-0.02em] text-public-content sm:text-4xl">
          Se connecter
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Accédez à votre tableau de bord SmartPlanning.
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
