'use client'

/**
 * HeroSection Component
 * Main hero section with headline, CTA, and illustration
 */

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  motion,
  useScroll,
  useTransform,
  fadeInUp,
  staggerContainer,
  scaleIn,
  floatAnimationValue,
  floatTransition,
  glowPulse,
  glowPulseTransition,
} from '@/lib/animations'
import { ScrollIndicator, FloatingCheck, FloatingBell } from '../index'

export function HeroSection() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // More gradual fade out - starts later and ends later for smoother transition
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [1, 1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.98])
  const heroY = useTransform(scrollYProgress, [0, 0.8], [0, 50])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center pb-20 pt-40"
    >
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="container-custom"
      >
        {/* Mobile: flex column (image → text → buttons) | Desktop: grid 2 cols */}
        <div className="flex flex-col items-center gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Image - First on mobile, second on desktop */}
          <motion.div
            variants={scaleIn}
            initial={false}
            animate="visible"
            className="relative flex items-center justify-center lg:order-2"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl" />

            {/* Welcome Image */}
            <motion.div
              animate={floatAnimationValue}
              transition={floatTransition}
              className="relative"
            >
              <Image
                src="/images/logo-smartplanning.webp"
                alt="Bienvenue sur SmartPlanning - Illustration avec personnage et robot IA"
                width={500}
                height={400}
                className="relative z-10 drop-shadow-2xl"
                priority
              />
            </motion.div>

            {/* Floating Elements */}
            <FloatingCheck />
            <FloatingBell />
          </motion.div>

          {/* Text Content - Second on mobile, first on desktop */}
          <motion.div
            variants={staggerContainer}
            initial={false}
            animate="visible"
            className="text-center lg:order-1 lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6 inline-block">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
                </span>
                Nouvelle version disponible
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Planifiez{' '}
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  intelligemment
                </span>
                <span className="absolute bottom-2 left-0 h-3 w-full -rotate-1 bg-gradient-to-r from-blue-500/30 to-cyan-500/30" />
              </span>
              <br />
              votre équipe
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0"
            >
              La solution SaaS qui révolutionne la gestion des plannings
              d&apos;entreprise. Automatisez, optimisez et simplifiez votre
              organisation.
            </motion.p>

            {/* CTA Buttons - Desktop only (inside text block) */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 hidden gap-4 sm:flex sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="h-14 border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                asChild
              >
                <Link href="/register">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* CTA Button - Mobile only (after text) */}
          <motion.div
            variants={fadeInUp}
            initial={false}
            animate="visible"
            className="flex w-full flex-col gap-4 px-4 sm:hidden"
          >
            <Button
              size="lg"
              className="h-14 w-full border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
              asChild
            >
              <Link href="/register">
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Centered Logo at bottom of Hero */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mt-16 flex justify-center lg:mt-24"
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-purple-500/30 blur-3xl"
              animate={glowPulse}
              transition={glowPulseTransition}
            />
            <Image
              src="/images/logo-sp.png"
              alt="SmartPlanning"
              width={220}
              height={140}
              className="relative z-10 drop-shadow-2xl"
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  )
}
