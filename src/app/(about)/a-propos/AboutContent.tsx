'use client'

/**
 * AboutContent Component
 * Client component with animations for the About page
 *
 * @description Composant principal de la page À propos avec :
 * - Sémantique HTML5 optimisée (article, section, header)
 * - Accessibilité WCAG 2.1 AA (aria-labels, roles, landmarks)
 * - Animations Framer Motion
 * - Structure optimisée pour SEO et LLMs
 */

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, fadeInUp, staggerContainer, scaleIn } from '@/lib/animations'
import { SectionHeader, AnimatedBackground } from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { ValueCard, TargetCard } from '../components'
import { values, targets, mission } from '../data'

export function AboutContent() {
  return (
    <div className="relative min-h-screen bg-[#030712] text-white">
      {/* Background Effects - Decorative, hidden from screen readers */}
      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      {/* Header with skip link target */}
      <LandingHeader />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyan-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <main id="main-content" role="main">
        {/* Hero Section - Article principal */}
        <article
          aria-labelledby="hero-title"
          className="relative flex min-h-[70vh] items-center pb-16 pt-32"
        >
          <div className="container-custom">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Text Content */}
              <motion.header
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="text-center lg:text-left"
              >
                {/* Badge - Decorative */}
                <motion.div
                  variants={fadeInUp}
                  className="mb-6 inline-block"
                  aria-hidden="true"
                >
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
                    <Target className="h-4 w-4" aria-hidden="true" />
                    Notre histoire
                  </span>
                </motion.div>

                {/* Title - H1 unique de la page */}
                <motion.h1
                  id="hero-title"
                  variants={fadeInUp}
                  className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
                >
                  {mission.title}{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {mission.highlight}
                  </span>
                  <br />
                  <span className="text-white/90">{mission.subtitle}</span>
                </motion.h1>

                {/* Description - Paragraphes sémantiques */}
                <motion.p
                  variants={fadeInUp}
                  className="mx-auto max-w-xl text-lg leading-relaxed text-white/60 lg:mx-0"
                >
                  {mission.description}
                </motion.p>

                {/* Solution */}
                <motion.p
                  variants={fadeInUp}
                  className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/60 lg:mx-0"
                >
                  {mission.solution}
                </motion.p>

                {/* CTA avec aria-label descriptif */}
                <motion.div
                  variants={fadeInUp}
                  className="mt-8 flex justify-center gap-4 lg:justify-start"
                >
                  <Button
                    size="lg"
                    className="h-14 border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                    asChild
                  >
                    <Link
                      href="/register"
                      aria-label="Créer un compte SmartPlanning gratuitement"
                    >
                      Essayer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.header>

              {/* Illustration avec figure sémantique */}
              <motion.figure
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="relative flex items-center justify-center"
              >
                {/* Glow Effect - Decorative */}
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
                  aria-hidden="true"
                />

                {/* Manager illustration */}
                <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10">
                  <Image
                    src="/images/manager.png"
                    alt="Manager utilisant le logiciel SmartPlanning sur ordinateur pour organiser les plannings de son équipe dans un bureau moderne"
                    width={500}
                    height={400}
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                </div>
                <figcaption className="sr-only">
                  Illustration d&apos;un manager utilisant SmartPlanning pour
                  gérer les plannings de son équipe
                </figcaption>
              </motion.figure>
            </div>
          </div>
        </article>

        {/* Values Section */}
        <section aria-labelledby="values-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <SectionHeader
              badge="Ce qui nous définit"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  💎
                </span>
              }
              color="cyan"
              title="Nos"
              titleHighlight="valeurs"
              description="Les principes qui guident chaque décision dans la conception de SmartPlanning."
            />
            {/* Hidden h2 for screen readers if SectionHeader doesn't include one */}
            <h2 id="values-title" className="sr-only">
              Nos valeurs : Simplicité, Proximité, Fiabilité
            </h2>

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-3"
              role="list"
              aria-label="Liste des valeurs de SmartPlanning"
            >
              {values.map((value, index) => (
                <li key={value.id}>
                  <ValueCard
                    icon={value.icon}
                    title={value.title}
                    description={value.description}
                    gradient={value.gradient}
                    delay={index * 0.1}
                  />
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* Target Audience Section */}
        <section aria-labelledby="targets-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <SectionHeader
              badge="Pour qui ?"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  🎯
                </span>
              }
              color="purple"
              title="SmartPlanning s'adresse à"
              titleHighlight="toutes les entreprises"
              description="Quelle que soit votre taille ou votre secteur, SmartPlanning s'adapte à vos besoins."
            />
            {/* Hidden h2 for screen readers */}
            <h2 id="targets-title" className="sr-only">
              Public cible : TPE, PME, managers, industrie, santé, commerce
            </h2>

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label="Secteurs d'activité ciblés par SmartPlanning"
            >
              {targets.map((target) => (
                <li key={target.id}>
                  <TargetCard
                    icon={target.icon}
                    title={target.title}
                    description={target.description}
                    color={target.color}
                  />
                </li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-labelledby="cta-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <motion.aside
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 p-12 text-center lg:p-20"
              role="complementary"
              aria-label="Appel à l'action pour essayer SmartPlanning"
            >
              {/* Background glow - Decorative */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <h2
                  id="cta-title"
                  className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
                >
                  Prêt à{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    simplifier
                  </span>{' '}
                  vos plannings ?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
                  Rejoignez les entreprises qui ont choisi SmartPlanning pour
                  gagner du temps et améliorer leur organisation.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button
                    size="lg"
                    className="h-14 border-0 bg-gradient-to-r from-blue-500 to-cyan-400 px-8 text-base text-white shadow-xl shadow-blue-500/25 hover:from-blue-600 hover:to-cyan-500"
                    asChild
                  >
                    <Link
                      href="/register"
                      aria-label="Créer un compte et démarrer gratuitement avec SmartPlanning"
                    >
                      Démarrer gratuitement
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/10"
                    asChild
                  >
                    <Link
                      href="/#features"
                      aria-label="Voir toutes les fonctionnalités de SmartPlanning"
                    >
                      Découvrir les fonctionnalités
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  )
}
