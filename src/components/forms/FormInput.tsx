'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

/**
 * FormInput - Composant Input générique avec support multi-types
 *
 * Types supportés : text, email, password, number, url, tel
 *
 * Features:
 * - Intégration react-hook-form (forwardRef)
 * - Icons gauche/droite (lucide-react)
 * - États visuels : default, error, success, disabled
 * - Dark mode
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * // Avec react-hook-form
 * <FormInput
 *   label="Email"
 *   type="email"
 *   error={errors.email?.message}
 *   leftIcon={<Mail className="w-4 h-4" />}
 *   {...register("email")}
 * />
 *
 * // Avec état de succès
 * <FormInput
 *   label="Username"
 *   variant="success"
 *   rightIcon={<Check className="w-4 h-4" />}
 *   {...register("username")}
 * />
 * ```
 */

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label affiché au-dessus du champ */
  label?: string

  /** Message d'erreur affiché sous le champ */
  error?: string

  /** Indique si le champ est requis */
  required?: boolean

  /** Texte d'aide affiché sous le champ */
  helpText?: string

  /** Icône affichée à gauche de l'input */
  leftIcon?: React.ReactNode

  /** Icône affichée à droite de l'input */
  rightIcon?: React.ReactNode

  /** Variante visuelle du champ */
  variant?: 'default' | 'error' | 'success'

  /** Classes CSS pour le wrapper FormField */
  wrapperClassName?: string

  /** Classes CSS pour l'input */
  inputClassName?: string
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      required,
      helpText,
      leftIcon,
      rightIcon,
      variant = 'default',
      type = 'text',
      disabled,
      className,
      wrapperClassName,
      inputClassName,
      ...props
    },
    ref
  ) => {
    // Détermine la variante effective (error > success > default)
    const effectiveVariant = error ? 'error' : variant

    // Classes de base pour l'input
    const baseClasses = cn(
      // Base
      'w-full rounded-lg border transition-all duration-150',
      'text-base text-gray-900 dark:text-gray-100',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 dark:disabled:bg-gray-800',
      'disabled:cursor-not-allowed disabled:opacity-60',

      // Padding (avec ou sans icônes)
      leftIcon && !rightIcon && 'pl-11 pr-4 py-2.5',
      !leftIcon && rightIcon && 'pl-4 pr-11 py-2.5',
      leftIcon && rightIcon && 'pl-11 pr-11 py-2.5',
      !leftIcon && !rightIcon && 'px-4 py-2.5',

      // Variantes de couleur
      effectiveVariant === 'default' &&
        !disabled &&
        cn(
          'border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-900',
          'hover:border-gray-400 dark:hover:border-gray-500',
          'focus:border-blue-500 dark:focus:border-blue-400',
          'focus:ring-blue-200 dark:focus:ring-blue-900'
        ),

      effectiveVariant === 'error' &&
        !disabled &&
        cn(
          'border-red-500 dark:border-red-400',
          'bg-red-50 dark:bg-red-950/20',
          'focus:border-red-500 dark:focus:border-red-400',
          'focus:ring-red-200 dark:focus:ring-red-900'
        ),

      effectiveVariant === 'success' &&
        !disabled &&
        cn(
          'border-green-500 dark:border-green-400',
          'bg-green-50 dark:bg-green-950/20',
          'focus:border-green-500 dark:focus:border-green-400',
          'focus:ring-green-200 dark:focus:ring-green-900'
        ),

      inputClassName
    )

    // Classes pour les icônes
    const iconClasses = cn(
      'absolute top-1/2 -translate-y-1/2',
      'text-gray-400 dark:text-gray-500',
      'pointer-events-none',
      effectiveVariant === 'error' && 'text-red-500 dark:text-red-400',
      effectiveVariant === 'success' && 'text-green-500 dark:text-green-400'
    )

    const inputElement = (
      <div className="relative flex items-center">
        {/* Icône gauche */}
        {leftIcon && (
          <div className={cn(iconClasses, 'left-3.5')}>{leftIcon}</div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={baseClasses}
          {...props}
        />

        {/* Icône droite */}
        {rightIcon && (
          <div className={cn(iconClasses, 'right-3.5')}>{rightIcon}</div>
        )}
      </div>
    )

    // Si pas de label/error/helpText, retourne juste l'input
    if (!label && !error && !helpText) {
      return inputElement
    }

    // Sinon, wrappe avec FormField
    return (
      <FormField
        label={label}
        error={error}
        required={required}
        helpText={helpText}
        className={wrapperClassName}
      >
        {inputElement}
      </FormField>
    )
  }
)

FormInput.displayName = 'FormInput'
