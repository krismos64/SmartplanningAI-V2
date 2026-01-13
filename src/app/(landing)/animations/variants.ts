/**
 * Animation variants for Framer Motion
 * Centralized animation configurations for the landing page
 *
 * @see https://motion.dev/docs/react-animation
 */

import type { Variants, Transition } from 'framer-motion'

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

// ============================================================================
// CONTAINER ANIMATIONS (for stagger children)
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

// ============================================================================
// FLOATING ANIMATIONS
// ============================================================================

export const floatAnimation = {
  y: [0, -10, 0],
}

export const floatTransition: Transition = {
  duration: 6,
  repeat: Infinity,
  ease: 'easeInOut',
}

export const floatSmall = {
  y: [0, -8, 0],
}

export const floatSmallTransition: Transition = {
  duration: 4,
  repeat: Infinity,
  ease: 'easeInOut',
}

// ============================================================================
// GLOW ANIMATIONS
// ============================================================================

export const glowPulse = {
  opacity: [0.3, 0.6, 0.3],
  scale: [1, 1.2, 1],
}

export const glowPulseTransition: Transition = {
  duration: 5,
  repeat: Infinity,
  ease: 'easeInOut',
}

// ============================================================================
// MARQUEE / BANNER ANIMATIONS
// ============================================================================

export const marqueeAnimation = {
  x: [0, -1000],
}

export const marqueeTransition: Transition = {
  x: {
    repeat: Infinity,
    repeatType: 'loop',
    duration: 20,
    ease: 'linear',
  },
}

// ============================================================================
// SCROLL INDICATOR ANIMATION
// ============================================================================

export const bounceAnimation = {
  y: [0, 10, 0],
}

export const bounceTransition: Transition = {
  duration: 2,
  repeat: Infinity,
}

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale = {
  scale: 1.05,
}

export const tapScale = {
  scale: 0.95,
}

// ============================================================================
// FLOATING ELEMENTS ANIMATIONS
// ============================================================================

export const floatingElement1 = {
  animate: {
    y: [0, 15, 0],
    rotate: [0, 5, 0],
  },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: 0.5,
  } as Transition,
}

export const floatingElement2 = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, -5, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: 1,
  } as Transition,
}
