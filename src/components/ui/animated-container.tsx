'use client'

/**
 * AnimatedContainer - Composants d'animation avec Framer Motion
 *
 * Composants pour animations d'entrée fluides avec support stagger.
 * Direction esthétique : "Cyber Glass 3D"
 *
 * @see SP-259 - Design Tokens Enhancement
 * @see Motion docs - stagger, variants, delayChildren
 */

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

/**
 * Variant fadeInUp - Animation d'entrée standard
 * Fondu + translation vers le haut + légère mise à l'échelle
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Variant fadeInDown - Animation d'entrée par le haut
 */
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Variant fadeInLeft - Animation d'entrée par la gauche
 */
export const fadeInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Variant fadeInRight - Animation d'entrée par la droite
 */
export const fadeInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Variant scaleIn - Animation d'entrée avec zoom
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

/**
 * Variant staggerContainer - Container pour animations échelonnées
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

/**
 * Variant staggerContainerFast - Container stagger rapide
 */
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

/**
 * Variant staggerContainerSlow - Container stagger lent
 */
export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

// =============================================================================
// ANIMATED CONTAINER COMPONENT
// =============================================================================

export interface AnimatedContainerProps extends HTMLMotionProps<'div'> {
  /** Contenu à animer */
  children: React.ReactNode
  /** Classes CSS additionnelles */
  className?: string
  /** Activer le mode stagger pour les enfants */
  stagger?: boolean
  /** Vitesse du stagger : 'fast' | 'normal' | 'slow' */
  staggerSpeed?: 'fast' | 'normal' | 'slow'
  /** Délai avant le début de l'animation (en secondes) */
  delay?: number
  /** Type d'animation */
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
  /** Désactiver l'animation (pour les tests ou préférences utilisateur) */
  disabled?: boolean
}

/**
 * AnimatedContainer - Container avec animation d'entrée
 *
 * @example
 * ```tsx
 * // Animation simple
 * <AnimatedContainer>
 *   <Card>Content</Card>
 * </AnimatedContainer>
 *
 * // Animation stagger pour liste
 * <AnimatedContainer stagger>
 *   {items.map(item => (
 *     <AnimatedItem key={item.id}>
 *       <Card>{item.title}</Card>
 *     </AnimatedItem>
 *   ))}
 * </AnimatedContainer>
 *
 * // Animation avec délai
 * <AnimatedContainer delay={0.3} animation="fadeInLeft">
 *   <Sidebar />
 * </AnimatedContainer>
 * ```
 */
export function AnimatedContainer({
  children,
  className,
  stagger = false,
  staggerSpeed = 'normal',
  delay = 0,
  animation = 'fadeInUp',
  disabled = false,
  ...props
}: AnimatedContainerProps) {
  // Si désactivé, render sans animation
  if (disabled) {
    return <div className={className}>{children}</div>
  }

  // Sélection du variant d'animation
  const animationVariants: Record<string, Variants> = {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
  }

  // Sélection du container stagger
  const staggerVariants: Record<string, Variants> = {
    fast: staggerContainerFast,
    normal: staggerContainer,
    slow: staggerContainerSlow,
  }

  const selectedVariant = stagger
    ? staggerVariants[staggerSpeed]
    : animationVariants[animation]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={selectedVariant}
      transition={{ delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// ANIMATED ITEM COMPONENT
// =============================================================================

export interface AnimatedItemProps extends HTMLMotionProps<'div'> {
  /** Contenu à animer */
  children: React.ReactNode
  /** Classes CSS additionnelles */
  className?: string
  /** Type d'animation (doit correspondre au parent stagger) */
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn'
}

/**
 * AnimatedItem - Élément enfant pour animations stagger
 *
 * À utiliser dans un AnimatedContainer avec stagger=true
 *
 * @example
 * ```tsx
 * <AnimatedContainer stagger>
 *   {items.map(item => (
 *     <AnimatedItem key={item.id}>
 *       <Card>{item.title}</Card>
 *     </AnimatedItem>
 *   ))}
 * </AnimatedContainer>
 * ```
 */
export function AnimatedItem({
  children,
  className,
  animation = 'fadeInUp',
  ...props
}: AnimatedItemProps) {
  const animationVariants: Record<string, Variants> = {
    fadeInUp,
    fadeInDown,
    fadeInLeft,
    fadeInRight,
    scaleIn,
  }

  return (
    <motion.div
      variants={animationVariants[animation]}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// =============================================================================
// ANIMATED PRESENCE WRAPPER
// =============================================================================

export interface AnimatedPresenceProps {
  /** Contenu à animer */
  children: React.ReactNode
  /** Clé unique pour l'animation de sortie */
  presenceKey?: string | number
  /** Mode d'animation : 'wait' attend la sortie avant l'entrée */
  mode?: 'wait' | 'sync' | 'popLayout'
}

/**
 * Hook pour détecter les préférences de réduction de mouvement
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  return mediaQuery.matches
}

// =============================================================================
// EXPORTS
// =============================================================================

export const animationVariants = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
}
