'use client'

/**
 * LegalPageLayout Component
 * Layout réutilisable pour toutes les pages légales (CGU, CGV, Privacy, etc.)
 *
 * @description Fournit une structure cohérente avec la landing page :
 * - Header fixe avec navigation simplifiée
 * - Background animé
 * - Table des matières interactive
 * - Footer standard
 *
 * @see SP-279 à SP-285 - Pages Légales & RGPD
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Calendar, ChevronUp, FileText, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedBackground } from '@/app/(landing)/components'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { fadeInUp, staggerContainer } from '@/app/(landing)/animations'

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
          if (section && section.offsetTop <= scrollPosition) {
            setActiveSection(tableOfContents[i].id)
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
    <div className="min-h-screen overflow-x-hidden bg-[#030712] text-white">
      {/* Background animé */}
      <AnimatedBackground />

      {/* Header simplifié */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          isScrolled
            ? 'border-b border-white/5 bg-[#030712]/90 py-4 backdrop-blur-xl'
            : 'bg-transparent py-6'
        )}
      >
        <div className="container-custom">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-50 blur-lg transition-opacity group-hover:opacity-75" />
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Smart<span className="text-cyan-400">Planning</span>
              </span>
            </Link>

            {/* Retour à l'accueil */}
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Contenu principal */}
      <main className="relative pt-32 pb-20">
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
                    className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
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
                              ? 'text-cyan-400'
                              : 'text-white/60 hover:text-white'
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
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                  {icon}
                  Document légal
                </div>

                {/* Titre */}
                <h1 className="mb-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {/* Sous-titre */}
                <p className="mb-6 max-w-2xl text-lg text-white/60">
                  {subtitle}
                </p>

                {/* Métadonnées */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Version {version}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Mis à jour le {lastUpdated}
                  </span>
                </div>
              </motion.div>

              {/* Table des matières mobile */}
              {tableOfContents.length > 0 && (
                <motion.div
                  variants={fadeInUp}
                  className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6 lg:hidden"
                >
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/50">
                    Sommaire
                  </h3>
                  <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {tableOfContents
                      .filter((item) => item.level !== 3)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className="text-left text-sm text-white/60 hover:text-cyan-400"
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
                className="legal-content prose prose-invert max-w-none"
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
          'fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#030712]/90 text-white/70 shadow-lg backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:bg-cyan-500/20 hover:text-cyan-400',
          !showScrollTop && 'pointer-events-none'
        )}
        aria-label="Retour en haut"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </div>
  )
}
