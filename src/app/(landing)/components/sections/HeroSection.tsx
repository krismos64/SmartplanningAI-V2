'use client'

/**
 * HeroSection Component
 * Main hero section with headline, CTA, and illustration
 */

import { Button } from '@/components/ui/button'
import {
  fadeInUp,
  motion,
  scaleIn,
  staggerContainer,
  useScroll,
  useTransform,
} from '@/lib/animations'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { ScrollIndicator } from '../index'

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
            <div className="absolute inset-0 rounded-3xl bg-blue-600/10 dark:bg-blue-400/10 blur-3xl" />

            {/* Welcome Image (static, no infinite float) */}
            <div className="relative w-full max-w-sm md:max-w-lg lg:max-w-2xl">
              <Image
                src="/images/logo-smartplanning.webp"
                alt="Bienvenue sur SmartPlanning - Illustration avec personnage et robot IA"
                width={500}
                height={400}
                className="relative z-10 h-auto w-full drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>

          {/* Text Content - Second on mobile, first on desktop */}
          <motion.div
            variants={staggerContainer}
            initial={false}
            animate="visible"
            className="text-center lg:order-1 lg:text-left"
          >
            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="mb-6 text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Planifiez{' '}
              <span className="relative">
                <span className="relative z-10 text-blue-600 dark:text-blue-400">
                  intelligemment
                </span>
                <span className="absolute bottom-2 left-0 h-3 w-full -rotate-1 bg-blue-600/20 dark:bg-blue-400/20" />
              </span>
              <br />
              votre équipe
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl lg:mx-0"
            >
              Plannings, congés, messagerie interne et imports CSV : tout en un.
              La solution SaaS française pour simplifier la gestion de vos
              équipes.
            </motion.p>

            {/* CTA Buttons - Desktop only (inside text block) */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 hidden gap-4 sm:flex sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="h-14 bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
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
              className="h-14 w-full bg-blue-600 px-8 text-base font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              asChild
            >
              <Link href="/register">
                Démarrer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Centered Logo at bottom of Hero - apparition au scroll, pas de boucle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className="mt-16 flex justify-center lg:mt-24"
        >
          <motion.div className="relative" whileHover={{ scale: 1.05 }}>
            {/* Glow effect statique */}
            <div className="absolute inset-0 rounded-3xl bg-blue-600/15 blur-3xl dark:bg-blue-400/15" />
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
