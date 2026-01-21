'use client'

/**
 * HowItWorksSection Component
 * Steps showing how the product works
 * Refactored to use SectionHeader component
 */

import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { steps } from '../../data'
import { SectionLogo, SectionHeader } from '../index'

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-to-b from-transparent via-blue-950/20 to-transparent py-24 lg:py-32"
    >
      <div className="container-custom">
        {/* Section Header - Using reusable component */}
        <SectionHeader
          badge="Comment ça marche"
          color="purple"
          title="Démarrez en"
          titleHighlight="3 étapes simples"
          marginBottom="mb-16 lg:mb-24"
        />

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full bg-gradient-to-r from-purple-500/50 to-transparent md:block" />
              )}

              {/* Step Number */}
              <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-purple-500/30 bg-[#030712]">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent">
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
              <p className="mx-auto max-w-xs text-white/50">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
