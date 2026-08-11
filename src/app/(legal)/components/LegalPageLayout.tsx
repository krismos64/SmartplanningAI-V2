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
import { AnimatedBackground } from '@/app/(landing)/components'
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
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Gestion du scroll pour le header et le bouton scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
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
    <div className="public-scope relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Background animé - Decorative, hidden from screen readers */}
      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      {/* Header with scroll-aware background */}
      <LandingHeader isScrolled={isScrolled} />

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
                    className="rounded-xl border border-border bg-card p-6 backdrop-blur-sm"
                  >
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                              ? 'text-blue-600'
                              : 'text-muted-foreground hover:text-foreground'
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
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-600">
                  {icon}
                  Document légal
                </div>

                {/* Titre */}
                <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {/* Sous-titre */}
                <p className="mb-6 max-w-2xl text-lg text-muted-foreground">
                  {subtitle}
                </p>

                {/* Métadonnées */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/70">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Version {version}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Mis à jour le {lastUpdated}
                  </span>
                </div>
              </motion.div>

              {/* Table des matières mobile */}
              {tableOfContents.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="mb-8 rounded-xl border border-border bg-card p-6 lg:hidden"
                >
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Sommaire
                  </h3>
                  <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tableOfContents
                      .filter((item) => item.level !== 3)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="text-left text-sm text-muted-foreground hover:text-blue-600"
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
          'fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-lg backdrop-blur-sm transition-all hover:border-blue-600/50 hover:bg-blue-600/20 hover:text-blue-600',
          !showScrollTop && 'pointer-events-none'
        )}
        aria-label="Retour en haut"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
