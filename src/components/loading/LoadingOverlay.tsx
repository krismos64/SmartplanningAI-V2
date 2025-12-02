'use client'

import React from 'react'
import { Spinner } from './Spinner'
import { cn } from '@/lib/utils'

/**
 * LoadingOverlay - Overlay plein écran avec spinner
 *
 * Features:
 * - Overlay plein écran avec backdrop
 * - Spinner centré avec message optionnel
 * - Bloque les interactions pendant loading
 * - Transition smooth (fade in/out)
 * - Option blur du contenu derrière
 * - Portal pour rendu hors du DOM parent
 *
 * @example
 * ```tsx
 * <LoadingOverlay isLoading={isLoading} message="Chargement des données..." />
 * <LoadingOverlay isLoading={isLoading} blur />
 * <LoadingOverlay isLoading={isLoading} spinnerSize="lg" />
 * ```
 */

export interface LoadingOverlayProps {
  /** Afficher l'overlay */
  isLoading: boolean

  /** Message de chargement */
  message?: string

  /** Appliquer un blur au contenu derrière */
  blur?: boolean

  /** Taille du spinner */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'

  /** Classes CSS additionnelles */
  className?: string

  /** Z-index de l'overlay */
  zIndex?: number
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  blur = false,
  spinnerSize = 'lg',
  className,
  zIndex = 50,
}) => {
  // Ne rend rien si pas en chargement
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'fixed inset-0 flex items-center justify-center',
        'bg-black/50 dark:bg-black/70',
        blur && 'backdrop-blur-sm',
        'transition-opacity duration-200',
        'animate-in fade-in-0',
        className
      )}
      style={{ zIndex }}
      role="progressbar"
      aria-busy="true"
      aria-live="polite"
      aria-label={message || 'Chargement en cours'}
    >
      {/* Contenu centré */}
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
        <Spinner size={spinnerSize} variant="primary" label={message} />

        {message && (
          <p className="max-w-xs text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

LoadingOverlay.displayName = 'LoadingOverlay'

/**
 * InlineLoadingOverlay - Overlay relatif à un container
 *
 * Utile pour afficher un loading sur une section spécifique plutôt que plein écran
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <MyContent />
 *   <InlineLoadingOverlay isLoading={isLoading} />
 * </div>
 * ```
 */

export interface InlineLoadingOverlayProps {
  /** Afficher l'overlay */
  isLoading: boolean

  /** Message de chargement */
  message?: string

  /** Appliquer un blur au contenu derrière */
  blur?: boolean

  /** Taille du spinner */
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'

  /** Classes CSS additionnelles */
  className?: string

  /** Hauteur minimale (utile pour éviter le collapse) */
  minHeight?: number | string
}

export const InlineLoadingOverlay: React.FC<InlineLoadingOverlayProps> = ({
  isLoading,
  message,
  blur = false,
  spinnerSize = 'md',
  className,
  minHeight,
}) => {
  // Ne rend rien si pas en chargement
  if (!isLoading) return null

  return (
    <div
      className={cn(
        'absolute inset-0 flex items-center justify-center',
        'bg-white/80 dark:bg-gray-900/80',
        blur && 'backdrop-blur-sm',
        'transition-opacity duration-200',
        'z-10 animate-in fade-in-0',
        className
      )}
      style={{ minHeight }}
      role="progressbar"
      aria-busy="true"
      aria-live="polite"
      aria-label={message || 'Chargement en cours'}
    >
      {/* Contenu centré */}
      <div className="flex flex-col items-center gap-3">
        <Spinner size={spinnerSize} variant="primary" label={message} />

        {message && (
          <p className="max-w-xs text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

InlineLoadingOverlay.displayName = 'InlineLoadingOverlay'
