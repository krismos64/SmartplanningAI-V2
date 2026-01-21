'use client'

/**
 * AuthLayoutClient - Client component for auth layout
 *
 * @description Layout avec design dark, Header/Footer de la landing,
 * animations Framer Motion et background animé.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { AnimatedBackground } from '../(landing)/components'
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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#030712] text-white">
      {/* Background animé */}
      <AnimatedBackground />

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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            {children}
          </div>

          {/* Liens légaux */}
          <p className="mt-6 text-center text-sm text-white/50">
            En continuant, vous acceptez nos{' '}
            <Link
              href="/terms"
              className="text-cyan-400 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
            >
              conditions d&apos;utilisation
            </Link>{' '}
            et notre{' '}
            <Link
              href="/privacy"
              className="text-cyan-400 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
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
