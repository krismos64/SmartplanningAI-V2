'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'

/**
 * FormTextarea - Composant Textarea avec compteur de caractères
 *
 * Features:
 * - Intégration react-hook-form (forwardRef)
 * - Compteur caractères optionnel (X/maxLength)
 * - Auto-resize optionnel
 * - États visuels : default, error, success, disabled
 * - Dark mode
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * <FormTextarea
 *   label="Description"
 *   maxLength={500}
 *   showCharCount
 *   error={errors.description?.message}
 *   {...register("description")}
 * />
 * ```
 */

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Label affiché au-dessus du champ */
  label?: string

  /** Message d'erreur affiché sous le champ */
  error?: string

  /** Indique si le champ est requis */
  required?: boolean

  /** Texte d'aide affiché sous le champ */
  helpText?: string

  /** Variante visuelle du champ */
  variant?: 'default' | 'error' | 'success'

  /** Affiche le compteur de caractères (nécessite maxLength) */
  showCharCount?: boolean

  /** Active le redimensionnement automatique */
  autoResize?: boolean

  /** Classes CSS pour le wrapper FormField */
  wrapperClassName?: string

  /** Classes CSS pour le textarea */
  textareaClassName?: string
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(
  (
    {
      label,
      error,
      required,
      helpText,
      variant = 'default',
      showCharCount,
      autoResize,
      maxLength,
      disabled,
      className: _className,
      wrapperClassName,
      textareaClassName,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null)
    const [charCount, setCharCount] = React.useState(0)

    // Combine les refs (externe + interne)
    React.useImperativeHandle(ref, () => textareaRef.current!)

    // Détermine la variante effective
    const effectiveVariant = error ? 'error' : variant

    // Met à jour le compteur de caractères
    React.useEffect(() => {
      if (showCharCount && textareaRef.current) {
        setCharCount(textareaRef.current.value.length)
      }
    }, [value, showCharCount])

    // Auto-resize
    React.useEffect(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [value, autoResize])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCharCount) {
        setCharCount(e.target.value.length)
      }

      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }

      onChange?.(e)
    }

    // Classes de base
    const baseClasses = cn(
      // Base
      'w-full rounded-lg border transition-all duration-150',
      'text-base text-gray-900 dark:text-gray-100',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 dark:disabled:bg-gray-800',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'px-4 py-2.5',
      'min-h-[100px]',
      'resize-y',
      autoResize && 'resize-none overflow-hidden',

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

      textareaClassName
    )

    const textareaElement = (
      <div className="relative">
        <textarea
          ref={textareaRef}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          className={baseClasses}
          {...props}
        />

        {/* Compteur de caractères */}
        {showCharCount && maxLength && (
          <div
            className="absolute bottom-2 right-3 rounded bg-white px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-900 dark:text-gray-400"
            aria-live="polite"
            aria-atomic="true"
          >
            {charCount} / {maxLength}
          </div>
        )}
      </div>
    )

    // Si pas de label/error/helpText, retourne juste le textarea
    if (!label && !error && !helpText) {
      return textareaElement
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
        {textareaElement}
      </FormField>
    )
  }
)

FormTextarea.displayName = 'FormTextarea'
