/**
 * AnimatedList Component - SmartPlanning V2
 *
 * Composant pour animer des listes avec stagger automatique
 * Optimisé pour les performances et l'accessibilité
 *
 * @see SP-379 - Animations System
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useStaggerAnimation, type StaggerItemVariant } from '../hooks/useStaggerAnimation'
import { cn } from '@/lib/utils'

// =============================================================================
// TYPES
// =============================================================================

export interface AnimatedListProps<T> extends Omit<HTMLMotionProps<'ul'>, 'children'> {
  /** Items à afficher */
  items: T[]
  /** Fonction de rendu pour chaque item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Fonction pour obtenir la clé unique de chaque item */
  keyExtractor: (item: T, index: number) => string | number
  /** Délai entre chaque item (en secondes) */
  staggerDelay?: number
  /** Délai initial avant le premier item */
  initialDelay?: number
  /** Variant pour les items */
  itemVariant?: StaggerItemVariant
  /** Direction du stagger (-1 pour inverse) */
  direction?: 1 | -1
  /** Tag pour le container */
  as?: 'ul' | 'ol' | 'div'
  /** Tag pour chaque item */
  itemAs?: 'li' | 'div' | 'article'
  /** Classes pour le container */
  className?: string
  /** Classes pour chaque item */
  itemClassName?: string
  /** Composant à afficher si la liste est vide */
  emptyComponent?: React.ReactNode
  /** Animer les ajouts/suppressions */
  animatePresence?: boolean
  /** Mode AnimatePresence */
  presenceMode?: 'sync' | 'wait' | 'popLayout'
  /** Ignorer reduced-motion */
  ignoreReducedMotion?: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Liste animée avec stagger automatique
 *
 * @example
 * ```tsx
 * // Liste simple
 * <AnimatedList
 *   items={users}
 *   keyExtractor={(user) => user.id}
 *   renderItem={(user) => <UserCard user={user} />}
 * />
 *
 * // Avec options personnalisées
 * <AnimatedList
 *   items={products}
 *   keyExtractor={(p) => p.id}
 *   renderItem={(p) => <ProductCard product={p} />}
 *   staggerDelay={0.15}
 *   itemVariant="scale"
 *   as="div"
 *   itemAs="article"
 *   className="grid grid-cols-3 gap-4"
 * />
 *
 * // Avec AnimatePresence pour additions/suppressions
 * <AnimatedList
 *   items={notifications}
 *   keyExtractor={(n) => n.id}
 *   renderItem={(n) => <Notification {...n} />}
 *   animatePresence
 *   presenceMode="popLayout"
 * />
 * ```
 */
export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  staggerDelay,
  initialDelay,
  itemVariant = 'default',
  direction = 1,
  as = 'ul',
  itemAs = 'li',
  className,
  itemClassName,
  emptyComponent,
  animatePresence = false,
  presenceMode = 'sync',
  ignoreReducedMotion = false,
  ...motionProps
}: AnimatedListProps<T>) {
  const shouldReduceMotion = useReducedMotion()
  const reduceMotion = shouldReduceMotion && !ignoreReducedMotion

  // Hook stagger
  const { containerProps, itemProps } = useStaggerAnimation(items.length, {
    staggerDelay,
    initialDelay,
    itemVariant,
    direction,
    ignoreReducedMotion,
  })

  // Container motion component
  const MotionContainer = motion[as] as typeof motion.ul
  const MotionItem = motion[itemAs] as typeof motion.li

  // Liste vide
  if (items.length === 0) {
    if (emptyComponent) {
      return <>{emptyComponent}</>
    }
    return null
  }

  // Contenu des items
  const listItems = items.map((item, index) => {
    const key = keyExtractor(item, index)

    return (
      <MotionItem
        key={key}
        {...itemProps}
        className={cn(itemClassName)}
        layout={animatePresence && !reduceMotion}
      >
        {renderItem(item, index)}
      </MotionItem>
    )
  })

  // Avec AnimatePresence
  if (animatePresence) {
    return (
      <MotionContainer
        {...containerProps}
        className={cn(className)}
        {...motionProps}
      >
        <AnimatePresence mode={presenceMode}>
          {listItems}
        </AnimatePresence>
      </MotionContainer>
    )
  }

  // Sans AnimatePresence
  return (
    <MotionContainer
      {...containerProps}
      className={cn(className)}
      {...motionProps}
    >
      {listItems}
    </MotionContainer>
  )
}

// =============================================================================
// TYPED VARIANTS
// =============================================================================

/**
 * Liste avec stagger rapide
 */
export function QuickAnimatedList<T>(
  props: Omit<AnimatedListProps<T>, 'staggerDelay' | 'initialDelay'>
) {
  return <AnimatedList<T> {...props} staggerDelay={0.05} initialDelay={0} itemVariant="fade" />
}

/**
 * Liste avec animation scale (pour grilles)
 */
export function GridAnimatedList<T>(
  props: Omit<AnimatedListProps<T>, 'staggerDelay' | 'itemVariant' | 'as'>
) {
  return (
    <AnimatedList<T>
      {...props}
      staggerDelay={0.08}
      itemVariant="scale"
      as="div"
      itemAs="div"
    />
  )
}

/**
 * Liste ordonnée animée
 */
export function AnimatedOrderedList<T>(
  props: Omit<AnimatedListProps<T>, 'as'>
) {
  return <AnimatedList<T> {...props} as="ol" />
}

export default AnimatedList
