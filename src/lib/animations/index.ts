/**
 * Animation System - SmartPlanning V2
 *
 * Système d'animations standardisé basé sur Framer Motion
 * Avec support complet de l'accessibilité (prefers-reduced-motion)
 *
 * @see SP-379 - Animations System
 *
 * @example
 * ```tsx
 * // Import des éléments nécessaires
 * import {
 *   useAnimation,
 *   useReducedMotion,
 *   AnimatedContainer,
 *   AnimatedList,
 *   fadeVariants,
 *   hoverScale,
 *   durations,
 * } from '@/lib/animations'
 * ```
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

export {
  durations,
  easings,
  springs,
  staggerConfig,
  reducedMotionDurations,
  transitions,
  animationConfig,
  default as config,
  type Duration,
  type Easing,
  type Spring,
  type StaggerConfig,
  type Transition as AnimationTransition,
} from './config'

// =============================================================================
// VARIANTS
// =============================================================================

export {
  // Fade
  fadeVariants,
  fadeDelayedVariants,
  // Slide
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  // Scale
  scaleVariants,
  scaleSpringVariants,
  popVariants,
  // Combined
  fadeSlideUpVariants,
  fadeScaleVariants,
  // Stagger
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  staggerItemFade,
  staggerItemScale,
  // Page transitions
  pageTransitionFade,
  pageTransitionSlide,
  // Special
  accordionVariants,
  overlayVariants,
  reducedMotionVariants,
  // Factory functions
  createSlideVariant,
  createScaleVariant,
  createStaggerContainer,
  // Landing page specific (compatibility with old system)
  fadeInUp,
  scaleIn,
  // Continuous / Looping animations
  floatAnimation,
  floatSmallAnimation,
  glowPulseAnimation,
  marqueeAnimation,
  bounceAnimation,
  pulseAnimation,
  orbitAnimation,
  // Floating elements presets
  floatingElement1,
  floatingElement2,
  // Illustration variants (with initial/animate states)
  illustrationContainer,
  floatVariants,
  orbitVariants,
  // Map
  variantsMap,
  default as variants,
  type VariantName,
} from './variants'

// =============================================================================
// PRESETS
// =============================================================================

export {
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
  // All presets
  presets,
  default as presetsDefault,
} from './presets'

// =============================================================================
// HOOKS
// =============================================================================

export {
  // Reduced motion
  useReducedMotion,
  usePrefersReducedMotion,
  useMotionSafe,
  // Animation
  useAnimation,
  useWhileAnimation,
  useAnimationWithFallback,
  useAnimationDuration,
  // Stagger
  useStaggerAnimation,
  useQuickStagger,
  useSlowStagger,
  useReverseStagger,
  useGridStagger,
  // In view
  useInViewAnimation,
  useInViewOnce,
  useInViewDelayed,
  useInViewSection,
  useInViewRepeatable,
  // Types
  type AnimationOptions,
  type AnimationProps,
  type WhileAnimationProps,
  type StaggerOptions,
  type StaggerAnimationResult,
  type StaggerItemVariant,
  type InViewOptions,
  type InViewAnimationResult,
} from './hooks'

// =============================================================================
// COMPONENTS
// =============================================================================

export {
  // Containers
  AnimatedContainer,
  FadeContainer,
  SlideUpContainer,
  ScaleContainer,
  StaggerContainer,
  // Lists
  AnimatedList,
  QuickAnimatedList,
  GridAnimatedList,
  AnimatedOrderedList,
  // Presence
  AnimatedPresence,
  AnimatedPresenceWait,
  AnimatedPresencePopLayout,
  AnimatedPresenceNoInitial,
  // Types
  type AnimatedContainerProps,
  type AnimatedListProps,
  type AnimatedPresenceProps,
} from './components'

// =============================================================================
// RE-EXPORTS FROM FRAMER MOTION
// =============================================================================

export {
  motion,
  AnimatePresence as FramerAnimatePresence,
  useAnimation as useFramerAnimation,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useVelocity,
  useAnimationControls,
  LayoutGroup,
  LazyMotion,
  domAnimation,
  domMax,
  m,
} from 'framer-motion'

// Types Framer Motion utiles
export type {
  Variants,
  Transition as FramerTransition,
  TargetAndTransition,
  MotionProps,
  HTMLMotionProps,
  SVGMotionProps,
} from 'framer-motion'
