'use client'

/**
 * SectorContent Component
 * Template réutilisable des pages secteur /solutions/[slug]
 *
 * @description Structure GEO commune à tous les secteurs :
 * - Hero avec H1 requête-cible et réponse directe citable (100 premiers mots)
 * - Défis métier du secteur (cards)
 * - Réponses produit (fonctionnalités mappées au secteur)
 * - Exemple de prix contextualisé (per-seat)
 * - FAQ secteur (alimentée aussi dans le JSON-LD FAQPage)
 * - CTA essai gratuit
 * Sémantique HTML5 + WCAG 2.1 AA, contenu 100 % rendu côté serveur.
 *
 * @ticket SP-552
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock,
  FileDown,
  HardHat,
  MapPin,
  MessagesSquare,
  Scale,
  Smartphone,
  Store,
  Sun,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import {
  SectionHeader,
  AnimatedBackground,
  FAQItem,
  PRIMARY_BUTTON_CLASSES,
  HIGHLIGHT_TEXT_CLASSES,
} from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import {
  PRICING,
  calculateMonthlyPrice,
  formatPrice,
} from '@/lib/config/pricing'
import type { SectorData, SectorIconName } from '../data'

const SECTOR_ICONS: Record<SectorIconName, LucideIcon> = {
  clock: Clock,
  users: Users,
  alert: AlertTriangle,
  scale: Scale,
  calendar: CalendarDays,
  smartphone: Smartphone,
  bell: Bell,
  message: MessagesSquare,
  'file-down': FileDown,
  'user-plus': UserPlus,
  store: Store,
  sun: Sun,
  'hard-hat': HardHat,
  'map-pin': MapPin,
}

interface SectorContentProps {
  sector: SectorData
}

export function SectorContent({ sector }: SectorContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const monthlyPrice = calculateMonthlyPrice(sector.pricingExample.headcount)

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Background Effects - Decorative, hidden from screen readers */}
      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      {/* Header with scroll-aware background */}
      <LandingHeader isScrolled={isScrolled} />

      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <main id="main-content" role="main">
        {/* Hero Section */}
        <article
          aria-labelledby="hero-title"
          className="relative pb-16 pt-28 lg:pt-32"
        >
          <div className="container-custom">
            {/* Fil d'Ariane */}
            <nav aria-label="Fil d'Ariane" className="mb-8">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground"
                  >
                    Accueil
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li aria-current="page" className="text-foreground">
                  {sector.name}
                </li>
              </ol>
            </nav>

            <motion.header
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-3xl text-center"
            >
              {/* Badge - Decorative */}
              <motion.div
                variants={fadeInUp}
                className="mb-6 inline-block"
                aria-hidden="true"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:border-blue-500/20 dark:text-blue-400">
                  <Store className="h-4 w-4" aria-hidden="true" />
                  {sector.badge}
                </span>
              </motion.div>

              {/* Title - H1 unique de la page */}
              <motion.h1
                id="hero-title"
                variants={fadeInUp}
                className="mb-6 text-4xl font-bold leading-tight sm:text-5xl"
              >
                {sector.h1}{' '}
                <span className={HIGHLIGHT_TEXT_CLASSES}>
                  {sector.h1Highlight}
                </span>
              </motion.h1>

              {/* Réponse directe (GEO) : la réponse à la requête, citable */}
              <motion.p
                variants={fadeInUp}
                className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
              >
                {sector.directAnswer}
              </motion.p>

              {/* CTA */}
              <motion.div
                variants={fadeInUp}
                className="mt-8 flex flex-col justify-center gap-4 sm:flex-row"
              >
                <Button size="lg" className={PRIMARY_BUTTON_CLASSES} asChild>
                  <Link
                    href="/register"
                    aria-label="Créer un compte SmartPlanning gratuitement"
                  >
                    Essayer gratuitement
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base"
                  asChild
                >
                  <Link
                    href="/tarifs"
                    aria-label="Consulter les tarifs de SmartPlanning"
                  >
                    Voir les tarifs
                  </Link>
                </Button>
              </motion.div>
            </motion.header>

            {/* Introduction métier */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto mt-16 max-w-3xl space-y-6"
            >
              {sector.intro.map((paragraph, index) => (
                <motion.p
                  key={index}
                  variants={fadeInUp}
                  className="text-lg leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </motion.p>
              ))}
            </motion.div>
          </div>
        </article>

        {/* Défis du secteur */}
        <section aria-labelledby="challenges-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <SectionHeader
              badge="Vos contraintes métier"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  🧩
                </span>
              }
              title="Les défis du planning en"
              titleHighlight={sector.shortName}
              titleId="challenges-title"
              description={`Ce qui rend la gestion des horaires si chronophage en ${sector.shortName}.`}
            />

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2"
              role="list"
              aria-label={`Défis du planning en ${sector.shortName}`}
            >
              {sector.challenges.map((challenge) => {
                const Icon = SECTOR_ICONS[challenge.icon]
                return (
                  <motion.li
                    key={challenge.title}
                    variants={fadeInUp}
                    className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-400/10">
                      <Icon
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {challenge.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {challenge.description}
                    </p>
                  </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </section>

        {/* Réponses produit */}
        <section aria-labelledby="solutions-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <SectionHeader
              badge="La réponse SmartPlanning"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  ⚡
                </span>
              }
              title="Ce que SmartPlanning change pour votre"
              titleHighlight="équipe"
              titleId="solutions-title"
              description="Des fonctionnalités concrètes, pensées pour le quotidien du terrain."
            />

            <motion.ul
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              role="list"
              aria-label={`Fonctionnalités SmartPlanning pour la ${sector.shortName}`}
            >
              {sector.solutions.map((solution) => {
                const Icon = SECTOR_ICONS[solution.icon]
                return (
                  <motion.li
                    key={solution.feature}
                    variants={fadeInUp}
                    className="h-full rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 dark:bg-blue-400/10">
                      <Icon
                        className="h-6 w-6 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {solution.feature}
                    </h3>
                    <p className="text-muted-foreground">{solution.benefit}</p>
                  </motion.li>
                )
              })}
            </motion.ul>
          </div>
        </section>

        {/* Prix contextualisé */}
        <section aria-labelledby="pricing-title" className="py-24 lg:py-32">
          <div className="container-custom">
            <SectionHeader
              badge="Tarif transparent"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  💶
                </span>
              }
              title="Un prix simple pour"
              titleHighlight={sector.pricingExample.teamLabel}
              titleId="pricing-title"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-xl rounded-3xl border border-border bg-card/50 p-10 text-center backdrop-blur-sm"
            >
              <p className="text-lg text-muted-foreground">
                {sector.pricingExample.headcount} employés ×{' '}
                {formatPrice(PRICING.PRICE_PER_EMPLOYEE)} HT
              </p>
              <p className="my-4 text-5xl font-bold">
                {formatPrice(monthlyPrice)}{' '}
                <span className="text-lg font-normal text-muted-foreground">
                  HT / mois
                </span>
              </p>
              <p className="text-muted-foreground">
                {sector.pricingExample.description}
              </p>
              <Button
                size="lg"
                className={`mt-8 ${PRIMARY_BUTTON_CLASSES}`}
                asChild
              >
                <Link
                  href="/tarifs"
                  aria-label="Voir le détail des tarifs SmartPlanning"
                >
                  Voir le détail des tarifs
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* FAQ secteur */}
        <section
          id="faq"
          aria-labelledby="faq-title"
          className="py-24 lg:py-32"
        >
          <div className="container-custom">
            <SectionHeader
              badge="FAQ"
              badgeIcon={
                <span className="text-lg" aria-hidden="true">
                  💬
                </span>
              }
              title="Questions fréquentes en"
              titleHighlight={sector.shortName}
              titleId="faq-title"
            />

            <div className="mx-auto max-w-3xl space-y-4">
              {sector.faqs.map((faq, index) => (
                <FAQItem
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFaqIndex === index}
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section aria-labelledby="cta-title" className="pb-24 lg:pb-32">
          <div className="container-custom">
            <motion.aside
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 p-12 text-center lg:p-20"
              role="complementary"
              aria-label="Appel à l'action pour essayer SmartPlanning"
            >
              {/* Background glow - Decorative */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-400/5"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <h2
                  id="cta-title"
                  className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
                >
                  Testez SmartPlanning dans votre{' '}
                  <span className={HIGHLIGHT_TEXT_CLASSES}>établissement</span>
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Créez votre compte et testez SmartPlanning gratuitement
                  pendant {PRICING.TRIAL_DAYS} jours, sans carte bancaire.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  <Button size="lg" className={PRIMARY_BUTTON_CLASSES} asChild>
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
                    className="h-14 px-8 text-base"
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
