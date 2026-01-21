'use client'

/**
 * Input Component - SmartPlanning V2
 *
 * Input étendu avec support d'icônes, état de chargement et compteur de caractères.
 *
 * @see SP-260 - Extension composants UI
 * Extensions : leftIcon, rightIcon, isLoading, showCount, maxLength
 */

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** Icône à afficher à gauche de l'input */
  leftIcon?: React.ReactNode
  /** Icône à afficher à droite de l'input */
  rightIcon?: React.ReactNode
  /** Affiche un spinner de chargement (remplace rightIcon) */
  isLoading?: boolean
  /** Affiche le compteur de caractères (nécessite maxLength) */
  showCount?: boolean
  /** Taille de l'input */
  size?: 'default' | 'sm' | 'lg'
  /** État d'erreur visuel */
  error?: boolean
}

const sizeClasses = {
  default: 'h-9 px-3 py-1 text-base md:text-sm',
  sm: 'h-8 px-2.5 py-0.5 text-sm',
  lg: 'h-11 px-4 py-2 text-base',
}

const iconSizeClasses = {
  default: '[&>svg]:h-4 [&>svg]:w-4',
  sm: '[&>svg]:h-3.5 [&>svg]:w-3.5',
  lg: '[&>svg]:h-5 [&>svg]:w-5',
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      leftIcon,
      rightIcon,
      isLoading = false,
      showCount = false,
      size = 'default',
      error = false,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    // État interne pour le compteur si non contrôlé
    const [internalValue, setInternalValue] = React.useState(
      defaultValue?.toString() || ''
    )

    // Valeur actuelle (contrôlée ou non)
    const currentValue = value !== undefined ? value.toString() : internalValue
    const characterCount = currentValue.length

    // Handler pour mettre à jour l'état interne
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value)
      }
      onChange?.(e)
    }

    // Détermine si on a des éléments à droite
    const hasRightContent = isLoading || rightIcon || (showCount && maxLength)

    // Classes de base de l'input
    const inputBaseClasses = cn(
      'flex w-full rounded-md border bg-transparent shadow-sm transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error
        ? 'border-destructive focus-visible:ring-destructive'
        : 'border-input',
      sizeClasses[size],
      leftIcon && 'pl-9',
      hasRightContent && (showCount && maxLength ? 'pr-16' : 'pr-9')
    )

    return (
      <div className="relative w-full">
        {/* Icône gauche */}
        {leftIcon && (
          <span
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              'pointer-events-none',
              iconSizeClasses[size]
            )}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          type={type}
          className={cn(inputBaseClasses, className)}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />

        {/* Conteneur droite : loader, icône ou compteur */}
        {hasRightContent && (
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'pointer-events-none flex items-center gap-2',
              iconSizeClasses[size]
            )}
          >
            {/* Compteur de caractères */}
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  characterCount >= maxLength
                    ? 'text-destructive'
                    : characterCount >= maxLength * 0.9
                      ? 'text-warning'
                      : 'text-muted-foreground'
                )}
                aria-live="polite"
              >
                {characterCount}/{maxLength}
              </span>
            )}

            {/* Loader (priorité sur rightIcon) */}
            {isLoading ? (
              <Loader2
                className="animate-spin text-muted-foreground"
                aria-hidden="true"
              />
            ) : (
              rightIcon && (
                <span className="text-muted-foreground" aria-hidden="true">
                  {rightIcon}
                </span>
              )
            )}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
