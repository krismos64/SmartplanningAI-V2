/**
 * Auth Layout - Layout pour les pages d'authentification
 *
 * ✅ Source : Next.js 15 Route Groups + Authentication patterns (Context7)
 *
 * OBJECTIF (CDA) :
 * Layout dédié aux pages d'authentification (login, register).
 * Utilise les Route Groups (auth) pour isoler ces pages du reste de l'app.
 *
 * AVANTAGES ROUTE GROUPS :
 * - URL propres : /login et /register (pas de /auth/login)
 * - Layout personnalisé sans affecter les autres pages
 * - Organisation claire du code
 *
 * FONCTIONNALITÉS :
 * - Design centré et minimaliste
 * - Logo SmartPlanning
 * - Footer simple
 * - Responsive mobile-first
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 Route Groups : (folder)
 * - Pattern recommandé pour auth flows
 * - Server Component (pas de "use client")
 */

import Link from 'next/link'
import type { Metadata } from 'next'

/**
 * Metadata pour les pages d'authentification
 *
 * Ces metadata sont partagées par login et register,
 * mais peuvent être surchargées individuellement
 */
export const metadata: Metadata = {
  title: 'Authentification',
  robots: {
    index: false, // Pages auth non indexées par Google
    follow: false,
  },
}

/**
 * AuthLayout Component
 *
 * Layout simple et centré pour les formulaires d'authentification
 *
 * ARCHITECTURE (CDA) :
 * - Header minimal avec logo
 * - Contenu centré verticalement et horizontalement
 * - Footer discret
 *
 * @param children - Pages login ou register
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ===================================================================
          HEADER MINIMAL
          =================================================================== */}
      <header className="border-b bg-white">
        <div className="container-custom flex h-16 items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            SmartPlanning
          </Link>
        </div>
      </header>

      {/* ===================================================================
          MAIN CONTENT - Centré verticalement
          =================================================================== */}
      <main className="flex flex-1 items-center justify-center bg-secondary/30 px-4 py-12">
        <div className="w-full max-w-md">
          {/*
            Card blanche contenant le formulaire
            - Ombre légère pour effet de profondeur
            - Padding généreux
            - Border radius moderne
          */}
          <div className="rounded-xl border bg-white p-8 shadow-sm">
            {children}
          </div>

          {/*
            Liens utiles sous le formulaire
            Exemple : "Déjà un compte ?" sous le register
          */}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            En continuant, vous acceptez nos{' '}
            <Link href="/terms" className="underline hover:text-primary">
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </main>

      {/* ===================================================================
          FOOTER MINIMALISTE
          =================================================================== */}
      <footer className="border-t bg-white py-6">
        <div className="container-custom text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} SmartPlanning. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
