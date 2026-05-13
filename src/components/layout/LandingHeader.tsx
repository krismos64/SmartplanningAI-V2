'use client'

/**
 * LandingHeader Component
 * Navigation header for public pages (landing, auth)
 *
 * @description Header avec logo, navigation et CTA pour pages publiques
 * Réutilisable entre landing page et pages d'authentification
 */

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

// Navigation links for landing page
const navLinks = [
  { href: '/#demo', label: 'Démo' },
  { href: '/#role-demos', label: 'Démos par rôle' },
  { href: '/#features', label: 'Fonctionnalités' },
  { href: '/#how-it-works', label: 'Comment ça marche' },
  { href: '/#benefits', label: 'Avantages' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
  { href: '/a-propos', label: 'À propos' },
]

interface LandingHeaderProps {
  /** Whether the page has been scrolled (for background change) */
  isScrolled?: boolean
  /** Whether to show navigation links (false for auth pages) */
  showNavLinks?: boolean
  /** Whether the header is fixed or static */
  isFixed?: boolean
}

export function LandingHeader({
  isScrolled = false,
  showNavLinks = true,
  isFixed = true,
}: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'left-0 right-0 z-50 transition-all duration-500',
          isFixed ? 'fixed top-8' : 'relative top-0',
          isScrolled || !isFixed
            ? 'border-b border-border/10 bg-background/80 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-[#030712]/80'
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
              <span className="text-xl font-bold tracking-tight text-foreground dark:text-white">
                Smart<span className="text-cyan-400">Planning</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {showNavLinks && (
              <div className="hidden items-center gap-4 lg:flex xl:gap-5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground dark:text-white/70 dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* CTA Buttons + Theme Toggle */}
            <div className="hidden items-center gap-4 lg:flex">
              {/* Theme Toggle (SP-265) */}
              <ThemeToggle className="text-muted-foreground hover:text-foreground dark:text-white/80 dark:hover:text-white" />

              <Button
                variant="ghost"
                className="text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                asChild
              >
                <Link href="/login">Connexion</Link>
              </Button>
              <Button
                className="border-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                asChild
              >
                <Link href="/register">Essai gratuit</Link>
              </Button>
            </div>

            {/* Mobile Menu Button - WCAG 2.5.5: 44px minimum touch target */}
            <button
              className="flex h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent dark:text-white/80 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={
                isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'
              }
              data-testid="landing-mobile-menu-button"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu - Portail dans body pour éviter le stacking context du header */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-background dark:bg-[#030712] lg:hidden"
              >
                {/* Close button - Fixed top right - WCAG 2.5.5: 44px minimum touch target */}
                <motion.button
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute right-4 top-4 z-10 flex h-12 min-h-[44px] w-12 min-w-[44px] touch-manipulation items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-cyan-400/50 hover:bg-cyan-400/20 hover:text-cyan-400 dark:border-white/20 dark:bg-[#030712] dark:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                  data-testid="landing-mobile-menu-close"
                >
                  <X className="h-6 w-6" />
                </motion.button>

                {/* Logo at top center */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3 flex justify-center"
                >
                  <Image
                    src="/images/logo-sp.png"
                    alt="SmartPlanning"
                    width={120}
                    height={78}
                    className="drop-shadow-2xl"
                  />
                </motion.div>

                {/* Menu content centered */}
                <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-6 py-1">
                  {showNavLinks &&
                    navLinks.map((link, index) => (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-[15px] font-medium text-foreground transition-colors hover:text-cyan-400 dark:text-white"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.label}
                      </motion.a>
                    ))}

                  {/* Theme Toggle Mobile */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: showNavLinks ? navLinks.length * 0.05 : 0,
                    }}
                    className="mt-1 flex items-center gap-2"
                  >
                    <span className="text-sm text-muted-foreground dark:text-white/70">
                      Thème
                    </span>
                    <ThemeToggle className="text-foreground dark:text-white" />
                  </motion.div>

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: showNavLinks
                        ? navLinks.length * 0.05 + 0.05
                        : 0.05,
                    }}
                    className="mt-2 flex w-full max-w-xs flex-col gap-2"
                  >
                    <Button
                      size="default"
                      className="h-10 w-full border-2 border-foreground bg-transparent text-sm font-semibold text-foreground hover:bg-foreground hover:text-background dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#030712]"
                      asChild
                    >
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                    </Button>
                    <Button
                      size="default"
                      className="h-10 w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
                      asChild
                    >
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Essai gratuit
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
