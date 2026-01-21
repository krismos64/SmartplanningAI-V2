'use client'

/**
 * LandingHeader Component
 * Navigation header for public pages (landing, auth)
 *
 * @description Header avec logo, navigation et CTA pour pages publiques
 * Réutilisable entre landing page et pages d'authentification
 */

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Navigation links for landing page
const navLinks = [
  { href: '/#demo', label: 'Démo' },
  { href: '/#features', label: 'Fonctionnalités' },
  { href: '/#how-it-works', label: 'Comment ça marche' },
  { href: '/#benefits', label: 'Avantages' },
  { href: '/#pricing', label: 'Tarifs' },
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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'left-0 right-0 z-50 transition-all duration-500',
        isFixed ? 'fixed top-8' : 'relative top-0',
        isScrolled || !isFixed
          ? 'border-b border-white/5 bg-[#030712]/80 py-4 backdrop-blur-xl'
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

          {/* Desktop Navigation */}
          {showNavLinks && (
            <div className="hidden items-center gap-4 lg:flex xl:gap-5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="hidden items-center gap-4 lg:flex">
            <Button
              variant="ghost"
              className="text-white/80 hover:bg-white/10 hover:text-white"
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

          {/* Mobile Menu Button */}
          <button
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu - Fullscreen overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[100] flex flex-col bg-[#030712] lg:hidden"
              style={{ backgroundColor: '#030712' }}
            >
              {/* Close button - Fixed top right */}
              <motion.button
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute right-4 top-4 z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#030712] text-white transition-all hover:border-cyan-400/50 hover:bg-cyan-400/20 hover:text-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" />
              </motion.button>

              {/* Logo at top center */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-6 flex justify-center"
              >
                <Image
                  src="/images/logo-sp.png"
                  alt="SmartPlanning"
                  width={200}
                  height={130}
                  className="drop-shadow-2xl"
                />
              </motion.div>

              {/* Menu content centered */}
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-4">
                {showNavLinks &&
                  navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-lg font-medium text-white transition-colors hover:text-cyan-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </motion.a>
                  ))}

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: showNavLinks ? navLinks.length * 0.05 : 0,
                  }}
                  className="mt-4 flex w-full max-w-xs flex-col gap-3"
                >
                  <Button
                    size="default"
                    className="h-12 w-full border-2 border-white bg-transparent text-sm font-semibold text-white hover:bg-white hover:text-[#030712]"
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
                    className="h-12 w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-semibold text-white shadow-lg shadow-blue-500/25"
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
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
