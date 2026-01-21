/**
 * useInViewAnimation Hook - SmartPlanning V2
 *
 * Hook pour déclencher des animations au scroll
 * basé sur IntersectionObserver via Framer Motion
 *
 * @see SP-379 - Animations System
 * @see https://motion.dev/docs/react-use-in-view
 */

'use client'

import React, { useRef, useMemo, useCallback } from 'react'
import { useInView, useAnimationControls } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useReducedMotion } from './useReducedMotion'
import {
  variantsMap,
  reducedMotionVariants,
  type VariantName,
} from '../variants'

// =============================================================================
// TYPES
// =============================================================================

export interface InViewOptions {
  /** Seuil de visibilité (0-1) - défaut: 0.1 */
  threshold?: number
  /** Marge autour de l'élément (format CSS margin) */
  margin?: string
  /** Animer une seule fois ou à chaque entrée */
  once?: boolean
  /** Délai avant l'animation (en secondes) */
  delay?: number
  /** Variant à utiliser */
  variant?: VariantName | Variants
  /** Ignorer reduced-motion */
  ignoreReducedMotion?: boolean
  /** Élément racine pour l'observation */
  root?: React.RefObject<Element>
}

export interface InViewAnimationResult<T extends Element = HTMLDivElement> {
  /** Ref à attacher à l'élément observé */
  ref: React.RefObject<T | null>
  /** L'élément est-il visible ? */
  isInView: boolean
  /** Contrôles d'animation Framer Motion */
  controls: ReturnType<typeof useAnimationControls>
  /** Props à spreader sur le composant motion */
  animationProps: {
    ref: React.RefObject<T | null>
    variants: Variants
    initial: string
    animate: ReturnType<typeof useAnimationControls>
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour animer les éléments quand ils entrent dans le viewport
 *
 * @param options - Options de configuration
 * @returns Ref, état et props d'animation
 *
 * @example
 * ```tsx
 * function Section() {
 *   const { animationProps, isInView } = useInViewAnimation({
 *     threshold: 0.2,
 *     once: true,
 *     variant: 'fadeSlideUp',
 *   })
 *
 *   return (
 *     <motion.section {...animationProps}>
 *       <h2>Cette section s'anime au scroll</h2>
 *     </motion.section>
 *   )
 * }
 * ```
 */
export function useInViewAnimation<T extends Element = HTMLDivElement>(
  options: InViewOptions = {}
): InViewAnimationResult<T> {
  const shouldReduceMotion = useReducedMotion()

  const {
    threshold = 0.1,
    margin = '0px',
    once = true,
    delay = 0,
    variant = 'fadeSlideUp',
    ignoreReducedMotion = false,
    root,
  } = options

  // Ref pour l'élément observé
  const ref = useRef<T>(null)

  // Options pour useInView
  const inViewOptions = useMemo(
    () => ({
      amount: threshold,
      margin: margin as
        | `${number}px`
        | `${number}px ${number}px`
        | `${number}px ${number}px ${number}px ${number}px`,
      once,
      root,
    }),
    [threshold, margin, once, root]
  )

  // Détection de la visibilité
  const isInView = useInView(ref, inViewOptions)

  // Contrôles d'animation
  const controls = useAnimationControls()

  // Détermine les variants à utiliser
  const activeVariants = useMemo((): Variants => {
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    if (reduceMotion) {
      return reducedMotionVariants
    }

    return typeof variant === 'string' ? variantsMap[variant] : variant
  }, [shouldReduceMotion, ignoreReducedMotion, variant])

  // Effet pour déclencher l'animation
  // Note: Utilise un useCallback pour éviter les dépendances circulaires
  const triggerAnimation = useCallback(async () => {
    if (isInView) {
      if (delay > 0 && !(shouldReduceMotion && !ignoreReducedMotion)) {
        await new Promise((resolve) => setTimeout(resolve, delay * 1000))
      }
      await controls.start('visible')
    } else if (!once) {
      await controls.start('hidden')
    }
  }, [isInView, delay, shouldReduceMotion, ignoreReducedMotion, controls, once])

  // Déclenche l'animation quand isInView change (après mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    void triggerAnimation()
  }, [triggerAnimation])

  // Props à spreader sur le composant motion
  const animationProps = useMemo(
    () => ({
      ref,
      variants: activeVariants,
      initial: 'hidden',
      animate: controls,
    }),
    [activeVariants, controls]
  )

  return {
    ref,
    isInView,
    controls,
    animationProps,
  }
}

/**
 * Hook simplifié pour animation au scroll - une seule fois
 */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  variant: VariantName = 'fadeSlideUp'
): InViewAnimationResult<T> {
  return useInViewAnimation<T>({
    variant,
    once: true,
    threshold: 0.1,
  })
}

/**
 * Hook pour animation au scroll avec délai
 */
export function useInViewDelayed<T extends Element = HTMLDivElement>(
  delay: number,
  variant: VariantName = 'fadeSlideUp'
): InViewAnimationResult<T> {
  return useInViewAnimation<T>({
    variant,
    delay,
    once: true,
  })
}

/**
 * Hook pour sections avec grand seuil de visibilité
 */
export function useInViewSection<T extends Element = HTMLDivElement>(
  options: Omit<InViewOptions, 'threshold'> = {}
): InViewAnimationResult<T> {
  return useInViewAnimation<T>({
    ...options,
    threshold: 0.3,
    variant: options.variant ?? 'fadeSlideUp',
  })
}

/**
 * Hook pour grilles avec animation répétée
 */
export function useInViewRepeatable<T extends Element = HTMLDivElement>(
  variant: VariantName = 'fade'
): InViewAnimationResult<T> {
  return useInViewAnimation<T>({
    variant,
    once: false,
    threshold: 0.2,
  })
}

export default useInViewAnimation
