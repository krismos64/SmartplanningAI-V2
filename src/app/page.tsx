/**
 * Landing Page - Page d'accueil publique
 *
 * ✅ Source : Next.js 15 App Router best practices (Context7)
 *
 * OBJECTIF (CDA) :
 * Page d'accueil accessible à tous (visiteurs non connectés).
 * Point d'entrée de l'application avant authentification.
 *
 * FONCTIONNALITÉS PRÉVUES :
 * - Hero section avec call-to-action
 * - Présentation des fonctionnalités
 * - Plans tarifaires (FREE, STARTER, BUSINESS, ENTERPRISE)
 * - Footer avec liens
 *
 * RÉFÉRENCE CDA :
 * - React Server Component (pas de "use client")
 * - Metadata export pour SEO
 * - Optimisation Next.js (fonts, images)
 */

import Link from 'next/link'
import type { Metadata } from 'next'

/**
 * Metadata SEO spécifique à la page d'accueil
 *
 * Surcharge les metadata du RootLayout pour cette page
 */
export const metadata: Metadata = {
  title: 'Accueil - Gérez vos plannings intelligemment',
  description:
    'SmartPlanning est la solution SaaS pour optimiser la gestion de vos équipes. Plans gratuits et premium disponibles. Essayez dès maintenant !',
  openGraph: {
    title: 'SmartPlanning - Accueil',
    description:
      'Solution SaaS de gestion de plannings. Essai gratuit sans carte bancaire.',
  },
}

/**
 * Home Component - Landing Page
 *
 * Page d'accueil publique (non authentifiée)
 * Server Component par défaut
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ===================================================================
          HEADER / NAVIGATION
          =================================================================== */}
      <header className="border-b bg-white">
        <div className="container-custom flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            SmartPlanning
          </Link>

          {/* Navigation principale */}
          <nav className="hidden md:flex md:gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Tarifs
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              À propos
            </Link>
          </nav>

          {/* CTA Authentification */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================================
          HERO SECTION
          =================================================================== */}
      <main className="flex-1">
        <section className="container-custom py-20 text-center md:py-32">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Gérez vos plannings{' '}
            <span className="text-primary">intelligemment</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            SmartPlanning simplifie la gestion de vos équipes. Plannings,
            congés, shifts : tout en un seul endroit. Essai gratuit, sans carte
            bancaire.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-border bg-white px-8 py-3 text-base font-medium text-foreground hover:bg-secondary"
            >
              Démo en direct
            </Link>
          </div>
        </section>

        {/* ===================================================================
            FEATURES SECTION (Placeholder)
            =================================================================== */}
        <section id="features" className="border-t bg-secondary/50 py-20">
          <div className="container-custom">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
              Fonctionnalités principales
            </h2>
            <div className="grid-auto">
              <div className="card-base">
                <h3 className="mb-2 text-xl font-semibold">
                  Plannings intelligents
                </h3>
                <p className="text-muted-foreground">
                  Créez et gérez les plannings de vos équipes en quelques clics.
                </p>
              </div>
              <div className="card-base">
                <h3 className="mb-2 text-xl font-semibold">Gestion des congés</h3>
                <p className="text-muted-foreground">
                  Demandes, validations et suivi des congés simplifiés.
                </p>
              </div>
              <div className="card-base">
                <h3 className="mb-2 text-xl font-semibold">Multi-tenant</h3>
                <p className="text-muted-foreground">
                  Isolation complète des données par organisation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================
            PRICING SECTION (Placeholder)
            =================================================================== */}
        <section id="pricing" className="py-20">
          <div className="container-custom">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-foreground">
              Plans tarifaires
            </h2>
            <p className="mb-8 text-center text-muted-foreground">
              Choisissez le plan adapté à votre organisation
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="card-base">
                <h3 className="mb-2 text-xl font-bold">FREE</h3>
                <p className="mb-4 text-3xl font-bold">0€</p>
                <p className="text-sm text-muted-foreground">
                  Jusqu&apos;à 5 employés
                </p>
              </div>
              <div className="card-base border-primary">
                <h3 className="mb-2 text-xl font-bold text-primary">
                  BUSINESS
                </h3>
                <p className="mb-4 text-3xl font-bold">99€/mois</p>
                <p className="text-sm text-muted-foreground">
                  Jusqu&apos;à 50 employés
                </p>
              </div>
              <div className="card-base">
                <h3 className="mb-2 text-xl font-bold">ENTERPRISE</h3>
                <p className="mb-4 text-3xl font-bold">299€/mois</p>
                <p className="text-sm text-muted-foreground">Employés illimités</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ===================================================================
          FOOTER
          =================================================================== */}
      <footer className="border-t bg-secondary/50 py-8">
        <div className="container-custom text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SmartPlanning. Projet CDA - Christophe
            Dev.
          </p>
        </div>
      </footer>
    </div>
  )
}
