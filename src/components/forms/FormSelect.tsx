'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'
import { ChevronDown } from 'lucide-react'

/**
 * FormSelect - Composant Select (dropdown) stylisé
 *
 * Features:
 * - Intégration react-hook-form (forwardRef)
 * - Placeholder personnalisé
 * - Options avec disabled
 * - Groupes d'options (optgroup)
 * - États visuels : default, error, success, disabled
 * - Icône chevron custom
 * - Dark mode
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * <FormSelect
 *   label="Département"
 *   placeholder="Sélectionnez un département"
 *   options={[
 *     { value: "1", label: "RH" },
 *     { value: "2", label: "IT", disabled: true },
 *   ]}
 *   error={errors.departmentId?.message}
 *   {...register("departmentId")}
 * />
 * ```
 */

export interface FormSelectOption {
  /** Valeur de l'option */
  value: string | number

  /** Label affiché */
  label: string

  /** Option désactivée */
  disabled?: boolean
}

export interface FormSelectOptGroup {
  /** Label du groupe */
  label: string

  /** Options du groupe */
  options: FormSelectOption[]
}

export interface FormSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Label affiché au-dessus du champ */
  label?: string

  /** Message d'erreur affiché sous le champ */
  error?: string

  /** Indique si le champ est requis */
  required?: boolean

  /** Texte d'aide affiché sous le champ */
  helpText?: string

  /** Options simples du select */
  options?: FormSelectOption[]

  /** Options groupées (optgroup) */
  optGroups?: FormSelectOptGroup[]

  /** Texte du placeholder (option vide) */
  placeholder?: string

  /** Variante visuelle du champ */
  variant?: 'default' | 'error' | 'success'

  /** Classes CSS pour le wrapper FormField */
  wrapperClassName?: string

  /** Classes CSS pour le select */
  selectClassName?: string
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      error,
      required,
      helpText,
      options = [],
      optGroups = [],
      placeholder,
      variant = 'default',
      disabled,
      className,
      wrapperClassName,
      selectClassName,
      ...props
    },
    ref
  ) => {
    // Détermine la variante effective
    const effectiveVariant = error ? 'error' : variant

    // Classes de base
    const baseClasses = cn(
      // Base
      'w-full rounded-lg border transition-all duration-150',
      'text-base text-gray-900 dark:text-gray-100',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 dark:disabled:bg-gray-800',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'px-4 py-2.5 pr-10',
      'appearance-none',
      'cursor-pointer',

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

      selectClassName
    )

    const selectElement = (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={baseClasses}
          {...props}
        >
          {/* Placeholder */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {/* Options simples */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}

          {/* Options groupées (optgroup) */}
          {optGroups.map((group, groupIndex) => (
            <optgroup key={groupIndex} label={group.label}>
              {group.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Icône chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDown
            className={cn(
              'h-5 w-5 transition-colors',
              effectiveVariant === 'default' &&
                'text-gray-400 dark:text-gray-500',
              effectiveVariant === 'error' && 'text-red-500 dark:text-red-400',
              effectiveVariant === 'success' &&
                'text-green-500 dark:text-green-400'
            )}
          />
        </div>
      </div>
    )

    // Si pas de label/error/helpText, retourne juste le select
    if (!label && !error && !helpText) {
      return selectElement
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
        {selectElement}
      </FormField>
    )
  }
)

FormSelect.displayName = 'FormSelect'
