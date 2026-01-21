/**
 * useAnimation Hook - SmartPlanning V2
 *
 * Hook pour utiliser les animations de manière réutilisable
 * avec support automatique de prefers-reduced-motion
 *
 * @see SP-379 - Animations System
 */

'use client'

import { useMemo } from 'react'
import type { Variants, TargetAndTransition, Transition } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'
import { variantsMap, reducedMotionVariants, type VariantName } from '../variants'
import { transitions, reducedMotionDurations, durations } from '../config'

// =============================================================================
// TYPES
// =============================================================================

export interface AnimationOptions {
  /** Délai avant l'animation (en secondes) */
  delay?: number
  /** Durée personnalisée (en secondes) */
  duration?: number
  /** Désactiver l'animation reduced-motion */
  ignoreReducedMotion?: boolean
  /** Transition personnalisée */
  transition?: Transition
}

export interface AnimationProps {
  variants: Variants
  initial: string
  animate: string
  exit?: string
  transition?: Transition
}

export interface WhileAnimationProps {
  whileHover?: TargetAndTransition
  whileTap?: TargetAndTransition
  whileFocus?: TargetAndTransition
  transition?: Transition
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour obtenir les props d'animation réutilisables
 *
 * @param variant - Nom du variant prédéfini ou variants personnalisés
 * @param options - Options d'animation
 * @returns Props à spreader sur un composant motion
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const animationProps = useAnimation('fadeSlideUp', { delay: 0.2 })
 *
 *   return (
 *     <motion.div {...animationProps}>
 *       Contenu animé
 *     </motion.div>
 *   )
 * }
 * ```
 */
export function useAnimation(
  variant: VariantName | Variants,
  options: AnimationOptions = {}
): AnimationProps {
  const shouldReduceMotion = useReducedMotion()
  const { delay = 0, duration, ignoreReducedMotion = false, transition: customTransition } = options

  return useMemo(() => {
    // Détermine si on doit réduire le mouvement
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    // Récupère les variants
    const baseVariants = typeof variant === 'string' ? variantsMap[variant] : variant
    const activeVariants = reduceMotion ? reducedMotionVariants : baseVariants

    // Construit la transition
    const baseTransition: Transition = {
      duration: reduceMotion
        ? reducedMotionDurations.normal
        : duration ?? durations.normal,
      delay,
    }

    const finalTransition = customTransition
      ? { ...baseTransition, ...customTransition }
      : baseTransition

    return {
      variants: activeVariants,
      initial: 'hidden',
      animate: 'visible',
      exit: 'exit',
      transition: finalTransition,
    }
  }, [variant, shouldReduceMotion, delay, duration, ignoreReducedMotion, customTransition])
}

/**
 * Hook pour obtenir les props d'animation while (hover, tap, focus)
 *
 * @param options - Configuration des animations while
 * @returns Props whileHover, whileTap, whileFocus à spreader
 *
 * @example
 * ```tsx
 * function Button() {
 *   const whileProps = useWhileAnimation({
 *     hover: { scale: 1.02 },
 *     tap: { scale: 0.98 },
 *   })
 *
 *   return (
 *     <motion.button {...whileProps}>
 *       Click me
 *     </motion.button>
 *   )
 * }
 * ```
 */
export function useWhileAnimation(options: {
  hover?: TargetAndTransition
  tap?: TargetAndTransition
  focus?: TargetAndTransition
  ignoreReducedMotion?: boolean
}): WhileAnimationProps {
  const shouldReduceMotion = useReducedMotion()
  const { hover, tap, focus, ignoreReducedMotion = false } = options

  return useMemo(() => {
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    if (reduceMotion) {
      // En reduced motion, on utilise uniquement opacity
      return {
        whileHover: hover ? { opacity: 0.8 } : undefined,
        whileTap: tap ? { opacity: 0.7 } : undefined,
        whileFocus: focus ? { opacity: 0.9 } : undefined,
        transition: { duration: reducedMotionDurations.fast },
      }
    }

    return {
      whileHover: hover,
      whileTap: tap,
      whileFocus: focus,
      transition: transitions.fast,
    }
  }, [shouldReduceMotion, hover, tap, focus, ignoreReducedMotion])
}

/**
 * Hook pour créer une animation custom avec support reduced-motion
 *
 * @param normalProps - Props d'animation normale
 * @param reducedProps - Props pour reduced-motion (optionnel)
 * @returns Props appropriées selon la préférence
 */
export function useAnimationWithFallback<T extends object>(
  normalProps: T,
  reducedProps?: Partial<T>
): T | Partial<T> {
  const shouldReduceMotion = useReducedMotion()

  return useMemo(() => {
    if (shouldReduceMotion) {
      return reducedProps ?? ({} as Partial<T>)
    }
    return normalProps
  }, [shouldReduceMotion, normalProps, reducedProps])
}

/**
 * Hook pour obtenir la durée appropriée selon reduced-motion
 *
 * @param normalDuration - Durée normale en secondes
 * @returns Durée adaptée
 */
export function useAnimationDuration(normalDuration: number): number {
  const shouldReduceMotion = useReducedMotion()

  return useMemo(() => {
    if (shouldReduceMotion) {
      // Retourne une durée minimale (pas 0 pour garder une transition)
      return Math.min(normalDuration, 0.1)
    }
    return normalDuration
  }, [shouldReduceMotion, normalDuration])
}

export default useAnimation
