'use client'

import * as React from 'react'
import { motion, type Easing } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/lib/animations'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Tailles disponibles pour le ProgressCircle
 */
export type ProgressCircleSize = 'sm' | 'md' | 'lg'

/**
 * Variantes de couleur pour le ProgressCircle
 * Utilisent les Design Tokens sémantiques
 */
export type ProgressCircleColor =
  | 'primary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'info'

/**
 * Props du composant ProgressCircle
 */
export interface ProgressCircleProps {
  /**
   * Valeur actuelle de la progression (0-100)
   * Si non défini, le cercle est en mode indéterminé (spinning)
   */
  value?: number

  /**
   * Taille du cercle
   * @default 'md'
   */
  size?: ProgressCircleSize

  /**
   * Couleur du cercle (utilise les Design Tokens)
   * @default 'primary'
   */
  color?: ProgressCircleColor

  /**
   * Épaisseur du trait (stroke)
   * @default undefined (calculé automatiquement selon la taille)
   */
  strokeWidth?: number

  /**
   * Afficher le pourcentage au centre
   * @default false
   */
  showValue?: boolean

  /**
   * Label personnalisé au centre (remplace le pourcentage)
   */
  centerLabel?: React.ReactNode

  /**
   * Label accessible pour les lecteurs d'écran
   * @default 'Progression'
   */
  'aria-label'?: string

  /**
   * ID de l'élément décrivant le progresscircle
   */
  'aria-describedby'?: string

  /**
   * Classes CSS additionnelles
   */
  className?: string

  /**
   * Durée de l'animation de progression (en secondes)
   * @default 0.5
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

const SIZE_CONFIG: Record<
  ProgressCircleSize,
  { size: number; strokeWidth: number; fontSize: string }
> = {
  sm: { size: 32, strokeWidth: 3, fontSize: 'text-xs' },
  md: { size: 48, strokeWidth: 4, fontSize: 'text-sm' },
  lg: { size: 64, strokeWidth: 5, fontSize: 'text-base' },
}

const COLOR_CLASSES: Record<
  ProgressCircleColor,
  { track: string; progress: string }
> = {
  primary: {
    track: 'stroke-primary/20 dark:stroke-primary/10',
    progress: 'stroke-primary',
  },
  success: {
    track: 'stroke-emerald-500/20 dark:stroke-emerald-500/10',
    progress: 'stroke-emerald-500 dark:stroke-emerald-400',
  },
  warning: {
    track: 'stroke-amber-500/20 dark:stroke-amber-500/10',
    progress: 'stroke-amber-500 dark:stroke-amber-400',
  },
  destructive: {
    track: 'stroke-rose-500/20 dark:stroke-rose-500/10',
    progress: 'stroke-rose-500 dark:stroke-rose-400',
  },
  info: {
    track: 'stroke-cyan-500/20 dark:stroke-cyan-500/10',
    progress: 'stroke-cyan-500 dark:stroke-cyan-400',
  },
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ProgressCircle - Indicateur de progression circulaire SVG
 *
 * Features:
 * - Mode déterminé (value 0-100%) ou indéterminé (spinning)
 * - 3 tailles : sm (32px), md (48px), lg (64px)
 * - 5 couleurs sémantiques via Design Tokens
 * - Pourcentage optionnel au centre
 * - Animation fluide avec Framer Motion (stroke-dasharray/dashoffset)
 * - Support prefers-reduced-motion
 * - Accessibilité complète (ARIA)
 * - Support dark mode
 *
 * @example
 * ```tsx
 * // Déterminé avec pourcentage
 * <ProgressCircle value={75} showValue />
 *
 * // Indéterminé (spinning)
 * <ProgressCircle />
 *
 * // Avec couleur et taille personnalisées
 * <ProgressCircle value={50} color="success" size="lg" />
 *
 * // Avec label personnalisé au centre
 * <ProgressCircle value={100} centerLabel={<CheckIcon />} />
 * ```
 *
 * @see SP-266 - Loading States avancés
 */
export const ProgressCircle = React.forwardRef<
  HTMLDivElement,
  ProgressCircleProps
>(
  (
    {
      value,
      size = 'md',
      color = 'primary',
      strokeWidth: customStrokeWidth,
      showValue = false,
      centerLabel,
      'aria-label': ariaLabel = 'Progression',
      'aria-describedby': ariaDescribedBy,
      className,
      animationDuration = 0.5,
      onComplete,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const isIndeterminate = value === undefined

    // Configuration de taille
    const config = SIZE_CONFIG[size]
    const circleSize = config.size
    const strokeWidth = customStrokeWidth ?? config.strokeWidth

    // Calculs SVG
    const radius = (circleSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = circleSize / 2

    // Normaliser la valeur entre 0 et 100
    const normalizedValue = React.useMemo(() => {
      if (isIndeterminate) return 0
      return Math.min(100, Math.max(0, value))
    }, [value, isIndeterminate])

    // Calculer le stroke-dashoffset pour le mode déterminé
    const strokeDashoffset = React.useMemo(() => {
      const progress = normalizedValue / 100
      return circumference * (1 - progress)
    }, [normalizedValue, circumference])

    // Appeler onComplete quand la valeur atteint 100%
    React.useEffect(() => {
      if (normalizedValue === 100 && onComplete) {
        onComplete()
      }
    }, [normalizedValue, onComplete])

    const colorConfig = COLOR_CLASSES[color]

    // Animation pour mode indéterminé (spinning)
    const indeterminateAnimation = {
      rotate: 360,
      transition: {
        duration: prefersReducedMotion ? 0 : 1,
        repeat: Infinity,
        ease: 'linear' as Easing,
      },
    }

    // Animation dash pour mode indéterminé
    const indeterminateDashAnimation = {
      strokeDasharray: [
        `${circumference * 0.1} ${circumference * 0.9}`,
        `${circumference * 0.8} ${circumference * 0.2}`,
        `${circumference * 0.1} ${circumference * 0.9}`,
      ],
      transition: {
        duration: prefersReducedMotion ? 0 : 1.5,
        repeat: Infinity,
        ease: 'easeInOut' as Easing,
      },
    }

    // Animation pour mode déterminé
    const determinateAnimation = {
      strokeDashoffset,
      transition: {
        duration: prefersReducedMotion ? 0 : animationDuration,
        ease: 'easeOut' as Easing,
      },
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-busy={isIndeterminate}
        className={cn(
          'relative inline-flex items-center justify-center',
          className
        )}
        style={{ width: circleSize, height: circleSize }}
      >
        <motion.svg
          width={circleSize}
          height={circleSize}
          viewBox={`0 0 ${circleSize} ${circleSize}`}
          className="rotate-[-90deg]"
          animate={isIndeterminate ? indeterminateAnimation : undefined}
          aria-hidden="true"
        >
          {/* Track (fond) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className={colorConfig.track}
          />

          {/* Progress circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorConfig.progress}
            style={{
              strokeDasharray: circumference,
            }}
            initial={{
              strokeDashoffset: isIndeterminate ? 0 : circumference,
            }}
            animate={
              isIndeterminate
                ? indeterminateDashAnimation
                : determinateAnimation
            }
          />
        </motion.svg>

        {/* Contenu central */}
        {(showValue || centerLabel) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {centerLabel ? (
              centerLabel
            ) : showValue ? (
              <span
                className={cn(
                  'font-semibold tabular-nums text-foreground',
                  config.fontSize
                )}
              >
                {isIndeterminate ? '' : `${Math.round(normalizedValue)}%`}
              </span>
            ) : null}
          </div>
        )}
      </div>
    )
  }
)

ProgressCircle.displayName = 'ProgressCircle'

export default ProgressCircle
