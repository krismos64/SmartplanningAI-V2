'use client'

/**
 * FeaturesSection Component
 * Grid of feature cards
 * Refactored to use SectionHeader component
 */

import dynamic from 'next/dynamic'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { features } from '../../data'
import { SectionLogo, SectionHeader } from '../index'

// Import Lottie dynamically to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Import animation data
import planningAnimation from '../../../../../public/animations/planning-animation.json'

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="container-custom">
        {/* Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-6 flex justify-center"
        >
          <Lottie
            animationData={planningAnimation}
            loop={true}
            className="h-40 w-40 md:h-48 md:w-48"
          />
        </motion.div>

        {/* Section Header - Using reusable component */}
        <SectionHeader
          badge="Fonctionnalités"
          color="blue"
          title="Tout ce dont vous avez besoin pour"
          titleHighlight="planifier efficacement"
          description="Des outils puissants conçus pour simplifier la gestion de vos équipes et optimiser votre organisation."
          marginBottom="mb-8"
        />

        {/* Features Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={cn(
                'group relative overflow-hidden rounded-2xl border bg-card/50 p-8 transition-all hover:border-primary/30',
                feature.comingSoon
                  ? 'border-violet-500/30 bg-violet-500/5'
                  : 'border-border/50'
              )}
            >
              {/* Coming Soon Badge */}
              {feature.comingSoon && (
                <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-3 py-1 text-xs font-semibold text-white">
                  À venir
                </div>
              )}

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
              <p className="text-muted-foreground">{feature.description}</p>

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
