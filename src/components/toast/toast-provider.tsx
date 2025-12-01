"use client";

import { Toaster } from "sonner";

/**
 * ToastProvider - Provider Next.js App Router pour Sonner
 *
 * Features:
 * - Configuration optimale pour SmartPlanning
 * - Position top-right
 * - Rich colors activées (couleurs vibrantes)
 * - Close button visible
 * - Theme system (auto dark/light)
 * - Expand on hover
 * - Max 5 toasts visibles
 *
 * Usage:
 * ```tsx
 * // Dans app/layout.tsx
 * import { ToastProvider } from '@/components/toast';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ToastProvider />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

export interface ToastProviderProps {
  /** Position des toasts */
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

  /** Activer les couleurs riches (recommandé) */
  richColors?: boolean;

  /** Afficher le bouton de fermeture */
  closeButton?: boolean;

  /** Expand on hover */
  expand?: boolean;

  /** Theme (light, dark, system) */
  theme?: "light" | "dark" | "system";

  /** Nombre maximum de toasts visibles */
  visibleToasts?: number;
}

export function ToastProvider({
  position = "top-right",
  richColors = true,
  closeButton = true,
  expand = true,
  theme = "system",
  visibleToasts = 5,
}: ToastProviderProps = {}) {
  return (
    <Toaster
      position={position}
      richColors={richColors}
      closeButton={closeButton}
      expand={expand}
      theme={theme}
      visibleToasts={visibleToasts}
      toastOptions={{
        classNames: {
          toast: "font-sans",
          title: "font-medium",
          description: "text-sm opacity-90",
          actionButton: "!bg-primary !text-primary-foreground",
          cancelButton: "!bg-muted !text-muted-foreground",
        },
      }}
    />
  );
}
