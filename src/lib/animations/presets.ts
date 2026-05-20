/**
 * Animation Presets - SmartPlanning V2
 *
 * Micro-interactions et presets prêts à l'emploi
 * Optimisés pour la performance (GPU accelerated)
 *
 * @see SP-379 - Animations System
 */

import type { TargetAndTransition, Variants } from 'framer-motion'
import { durations, easings, springs } from './config'

// =============================================================================
// HOVER PRESETS
// =============================================================================

/**
 * Hover Scale - Légère augmentation au survol
 *
 * @example
 * ```tsx
 * <motion.button whileHover={hoverScale}>Click me</motion.button>
 * ```
 */
export const hoverScale: TargetAndTransition = {
  scale: 1.02,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Hover Scale Plus - Augmentation plus visible
 */
export const hoverScalePlus: TargetAndTransition = {
  scale: 1.05,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Hover Lift - Élévation légère (shadow implicite via CSS)
 */
export const hoverLift: TargetAndTransition = {
  y: -2,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Hover Lift Plus - Élévation plus marquée
 */
export const hoverLiftPlus: TargetAndTransition = {
  y: -4,
  scale: 1.01,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Hover Glow - Effet lumineux (combiné avec CSS glow)
 */
export const hoverGlow: TargetAndTransition = {
  scale: 1.02,
  transition: springs.gentle,
}

/**
 * Hover Subtle - Très léger, pour éléments sensibles
 */
export const hoverSubtle: TargetAndTransition = {
  scale: 1.01,
  transition: {
    duration: durations.instant,
    ease: easings.easeOut,
  },
}

/**
 * Hover Brightness - Pour images/cards
 */
export const hoverBrightness: TargetAndTransition = {
  filter: 'brightness(1.05)',
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

// =============================================================================
// TAP/CLICK PRESETS
// =============================================================================

/**
 * Tap Scale - Réduction au clic
 *
 * @example
 * ```tsx
 * <motion.button whileTap={tapScale}>Click me</motion.button>
 * ```
 */
export const tapScale: TargetAndTransition = {
  scale: 0.98,
  transition: {
    duration: durations.instant,
    ease: easings.easeIn,
  },
}

/**
 * Tap Scale Plus - Réduction plus visible
 */
export const tapScalePlus: TargetAndTransition = {
  scale: 0.95,
  transition: {
    duration: durations.instant,
    ease: easings.easeIn,
  },
}

/**
 * Tap Push - Effet "enfoncé"
 */
export const tapPush: TargetAndTransition = {
  scale: 0.97,
  y: 1,
  transition: {
    duration: durations.instant,
    ease: easings.easeIn,
  },
}

// =============================================================================
// FOCUS PRESETS
// =============================================================================

/**
 * Focus Scale - Léger agrandissement au focus
 */
export const focusScale: TargetAndTransition = {
  scale: 1.02,
  transition: springs.snappy,
}

/**
 * Focus Ring Animation - Pour accompagner CSS focus ring
 */
export const focusRing: TargetAndTransition = {
  scale: 1.01,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

// =============================================================================
// BUTTON PRESETS
// =============================================================================

/**
 * Preset complet pour boutons primaires
 */
export const buttonPrimary = {
  whileHover: hoverScale,
  whileTap: tapScale,
  whileFocus: focusScale,
}

/**
 * Preset complet pour boutons secondaires
 */
export const buttonSecondary = {
  whileHover: hoverSubtle,
  whileTap: tapScale,
}

/**
 * Preset pour boutons avec lift
 */
export const buttonLift = {
  whileHover: hoverLift,
  whileTap: tapPush,
}

/**
 * Preset pour icon buttons
 */
export const buttonIcon = {
  whileHover: hoverScalePlus,
  whileTap: tapScalePlus,
}

// =============================================================================
// CARD PRESETS
// =============================================================================

/**
 * Card hover - Lift + Scale subtil
 */
export const cardHover: TargetAndTransition = {
  y: -4,
  scale: 1.01,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Preset complet pour cards interactives
 */
export const cardInteractive = {
  whileHover: cardHover,
  whileTap: { scale: 0.99 },
}

/**
 * Preset pour cards avec effet subtle
 */
export const cardSubtle = {
  whileHover: {
    y: -2,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
}

// =============================================================================
// LIST ITEM PRESETS
// =============================================================================

/**
 * List item hover
 */
export const listItemHover: TargetAndTransition = {
  x: 4,
  transition: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
}

/**
 * Preset pour list items
 */
export const listItem = {
  whileHover: listItemHover,
  whileTap: { scale: 0.99 },
}

// =============================================================================
// TOGGLE VARIANTS
// =============================================================================

/**
 * Toggle switch variants
 *
 * @example
 * ```tsx
 * <motion.div
 *   variants={toggleVariants}
 *   animate={isOn ? 'on' : 'off'}
 * />
 * ```
 */
export const toggleVariants: Variants = {
  off: {
    x: 0,
    transition: springs.snappy,
  },
  on: {
    x: 20, // Ajuster selon la taille du toggle
    transition: springs.snappy,
  },
}

/**
 * Toggle background variants
 */
export const toggleBackgroundVariants: Variants = {
  off: {
    backgroundColor: 'var(--muted)',
    transition: { duration: durations.fast },
  },
  on: {
    backgroundColor: 'var(--primary)',
    transition: { duration: durations.fast },
  },
}

// =============================================================================
// CHECKBOX/RADIO VARIANTS
// =============================================================================

/**
 * Checkbox check animation
 */
export const checkboxVariants: Variants = {
  unchecked: {
    pathLength: 0,
    opacity: 0,
  },
  checked: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: durations.fast,
        ease: easings.easeOut,
      },
      opacity: {
        duration: durations.instant,
      },
    },
  },
}

/**
 * Radio dot animation
 */
export const radioVariants: Variants = {
  unchecked: {
    scale: 0,
    opacity: 0,
  },
  checked: {
    scale: 1,
    opacity: 1,
    transition: springs.snappy,
  },
}

// =============================================================================
// ACCORDION PRESETS
// =============================================================================

/**
 * Accordion chevron rotation
 */
export const accordionChevronVariants: Variants = {
  closed: {
    rotate: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeInOut,
    },
  },
  open: {
    rotate: 180,
    transition: {
      duration: durations.fast,
      ease: easings.easeInOut,
    },
  },
}

/**
 * Accordion plus/minus icon
 */
export const accordionPlusVariants: Variants = {
  closed: {
    rotate: 0,
    transition: {
      duration: durations.fast,
      ease: easings.easeInOut,
    },
  },
  open: {
    rotate: 45,
    transition: {
      duration: durations.fast,
      ease: easings.easeInOut,
    },
  },
}

// =============================================================================
// MENU/DROPDOWN PRESETS
// =============================================================================

/**
 * Menu item highlight
 */
export const menuItemHover: TargetAndTransition = {
  backgroundColor: 'var(--accent)',
  transition: {
    duration: durations.instant,
    ease: easings.easeOut,
  },
}

/**
 * Dropdown menu variants
 */
export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: {
      duration: durations.instant,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// TOOLTIP PRESETS
// =============================================================================

/**
 * Tooltip variants
 */
export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 5,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.fast,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: 5,
    scale: 0.95,
    transition: {
      duration: durations.instant,
      ease: easings.easeIn,
    },
  },
}

// =============================================================================
// NOTIFICATION/TOAST PRESETS
// =============================================================================

/**
 * Toast slide in from right
 */
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: {
      duration: durations.fast,
      ease: easings.easeIn,
    },
  },
}

/**
 * Notification badge pop
 */
export const badgeVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      duration: durations.fast,
    },
  },
}

// =============================================================================
// LOADING PRESETS
// =============================================================================

/** Conservé : loader fonctionnel (skeleton states). */
export const pulseVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
}

/** Conservé : loader fonctionnel (spinner). */
export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: easings.linear,
    },
  },
}

/** Conservé : loader fonctionnel (dots bouncing). */
export const bounceDotsContainerVariants: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const bounceDotVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: easings.easeInOut,
    },
  },
}

// =============================================================================
// SKELETON PRESETS
// =============================================================================

/** Conservé : loader fonctionnel (skeleton shimmer). */
export const skeletonVariants: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: easings.linear,
    },
  },
}

// =============================================================================
// REDUCED MOTION ALTERNATIVES
// =============================================================================

/**
 * Presets pour prefers-reduced-motion
 * Remplace les animations par des transitions d'opacité simples
 */
export const reducedMotionPresets = {
  hover: { opacity: 0.8 },
  tap: { opacity: 0.7 },
  focus: {},
} as const

// =============================================================================
// EXPORTS
// =============================================================================

export const presets = {
  // Hover
  hoverScale,
  hoverScalePlus,
  hoverLift,
  hoverLiftPlus,
  hoverGlow,
  hoverSubtle,
  hoverBrightness,

  // Tap
  tapScale,
  tapScalePlus,
  tapPush,

  // Focus
  focusScale,
  focusRing,

  // Button presets
  buttonPrimary,
  buttonSecondary,
  buttonLift,
  buttonIcon,

  // Card presets
  cardHover,
  cardInteractive,
  cardSubtle,

  // List presets
  listItemHover,
  listItem,

  // Component variants
  toggleVariants,
  toggleBackgroundVariants,
  checkboxVariants,
  radioVariants,
  accordionChevronVariants,
  accordionPlusVariants,
  dropdownVariants,
  tooltipVariants,
  toastVariants,
  badgeVariants,

  // Loading
  pulseVariants,
  spinVariants,
  bounceDotsContainerVariants,
  bounceDotVariants,
  skeletonVariants,

  // Reduced motion
  reducedMotionPresets,
} as const

export default presets
