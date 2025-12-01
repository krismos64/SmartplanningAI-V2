"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * FormCheckbox - Composant Checkbox stylisé
 *
 * Features:
 * - Intégration react-hook-form (forwardRef)
 * - États visuels : default, error, checked, disabled
 * - Label cliquable
 * - Dark mode
 * - Accessibilité WCAG AA
 *
 * @example
 * ```tsx
 * <FormCheckbox
 *   label="J'accepte les conditions générales"
 *   error={errors.acceptTerms?.message}
 *   {...register("acceptTerms")}
 * />
 * ```
 */

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Label affiché à droite de la checkbox */
  label: string;

  /** Message d'erreur affiché sous le champ */
  error?: string;

  /** Texte d'aide affiché sous le label */
  helpText?: string;

  /** Classes CSS pour le wrapper */
  wrapperClassName?: string;

  /** Classes CSS pour la checkbox */
  checkboxClassName?: string;

  /** Classes CSS pour le label */
  labelClassName?: string;
}

export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  FormCheckboxProps
>(
  (
    {
      label,
      error,
      helpText,
      disabled,
      className,
      wrapperClassName,
      checkboxClassName,
      labelClassName,
      id,
      ...props
    },
    ref
  ) => {
    // Génération d'un ID unique si non fourni
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${checkboxId}-error`;
    const helpId = `${checkboxId}-help`;

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {/* Checkbox + Label */}
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={cn(
              error && errorId,
              helpText && !error && helpId
            )
              .split(" ")
              .filter(Boolean)
              .join(" ") || undefined}
            className={cn(
              // Base
              "w-5 h-5 rounded border-2 transition-all duration-150",
              "cursor-pointer flex-shrink-0 mt-0.5",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",

              // States par défaut
              !error &&
                !disabled &&
                cn(
                  "border-gray-300 dark:border-gray-600",
                  "text-blue-600 dark:text-blue-500",
                  "bg-white dark:bg-gray-900",
                  "hover:border-gray-400 dark:hover:border-gray-500",
                  "focus:ring-blue-200 dark:focus:ring-blue-900",
                  "checked:bg-blue-600 dark:checked:bg-blue-500",
                  "checked:border-blue-600 dark:checked:border-blue-500"
                ),

              // State error
              error &&
                !disabled &&
                cn(
                  "border-red-500 dark:border-red-400",
                  "text-red-600 dark:text-red-500",
                  "bg-red-50 dark:bg-red-950/20",
                  "focus:ring-red-200 dark:focus:ring-red-900",
                  "checked:bg-red-600 dark:checked:bg-red-500",
                  "checked:border-red-600 dark:checked:border-red-500"
                ),

              // State disabled
              disabled &&
                cn(
                  "cursor-not-allowed opacity-60",
                  "bg-gray-100 dark:bg-gray-800",
                  "border-gray-300 dark:border-gray-600"
                ),

              checkboxClassName
            )}
            {...props}
          />

          {/* Label */}
          <label
            htmlFor={checkboxId}
            className={cn(
              "text-sm text-gray-900 dark:text-gray-100",
              "cursor-pointer select-none",
              disabled && "cursor-not-allowed opacity-60",
              labelClassName
            )}
          >
            {label}
          </label>
        </div>

        {/* Texte d'aide */}
        {helpText && !error && (
          <p
            id={helpId}
            className="text-sm text-gray-500 dark:text-gray-400 ml-8"
          >
            {helpText}
          </p>
        )}

        {/* Message d'erreur */}
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1.5 ml-8"
          >
            <span className="mt-0.5 flex-shrink-0" aria-hidden="true">
              ⚠️
            </span>
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
