'use client'

/**
 * SectionLogo Component
 * Animated logo displayed at the bottom of each section
 */

import Image from 'next/image'
import {
  motion,
  floatSmall,
  floatSmallTransition,
  glowPulse,
  glowPulseTransition,
  hoverScale,
} from '@/lib/animations'

export function SectionLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="mt-16 flex justify-center lg:mt-20"
    >
      <motion.div
        className="relative"
        animate={floatSmall}
        transition={floatSmallTransition}
        whileHover={hoverScale}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-purple-500/30 blur-3xl"
          animate={glowPulse}
          transition={glowPulseTransition}
        />
        <Image
          src="/images/logo-sp.png"
          alt="SmartPlanning"
          width={180}
          height={115}
          className="relative z-10 drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  )
}
