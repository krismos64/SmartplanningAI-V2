'use client'

/**
 * BenefitsSection Component
 * Highlights key benefits with before/after illustration
 * Refactored to use centralized data and SectionHeader
 */

import Image from 'next/image'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { benefits } from '../../data'
import { SectionHeader } from '../index'

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-24 lg:py-32">
      <div className="container-custom">
        {/* Section Header - Using reusable component */}
        <SectionHeader
          badge="Pourquoi SmartPlanning ?"
          color="amber"
          title="Ce que SmartPlanning"
          titleHighlight="change pour vous"
          description="Gagnez du temps et offrez à vos équipes une organisation claire."
        />

        {/* Content Grid: Image + Benefits */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Before/After Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-3xl bg-blue-600/10 dark:bg-blue-400/10 blur-3xl" />
            <Image
              src="/images/avant-après-sp.png"
              alt="Avant et après SmartPlanning - Comparaison visuelle"
              width={600}
              height={450}
              className="relative z-10 rounded-2xl shadow-2xl"
            />
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {benefits.map((benefit) => (
              <motion.div
                key={benefit.id}
                variants={fadeInUp}
                className="group flex gap-4 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-blue-600/30 dark:hover:border-blue-400/30 hover:bg-card"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 ring-1 ring-blue-600/15 dark:bg-blue-400/15 dark:ring-blue-400/15">
                  <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
