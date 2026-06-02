'use client'

/**
 * AuthLayoutClient - Client component for auth layout
 *
 * @description Layout réutilisant les composants landing avec :
 * - TopBanner animé
 * - Header/Footer de la landing
 * - Animations Framer Motion
 * - Background animé
 * - Support light/dark mode via CSS variables
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { AnimatedBackground, TopBanner } from '../(landing)/components'
import { motion, fadeInUp } from '@/lib/animations'

interface AuthLayoutClientProps {
  children: React.ReactNode
}

export function AuthLayoutClient({ children }: AuthLayoutClientProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      {/* Top Banner - Animated marquee */}
      <TopBanner />

      {/* Background animé - Decorative */}
      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      {/* Header - sans navigation links pour les pages auth */}
      <LandingHeader isScrolled={isScrolled} showNavLinks={false} />

      {/* Main Content - Centré avec espace pour le header fixe */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-32">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="w-full max-w-md"
        >
          {/* Card glassmorphism */}
          <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
            {children}
          </div>

          {/* Liens légaux */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            En continuant, vous acceptez nos{' '}
            <Link
              href="/cgu"
              className="text-blue-600 underline-offset-4 transition-colors hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link
              href="/confidentialite"
              className="text-blue-600 underline-offset-4 transition-colors hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              politique de confidentialité
            </Link>
            .
          </p>
        </motion.div>
      </main>

      {/* Footer de la landing */}
      <LandingFooter />
    </div>
  )
}
