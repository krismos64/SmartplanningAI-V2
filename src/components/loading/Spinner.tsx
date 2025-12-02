'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Spinner - Loading spinner avec animation CSS pure
 *
 * Features:
 * - Animation CSS pure (pas de lib externe)
 * - 4 tailles : sm, md, lg, xl
 * - 3 variants : primary, white, current
 * - Label accessible
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" variant="white" />
 * <Spinner size="sm" label="Chargement des données..." />
 * ```
 */

export interface SpinnerProps {
  /** Taille du spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** Variant de couleur */
  variant?: 'primary' | 'white' | 'current'

  /** Label accessible (sr-only par défaut) */
  label?: string

  /** Afficher le label visuellement */
  showLabel?: boolean

  /** Classes CSS additionnelles */
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
  xl: 'w-16 h-16 border-4',
}

const variantClasses = {
  primary:
    'border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400',
  white: 'border-white/30 border-t-white',
  current: 'border-current/30 border-t-current',
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'primary',
      label = 'Chargement...',
      showLabel = false,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-center gap-3', className)}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        {/* Spinner */}
        <div
          className={cn(
            'animate-spin rounded-full',
            sizeClasses[size],
            variantClasses[variant]
          )}
          aria-hidden="true"
        />

        {/* Label */}
        {showLabel ? (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {label}
          </span>
        ) : (
          <span className="sr-only">{label}</span>
        )}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

/**
 * SpinnerDots - Loading spinner avec points animés
 *
 * Alternative au spinner circulaire, utile pour les chargements inline
 *
 * @example
 * ```tsx
 * <SpinnerDots />
 * <SpinnerDots size="lg" />
 * ```
 */

export interface SpinnerDotsProps {
  /** Taille des points */
  size?: 'sm' | 'md' | 'lg'

  /** Variant de couleur */
  variant?: 'primary' | 'white' | 'current'

  /** Classes CSS additionnelles */
  className?: string
}

const dotSizeClasses = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
}

const dotVariantClasses = {
  primary: 'bg-blue-600 dark:bg-blue-400',
  white: 'bg-white',
  current: 'bg-current',
}

export const SpinnerDots = React.forwardRef<HTMLDivElement, SpinnerDotsProps>(
  ({ size = 'md', variant = 'primary', className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1.5', className)}
        role="status"
        aria-label="Chargement..."
      >
        <span className="sr-only">Chargement...</span>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'animate-pulse rounded-full',
              dotSizeClasses[size],
              dotVariantClasses[variant]
            )}
            style={{
              animationDelay: `${index * 0.15}s`,
              animationDuration: '1s',
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }
)

SpinnerDots.displayName = 'SpinnerDots'
