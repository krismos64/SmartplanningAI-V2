'use client'

/**
 * AuthLayoutClient - Ossature des pages d'authentification
 *
 * Reprend la mise en page du prototype (SP-574) : ecran scinde en deux
 * moities egales, panneau bleu nuit editorial a gauche, panneau creme a
 * droite portant la carte du formulaire.
 *
 * Valeurs relevees sur le prototype plutot que devinees : grille 50/50,
 * carte creme avec une ombre corail decalee de 15 px et 17 px **sans flou**,
 * angles a 2 px, bouton lime a texte bleu nuit.
 *
 * Porte `.public-scope` : le `ThemeProvider` reste monte au layout racine,
 * sans cette classe la page suit le theme de l'application et vire au sombre
 * chez un utilisateur qui l'a choisi.
 *
 * Le panneau de gauche est fourni par `AuthSidePanel`, son contenu differant
 * entre connexion et inscription. Il est masque sous `lg` : sur mobile le
 * formulaire occupe tout l'ecran, comme sur le prototype.
 *
 * @see SP-574 - Reprise de login et register
 */

import Image from 'next/image'
import Link from 'next/link'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { AuthSidePanel } from './AuthSidePanel'

interface AuthLayoutClientProps {
  children: React.ReactNode
}

export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  return (
    <div className="public-scope flex min-h-screen flex-col overflow-x-hidden bg-public-surface font-geist text-public-content">
      <LandingHeader showNavLinks={false} />

      {/*
        Le header est fixe et n'a pas de hauteur figee, `py-4` plus son
        contenu. `pt-24 lg:pt-28` reprend la compensation de
        `PublicPageShell` plutot qu'une valeur mesuree au pixel, qui casserait
        au premier changement de padding du header.
      */}
      <main className="flex-1 pt-24 lg:pt-28">
        <div className="grid lg:grid-cols-2">
          {/*
            Panneau editorial. Rendu par le layout mais alimente par la page,
            via le contexte porte dans `AuthSidePanel`.
          */}
          <AuthSidePanel />

          {/*
            Panneau formulaire.

            Aligne en haut et non centre verticalement (SP-575) : la carte
            se centrait dans une colonne dont la hauteur vient du plus haut
            des deux panneaux, donc elle descendait de 37 px sur /login, ou
            le formulaire est court. Les deux moities ne pouvaient pas
            s'aligner tant que l'une se centrait et l'autre non.
          */}
          <div className="flex items-start justify-center bg-public-surface-subtle px-4 py-16 lg:px-12 lg:py-24">
            <div className="w-full max-w-lg">
              {/*
                Ombre corail portee sans flou, decalee de 15 px et 17 px. Un
                `box-shadow` plein plutot qu'un aplat en position absolue :
                il suit la hauteur de la carte sans calcul.
              */}
              <div className="bg-public-surface p-8 shadow-[15px_17px_0_0_hsl(var(--public-accent-on-dark))] sm:p-11">
                {children}
              </div>

              <p className="mt-8 text-center font-geist text-sm text-public-content-muted">
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
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}

/**
 * Marque affichee dans le panneau editorial, sur fond sombre.
 *
 * Le header porte deja la marque, mais le prototype la repete dans le
 * panneau : sur grand ecran, la moitie sombre se lit comme une page a part.
 */
export function AuthBrand() {
  return (
    <Link
      href="/"
      aria-label="SmartPlanning, retour à l'accueil"
      className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-public-surface-dark"
    >
      <Image
        src="/images/logo-sp.png"
        alt=""
        width={34}
        height={34}
        className="h-[34px] w-[34px]"
      />
      <span className="font-geist text-lg font-bold text-public-content-on-dark">
        Smart<span className="text-public-accent-on-dark">Planning</span>
      </span>
    </Link>
  )
}
