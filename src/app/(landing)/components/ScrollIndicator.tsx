'use client'

/**
 * ScrollIndicator Component
 * Animated scroll indicator at the bottom of the hero section
 */

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { bounceAnimation, bounceTransition } from '../animations'

export function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2"
    >
      <motion.div
        animate={bounceAnimation}
        transition={bounceTransition}
        className="flex flex-col items-center gap-2"
      >
        <span className="text-xs text-white/40">Découvrir</span>
        <ChevronDown className="h-5 w-5 text-white/40" />
      </motion.div>
    </motion.div>
  )
}
