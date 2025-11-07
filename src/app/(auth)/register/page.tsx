/**
 * Register Page - Page d'inscription
 *
 * ✅ Source : Next.js 15 + NextAuth patterns (Context7)
 *
 * OBJECTIF (CDA) :
 * Page d'inscription pour nouveaux utilisateurs et organisations.
 * Crée à la fois un compte utilisateur ET une organisation.
 *
 * RÉFÉRENCE CDA :
 * - Server Component avec metadata
 * - Form handling avec Server Actions (Phase 4)
 * - Validation Zod côté serveur
 */

import Link from 'next/link'
import type { Metadata } from 'next'

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

      {/* Formulaire (placeholder pour SP-105) */}
      <form className="space-y-4">
        {/* Nom */}
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-foreground"
          >
            Nom complet
          </label>
          <input
            id="name"
            type="text"
            placeholder="Jean Dupont"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email professionnel
          </label>
          <input
            id="email"
            type="email"
            placeholder="jean@entreprise.com"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Company Name */}
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-medium text-foreground"
          >
            Nom de votre organisation
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="Mon Entreprise SAS"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 8 caractères, 1 majuscule, 1 chiffre
          </p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-input bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground">
            J&apos;accepte les{' '}
            <Link href="/terms" className="text-primary hover:underline">
              conditions d&apos;utilisation
            </Link>{' '}
            et la{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              politique de confidentialité
            </Link>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Créer mon compte
        </button>
      </form>

      {/* Link to login */}
      <p className="text-center text-sm text-muted-foreground">
        Vous avez déjà un compte ?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Se connecter
        </Link>
      </p>

      {/* Info plan FREE */}
      <div className="rounded-lg border border-border bg-secondary/50 p-4">
        <p className="mb-1 text-xs font-medium text-foreground">
          ✨ Plan FREE inclus
        </p>
        <p className="text-xs text-muted-foreground">
          Jusqu&apos;à 5 employés, fonctionnalités complètes, sans limite de
          temps. Pas de carte bancaire requise.
        </p>
      </div>
    </div>
  )
}
