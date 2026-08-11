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
  children: React.ReactNode
}

export function PublicPageShell({
  breadcrumb,
  children,
}: PublicPageShellProps) {
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
        <div className="container-custom pt-28 lg:pt-32">
          <nav aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-public-content-muted">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-[2.75rem] items-center transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
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
                      className="h-4 w-4 shrink-0 opacity-50"
                    />
                    {isLast || !entry.href ? (
                      <span
                        aria-current="page"
                        className="text-public-content"
                      >
                        {entry.label}
                      </span>
                    ) : (
                      <Link
                        href={entry.href}
                        className="inline-flex min-h-[2.75rem] items-center transition-colors hover:text-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent"
                      >
                        {entry.label}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        {children}
      </main>

      <LandingFooter />
    </div>
  )
}
