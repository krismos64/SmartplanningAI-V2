"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * FormDialog - Modal contenant un formulaire
 *
 * Features:
 * - Wrapper pour formulaires dans un Dialog
 * - Support react-hook-form
 * - Loading state automatique
 * - Focus sur premier input
 * - Gestion submit/cancel
 * - Accessible WCAG AA
 *
 * @example
 * ```tsx
 * <FormDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Créer un employé"
 *   description="Remplissez le formulaire ci-dessous"
 *   submitLabel="Créer"
 *   cancelLabel="Annuler"
 *   onSubmit={handleSubmit}
 *   isSubmitting={isSubmitting}
 * >
 *   <FormInput label="Nom" {...register("name")} />
 *   <FormInput label="Email" {...register("email")} />
 * </FormDialog>
 * ```
 */

export interface FormDialogProps {
  /** Contrôle l'ouverture du dialog */
  open: boolean;

  /** Callback appelé quand l'état open change */
  onOpenChange: (open: boolean) => void;

  /** Titre du dialog */
  title: string;

  /** Description optionnelle */
  description?: string;

  /** Contenu du formulaire (children) */
  children: React.ReactNode;

  /** Label du bouton de soumission */
  submitLabel?: string;

  /** Label du bouton d'annulation */
  cancelLabel?: string;

  /** Callback appelé lors de la soumission */
  onSubmit: (e: React.FormEvent) => void;

  /** Callback appelé lors de l'annulation */
  onCancel?: () => void;

  /** État de chargement (désactive les boutons, affiche spinner) */
  isSubmitting?: boolean;

  /** Taille du dialog */
  size?: "sm" | "md" | "lg" | "xl";

  /** Message d'erreur global (optionnel) */
  error?: string;
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export const FormDialog = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  FormDialogProps
>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      submitLabel = "Enregistrer",
      cancelLabel = "Annuler",
      onSubmit,
      onCancel,
      isSubmitting = false,
      size = "md",
      error,
    },
    ref
  ) => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(e);
    };

    const handleCancel = () => {
      onCancel?.();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(sizeClasses[size])}
          onOpenAutoFocus={(event) => {
            // Focus le premier input du formulaire
            event.preventDefault();
            setTimeout(() => {
              const firstInput = formRef.current?.querySelector<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              >("input:not([type=hidden]), textarea, select");
              firstInput?.focus();
            }, 0);
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          {/* Formulaire */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            {/* Contenu du formulaire */}
            <div className="space-y-4 py-4">{children}</div>

            {/* Message d'erreur global */}
            {error && (
              <div
                className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* Footer avec boutons */}
            <DialogFooter className="gap-2 sm:gap-0">
              {/* Bouton Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-4 py-2",
                  "text-sm font-medium transition-colors",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-900",
                  "text-gray-700 dark:text-gray-200",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {cancelLabel}
              </button>

              {/* Bouton Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center justify-center rounded-md px-4 py-2",
                  "text-sm font-medium transition-colors",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
                  "text-white",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Chargement...
                  </>
                ) : (
                  submitLabel
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
);

FormDialog.displayName = "FormDialog";
