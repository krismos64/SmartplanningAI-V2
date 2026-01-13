'use client'

/**
 * FeaturesSection Component
 * Grid of feature cards
 */

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeInUp, staggerContainer } from '../../animations'
import { features } from '../../data'
import { SectionLogo } from '../SectionLogo'

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center lg:mb-24"
        >
          <motion.span
            variants={fadeInUp}
            className="mb-6 inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400"
          >
            Fonctionnalités
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Tout ce dont vous avez besoin pour{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              planifier efficacement
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto max-w-2xl text-lg text-white/60"
          >
            Des outils puissants conçus pour simplifier la gestion de vos
            équipes et optimiser votre organisation.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-white/10"
            >
              {/* Icon */}
              <div
                className={cn(
                  'mb-6 inline-flex rounded-xl bg-gradient-to-br p-3',
                  feature.color
                )}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-white/60">{feature.description}</p>

              {/* Hover Gradient */}
              <div
                className={cn(
                  'absolute inset-0 -z-10 opacity-0 transition-opacity group-hover:opacity-10',
                  `bg-gradient-to-br ${feature.color}`
                )}
              />

              {/* Hover Arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-5 w-5 text-cyan-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
