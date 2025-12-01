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
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ConfirmDialog - Modal de confirmation avec variants
 *
 * Features:
 * - 3 variants : danger (rouge), warning (jaune), info (bleu)
 * - Icônes adaptées selon variant
 * - Focus sur Cancel par défaut (sécurité)
 * - Callbacks onConfirm / onCancel
 * - Accessible WCAG AA
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   variant="danger"
 *   title="Supprimer l'employé ?"
 *   message="Cette action est irréversible. L'employé sera définitivement supprimé."
 *   confirmLabel="Supprimer"
 *   cancelLabel="Annuler"
 *   onConfirm={handleDelete}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */

export type ConfirmDialogVariant = "danger" | "warning" | "info";

export interface ConfirmDialogProps {
  /** Contrôle l'ouverture du dialog */
  open: boolean;

  /** Callback appelé quand l'état open change */
  onOpenChange: (open: boolean) => void;

  /** Variant visuel du dialog */
  variant?: ConfirmDialogVariant;

  /** Titre du dialog */
  title: string;

  /** Message de confirmation */
  message: string;

  /** Label du bouton de confirmation */
  confirmLabel?: string;

  /** Label du bouton d'annulation */
  cancelLabel?: string;

  /** Callback appelé lors de la confirmation */
  onConfirm: () => void;

  /** Callback appelé lors de l'annulation */
  onCancel?: () => void;

  /** État de chargement (désactive les boutons) */
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-950/30",
    confirmButton: cn(
      "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
      "text-white font-medium",
      "focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
    ),
  },
  warning: {
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-950/30",
    confirmButton: cn(
      "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
      "text-white font-medium",
      "focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
    ),
  },
  info: {
    icon: CheckCircle,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-950/30",
    confirmButton: cn(
      "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
      "text-white font-medium",
      "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    ),
  },
};

export const ConfirmDialog = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  ConfirmDialogProps
>(
  (
    {
      open,
      onOpenChange,
      variant = "info",
      title,
      message,
      confirmLabel = "Confirmer",
      cancelLabel = "Annuler",
      onConfirm,
      onCancel,
      isLoading = false,
    },
    ref
  ) => {
    const config = variantConfig[variant];
    const Icon = config.icon;
    const cancelButtonRef = React.useRef<HTMLButtonElement>(null);

    const handleConfirm = () => {
      onConfirm();
    };

    const handleCancel = () => {
      onCancel?.();
      onOpenChange(false);
    };

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={(event) => {
            // Focus le bouton Cancel par défaut (sécurité)
            cancelButtonRef.current?.focus();
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="flex items-start gap-4">
              {/* Icône variant */}
              <div
                className={cn(
                  "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full",
                  config.iconBg
                )}
              >
                <Icon className={cn("h-6 w-6", config.iconColor)} />
              </div>

              {/* Titre */}
              <div className="flex-1 space-y-1">
                <DialogTitle className="text-left">{title}</DialogTitle>
                <DialogDescription className="text-left">
                  {message}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            {/* Bouton Cancel */}
            <button
              ref={cancelButtonRef}
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
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

            {/* Bouton Confirm */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center justify-center rounded-md px-4 py-2",
                "text-sm transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                config.confirmButton
              )}
            >
              {isLoading ? "Chargement..." : confirmLabel}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ConfirmDialog.displayName = "ConfirmDialog";
