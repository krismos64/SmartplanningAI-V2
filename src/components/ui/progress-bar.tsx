'use client'

import * as React from 'react'
import { motion, type Easing } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tailles disponibles pour la ProgressBar
 */
export type ProgressBarSize = 'sm' | 'md' | 'lg'

/**
 * Variantes de couleur pour la ProgressBar
 * Utilisent les Design Tokens sémantiques
 */
export type ProgressBarColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'

/**
 * Props du composant ProgressBar
 */
export interface ProgressBarProps {
  /**
   * Valeur actuelle de la progression (0-100)
   * Si non défini, la barre est en mode indéterminé
   */
  value?: number

  /**
   * Taille de la barre
   * @default 'md'
   */
  size?: ProgressBarSize

  /**
   * Couleur de la barre (utilise les Design Tokens)
   * @default 'primary'
   */
  color?: ProgressBarColor

  /**
   * Afficher le pourcentage en label
   * @default false
   */
  showLabel?: boolean

  /**
   * Position du label
   * @default 'right'
   */
  labelPosition?: 'right' | 'top' | 'inside'

  /**
   * Label personnalisé (remplace le pourcentage)
   */
  customLabel?: string

  /**
   * Label accessible pour les lecteurs d'écran
   * @default 'Progression'
   */
  'aria-label'?: string

  /**
   * ID de l'élément décrivant la progressbar
   */
  'aria-describedby'?: string

  /**
   * Classes CSS additionnelles pour le container
   */
  className?: string

  /**
   * Classes CSS additionnelles pour la barre de progression
   */
  barClassName?: string

  /**
   * Durée de l'animation de la barre (en secondes)
   * @default 0.3
   */
  animationDuration?: number

  /**
   * Callback appelé quand la progression atteint 100%
   */
  onComplete?: () => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SIZE_CLASSES: Record<ProgressBarSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

const COLOR_CLASSES: Record<ProgressBarColor, { track: string; bar: string }> =
  {
    primary: {
      track: 'bg-primary/20 dark:bg-primary/10',
      bar: 'bg-primary',
    },
    success: {
      track: 'bg-emerald-500/20 dark:bg-emerald-500/10',
      bar: 'bg-emerald-500 dark:bg-emerald-400',
    },
    warning: {
      track: 'bg-amber-500/20 dark:bg-amber-500/10',
      bar: 'bg-amber-500 dark:bg-amber-400',
    },
    destructive: {
      track: 'bg-rose-500/20 dark:bg-rose-500/10',
      bar: 'bg-rose-500 dark:bg-rose-400',
    },
    info: {
      track: 'bg-cyan-500/20 dark:bg-cyan-500/10',
      bar: 'bg-cyan-500 dark:bg-cyan-400',
    },
  }

const LABEL_SIZE_CLASSES: Record<ProgressBarSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProgressBar - Barre de progression avec support déterminé et indéterminé
 *
 * Features:
 * - Mode déterminé (value 0-100%) ou indéterminé (animation continue)
 * - 3 tailles : sm (h-1), md (h-2), lg (h-3)
 * - 5 couleurs sémantiques via Design Tokens
 * - Label optionnel (pourcentage ou personnalisé)
 * - Animation fluide avec Framer Motion
 * - Support prefers-reduced-motion
 * - Accessibilité complète (ARIA)
 * - Support dark mode
 *
 * @example
 * ```tsx
 * // Déterminé avec pourcentage
 * <ProgressBar value={75} showLabel />
 *
 * // Indéterminé (loading)
 * <ProgressBar />
 *
 * // Avec couleur et taille personnalisées
 * <ProgressBar value={50} color="success" size="lg" />
 * ```
 *
 * @see SP-266 - Loading States avancés
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      size = 'md',
      color = 'primary',
      showLabel = false,
      labelPosition = 'right',
      customLabel,
      'aria-label': ariaLabel = 'Progression',
      'aria-describedby': ariaDescribedBy,
      className,
      barClassName,
      animationDuration = 0.3,
      onComplete,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const isIndeterminate = value === undefined

    // Normaliser la valeur entre 0 et 100
    const normalizedValue = React.useMemo(() => {
      if (isIndeterminate) return 0
      return Math.min(100, Math.max(0, value))
    }, [value, isIndeterminate])

    // Appeler onComplete quand la valeur atteint 100%
    React.useEffect(() => {
      if (normalizedValue === 100 && onComplete) {
        onComplete()
      }
    }, [normalizedValue, onComplete])

    // Calculer le label à afficher
    const displayLabel = React.useMemo(() => {
      if (customLabel) return customLabel
      if (isIndeterminate) return 'Chargement...'
      return `${Math.round(normalizedValue)}%`
    }, [customLabel, isIndeterminate, normalizedValue])

    const colorConfig = COLOR_CLASSES[color]

    // Animation pour mode indéterminé
    const indeterminateAnimation = {
      x: ['-100%', '100%'],
      transition: {
        duration: prefersReducedMotion ? 0 : 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as Easing,
      },
    }

    // Animation pour mode déterminé
    const determinateAnimation = {
      width: `${normalizedValue}%`,
      transition: {
        duration: prefersReducedMotion ? 0 : animationDuration,
        ease: 'easeOut' as Easing,
      },
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full items-center gap-3',
          labelPosition === 'top' && 'flex-col items-start gap-1',
          className
        )}
      >
        {/* Label en haut */}
        {showLabel && labelPosition === 'top' && (
          <span
            className={cn(
              'font-medium text-foreground',
              LABEL_SIZE_CLASSES[size]
            )}
          >
            {displayLabel}
          </span>
        )}

        {/* Track (fond) */}
        <div
          role="progressbar"
          aria-valuenow={isIndeterminate ? undefined : normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-busy={isIndeterminate}
          className={cn(
            'relative w-full overflow-hidden rounded-full',
            SIZE_CLASSES[size],
            colorConfig.track
          )}
        >
          {/* Barre de progression */}
          {isIndeterminate ? (
            // Mode indéterminé : animation shimmer
            <motion.div
              className={cn(
                'absolute inset-y-0 w-1/3 rounded-full',
                colorConfig.bar,
                barClassName
              )}
              animate={indeterminateAnimation}
              aria-hidden="true"
            />
          ) : (
            // Mode déterminé : barre proportionnelle
            <motion.div
              className={cn(
                'h-full rounded-full',
                colorConfig.bar,
                barClassName
              )}
              initial={{ width: 0 }}
              animate={determinateAnimation}
              aria-hidden="true"
            >
              {/* Label inside */}
              {showLabel && labelPosition === 'inside' && size === 'lg' && (
                <span
                  className={cn(
                    'absolute inset-0 flex items-center justify-center text-xs font-medium',
                    normalizedValue > 50 ? 'text-white' : 'text-foreground'
                  )}
                >
                  {displayLabel}
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Label à droite */}
        {showLabel && labelPosition === 'right' && (
          <span
            className={cn(
              'min-w-[3rem] font-medium tabular-nums text-foreground',
              LABEL_SIZE_CLASSES[size]
            )}
          >
            {displayLabel}
          </span>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar
