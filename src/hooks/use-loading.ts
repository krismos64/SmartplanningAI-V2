import { useState, useCallback, useRef } from 'react'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options pour le hook useLoading
 */
export interface UseLoadingOptions {
  /**
   * État initial du loading
   * @default false
   */
  initialState?: boolean

  /**
   * Délai minimum de loading (en ms) pour éviter les flashs
   * @default 0
   */
  minDuration?: number

  /**
   * Callback appelé quand le loading commence
   */
  onStart?: () => void

  /**
   * Callback appelé quand le loading se termine
   */
  onEnd?: () => void
}

/**
 * Résultat retourné par le hook useLoading
 */
export interface UseLoadingResult {
  /**
   * État actuel du loading
   */
  isLoading: boolean

  /**
   * Démarre le loading
   */
  startLoading: () => void

  /**
   * Arrête le loading
   */
  stopLoading: () => void

  /**
   * Toggle le loading
   */
  toggleLoading: () => void

  /**
   * Wrapper qui gère automatiquement le loading pendant l'exécution d'une fonction async
   *
   * @example
   * ```tsx
   * const { withLoading } = useLoading()
   *
   * const handleSubmit = withLoading(async (data) => {
   *   await api.submit(data)
   * })
   * ```
   */
  withLoading: <T, Args extends unknown[]>(
    fn: (...args: Args) => Promise<T>
  ) => (...args: Args) => Promise<T>

  /**
   * Réinitialise le loading à l'état initial
   */
  reset: () => void
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useLoading - Hook pour gérer les états de chargement
 *
 * Features:
 * - État boolean isLoading
 * - Méthodes startLoading/stopLoading/toggle
 * - Wrapper withLoading pour fonctions async
 * - Option minDuration pour éviter les flashs UI
 * - Callbacks onStart/onEnd
 *
 * @example
 * ```tsx
 * // Usage basique
 * const { isLoading, startLoading, stopLoading } = useLoading()
 *
 * // Avec wrapper async
 * const { isLoading, withLoading } = useLoading()
 * const handleClick = withLoading(async () => {
 *   await fetchData()
 * })
 *
 * // Avec durée minimum (anti-flash)
 * const { isLoading, withLoading } = useLoading({ minDuration: 500 })
 * ```
 *
 * @see SP-266 - Loading States avancés
 */
export function useLoading(options: UseLoadingOptions = {}): UseLoadingResult {
  const { initialState = false, minDuration = 0, onStart, onEnd } = options

  const [isLoading, setIsLoading] = useState<boolean>(initialState)
  const loadingStartTime = useRef<number | null>(null)

  const startLoading = useCallback(() => {
    loadingStartTime.current = Date.now()
    setIsLoading(true)
    onStart?.()
  }, [onStart])

  const stopLoading = useCallback(() => {
    const elapsed = loadingStartTime.current
      ? Date.now() - loadingStartTime.current
      : 0

    const remainingTime = Math.max(0, minDuration - elapsed)

    if (remainingTime > 0) {
      setTimeout(() => {
        setIsLoading(false)
        loadingStartTime.current = null
        onEnd?.()
      }, remainingTime)
    } else {
      setIsLoading(false)
      loadingStartTime.current = null
      onEnd?.()
    }
  }, [minDuration, onEnd])

  const toggleLoading = useCallback(() => {
    if (isLoading) {
      stopLoading()
    } else {
      startLoading()
    }
  }, [isLoading, startLoading, stopLoading])

  const withLoading = useCallback(
    <T, Args extends unknown[]>(
      fn: (...args: Args) => Promise<T>
    ): ((...args: Args) => Promise<T>) => {
      return async (...args: Args): Promise<T> => {
        startLoading()
        try {
          return await fn(...args)
        } finally {
          stopLoading()
        }
      }
    },
    [startLoading, stopLoading]
  )

  const reset = useCallback(() => {
    setIsLoading(initialState)
    loadingStartTime.current = null
  }, [initialState])

  return {
    isLoading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading,
    reset,
  }
}

export default useLoading
