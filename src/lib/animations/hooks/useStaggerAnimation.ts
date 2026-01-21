/**
 * useStaggerAnimation Hook - SmartPlanning V2
 *
 * Hook pour créer des animations en cascade (stagger)
 * pour listes, grilles et groupes d'éléments
 *
 * @see SP-379 - Animations System
 */

'use client'

import { useMemo, useCallback } from 'react'
import type { Variants } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'
import {
  staggerItem,
  staggerItemFade,
  staggerItemScale,
  reducedMotionVariants,
} from '../variants'
import { staggerConfig, durations, easings } from '../config'

// =============================================================================
// TYPES
// =============================================================================

export type StaggerItemVariant = 'default' | 'fade' | 'scale'

export interface StaggerOptions {
  /** Délai entre chaque élément (en secondes) */
  staggerDelay?: number
  /** Délai initial avant le premier élément */
  initialDelay?: number
  /** Direction du stagger (-1 pour inverse) */
  direction?: 1 | -1
  /** Variant pour les items */
  itemVariant?: StaggerItemVariant
  /** Durée de l'animation de chaque item */
  itemDuration?: number
  /** Ignorer reduced-motion */
  ignoreReducedMotion?: boolean
}

export interface StaggerAnimationResult {
  /** Props pour le container parent */
  containerProps: {
    variants: Variants
    initial: string
    animate: string
    exit?: string
  }
  /** Props pour chaque item enfant */
  itemProps: {
    variants: Variants
  }
  /** Fonction pour obtenir le délai d'un item par index */
  getItemDelay: (index: number) => number
  /** Fonction pour obtenir les props d'un item avec délai custom */
  getItemProps: (index: number) => {
    variants: Variants
    custom: number
  }
}

// =============================================================================
// ITEM VARIANTS MAP
// =============================================================================

const itemVariantsMap: Record<StaggerItemVariant, Variants> = {
  default: staggerItem,
  fade: staggerItemFade,
  scale: staggerItemScale,
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour créer des animations stagger sur des listes
 *
 * @param itemCount - Nombre d'éléments dans la liste
 * @param options - Options de configuration
 * @returns Props pour container et items
 *
 * @example
 * ```tsx
 * function MyList({ items }) {
 *   const { containerProps, itemProps } = useStaggerAnimation(items.length)
 *
 *   return (
 *     <motion.ul {...containerProps}>
 *       {items.map((item) => (
 *         <motion.li key={item.id} {...itemProps}>
 *           {item.name}
 *         </motion.li>
 *       ))}
 *     </motion.ul>
 *   )
 * }
 * ```
 */
export function useStaggerAnimation(
  itemCount: number,
  options: StaggerOptions = {}
): StaggerAnimationResult {
  const shouldReduceMotion = useReducedMotion()

  const {
    staggerDelay = staggerConfig.default.staggerChildren,
    initialDelay = staggerConfig.default.delayChildren,
    direction = 1,
    itemVariant = 'default',
    itemDuration = durations.normal,
    ignoreReducedMotion = false,
  } = options

  // Container variants mémorisés
  const containerVariants = useMemo((): Variants => {
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    if (reduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { duration: 0.1 },
        },
        exit: { opacity: 0 },
      }
    }

    return {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: initialDelay,
          staggerDirection: direction,
          when: 'beforeChildren',
        },
      },
      exit: {
        opacity: 0,
        transition: {
          staggerChildren: staggerDelay / 2,
          staggerDirection: -direction,
          when: 'afterChildren',
        },
      },
    }
  }, [
    shouldReduceMotion,
    ignoreReducedMotion,
    staggerDelay,
    initialDelay,
    direction,
  ])

  // Item variants mémorisés
  const itemVariants = useMemo((): Variants => {
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    if (reduceMotion) {
      return reducedMotionVariants
    }

    const baseVariants = itemVariantsMap[itemVariant]

    // Override duration si spécifiée
    return {
      ...baseVariants,
      visible: {
        ...baseVariants.visible,
        transition: {
          duration: itemDuration,
          ease: easings.easeOut,
        },
      },
    }
  }, [shouldReduceMotion, ignoreReducedMotion, itemVariant, itemDuration])

  // Fonction pour calculer le délai d'un item
  const getItemDelay = useCallback(
    (index: number): number => {
      if (shouldReduceMotion && !ignoreReducedMotion) {
        return 0
      }

      const adjustedIndex = direction === -1 ? itemCount - 1 - index : index
      return initialDelay + adjustedIndex * staggerDelay
    },
    [
      shouldReduceMotion,
      ignoreReducedMotion,
      direction,
      itemCount,
      initialDelay,
      staggerDelay,
    ]
  )

  // Fonction pour obtenir les props d'un item avec son délai
  const getItemProps = useCallback(
    (index: number) => ({
      variants: itemVariants,
      custom: getItemDelay(index),
    }),
    [itemVariants, getItemDelay]
  )

  return {
    containerProps: {
      variants: containerVariants,
      initial: 'hidden',
      animate: 'visible',
      exit: 'exit',
    },
    itemProps: {
      variants: itemVariants,
    },
    getItemDelay,
    getItemProps,
  }
}

/**
 * Hook simplifié pour stagger rapide
 */
export function useQuickStagger(itemCount: number): StaggerAnimationResult {
  return useStaggerAnimation(itemCount, {
    staggerDelay: staggerConfig.fast.staggerChildren,
    initialDelay: 0,
    itemVariant: 'fade',
  })
}

/**
 * Hook pour stagger lent et dramatique
 */
export function useSlowStagger(itemCount: number): StaggerAnimationResult {
  return useStaggerAnimation(itemCount, {
    staggerDelay: staggerConfig.slow.staggerChildren,
    initialDelay: staggerConfig.slow.delayChildren,
    itemVariant: 'default',
  })
}

/**
 * Hook pour stagger inversé (du dernier au premier)
 */
export function useReverseStagger(itemCount: number): StaggerAnimationResult {
  return useStaggerAnimation(itemCount, {
    direction: -1,
    staggerDelay: staggerConfig.default.staggerChildren,
  })
}

/**
 * Hook pour stagger avec scale (pour grilles)
 */
export function useGridStagger(itemCount: number): StaggerAnimationResult {
  return useStaggerAnimation(itemCount, {
    staggerDelay: 0.08,
    itemVariant: 'scale',
  })
}

export default useStaggerAnimation
