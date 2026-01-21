/**
 * Animation Hooks - Index
 *
 * Export centralisé de tous les hooks d'animation
 *
 * @see SP-379 - Animations System
 */

// =============================================================================
// REDUCED MOTION
// =============================================================================

export {
  useReducedMotion,
  usePrefersReducedMotion,
  useMotionSafe,
  default as useReducedMotionDefault,
} from './useReducedMotion'

// =============================================================================
// ANIMATION
// =============================================================================

export {
  useAnimation,
  useWhileAnimation,
  useAnimationWithFallback,
  useAnimationDuration,
  default as useAnimationDefault,
  type AnimationOptions,
  type AnimationProps,
  type WhileAnimationProps,
} from './useAnimation'

// =============================================================================
// STAGGER
// =============================================================================

export {
  useStaggerAnimation,
  useQuickStagger,
  useSlowStagger,
  useReverseStagger,
  useGridStagger,
  default as useStaggerAnimationDefault,
  type StaggerOptions,
  type StaggerAnimationResult,
  type StaggerItemVariant,
} from './useStaggerAnimation'

// =============================================================================
// IN VIEW
// =============================================================================

export {
  useInViewAnimation,
  useInViewOnce,
  useInViewDelayed,
  useInViewSection,
  useInViewRepeatable,
  default as useInViewAnimationDefault,
  type InViewOptions,
  type InViewAnimationResult,
} from './useInViewAnimation'
