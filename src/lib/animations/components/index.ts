/**
 * Animation Components - Index
 *
 * Export centralisé de tous les composants d'animation
 *
 * @see SP-379 - Animations System
 */

// =============================================================================
// ANIMATED CONTAINER
// =============================================================================

export {
  AnimatedContainer,
  FadeContainer,
  SlideUpContainer,
  ScaleContainer,
  StaggerContainer,
  default as AnimatedContainerDefault,
  type AnimatedContainerProps,
} from './AnimatedContainer'

// =============================================================================
// ANIMATED LIST
// =============================================================================

export {
  AnimatedList,
  QuickAnimatedList,
  GridAnimatedList,
  AnimatedOrderedList,
  default as AnimatedListDefault,
  type AnimatedListProps,
} from './AnimatedList'

// =============================================================================
// ANIMATED PRESENCE
// =============================================================================

export {
  AnimatedPresence,
  AnimatedPresenceWait,
  AnimatedPresencePopLayout,
  AnimatedPresenceNoInitial,
  default as AnimatedPresenceDefault,
  type AnimatedPresenceProps,
} from './AnimatedPresence'
