'use client'

/**
 * StatsSection Component
 * Key statistics with animated counters
 */

import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../../animations'
import { stats } from '../../data'
import { AnimatedCounter, SectionLogo } from '../index'

export function StatsSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container-custom">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-8 lg:grid-cols-4"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <stat.icon className="mx-auto mb-4 h-8 w-8 text-cyan-400" />
              <div className="mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-4xl font-bold text-transparent lg:text-5xl">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <SectionLogo />
      </div>
    </section>
  )
}
