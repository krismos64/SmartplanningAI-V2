'use client'

/**
 * PricingPageContent Component
 * Client component with animations for the Pricing page
 *
 * @description Composant principal de la page Tarifs avec :
 * - Semantique HTML5 optimisee (article, section)
 * - Accessibilite WCAG 2.1 AA
 * - Animations Framer Motion
 * - Structure optimisee pour SEO et LLMs
 * - 5 sections : Hero, Simulateur, Features, FAQ, CTA
 *
 * @ticket SP-359
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  motion,
  FramerAnimatePresence,
  fadeInUp,
  staggerContainer,
} from '@/lib/animations'
import {
  SectionHeader,
  AnimatedBackground,
  TopBanner,
  FAQItem,
  GRADIENT_BUTTON_CLASSES,
  GRADIENT_TEXT_CLASSES,
} from '@/app/(landing)/components'
import { LandingHeader } from '@/components/layout/LandingHeader'
import { LandingFooter } from '@/components/layout/LandingFooter'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PRICING, INCLUDED_FEATURES } from '@/lib/config/pricing'
import { PRICING_FAQS } from './StructuredData'

// Contact threshold for large teams
const LARGE_TEAM_THRESHOLD = 50

export function PricingPageContent() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <TopBanner />

      <div aria-hidden="true">
        <AnimatedBackground />
      </div>

      <LandingHeader isScrolled={isScrolled} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyan-500 focus:px-4 focus:py-2 focus:text-white"
      >
        Aller au contenu principal
      </a>

      <main id="main-content" role="main">
        {/* Section 1 — Hero prix */}
        <section
          aria-labelledby="pricing-hero-title"
          className="relative pb-16 pt-32 lg:pb-24 lg:pt-40"
        >
          <div className="container-custom">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="mx-auto max-w-4xl text-center"
            >
              <motion.span
                variants={fadeInUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400"
                aria-hidden="true"
              >
                Tarification
              </motion.span>

              <motion.h1
                id="pricing-hero-title"
                variants={fadeInUp}
                className="mb-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
              >
                Un tarif unique,{' '}
                <span className={GRADIENT_TEXT_CLASSES}>
                  simple et transparent
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground"
                data-testid="pricing-hero-description"
              >
                SmartPlanning coûte 2,90&nbsp;&euro; HT par employé par mois.
                Toutes les fonctionnalités sont incluses. Sans engagement. Essai
                gratuit {PRICING.TRIAL_DAYS} jours sans carte bancaire.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Section 2 — Simulateur interactif */}
        <section aria-labelledby="simulator-title" className="py-16 lg:py-24">
          <div className="container-custom">
            <SectionHeader
              badge="Calculez votre tarif"
              color="cyan"
              title="Simulateur"
              titleHighlight="interactif"
              titleId="simulator-title"
              description="Ajustez le nombre d'employés pour découvrir votre tarif mensuel."
              marginBottom="mb-12"
            />

            <div className="mx-auto max-w-2xl">
              <PricingSimulator size="full" onEmployeesChange={setEmployees} />

              {/* Message contact > 50 employes */}
              <FramerAnimatePresence>
                {employees > LARGE_TEAM_THRESHOLD && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    data-testid="large-team-message"
                  >
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                      <MessageSquare
                        className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Équipe de plus de {LARGE_TEAM_THRESHOLD} employés ?
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Contactez-nous pour un accompagnement personnalisé.
                        </p>
                        <Link
                          href="/#contact"
                          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
                        >
                          Nous contacter
                          <ArrowRight
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </FramerAnimatePresence>
            </div>
          </div>
        </section>

        {/* Section 3 — Ce qui est inclus */}
        <section
          aria-labelledby="features-title"
          className="bg-gradient-to-b from-transparent via-purple-950/10 to-transparent py-16 lg:py-24"
        >
          <div className="container-custom">
            <SectionHeader
              badge="Tout inclus"
              color="emerald"
              title="Ce qui est"
              titleHighlight="inclus"
              titleId="features-title"
              description="Un seul tarif, toutes les fonctionnalités. Aucun supplément."
              marginBottom="mb-12"
            />

            <div className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Features list */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.ul
                  className="space-y-4"
                  role="list"
                  aria-label="Fonctionnalités incluses"
                >
                  {INCLUDED_FEATURES.map((feature) => (
                    <motion.li
                      key={feature}
                      variants={fadeInUp}
                      className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/30 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check
                          className="h-4 w-4 text-emerald-400"
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>

              {/* Pricing Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center lg:sticky lg:top-32"
              >
                <PricingCard animated={false} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Section 4 — FAQ Pricing */}
        <section aria-labelledby="faq-title" className="py-16 lg:py-24">
          <div className="container-custom">
            <SectionHeader
              badge="Questions fréquentes"
              color="blue"
              title="Vos questions sur les"
              titleHighlight="tarifs"
              titleId="faq-title"
              marginBottom="mb-12"
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="mx-auto max-w-3xl space-y-4"
              role="list"
              aria-label="Questions fréquentes sur les tarifs"
            >
              {PRICING_FAQS.map((faq, index) => (
                <motion.div key={index} variants={fadeInUp} role="listitem">
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Section 5 — CTA final */}
        <section aria-labelledby="cta-title" className="py-16 lg:py-24">
          <div className="container-custom">
            <motion.aside
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-blue-500/10 via-cyan-500/10 to-purple-500/10 p-12 text-center lg:p-20"
              role="complementary"
              aria-label="Appel à l'action pour essayer SmartPlanning"
            >
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
                  <span className={GRADIENT_TEXT_CLASSES}>simplifier</span> vos
                  plannings ?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Inscription en 2 minutes. Sans engagement.
                </p>
                <Button size="lg" className={GRADIENT_BUTTON_CLASSES} asChild>
                  <Link
                    href="/register"
                    aria-label="Démarrer l'essai gratuit de 21 jours sans carte bancaire"
                    data-testid="cta-register"
                  >
                    Démarrer l&apos;essai gratuit — {PRICING.TRIAL_DAYS} jours
                    sans carte bancaire
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </motion.aside>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
