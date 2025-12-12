import React from 'react'
import { cn } from '@/lib/utils'

/**
 * FormField - Wrapper générique pour tous les champs de formulaire
 *
 * Fournit une structure cohérente avec :
 * - Label avec indicateur requis (*)
 * - Message d'erreur avec accessibilité (role="alert")
 * - Texte d'aide optionnel
 * - Styles Tailwind cohérents
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email"
 *   error={errors.email?.message}
 *   required
 *   helpText="Nous ne partagerons jamais votre email"
 * >
 *   <input {...register("email")} />
 * </FormField>
 * ```
 */

export interface FormFieldProps {
  /** Label affiché au-dessus du champ */
  label?: string

  /** Message d'erreur affiché sous le champ */
  error?: string

  /** Indique si le champ est requis (affiche *) */
  required?: boolean

  /** Texte d'aide affiché sous le champ (ou sous l'erreur) */
  helpText?: string

  /** ID unique pour lier le label et le champ (génération auto si omis) */
  id?: string

  /** Classes CSS supplémentaires pour le wrapper */
  className?: string

  /** Contenu du champ (input, select, textarea, etc.) */
  children: React.ReactNode
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, helpText, id, className, children }, ref) => {
    // Génération d'un ID unique si non fourni
    const fieldId = id || `field-${Math.random().toString(36).substring(2, 9)}`
    const errorId = `${fieldId}-error`
    const helpId = `${fieldId}-help`

    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={fieldId}
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
            {required && (
              <span
                className="ml-1 text-red-500"
                aria-label="requis"
                title="Champ requis"
              >
                *
              </span>
            )}
          </label>
        )}

        {/* Champ de formulaire (input, select, etc.) */}
        <div className="relative">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // Clone l'enfant et ajoute les props d'accessibilité
              return React.cloneElement(
                child as React.ReactElement<Record<string, unknown>>,
                {
                  id: fieldId,
                  'aria-invalid': error ? 'true' : 'false',
                  'aria-describedby':
                    cn(error && errorId, helpText && !error && helpId)
                      .split(' ')
                      .filter(Boolean)
                      .join(' ') || undefined,
                }
              )
            }
            return child
          })}
        </div>

        {/* Message d'erreur */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="flex items-start gap-1.5 text-sm text-red-600 dark:text-red-400"
          >
            <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
              ⚠️
            </span>
            <span>{error}</span>
          </p>
        )}

        {/* Texte d'aide (affiché seulement si pas d'erreur) */}
        {helpText && !error && (
          <p id={helpId} className="text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'
