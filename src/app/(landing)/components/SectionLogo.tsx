'use client'

/**
 * SectionLogo Component
 * Logo displayed at the bottom of each section.
 * Apparition au scroll uniquement (whileInView), pas d'animation en boucle.
 */

import Image from 'next/image'
import { motion, hoverScale } from '@/lib/animations'

export function SectionLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="mt-16 flex justify-center lg:mt-20"
    >
      <motion.div className="relative" whileHover={hoverScale}>
        {/* Glow effect statique */}
        <div className="absolute inset-0 rounded-3xl bg-blue-600/15 blur-3xl dark:bg-blue-400/15" />
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
