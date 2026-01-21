'use client'

/**
 * NotFoundIllustration Component - SP-302
 *
 * Animated illustration for the 404 page using Framer Motion.
 * Composed of Lucide React icons with floating animation effect.
 *
 * @see Context7 Documentation:
 * - Framer Motion: variants with staggerChildren for orchestrated animations
 * - Animation pattern: translateY oscillation for floating effect
 * - Accessibility: aria-hidden="true" for decorative elements
 *
 * @ticket SP-302
 */

import { FileQuestion, Search, ArrowRight } from 'lucide-react'
import {
  motion,
  illustrationContainer,
  floatVariants,
  orbitVariants,
} from '@/lib/animations'

/**
 * Props for NotFoundIllustration component
 */
interface NotFoundIllustrationProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * NotFoundIllustration - Animated decorative illustration for 404 page
 *
 * Features:
 * - Floating animation on main FileQuestion icon
 * - Orbiting decorative Search and ArrowRight icons
 * - Responsive sizing (h-32 sm:h-40 md:h-48)
 * - Primary color for main icon, muted for decoratives
 * - Fully accessible with aria-hidden
 *
 * @param props - Component props
 * @returns Animated illustration composition
 */
export function NotFoundIllustration({
  className = '',
}: NotFoundIllustrationProps) {
  return (
    <motion.div
      className={`relative flex h-32 items-center justify-center sm:h-40 md:h-48 ${className}`}
      variants={illustrationContainer}
      initial="initial"
      animate="animate"
      aria-hidden="true"
      data-testid="not-found-illustration"
    >
      {/* Main floating icon */}
      <motion.div
        variants={floatVariants}
        className="relative z-10"
        data-testid="main-icon"
      >
        <div className="rounded-full bg-primary/10 p-6 sm:p-8 md:p-10">
          <FileQuestion
            className="h-12 w-12 text-primary sm:h-16 sm:w-16 md:h-20 md:w-20"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      {/* Decorative Search icon - top right */}
      <motion.div
        variants={orbitVariants}
        className="absolute right-4 top-0 sm:right-8 md:right-12"
        data-testid="search-icon"
      >
        <div className="rounded-full bg-muted/50 p-2 sm:p-3">
          <Search
            className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5 md:h-6 md:w-6"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      {/* Decorative ArrowRight icon - bottom left */}
      <motion.div
        variants={orbitVariants}
        className="absolute bottom-0 left-4 sm:left-8 md:left-12"
        data-testid="arrow-icon"
      >
        <div className="rounded-full bg-muted/50 p-2 sm:p-3">
          <ArrowRight
            className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5 md:h-6 md:w-6"
            strokeWidth={1.5}
          />
        </div>
      </motion.div>

      {/* Decorative dots */}
      <motion.div
        variants={orbitVariants}
        className="absolute left-0 top-1/4 sm:left-4"
      >
        <div className="h-2 w-2 rounded-full bg-primary/30" />
      </motion.div>

      <motion.div
        variants={orbitVariants}
        className="absolute bottom-1/4 right-0 sm:right-4"
      >
        <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
      </motion.div>
    </motion.div>
  )
}
