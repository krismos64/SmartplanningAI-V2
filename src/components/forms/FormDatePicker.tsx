'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { FormField } from './FormField'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

/**
 * FormDatePicker - Composant DatePicker avec react-day-picker
 *
 * Features:
 * - Intégration react-day-picker (déjà installé)
 * - Format français (date-fns/locale/fr)
 * - min/max dates
 * - Disabled dates
 * - Popover dropdown
 * - Dark mode
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * <FormDatePicker
 *   label="Date de début"
 *   minDate={new Date()}
 *   error={errors.startDate?.message}
 *   value={startDate}
 *   onChange={(date) => setValue("startDate", date)}
 * />
 * ```
 */

export interface FormDatePickerProps {
  /** Label affiché au-dessus du champ */
  label?: string

  /** Message d'erreur affiché sous le champ */
  error?: string

  /** Indique si le champ est requis */
  required?: boolean

  /** Texte d'aide affiché sous le champ */
  helpText?: string

  /** Date sélectionnée */
  value?: Date

  /** Callback onChange */
  onChange?: (date: Date | undefined) => void

  /** Date minimum sélectionnable */
  minDate?: Date

  /** Date maximum sélectionnable */
  maxDate?: Date

  /** Dates désactivées */
  disabledDates?: Date[]

  /** Placeholder du champ */
  placeholder?: string

  /** Désactive le champ */
  disabled?: boolean

  /** Classes CSS pour le wrapper FormField */
  wrapperClassName?: string

  /** Classes CSS pour l'input */
  inputClassName?: string
}

export const FormDatePicker = React.forwardRef<
  HTMLButtonElement,
  FormDatePickerProps
>(
  (
    {
      label,
      error,
      required,
      helpText,
      value,
      onChange,
      minDate,
      maxDate,
      disabledDates = [],
      placeholder = 'Sélectionner une date',
      disabled,
      wrapperClassName,
      inputClassName,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const buttonRef = React.useRef<HTMLButtonElement | null>(null)
    const popoverRef = React.useRef<HTMLDivElement | null>(null)

    // Combine les refs
    React.useImperativeHandle(ref, () => buttonRef.current!)

    // Ferme le popover si click en dehors
    React.useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (event: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Gestion de la sélection
    const handleSelect = (date: Date | undefined) => {
      onChange?.(date)
      setIsOpen(false)
    }

    // Classes pour l'input
    const inputClasses = cn(
      // Base
      'w-full rounded-lg border transition-all duration-150',
      'text-base text-gray-900 dark:text-gray-100',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-gray-100 dark:disabled:bg-gray-800',
      'disabled:cursor-not-allowed disabled:opacity-60',
      'px-4 py-2.5 pr-10',
      'text-left cursor-pointer',
      'flex items-center justify-between',

      // Variantes
      !error &&
        !disabled &&
        cn(
          'border-gray-300 dark:border-gray-600',
          'bg-white dark:bg-gray-900',
          'hover:border-gray-400 dark:hover:border-gray-500',
          'focus:border-blue-500 dark:focus:border-blue-400',
          'focus:ring-blue-200 dark:focus:ring-blue-900'
        ),

      error &&
        !disabled &&
        cn(
          'border-red-500 dark:border-red-400',
          'bg-red-50 dark:bg-red-950/20',
          'focus:border-red-500 dark:focus:border-red-400',
          'focus:ring-red-200 dark:focus:ring-red-900'
        ),

      inputClassName
    )

    const datePickerElement = (
      <div className="relative">
        {/* Input trigger */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={inputClasses}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className={cn(!value && 'text-gray-400 dark:text-gray-500')}>
            {value ? format(value, 'PPP', { locale: fr }) : placeholder}
          </span>

          <CalendarIcon
            className={cn(
              'h-5 w-5 flex-shrink-0',
              error
                ? 'text-red-500 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          />
        </button>

        {/* Popover Calendar */}
        {isOpen && (
          <div
            ref={popoverRef}
            className={cn(
              'absolute z-50 mt-2 rounded-lg p-3 shadow-lg',
              'bg-white dark:bg-gray-800',
              'border border-gray-200 dark:border-gray-700',
              'animate-in fade-in-0 zoom-in-95'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Sélecteur de date"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleSelect}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
                ...disabledDates,
              ]}
              locale={fr}
              className={cn(
                // Custom styles pour DayPicker
                'rdp-custom',
                'dark:text-gray-100'
              )}
              classNames={{
                months:
                  'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'space-x-1 flex items-center',
                nav_button: cn(
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  'rounded-md border border-gray-300 dark:border-gray-600'
                ),
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell:
                  'text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: cn(
                  'h-9 w-9 text-center text-sm p-0 relative',
                  'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md'
                ),
                day: cn(
                  'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                  'rounded-md'
                ),
                day_selected: cn(
                  'bg-blue-600 dark:bg-blue-500 text-white',
                  'hover:bg-blue-700 dark:hover:bg-blue-600',
                  'focus:bg-blue-700 dark:focus:bg-blue-600'
                ),
                day_today:
                  'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100',
                day_outside: 'text-gray-400 dark:text-gray-600 opacity-50',
                day_disabled:
                  'text-gray-400 dark:text-gray-600 opacity-50 cursor-not-allowed',
                day_hidden: 'invisible',
              }}
            />
          </div>
        )}
      </div>
    )

    // Si pas de label/error/helpText, retourne juste le picker
    if (!label && !error && !helpText) {
      return datePickerElement
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
        {datePickerElement}
      </FormField>
    )
  }
)

FormDatePicker.displayName = 'FormDatePicker'
