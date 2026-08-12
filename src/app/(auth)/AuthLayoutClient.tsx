'use client'

/**
 * AuthLayoutClient - Ossature des pages d'authentification
 *
 * Reprend l'identite publique (SP-574) : `/login` et `/register` sont la
 * derniere etape avant conversion, atteintes depuis le site public. Elles
 * gardaient l'habillage d'avant la refonte, fond bleute, carte blanche
 * arrondie et ombres portees, sous un header et un footer deja refondus.
 * La rupture etait visible dans le meme ecran.
 *
 * Porte `.public-scope` : le `ThemeProvider` reste monte au layout racine,
 * sans cette classe la page suit le theme de l'application et vire au sombre
 * chez un utilisateur qui l'a choisi.
 *
 * Le fond anime a ete retire : il appartenait a l'ancienne direction, et la
 * refonte publique ne l'utilise nulle part.
 *
 * @see SP-574 - Reprise de login et register
 */

import Link from 'next/link'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'

interface AuthLayoutClientProps {
  children: React.ReactNode
}

export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  return (
    <div className="public-scope relative flex min-h-screen flex-col overflow-x-hidden bg-public-surface font-geist text-public-content">
      {/* Header, sans les liens de navigation sur les pages auth */}
      <LandingHeader showNavLinks={false} />

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {/*
            Filet accent en tete et angles vifs, comme le bloc formulaire de
            la page contact. Pas de glassmorphism ni d'ombre portee : la
            refonte pose des aplats francs.
          */}
          <div className="border-t-2 border-public-accent bg-public-surface-subtle p-8">
            {children}
          </div>

          <p className="mt-6 text-center font-geist text-sm text-public-content-muted">
            En continuant, vous acceptez nos{' '}
            <Link
              href="/cgu"
              className="text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
            >
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link
              href="/confidentialite"
              className="text-public-content underline underline-offset-4 transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
