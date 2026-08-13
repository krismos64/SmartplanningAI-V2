/**
 * PublicPageShell - Ossature commune des pages de contenu publiques
 *
 * Regroupe ce que les pages secteur, guide et leurs hubs repetaient a
 * l'identique : le scope de theme, le lien d'evitement, le header, le fil
 * d'Ariane et le pied de page.
 *
 * Server Component : aucune interactivite propre.
 *
 * @see SP-570 - Pages secteur et guides
 * @see SP-575 - Fil d'Ariane pose dans le hero
 */

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'

export interface BreadcrumbEntry {
  label: string
  /** Absent sur le dernier maillon, qui porte `aria-current="page"` */
  href?: string
}

interface PublicPageShellProps {
  /**
   * Fil d'Ariane, sans l'accueil qui est ajoute automatiquement.
   * Le dernier element est rendu comme page courante.
   */
  breadcrumb: BreadcrumbEntry[]
  /**
   * Fond sur lequel le fil d'Ariane se pose, quand la page n'ouvre pas sur
   * un hero bleu nuit. Les sept pages de contenu le font toutes, d'ou le
   * defaut.
   */
  breadcrumbTone?: 'onDark' | 'onLight'
  children: React.ReactNode
}

export function PublicPageShell({
  breadcrumb,
  breadcrumbTone = 'onDark',
  children,
}: PublicPageShellProps) {
  const onDark = breadcrumbTone === 'onDark'
  return (
    <div className="public-scope min-h-screen bg-public-surface font-geist text-public-content">
      {/*
        Lien d'evitement, WCAG 2.4.1. Place avant le header pour etre la
        premiere cible de tabulation.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-public-surface-dark focus:px-4 focus:py-3 focus:text-public-content-on-dark"
      >
        Aller au contenu principal
      </a>

      <LandingHeader />

      <main id="main-content">
        {/*
          Fil d'Ariane pose dans le hero et non dans une bande a lui.

          Il occupait auparavant une bande creme de 112 px de retrait au
          dessus du hero, ou il flottait seul : beaucoup de place pour une
          ligne de 14 px, et un gris sans rapport avec la palette. Le
          prototype n'en porte aucun, mais le supprimer couterait le
          `BreadcrumbList` que Google affiche sous les resultats.

          Il continue donc la ou la page commence, dans l'aplat bleu nuit,
          en lime et en petites capitales. Le retrait bas est nul : c'est
          la section suivante qui porte son propre `py`, sinon le hero
          gagnait un blanc en tete.
        */}
        <nav
          aria-label="Fil d'Ariane"
          className={
            onDark
              ? 'bg-public-surface-dark pt-[6rem] lg:pt-[6.5rem]'
              : 'bg-public-surface pt-[6rem] lg:pt-[6.5rem]'
          }
        >
          <ol className="container-custom flex flex-wrap items-center gap-x-2 font-geist text-[0.6875rem] uppercase tracking-[0.14em]">
            <li>
              <Link
                href="/"
                className={
                  onDark
                    ? 'inline-flex min-h-[2.75rem] items-center text-public-content-on-dark/70 transition-colors hover:text-public-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight'
                    : 'inline-flex min-h-[2.75rem] items-center text-public-content-muted transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent'
                }
              >
                Accueil
              </Link>
            </li>
            {breadcrumb.map((entry, index) => {
              const isLast = index === breadcrumb.length - 1
              return (
                <li key={entry.label} className="flex items-center gap-2">
                  <ChevronRight
                    aria-hidden="true"
                    className={
                      onDark
                        ? 'h-3 w-3 shrink-0 text-public-accent-on-dark'
                        : 'h-3 w-3 shrink-0 text-public-accent'
                    }
                  />
                  {isLast || !entry.href ? (
                    <span
                      aria-current="page"
                      className={
                        onDark
                          ? 'font-semibold text-public-highlight'
                          : 'font-semibold text-public-accent'
                      }
                    >
                      {entry.label}
                    </span>
                  ) : (
                    <Link
                      href={entry.href}
                      className={
                        onDark
                          ? 'inline-flex min-h-[2.75rem] items-center text-public-content-on-dark/70 transition-colors hover:text-public-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-highlight'
                          : 'inline-flex min-h-[2.75rem] items-center text-public-content-muted transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent'
                      }
                    >
                      {entry.label}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        {children}
      </main>

      <LandingFooter />
    </div>
  )
}
