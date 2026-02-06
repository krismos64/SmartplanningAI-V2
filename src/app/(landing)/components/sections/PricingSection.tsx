'use client'

/**
 * PricingSection Component
 *
 * Section tarif unique per-seat avec simulateur interactif.
 * Remplace l'ancienne grille 3 plans (Starter/Pro/Enterprise).
 *
 * @ticket SP-358
 */

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { PricingSimulator } from '@/components/pricing/PricingSimulator'
import { PricingCard } from '@/components/pricing/PricingCard'
import { SectionLogo, SectionHeader } from '../index'

export function PricingSection() {
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
            <PricingSimulator size="compact" animated={false} />
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
