import { useState, useCallback, useRef } from 'react'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options pour le hook useProgressLoading
 */
export interface UseProgressLoadingOptions {
  /**
   * Valeur initiale de la progression (0-100)
   * @default 0
   */
  initialValue?: number

  /**
   * Valeur minimale
   * @default 0
   */
  min?: number

  /**
   * Valeur maximale
   * @default 100
   */
  max?: number

  /**
   * Pas d'incrémentation par défaut
   * @default 10
   */
  step?: number

  /**
   * Callback appelé quand la progression atteint le maximum
   */
  onComplete?: () => void

  /**
   * Callback appelé à chaque changement de valeur
   */
  onChange?: (value: number) => void
}

/**
 * Résultat retourné par le hook useProgressLoading
 */
export interface UseProgressLoadingResult {
  /**
   * Valeur actuelle de la progression (0-100)
   */
  progress: number

  /**
   * Définit une nouvelle valeur de progression
   */
  setProgress: (value: number) => void

  /**
   * Incrémente la progression
   * @param amount - Montant à ajouter (par défaut: step des options)
   */
  increment: (amount?: number) => void

  /**
   * Décrémente la progression
   * @param amount - Montant à retirer (par défaut: step des options)
   */
  decrement: (amount?: number) => void

  /**
   * Réinitialise la progression à la valeur initiale
   */
  reset: () => void

  /**
   * Met la progression au maximum
   */
  complete: () => void

  /**
   * Indique si la progression est complète (100%)
   */
  isComplete: boolean

  /**
   * Indique si la progression est à zéro
   */
  isZero: boolean

  /**
   * Pourcentage normalisé (0-1)
   */
  percentage: number
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useProgressLoading - Hook pour gérer une progression numérique
 *
 * Features:
 * - Valeur de progression (0-100 par défaut)
 * - Méthodes increment/decrement avec step configurable
 * - Bornes min/max configurables
 * - Callbacks onChange/onComplete
 * - Propriétés dérivées : isComplete, isZero, percentage
 *
 * @example
 * ```tsx
 * // Usage basique
 * const { progress, setProgress, increment } = useProgressLoading()
 *
 * // Avec options
 * const { progress, increment } = useProgressLoading({
 *   initialValue: 0,
 *   step: 25,
 *   onComplete: () => console.log('Done!')
 * })
 *
 * // Incrémentation manuelle
 * increment()      // +10 (step par défaut)
 * increment(5)     // +5
 * ```
 *
 * @see SP-266 - Loading States avancés
 */
export function useProgressLoading(
  options: UseProgressLoadingOptions = {}
): UseProgressLoadingResult {
  const {
    initialValue = 0,
    min = 0,
    max = 100,
    step = 10,
    onComplete,
    onChange,
  } = options

  // Normaliser la valeur initiale
  const normalizedInitial = Math.min(max, Math.max(min, initialValue))
  const [progress, setProgressState] = useState<number>(normalizedInitial)

  // Ref pour éviter les appels multiples de onComplete
  const hasCompleted = useRef<boolean>(normalizedInitial >= max)

  /**
   * Met à jour la progression avec validation des bornes
   */
  const setProgress = useCallback(
    (value: number) => {
      const normalizedValue = Math.min(max, Math.max(min, value))
      setProgressState(normalizedValue)
      onChange?.(normalizedValue)

      // Déclencher onComplete une seule fois
      if (normalizedValue >= max && !hasCompleted.current) {
        hasCompleted.current = true
        onComplete?.()
      } else if (normalizedValue < max) {
        hasCompleted.current = false
      }
    },
    [min, max, onChange, onComplete]
  )

  /**
   * Incrémente la progression
   */
  const increment = useCallback(
    (amount?: number) => {
      const incrementAmount = amount ?? step
      setProgress(progress + incrementAmount)
    },
    [progress, step, setProgress]
  )

  /**
   * Décrémente la progression
   */
  const decrement = useCallback(
    (amount?: number) => {
      const decrementAmount = amount ?? step
      setProgress(progress - decrementAmount)
    },
    [progress, step, setProgress]
  )

  /**
   * Réinitialise à la valeur initiale
   */
  const reset = useCallback(() => {
    hasCompleted.current = false
    setProgressState(normalizedInitial)
    onChange?.(normalizedInitial)
  }, [normalizedInitial, onChange])

  /**
   * Met la progression au maximum
   */
  const complete = useCallback(() => {
    setProgress(max)
  }, [max, setProgress])

  // Propriétés dérivées
  const isComplete = progress >= max
  const isZero = progress <= min
  const percentage = (progress - min) / (max - min)

  return {
    progress,
    setProgress,
    increment,
    decrement,
    reset,
    complete,
    isComplete,
    isZero,
    percentage,
  }
}

export default useProgressLoading
