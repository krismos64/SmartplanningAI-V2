/**
 * Login Page - Page de connexion
 *
 * ✅ Source : Next.js 15 + NextAuth patterns (Context7)
 *
 * OBJECTIF (CDA) :
 * Page de connexion pour utilisateurs existants.
 * Formulaire email/password avec validation côté client et serveur.
 *
 * RÉFÉRENCE CDA :
 * - Server Component avec metadata
 * - Form handling moderne (Server Actions - Phase 4)
 * - Validation côté client et serveur
 */

import Link from 'next/link'
import type { Metadata } from 'next'

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

      {/* Formulaire (placeholder pour SP-105) */}
      <form className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="vous@entreprise.com"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Mot de passe
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Se connecter
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-muted-foreground">
            ou continuer avec
          </span>
        </div>
      </div>

      {/* OAuth (prévu pour Phase 4) */}
      <button
        type="button"
        disabled
        className="w-full rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex items-center justify-center gap-2">
          Google (bientôt disponible)
        </span>
      </button>

      {/* Link to register */}
      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Créer un compte
        </Link>
      </p>

      {/* Demo accounts (pour développement) */}
      <div className="rounded-lg border border-dashed border-border bg-secondary/50 p-4">
        <p className="mb-2 text-xs font-medium text-foreground">
          🧪 Comptes de test (Phase 2)
        </p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>Director: john.doe@techcorp.com</p>
          <p>Manager: jane.smith@techcorp.com</p>
          <p>Employee: bob.wilson@techcorp.com</p>
          <p className="mt-2 font-medium">Mot de passe : Password123!</p>
        </div>
      </div>
    </div>
  )
}
