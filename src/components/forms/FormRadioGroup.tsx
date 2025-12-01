"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

/**
 * FormRadioGroup - Composant Radio buttons group
 *
 * Features:
 * - Groupe de radio buttons avec layout vertical/horizontal
 * - Support helpText par option
 * - États visuels : default, error, checked, disabled
 * - Dark mode
 * - Accessibilité WCAG AA (fieldset + legend)
 *
 * @example
 * ```tsx
 * <FormRadioGroup
 *   name="employmentType"
 *   label="Type d'emploi"
 *   options={[
 *     { value: "FULL_TIME", label: "Temps plein" },
 *     { value: "PART_TIME", label: "Temps partiel", helpText: "Moins de 35h" },
 *   ]}
 *   error={errors.employmentType?.message}
 *   {...register("employmentType")}
 * />
 * ```
 */

export interface FormRadioOption {
  /** Valeur de l'option */
  value: string;

  /** Label affiché */
  label: string;

  /** Texte d'aide pour cette option */
  helpText?: string;

  /** Option désactivée */
  disabled?: boolean;
}

export interface FormRadioGroupProps {
  /** Nom du groupe (attribut name) */
  name: string;

  /** Label du groupe affiché au-dessus */
  label?: string;

  /** Message d'erreur affiché sous le groupe */
  error?: string;

  /** Indique si le champ est requis */
  required?: boolean;

  /** Texte d'aide global affiché sous le label */
  helpText?: string;

  /** Options du radio group */
  options: FormRadioOption[];

  /** Valeur par défaut sélectionnée */
  defaultValue?: string;

  /** Valeur contrôlée */
  value?: string;

  /** Callback onChange */
  onChange?: (value: string) => void;

  /** Layout des options */
  layout?: "vertical" | "horizontal";

  /** Désactiver tout le groupe */
  disabled?: boolean;

  /** Classes CSS pour le wrapper FormField */
  wrapperClassName?: string;

  /** Classes CSS pour le fieldset */
  fieldsetClassName?: string;
}

export const FormRadioGroup = React.forwardRef<
  HTMLFieldSetElement,
  FormRadioGroupProps
>(
  (
    {
      name,
      label,
      error,
      required,
      helpText,
      options,
      defaultValue,
      value,
      onChange,
      layout = "vertical",
      disabled,
      wrapperClassName,
      fieldsetClassName,
    },
    ref
  ) => {
    const fieldsetId = `radiogroup-${name}`;

    const radioGroupElement = (
      <fieldset
        ref={ref}
        id={fieldsetId}
        disabled={disabled}
        className={cn(
          "border-0 p-0 m-0",
          disabled && "opacity-60 cursor-not-allowed",
          fieldsetClassName
        )}
      >
        {/* Options */}
        <div
          className={cn(
            "flex gap-4",
            layout === "vertical" && "flex-col",
            layout === "horizontal" && "flex-row flex-wrap"
          )}
          role="radiogroup"
          aria-required={required}
          aria-invalid={error ? "true" : "false"}
        >
          {options.map((option) => {
            const optionId = `${name}-${option.value}`;
            const isDisabled = disabled || option.disabled;

            return (
              <div key={option.value} className="flex flex-col gap-1">
                {/* Radio + Label */}
                <div className="flex items-start gap-3">
                  {/* Radio */}
                  <input
                    type="radio"
                    id={optionId}
                    name={name}
                    value={option.value}
                    defaultChecked={defaultValue === option.value}
                    checked={value === option.value}
                    disabled={isDisabled}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={cn(
                      // Base
                      "w-5 h-5 rounded-full border-2 transition-all duration-150",
                      "cursor-pointer flex-shrink-0 mt-0.5",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2",

                      // States par défaut
                      !error &&
                        !isDisabled &&
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
                        !isDisabled &&
                        cn(
                          "border-red-500 dark:border-red-400",
                          "text-red-600 dark:text-red-500",
                          "bg-red-50 dark:bg-red-950/20",
                          "focus:ring-red-200 dark:focus:ring-red-900",
                          "checked:bg-red-600 dark:checked:bg-red-500",
                          "checked:border-red-600 dark:checked:border-red-500"
                        ),

                      // State disabled
                      isDisabled &&
                        cn(
                          "cursor-not-allowed opacity-60",
                          "bg-gray-100 dark:bg-gray-800",
                          "border-gray-300 dark:border-gray-600"
                        )
                    )}
                  />

                  {/* Label */}
                  <label
                    htmlFor={optionId}
                    className={cn(
                      "text-sm text-gray-900 dark:text-gray-100",
                      "cursor-pointer select-none",
                      isDisabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    {option.label}
                  </label>
                </div>

                {/* Help text de l'option */}
                {option.helpText && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
                    {option.helpText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </fieldset>
    );

    // Si pas de label/error/helpText, retourne juste le fieldset
    if (!label && !error && !helpText) {
      return radioGroupElement;
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
        {radioGroupElement}
      </FormField>
    );
  }
);

FormRadioGroup.displayName = "FormRadioGroup";
