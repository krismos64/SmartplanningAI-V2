'use client'

/**
 * PricingSection Component
 *
 * Section tarif unique per-seat avec simulateur interactif.
 * Remplace l'ancienne grille 3 plans (Starter/Pro/Enterprise).
 *
 * @ticket SP-358
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquare } from 'lucide-react'
import {
  motion,
  FramerAnimatePresence,
  fadeInUp,
  staggerContainer,
} from '@/lib/animations'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PRICING } from '@/lib/config/pricing'
import { SectionLogo, SectionHeader } from '../index'

const LARGE_TEAM_THRESHOLD = 50

export function PricingSection() {
  const [employees, setEmployees] = useState<number>(PRICING.DEFAULT_EMPLOYEES)

  return (
    <section
      id="pricing"
      className="bg-gradient-to-b from-transparent via-purple-950/10 to-transparent py-24 lg:py-32"
    >
      <div className="container-custom">
        {/* Section Header */}
        <SectionHeader
          badge="Tarification"
          color="emerald"
          title="Un tarif simple et"
          titleHighlight="transparent"
          description="2,90 € par employé par mois. Toutes les fonctionnalités incluses, sans engagement."
          marginBottom="mb-16 lg:mb-24"
        />

        {/* Pricing Content — 2 colonnes desktop, stack mobile */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-2 lg:gap-12"
        >
          {/* Simulateur */}
          <motion.div variants={fadeInUp} whileHover={{ y: -5 }}>
            <PricingSimulator
              size="compact"
              animated={false}
              onEmployeesChange={setEmployees}
            />

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
                        Equipe de plus de {LARGE_TEAM_THRESHOLD} employes ?
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Contactez-nous pour un accompagnement personnalise.
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
          </motion.div>

          {/* Carte tarif */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -5 }}
            className="flex justify-center lg:justify-start"
          >
            <PricingCard animated={false} />
          </motion.div>
        </motion.div>

        {/* Lien vers page pricing dédiée */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/tarifs"
            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300"
          >
            Voir le détail des tarifs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
