'use client'

/**
 * TopBanner Component
 * Animated marquee banner at the top of the page
 */

import {
  motion,
  marqueeAnimationValue,
  marqueeTransition,
} from '@/lib/animations'

export function TopBanner() {
  return (
    <div className="fixed left-0 right-0 top-0 z-[60] overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 py-2">
      <motion.div
        animate={marqueeAnimationValue}
        transition={marqueeTransition}
        className="flex whitespace-nowrap"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-3 text-sm font-semibold tracking-wide text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            <span className="font-light">Bienvenue sur</span>
            <span className="bg-gradient-to-r from-white to-cyan-100 bg-clip-text font-bold text-transparent">
              smartplanning.fr
            </span>
            <span className="font-light">•</span>
            <span className="font-light">La planification intelligente</span>
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
