/**
 * Animation Variants - SmartPlanning V2
 *
 * Variants réutilisables pour Framer Motion
 * Optimisés pour la performance (transform + opacity uniquement)
 *
 * @see SP-379 - Animations System
 * @see https://motion.dev/docs/react-animation
 */

import type { Variants, Transition } from 'framer-motion'
import { durations, easings, staggerConfig } from './config'

// =============================================================================
// FADE VARIANTS
// =============================================================================

/**
 * Fade simple - Apparition/disparition en opacité
 *
 * @example
 * ```tsx
 * <motion.div variants={fadeVariants} initial="hidden" animate="visible" />
 * ```
 */
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Fade avec délai personnalisable
 */
export const fadeDelayedVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
      delay,
    },
  }),
  exit: { opacity: 0 },
}

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

/**
 * Slide Up - Entrée par le bas
 *
 * Idéal pour : modals, toasts, cards, éléments de liste
 */
export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Slide Down - Entrée par le haut
 *
 * Idéal pour : dropdowns, menus, notifications
 */
export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Slide Left - Entrée par la droite
 *
 * Idéal pour : sidebars, panels, navigation
 */
export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Slide Right - Entrée par la gauche
 *
 * Idéal pour : sidebars gauche, back navigation
 */
export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// SCALE VARIANTS
// =============================================================================

/**
 * Scale simple - Zoom in/out
 *
 * Idéal pour : boutons, cards, images, modals
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Scale avec spring - Plus dynamique
 */
export const scaleSpringVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
}

/**
 * Pop - Effet de "pop" rebondissant
 *
 * Idéal pour : notifications, badges, éléments ludiques
 */
export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: durations.fast,
    },
  },
}

// =============================================================================
// COMBINED VARIANTS
// =============================================================================

/**
 * Fade + Slide Up - Combinaison classique
 */
export const fadeSlideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Fade + Scale - Pour les modals et dialogs
 */
export const fadeScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// STAGGER VARIANTS
// =============================================================================

/**
 * Container pour stagger animation
 *
 * @example
 * ```tsx
 * <motion.ul variants={staggerContainer} initial="hidden" animate="visible">
 *   <motion.li variants={staggerItem}>Item 1</motion.li>
 *   <motion.li variants={staggerItem}>Item 2</motion.li>
 * </motion.ul>
 * ```
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...staggerConfig.default,
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      ...staggerConfig.fast,
      staggerDirection: -1,
      when: 'afterChildren',
    },
  },
}

/**
 * Container stagger rapide
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...staggerConfig.fast,
      when: 'beforeChildren',
    },
  },
  exit: { opacity: 0 },
}

/**
 * Container stagger lent
 */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...staggerConfig.slow,
      when: 'beforeChildren',
    },
  },
  exit: { opacity: 0 },
}

/**
 * Item pour stagger - Fade + Slide Up
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 10,
  },
}

/**
 * Item pour stagger - Fade simple
 */
export const staggerItemFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.normal,
      ease: easings.easeOut,
    },
  },
  exit: { opacity: 0 },
}

/**
 * Item pour stagger - Scale
 */
export const staggerItemScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
  },
}

// =============================================================================
// PAGE TRANSITION VARIANTS
// =============================================================================

/**
 * Transition de page - Fade simple
 */
export const pageTransitionFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Transition de page - Slide Up
 */
export const pageTransitionSlide: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.medium,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// ACCORDION / COLLAPSE VARIANTS
// =============================================================================

/**
 * Accordion content - Pour les contenus dépliables
 *
 * Note: height: 'auto' fonctionne avec Framer Motion
 */
export const accordionVariants: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
  },
  visible: {
    height: 'auto',
    opacity: 1,
    overflow: 'hidden',
    transition: {
      height: {
        duration: durations.normal,
        ease: easings.easeOut,
      },
      opacity: {
        duration: durations.fast,
        delay: 0.1,
      },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    transition: {
      height: {
        duration: durations.normal,
        ease: easings.easeIn,
      },
      opacity: {
        duration: durations.fast,
      },
    },
  },
}

// =============================================================================
// OVERLAY VARIANTS
// =============================================================================

/**
 * Overlay backdrop - Pour les modals et dialogs
 */
export const overlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: durations.fast,
      delay: 0.1,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// REDUCED MOTION VARIANTS
// =============================================================================

/**
 * Variants pour prefers-reduced-motion
 * Animations minimales ou instantanées
 */
export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.1 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Crée un variant slide personnalisé
 */
export function createSlideVariant(
  direction: 'up' | 'down' | 'left' | 'right',
  distance: number = 20,
  options?: Partial<Transition>
): Variants {
  const isVertical = direction === 'up' || direction === 'down'
  const sign = direction === 'up' || direction === 'left' ? 1 : -1

  const hiddenTransform = isVertical
    ? { y: distance * sign }
    : { x: distance * sign }

  const exitTransform = isVertical
    ? { y: distance * sign * 0.5 }
    : { x: distance * sign * 0.5 }

  return {
    hidden: {
      opacity: 0,
      ...hiddenTransform,
    },
    visible: {
      opacity: 1,
      x: isVertical ? undefined : 0,
      y: isVertical ? 0 : undefined,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut,
        ...options,
      },
    },
    exit: {
      opacity: 0,
      ...exitTransform,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn,
      },
    },
  }
}

/**
 * Crée un variant scale personnalisé
 */
export function createScaleVariant(
  from: number = 0.95,
  options?: Partial<Transition>
): Variants {
  return {
    hidden: {
      opacity: 0,
      scale: from,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.normal,
        ease: easings.easeOut,
        ...options,
      },
    },
    exit: {
      opacity: 0,
      scale: from,
      transition: {
        duration: durations.fast,
        ease: easings.easeIn,
      },
    },
  }
}

/**
 * Crée un stagger container personnalisé
 */
export function createStaggerContainer(
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
        when: 'beforeChildren',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerChildren / 2,
        staggerDirection: -1,
        when: 'afterChildren',
      },
    },
  }
}

// =============================================================================
// LANDING PAGE SPECIFIC VARIANTS
// =============================================================================

/**
 * Fade In Up - Version landing page avec plus d'amplitude
 *
 * Utilisé pour les sections de la landing page avec un mouvement plus prononcé
 * Compatible avec l'ancien système `fadeInUp` de la landing
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
}

/**
 * Scale In - Version landing page
 *
 * Compatible avec l'ancien système `scaleIn` de la landing
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: durations.slow,
      ease: easings.easeOut,
    },
  },
}

// =============================================================================
// CONTINUOUS / LOOPING ANIMATIONS
// =============================================================================

/**
 * Float Animation - Mouvement de flottement vertical
 *
 * Idéal pour : éléments décoratifs, illustrations, badges flottants
 *
 * @example
 * ```tsx
 * <motion.div
 *   animate={floatAnimation.animate}
 *   transition={floatAnimation.transition}
 * />
 * ```
 */
export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
  },
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Legacy: valeur d'animation pour float */
export const floatAnimationValue = floatAnimation.animate

/** Legacy: transition pour float */
export const floatTransition = floatAnimation.transition

/**
 * Float Small - Version plus subtile du flottement
 */
export const floatSmallAnimation = {
  animate: {
    y: [0, -8, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Legacy: valeur d'animation pour floatSmall */
export const floatSmall = floatSmallAnimation.animate

/** Legacy: transition pour floatSmall */
export const floatSmallTransition = floatSmallAnimation.transition

/**
 * Glow Pulse - Effet de pulsation lumineuse
 *
 * Idéal pour : effets de glow, highlights, éléments attirant l'attention
 */
export const glowPulseAnimation = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.2, 1],
  },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Legacy: valeur d'animation pour glowPulse */
export const glowPulse = glowPulseAnimation.animate

/** Legacy: transition pour glowPulse */
export const glowPulseTransition = glowPulseAnimation.transition

/**
 * Marquee Animation - Défilement horizontal continu
 *
 * Idéal pour : banners, tickers, carrousels de logos
 *
 * Usage combiné: animate={marqueeAnimation.animate} transition={marqueeAnimation.transition}
 * Usage séparé (legacy): animate={marqueeAnimationValue} transition={marqueeTransition}
 */
export const marqueeAnimation = {
  animate: {
    x: [0, -1000],
  },
  transition: {
    x: {
      repeat: Infinity,
      repeatType: 'loop' as const,
      duration: 20,
      ease: 'linear' as const,
    },
  },
}

/** Legacy: valeur d'animation pour marquee (utiliser avec marqueeTransition) */
export const marqueeAnimationValue = marqueeAnimation.animate

/** Legacy: transition pour marquee */
export const marqueeTransition = marqueeAnimation.transition

/**
 * Bounce Animation - Rebond vertical
 *
 * Idéal pour : indicateurs de scroll, flèches, éléments d'attention
 *
 * Usage combiné: animate={bounceAnimation.animate} transition={bounceAnimation.transition}
 * Usage séparé (legacy): animate={bounceAnimationValue} transition={bounceTransition}
 */
export const bounceAnimation = {
  animate: {
    y: [0, 10, 0],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/** Legacy: valeur d'animation pour bounce (utiliser avec bounceTransition) */
export const bounceAnimationValue = bounceAnimation.animate

/** Legacy: transition pour bounce */
export const bounceTransition = bounceAnimation.transition

/**
 * Pulse Animation - Pulsation d'échelle
 *
 * Idéal pour : icônes d'état, badges de notification
 */
export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
}

/**
 * Orbit Animation - Rotation continue
 *
 * Idéal pour : éléments décoratifs, loaders custom
 */
export const orbitAnimation = {
  animate: {
    rotate: 360,
  },
  transition: {
    duration: 20,
    repeat: Infinity,
    ease: 'linear' as const,
  },
}

// =============================================================================
// FLOATING ELEMENTS PRESETS
// =============================================================================

/**
 * Floating Element 1 - Animation complexe avec rotation
 *
 * Pour éléments décoratifs flottants (style 1)
 */
export const floatingElement1 = {
  animate: {
    y: [0, 15, 0],
    rotate: [0, 5, 0],
  },
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    delay: 0.5,
  },
}

/**
 * Floating Element 2 - Animation inverse
 *
 * Pour éléments décoratifs flottants (style 2)
 */
export const floatingElement2 = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, -5, 0],
  },
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    delay: 1,
  },
}

// =============================================================================
// ILLUSTRATION VARIANTS (with initial/animate states)
// =============================================================================

/**
 * Illustration Container - Container pour illustrations animées
 *
 * Utilise initial/animate au lieu de hidden/visible pour compatibilité
 * avec les animations continues (float, orbit)
 * @see NotFoundIllustration
 */
export const illustrationContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

/**
 * Float Variants - Animation de flottement vertical
 *
 * Pour illustrations animées avec effet de flottement doux
 * @see NotFoundIllustration
 */
export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

/**
 * Orbit Variants - Animation de pulsation pour éléments décoratifs
 *
 * Pour icônes décoratives en orbite autour d'un élément central
 * @see NotFoundIllustration
 */
export const orbitVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: [0.4, 0.7, 0.4],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
}

// =============================================================================
// HOVER / TAP PRESETS
// =============================================================================

/**
 * Hover Scale - Agrandissement au survol
 */
export const hoverScale = {
  scale: 1.05,
}

/**
 * Tap Scale - Réduction au clic
 */
export const tapScale = {
  scale: 0.95,
}

/**
 * Hover Lift - Effet de soulèvement au survol
 */
export const hoverLift = {
  y: -5,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type VariantName =
  | 'fade'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'scaleSpring'
  | 'pop'
  | 'fadeSlideUp'
  | 'fadeScale'

// =============================================================================
// VARIANTS MAP
// =============================================================================

/**
 * Map de tous les variants pour un accès dynamique
 */
export const variantsMap: Record<VariantName, Variants> = {
  fade: fadeVariants,
  slideUp: slideUpVariants,
  slideDown: slideDownVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
  scale: scaleVariants,
  scaleSpring: scaleSpringVariants,
  pop: popVariants,
  fadeSlideUp: fadeSlideUpVariants,
  fadeScale: fadeScaleVariants,
}

export default variantsMap
