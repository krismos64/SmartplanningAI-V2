"use client";

import { toast, ExternalToast } from "sonner";

/**
 * useToast - Hook custom pour Sonner avec helpers TypeScript
 *
 * Features:
 * - Fonctions typées pour chaque variant
 * - Support complet des options Sonner
 * - Promise handling intégré
 * - Dismiss programmatique
 * - API simple et intuitive
 *
 * @example
 * ```tsx
 * import { useToast } from '@/components/toast';
 *
 * function MyComponent() {
 *   const { success, error, promise } = useToast();
 *
 *   const handleSubmit = async () => {
 *     promise(submitData(), {
 *       loading: 'Envoi en cours...',
 *       success: 'Données envoyées !',
 *       error: 'Erreur lors de l\'envoi',
 *     });
 *   };
 *
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */

export type ToastOptions = ExternalToast;

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface PromiseMessages<T = unknown> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: Error) => string);
}

export interface PromiseData<T = unknown> {
  loading?: string | React.ReactNode;
  success?: string | React.ReactNode | ((data: T) => React.ReactNode);
  error?: string | React.ReactNode | ((error: Error) => React.ReactNode);
  description?: string | React.ReactNode;
  duration?: number;
}

/**
 * Hook custom pour gérer les toasts avec Sonner
 * Fournit des helpers typés pour tous les variants
 */
export const useToast = () => {
  return {
    /**
     * Affiche un toast de succès (vert avec checkmark)
     * @param message - Message principal
     * @param options - Options additionnelles (description, duration, action, etc.)
     */
    success: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast.success(message, options);
    },

    /**
     * Affiche un toast d'erreur (rouge avec icon erreur)
     * @param message - Message principal
     * @param options - Options additionnelles
     */
    error: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast.error(message, options);
    },

    /**
     * Affiche un toast d'avertissement (jaune avec icon warning)
     * @param message - Message principal
     * @param options - Options additionnelles
     */
    warning: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast.warning(message, options);
    },

    /**
     * Affiche un toast d'information (bleu avec icon info)
     * @param message - Message principal
     * @param options - Options additionnelles
     */
    info: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast.info(message, options);
    },

    /**
     * Affiche un toast de chargement (spinner)
     * @param message - Message principal
     * @param options - Options additionnelles
     */
    loading: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast.loading(message, options);
    },

    /**
     * Affiche un toast par défaut (neutre)
     * @param message - Message principal
     * @param options - Options additionnelles
     */
    message: (message: string | React.ReactNode, options?: ToastOptions) => {
      return toast(message, options);
    },

    /**
     * Gère automatiquement une promesse avec loading/success/error
     * @param promise - La promesse à gérer
     * @param messages - Messages pour loading/success/error
     */
    promise: <T = unknown>(
      promise: Promise<T>,
      messages: PromiseMessages<T> | PromiseData<T>
    ) => {
      return toast.promise(promise, messages as any);
    },

    /**
     * Ferme un toast spécifique par son ID
     * @param id - ID du toast à fermer (optionnel)
     */
    dismiss: (id?: string | number) => {
      return toast.dismiss(id);
    },

    /**
     * Ferme tous les toasts actifs
     */
    dismissAll: () => {
      return toast.dismiss();
    },

    /**
     * Affiche un toast personnalisé avec JSX
     * @param content - Contenu JSX personnalisé
     * @param options - Options additionnelles
     */
    custom: (content: React.ReactNode, options?: ToastOptions) => {
      return toast(content, options);
    },

    /**
     * Récupère l'historique de tous les toasts
     */
    getHistory: () => {
      return toast.getHistory?.() || [];
    },

    /**
     * Récupère les toasts actuellement actifs
     */
    getToasts: () => {
      return toast.getToasts?.() || [];
    },
  };
};

/**
 * Helper pour créer un toast avec action button
 * @param message - Message du toast
 * @param action - Configuration du bouton d'action
 * @param options - Options additionnelles
 */
export const toastWithAction = (
  message: string,
  action: ToastAction,
  options?: ToastOptions
) => {
  return toast(message, {
    ...options,
    action: {
      label: action.label,
      onClick: action.onClick,
    },
  });
};

/**
 * Helper pour créer un toast avec description
 * @param title - Titre du toast
 * @param description - Description détaillée
 * @param options - Options additionnelles
 */
export const toastWithDescription = (
  title: string,
  description: string,
  options?: ToastOptions
) => {
  return toast(title, {
    ...options,
    description,
  });
};

/**
 * Helper pour créer un toast persistent (ne se ferme pas automatiquement)
 * @param message - Message du toast
 * @param options - Options additionnelles
 */
export const toastPersistent = (
  message: string | React.ReactNode,
  options?: ToastOptions
) => {
  return toast(message, {
    ...options,
    duration: Infinity,
  });
};
