'use client'

/**
 * LegalPageLayout Component
 * Layout réutilisable pour toutes les pages légales (CGU, CGV, Privacy, etc.)
 *
 * @description Fournit une structure cohérente avec la landing page :
 * - Header fixe avec navigation (LandingHeader)
 * - Background animé
 * - Table des matières interactive
 * - Footer standard
 * - Support light/dark mode via CSS variables
 *
 * @see SP-279 à SP-285 - Pages Légales & RGPD
 */

import { useState, useEffect } from 'react'
import { ChevronUp, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'

// Types pour la table des matières
export interface TableOfContentsItem {
  id: string
  title: string
  level?: 1 | 2 | 3
}

interface LegalPageLayoutProps {
  /** Titre de la page */
  title: string
  /** Sous-titre ou description courte */
  subtitle: string
  /** Date de dernière mise à jour */
  lastUpdated: string
  /** Version du document */
  version?: string
  /** Icône à afficher (optionnel) */
  icon?: React.ReactNode
  /** Table des matières */
  tableOfContents?: TableOfContentsItem[]
  /** Contenu de la page */
  children: React.ReactNode
}

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  version = '1.0',
  icon = <FileText className="h-6 w-6" />,
  tableOfContents = [],
  children,
}: LegalPageLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Bouton scroll-to-top et detection de la section active
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500)

      // Détection de la section active
      if (tableOfContents.length > 0) {
        const sections = tableOfContents.map((item) =>
          document.getElementById(item.id)
        )
        const scrollPosition = window.scrollY + 150

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i]
          const tocItem = tableOfContents[i]
          if (section && tocItem && section.offsetTop <= scrollPosition) {
            setActiveSection(tocItem.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [tableOfContents])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: 'smooth' })
    }
  }

  return (
    <div className="public-scope relative min-h-screen overflow-x-hidden bg-public-surface font-geist text-public-content">
      {/* Header with scroll-aware background */}
      <LandingHeader />

      {/* Contenu principal */}
      <main className="relative pb-20 pt-24">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            {/* Sidebar - Table des matières (desktop) */}
            {tableOfContents.length > 0 && (
              <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
                <div className="sticky top-32">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="border border-public-border bg-public-surface-subtle p-6 backdrop-blur-sm"
                  >
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-public-content-muted">
                      Sommaire
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={cn(
                            'block w-full text-left text-sm transition-colors',
                            item.level === 2 && 'pl-4',
                            item.level === 3 && 'pl-8',
                            activeSection === item.id
                              ? 'font-semibold text-public-content'
                              : 'text-public-content-muted hover:text-public-content'
                          )}
                        >
                          {item.title}
                        </button>
                      ))}
                    </nav>
                  </motion.div>
                </div>
              </aside>
            )}

            {/* Contenu */}
            <motion.article
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="min-w-0 flex-1"
            >
              {/* En-tête du document */}
              <motion.div variants={fadeInUp} className="mb-12">
                {/* Badge avec icône */}
                <div className="mb-6 inline-flex items-center gap-2 border-l-4 border-public-accent bg-public-surface-subtle px-4 py-2 font-geist text-sm font-medium text-public-content">
                  {icon}
                  Document légal
                </div>

                {/* Titre */}
                <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {/* Sous-titre */}
                <p className="mb-6 max-w-2xl text-lg text-public-content-muted">
                  {subtitle}
                </p>

                {/* Métadonnées */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-public-content-muted">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-public-accent" />
                    Version {version}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-public-highlight" />
                    Mis à jour le {lastUpdated}
                  </span>
                </div>
              </motion.div>

              {/* Table des matières mobile */}
              {tableOfContents.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="mb-8 border border-public-border bg-public-surface-subtle p-6 lg:hidden"
                >
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-public-content-muted">
                    Sommaire
                  </h3>
                  <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tableOfContents
                      .filter((item) => item.level !== 3)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="text-left text-sm text-public-content-muted hover:text-public-content"
                        >
                          {item.title}
                        </button>
                      ))}
                  </nav>
                </motion.div>
              )}

              {/* Contenu du document */}
              <motion.div
                variants={fadeInUp}
                className="legal-content prose prose-neutral max-w-none"
              >
                {children}
              </motion.div>
            </motion.article>
          </div>
        </div>
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* Bouton scroll to top */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: showScrollTop ? 1 : 0 }}
        onClick={scrollToTop}
        className={cn(
          // Aplat franc et angles vifs : le bouton portait un fond
          // translucide avec flou et un survol bleu, d'avant la refonte.
          // WCAG 2.5.5 : 48 px, au-dessus du minimum de 44.
          'fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center bg-public-surface-dark text-public-content-on-dark transition-colors hover:bg-public-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2',
          !showScrollTop && 'pointer-events-none'
        )}
        aria-label="Retour en haut"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
