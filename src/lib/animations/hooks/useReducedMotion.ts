/**
 * useReducedMotion Hook - SmartPlanning V2
 *
 * Détecte la préférence utilisateur pour les mouvements réduits
 * Conforme aux guidelines WCAG 2.1 (critère 2.3.3)
 *
 * @see SP-379 - Animations System
 * @see https://motion.dev/docs/react-accessibility
 * @see https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
 */

'use client'

import { useState, useEffect } from 'react'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

// =============================================================================
// CONSTANTS
// =============================================================================

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour détecter la préférence utilisateur pour les mouvements réduits
 *
 * Utilise le hook natif de Framer Motion avec un fallback
 * pour les environnements où il n'est pas disponible
 *
 * @returns {boolean} true si l'utilisateur préfère les mouvements réduits
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const shouldReduceMotion = useReducedMotion()
 *
 *   return (
 *     <motion.div
 *       animate={shouldReduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
 *     />
 *   )
 * }
 * ```
 */
export function useReducedMotion(): boolean {
  // Utilise le hook Framer Motion si disponible
  const framerReducedMotion = useFramerReducedMotion()

  // State local comme fallback
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      // SSR-safe: retourne false côté serveur
      if (typeof window === 'undefined') {
        return false
      }
      return window.matchMedia(REDUCED_MOTION_QUERY).matches
    }
  )

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY)

    // Mise à jour initiale
    setPrefersReducedMotion(mediaQuery.matches)

    // Listener pour les changements
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Utilise addEventListener (moderne) ou addListener (legacy)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  // Préfère le résultat de Framer Motion s'il est défini (non-null)
  return framerReducedMotion ?? prefersReducedMotion
}

/**
 * Hook simplifié qui retourne uniquement le booléen
 * Alias pour une utilisation plus concise
 */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion()
}

/**
 * Hook qui retourne les props d'animation adaptées
 * selon la préférence de mouvement réduit
 *
 * @param normalAnimation - Animation normale
 * @param reducedAnimation - Animation réduite (optionnel, défaut: opacity only)
 * @returns L'animation appropriée selon la préférence
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const animation = useMotionSafe(
 *     { x: 0, opacity: 1 },           // Normal
 *     { opacity: 1 }                   // Reduced (optionnel)
 *   )
 *
 *   return <motion.div animate={animation} />
 * }
 * ```
 */
export function useMotionSafe<T extends object>(
  normalAnimation: T,
  reducedAnimation?: Partial<T>
): T | Partial<T> {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    // Retourne l'animation réduite ou extrait uniquement opacity
    if (reducedAnimation) {
      return reducedAnimation
    }

    // Fallback: garder uniquement opacity si présent
    if ('opacity' in normalAnimation) {
      return {
        opacity: (normalAnimation as { opacity: number }).opacity,
      } as unknown as Partial<T>
    }

    // Sinon retourne un objet vide (pas d'animation)
    return {} as Partial<T>
  }

  return normalAnimation
}

export default useReducedMotion
