/**
 * AnimatedContainer Component - SmartPlanning V2
 *
 * Wrapper pour animer des sections ou pages avec support
 * automatique de prefers-reduced-motion
 *
 * @see SP-379 - Animations System
 */

'use client'

import React, { forwardRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HTMLMotionProps, Variants } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import {
  variantsMap,
  reducedMotionVariants,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  type VariantName,
} from '../variants'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface AnimatedContainerProps
  extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /** Variant d'animation à utiliser */
  variant?: VariantName | 'none'
  /** Activer le stagger pour les enfants */
  stagger?: boolean | 'fast' | 'slow'
  /** Variants personnalisés */
  customVariants?: Variants
  /** Délai avant l'animation */
  delay?: number
  /** Tag HTML à utiliser */
  as?:
    | 'div'
    | 'section'
    | 'article'
    | 'main'
    | 'aside'
    | 'header'
    | 'footer'
    | 'nav'
  /** Afficher avec AnimatePresence (pour les conditions) */
  show?: boolean
  /** Mode AnimatePresence */
  presenceMode?: 'sync' | 'wait' | 'popLayout'
  /** Ignorer reduced-motion */
  ignoreReducedMotion?: boolean
  /** Classes CSS additionnelles */
  className?: string
  /** Enfants à animer */
  children: React.ReactNode
}

// =============================================================================
// STAGGER MAP
// =============================================================================

const staggerMap = {
  true: staggerContainer,
  fast: staggerContainerFast,
  slow: staggerContainerSlow,
} as const

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Container animé pour sections et pages
 *
 * @example
 * ```tsx
 * // Animation simple
 * <AnimatedContainer variant="fadeSlideUp">
 *   <h1>Titre</h1>
 *   <p>Contenu</p>
 * </AnimatedContainer>
 *
 * // Avec stagger pour les enfants
 * <AnimatedContainer variant="fade" stagger>
 *   <Card />
 *   <Card />
 *   <Card />
 * </AnimatedContainer>
 *
 * // Conditionnel avec AnimatePresence
 * <AnimatedContainer variant="fadeScale" show={isOpen}>
 *   <Modal />
 * </AnimatedContainer>
 * ```
 */
export const AnimatedContainer = forwardRef<
  HTMLDivElement,
  AnimatedContainerProps
>(
  (
    {
      variant = 'fadeSlideUp',
      stagger = false,
      customVariants,
      delay = 0,
      as = 'div',
      show = true,
      presenceMode = 'sync',
      ignoreReducedMotion = false,
      className,
      children,
      ...motionProps
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion()
    const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

    // Détermine les variants à utiliser
    const activeVariants = useMemo((): Variants => {
      // Variants personnalisés en priorité
      if (customVariants) {
        return reduceMotion ? reducedMotionVariants : customVariants
      }

      // Pas d'animation
      if (variant === 'none') {
        return {
          hidden: {},
          visible: {},
          exit: {},
        }
      }

      // Reduced motion
      if (reduceMotion) {
        return reducedMotionVariants
      }

      // Stagger container
      if (stagger) {
        const staggerKey = stagger === true ? 'true' : stagger
        return staggerMap[staggerKey]
      }

      // Variant standard
      return variantsMap[variant]
    }, [customVariants, variant, stagger, reduceMotion])

    // Transition avec délai
    const transition = useMemo(() => {
      if (delay > 0 && !reduceMotion) {
        return { delay }
      }
      return undefined
    }, [delay, reduceMotion])

    // Créer le composant motion dynamiquement
    const MotionComponent = motion[as] as typeof motion.div

    // Contenu animé
    const content = (
      <MotionComponent
        ref={ref}
        variants={activeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        className={cn(className)}
        {...motionProps}
      >
        {children}
      </MotionComponent>
    )

    // Avec AnimatePresence si show est utilisé
    if (typeof show === 'boolean') {
      return (
        <AnimatePresence mode={presenceMode}>{show && content}</AnimatePresence>
      )
    }

    return content
  }
)

AnimatedContainer.displayName = 'AnimatedContainer'

// =============================================================================
// VARIANT SHORTCUTS
// =============================================================================

/**
 * Container avec fade simple
 */
export const FadeContainer = forwardRef<
  HTMLDivElement,
  Omit<AnimatedContainerProps, 'variant'>
>((props, ref) => <AnimatedContainer ref={ref} variant="fade" {...props} />)
FadeContainer.displayName = 'FadeContainer'

/**
 * Container avec slide up
 */
export const SlideUpContainer = forwardRef<
  HTMLDivElement,
  Omit<AnimatedContainerProps, 'variant'>
>((props, ref) => <AnimatedContainer ref={ref} variant="slideUp" {...props} />)
SlideUpContainer.displayName = 'SlideUpContainer'

/**
 * Container avec scale
 */
export const ScaleContainer = forwardRef<
  HTMLDivElement,
  Omit<AnimatedContainerProps, 'variant'>
>((props, ref) => <AnimatedContainer ref={ref} variant="scale" {...props} />)
ScaleContainer.displayName = 'ScaleContainer'

/**
 * Container avec stagger automatique
 */
export const StaggerContainer = forwardRef<
  HTMLDivElement,
  Omit<AnimatedContainerProps, 'variant' | 'stagger'>
>((props, ref) => (
  <AnimatedContainer ref={ref} variant="fade" stagger {...props} />
))
StaggerContainer.displayName = 'StaggerContainer'

export default AnimatedContainer
