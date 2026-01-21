/**
 * AnimatedPresence Component - SmartPlanning V2
 *
 * Wrapper autour de AnimatePresence avec defaults SmartPlanning
 * Simplifie l'utilisation des animations d'entrée/sortie
 *
 * @see SP-379 - Animations System
 */

'use client'

import React from 'react'
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion'
import type { AnimatePresenceProps as FramerAnimatePresenceProps } from 'framer-motion'

// =============================================================================
// TYPES
// =============================================================================

export interface AnimatedPresenceProps extends FramerAnimatePresenceProps {
  /** Mode d'animation (défaut: 'sync') */
  mode?: 'sync' | 'wait' | 'popLayout'
  /** Désactiver l'animation initiale */
  initial?: boolean
  /** Callback quand toutes les animations de sortie sont terminées */
  onExitComplete?: () => void
  /** Enfants à animer */
  children: React.ReactNode
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Wrapper AnimatePresence avec defaults SmartPlanning
 *
 * Les modes disponibles :
 * - `sync` (défaut) : Les éléments entrent/sortent simultanément
 * - `wait` : L'élément sortant termine avant que le nouveau n'entre
 * - `popLayout` : Les éléments sortants sont "pop" du layout immédiatement
 *
 * @example
 * ```tsx
 * // Modal avec animation d'entrée/sortie
 * <AnimatedPresence mode="wait">
 *   {isOpen && (
 *     <motion.div
 *       initial={{ opacity: 0 }}
 *       animate={{ opacity: 1 }}
 *       exit={{ opacity: 0 }}
 *     >
 *       <Modal />
 *     </motion.div>
 *   )}
 * </AnimatedPresence>
 *
 * // Liste avec animations sur ajout/suppression
 * <AnimatedPresence mode="popLayout">
 *   {items.map((item) => (
 *     <motion.li
 *       key={item.id}
 *       layout
 *       initial={{ opacity: 0, scale: 0.8 }}
 *       animate={{ opacity: 1, scale: 1 }}
 *       exit={{ opacity: 0, scale: 0.8 }}
 *     >
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </AnimatedPresence>
 * ```
 */
export function AnimatedPresence({
  mode = 'sync',
  initial = true,
  onExitComplete,
  children,
  ...props
}: AnimatedPresenceProps) {
  return (
    <FramerAnimatePresence
      mode={mode}
      initial={initial}
      onExitComplete={onExitComplete}
      {...props}
    >
      {children}
    </FramerAnimatePresence>
  )
}

// =============================================================================
// PRESET VARIANTS
// =============================================================================

/**
 * AnimatePresence avec mode wait (pour transitions séquentielles)
 */
export function AnimatedPresenceWait({
  children,
  ...props
}: Omit<AnimatedPresenceProps, 'mode'>) {
  return (
    <AnimatedPresence mode="wait" {...props}>
      {children}
    </AnimatedPresence>
  )
}

/**
 * AnimatePresence avec mode popLayout (pour listes dynamiques)
 */
export function AnimatedPresencePopLayout({
  children,
  ...props
}: Omit<AnimatedPresenceProps, 'mode'>) {
  return (
    <AnimatedPresence mode="popLayout" {...props}>
      {children}
    </AnimatedPresence>
  )
}

/**
 * AnimatePresence sans animation initiale (pour éviter flash au mount)
 */
export function AnimatedPresenceNoInitial({
  children,
  ...props
}: Omit<AnimatedPresenceProps, 'initial'>) {
  return (
    <AnimatedPresence initial={false} {...props}>
      {children}
    </AnimatedPresence>
  )
}

export default AnimatedPresence
