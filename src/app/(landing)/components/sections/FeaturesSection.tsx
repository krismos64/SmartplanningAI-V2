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
          titleHighlight="gérer vos équipes"
          description="Plannings, congés, tâches, incidents, messagerie : tous les modules pour la gestion RH d&rsquo;une TPE-PME."
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
                'group relative overflow-hidden rounded-2xl border bg-card/50 p-8 transition-all hover:border-blue-600/30 dark:hover:border-blue-400/30',
                feature.comingSoon
                  ? 'border-blue-600/30 dark:border-blue-400/30 bg-blue-600/5 dark:bg-blue-400/5'
                  : 'border-border/50'
              )}
            >
              {/* Coming Soon Badge */}
              {feature.comingSoon && (
                <div className="absolute right-4 top-4 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                  À venir
                </div>
              )}

              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-blue-600/10 p-3 ring-1 ring-blue-600/15 dark:bg-blue-400/15 dark:ring-blue-400/15">
                <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>

              {/* Hover Tint */}
              <div className="absolute inset-0 -z-10 bg-blue-600/5 dark:bg-blue-400/5 opacity-0 transition-opacity group-hover:opacity-100" />

              {/* Hover Arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 transition-opacity group-hover:opacity-100">
                <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
