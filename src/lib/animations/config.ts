/**
 * Animation Configuration - SmartPlanning V2
 *
 * Configuration globale des animations Framer Motion
 * Durées et easings standardisés pour une expérience cohérente
 *
 * @see SP-379 - Animations System
 * @see https://motion.dev/docs/react-transitions
 */

// =============================================================================
// DURATIONS
// =============================================================================

/**
 * Durées d'animation standard (en secondes)
 *
 * Basées sur les guidelines Material Design et les best practices UX :
 * - Les animations rapides (< 200ms) sont perçues comme instantanées
 * - Les animations entre 200-500ms sont confortables pour l'utilisateur
 * - Les animations > 500ms doivent être réservées aux transitions importantes
 *
 * @example
 * ```tsx
 * import { durations } from '@/lib/animations/config'
 *
 * <motion.div
 *   animate={{ opacity: 1 }}
 *   transition={{ duration: durations.normal }}
 * />
 * ```
 */
export const durations = {
  /** 100ms - Micro-interactions instantanées (ripples, highlights) */
  instant: 0.1,

  /** 150ms - Hover, focus, active states */
  fast: 0.15,

  /** 200ms - Transitions légères (tooltips, dropdowns) */
  quick: 0.2,

  /** 300ms - Transitions standard (modals, cards) */
  normal: 0.3,

  /** 400ms - Transitions moyennes (sidebars, panels) */
  medium: 0.4,

  /** 500ms - Transitions lentes (pages, overlays) */
  slow: 0.5,

  /** 800ms - Animations complexes (hero, illustrations) */
  slower: 0.8,

  /** 1000ms - Animations très lentes (onboarding, tours) */
  slowest: 1.0,
} as const

// =============================================================================
// EASINGS
// =============================================================================

/**
 * Courbes d'accélération standard
 *
 * Cubic-bezier basés sur Material Design et CSS standards :
 * - easeOut : Démarrage rapide, ralentissement naturel (entrées)
 * - easeInOut : Démarrage et fin doux (transitions)
 * - easeIn : Démarrage lent, accélération (sorties)
 *
 * @see https://cubic-bezier.com/
 */
export const easings = {
  /** Sortie naturelle - Pour les éléments qui entrent */
  easeOut: [0.0, 0.0, 0.2, 1] as const,

  /** Transition fluide - Pour les changements d'état */
  easeInOut: [0.4, 0.0, 0.2, 1] as const,

  /** Entrée progressive - Pour les éléments qui sortent */
  easeIn: [0.4, 0.0, 1, 1] as const,

  /** Ease sharp - Pour les interactions rapides */
  sharp: [0.4, 0.0, 0.6, 1] as const,

  /** Linear - Pour les animations continues (progress, loading) */
  linear: [0, 0, 1, 1] as const,

  /** Anticipation - Léger recul avant mouvement */
  anticipate: [0.38, -0.4, 0.24, 1.1] as const,

  /** Overshoot - Dépassement léger puis retour */
  overshoot: [0.34, 1.56, 0.64, 1] as const,
} as const

// =============================================================================
// SPRING CONFIGURATIONS
// =============================================================================

/**
 * Configurations spring pour animations physiques
 *
 * Les springs offrent des animations plus naturelles que les bezier curves
 * car ils simulent la physique réelle (masse, tension, friction)
 *
 * @see https://motion.dev/docs/spring
 */
export const springs = {
  /** Spring doux - Boutons, cards, éléments interactifs */
  gentle: {
    type: 'spring' as const,
    stiffness: 120,
    damping: 14,
    mass: 1,
  },

  /** Spring standard - Usage général */
  default: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1,
  },

  /** Spring réactif - Feedback immédiat (toggles, switches) */
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 0.8,
  },

  /** Spring rebondissant - Éléments ludiques (notifications, badges) */
  bouncy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 15,
    mass: 1,
  },

  /** Spring lent - Grandes surfaces (modals, pages) */
  slow: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 20,
    mass: 1.2,
  },

  /** Spring avec visual duration - Pour synchroniser avec d'autres animations */
  visualDuration: {
    type: 'spring' as const,
    visualDuration: 0.5,
    bounce: 0.25,
  },
} as const

// =============================================================================
// STAGGER CONFIGURATIONS
// =============================================================================

/**
 * Configurations pour les animations en cascade
 *
 * Le stagger permet d'animer les enfants avec un délai progressif
 * créant un effet de vague ou de cascade
 */
export const staggerConfig = {
  /** Stagger rapide - Listes courtes */
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0,
  },

  /** Stagger normal - Listes standard */
  default: {
    staggerChildren: 0.1,
    delayChildren: 0.1,
  },

  /** Stagger lent - Effet plus dramatique */
  slow: {
    staggerChildren: 0.15,
    delayChildren: 0.2,
  },

  /** Stagger inversé - Du dernier au premier */
  reverse: {
    staggerChildren: 0.1,
    staggerDirection: -1 as const,
    delayChildren: 0,
  },
} as const

// =============================================================================
// REDUCED MOTION ALTERNATIVES
// =============================================================================

/**
 * Durées réduites pour prefers-reduced-motion
 *
 * Quand l'utilisateur préfère les mouvements réduits,
 * on utilise des durées minimales ou des animations alternatives
 */
export const reducedMotionDurations = {
  instant: 0,
  fast: 0,
  quick: 0.1,
  normal: 0.1,
  medium: 0.15,
  slow: 0.2,
  slower: 0.2,
  slowest: 0.2,
} as const

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

/**
 * Presets de transition prêts à l'emploi
 *
 * @example
 * ```tsx
 * import { transitions } from '@/lib/animations/config'
 *
 * <motion.div transition={transitions.smooth} />
 * ```
 */
export const transitions = {
  /** Transition instantanée */
  instant: {
    duration: durations.instant,
    ease: easings.easeOut,
  },

  /** Transition rapide et fluide */
  fast: {
    duration: durations.fast,
    ease: easings.easeOut,
  },

  /** Transition standard */
  default: {
    duration: durations.normal,
    ease: easings.easeInOut,
  },

  /** Transition douce */
  smooth: {
    duration: durations.medium,
    ease: easings.easeInOut,
  },

  /** Transition lente et élégante */
  slow: {
    duration: durations.slow,
    ease: easings.easeInOut,
  },

  /** Spring standard */
  spring: springs.default,

  /** Spring doux */
  springGentle: springs.gentle,

  /** Spring réactif */
  springSnappy: springs.snappy,
} as const

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Duration = keyof typeof durations
export type Easing = keyof typeof easings
export type Spring = keyof typeof springs
export type StaggerConfig = keyof typeof staggerConfig
export type Transition = keyof typeof transitions

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export const animationConfig = {
  durations,
  easings,
  springs,
  staggerConfig,
  reducedMotionDurations,
  transitions,
} as const

export default animationConfig
