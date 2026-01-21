'use client'

/**
 * PricingSection Component
 * Pricing plans with feature comparison
 * Refactored to use SectionHeader component
 */

import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { pricingPlans } from '../../data'
import { SectionLogo, SectionHeader } from '../index'

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-gradient-to-b from-transparent via-purple-950/10 to-transparent py-24 lg:py-32"
    >
      <div className="container-custom">
        {/* Section Header - Using reusable component */}
        <SectionHeader
          badge="Tarification"
          color="emerald"
          title="Des plans adaptés à"
          titleHighlight="votre croissance"
          description="Commencez gratuitement, évoluez quand vous êtes prêt. Pas de surprise, pas de frais cachés."
          marginBottom="mb-16 lg:mb-24"
        />

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-md gap-8 md:max-w-none md:grid-cols-2 lg:grid-cols-3"
        >
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className={cn(
                'relative mx-auto w-full max-w-sm rounded-2xl p-6 sm:p-8 md:mx-0 md:max-w-none',
                plan.popular
                  ? 'border-2 border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-transparent'
                  : 'border border-white/10 bg-white/[0.02]'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 text-sm font-semibold text-white">
                    Le plus populaire
                  </span>
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-6">
                <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-white/50">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-white/50">{plan.period}</span>
                )}
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-cyan-400" />
                    <span className="text-white/70">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className={cn(
                  'w-full',
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600'
                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                )}
                asChild
              >
                <Link href="/register">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
