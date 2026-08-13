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
    <div className="space-y-8">
      {/* En-tete aligne a gauche, meme motif que la page de connexion */}
      <div>
        <p className="font-geist text-xs font-semibold uppercase tracking-[0.14em] text-public-brand-on-light">
          Nouvelle entreprise
        </p>
        <h1 className="mt-4 font-geist text-3xl font-bold tracking-[-0.02em] text-public-content sm:text-4xl">
          Créer votre compte
        </h1>
        <p className="mt-3 font-geist text-base text-public-content-muted">
          Commencez gratuitement, sans carte bancaire.
        </p>
      </div>

      {/* Register Form Component */}
      <RegisterForm />

      {/* Link to login */}
      <p className="text-center font-geist text-sm text-public-content-muted">
        Vous avez déjà un compte ?{' '}
        <Link
          href="/login"
          className="font-semibold text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
        >
          Se connecter
        </Link>
      </p>

      {/*
        Info essai gratuit. Filet lime et aplat creme plutot que l'encart
        vert sur fond transparent : la refonte n'utilise aucune opacite sur
        les aplats, et le vert emeraude n'appartient pas a la palette
        publique.
      */}
      <div className="border-l-4 border-public-highlight bg-public-surface p-4">
        <p className="mb-1 font-geist text-xs font-semibold uppercase tracking-[0.12em] text-public-content">
          21 jours d&apos;essai gratuit
        </p>
        <p className="font-geist text-xs leading-relaxed text-public-content-muted">
          Toutes les fonctionnalités incluses, sans carte bancaire. 2,90 € par
          employé par mois après l&apos;essai.
        </p>
      </div>
    </div>
  )
}
