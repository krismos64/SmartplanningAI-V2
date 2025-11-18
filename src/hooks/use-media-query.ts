/**
 * useMediaQuery Hook - Détection responsive des breakpoints
 *
 * ✅ Source : Pattern React pour media queries (Context7)
 *
 * OBJECTIF :
 * Hook custom pour détecter les breakpoints CSS et adapter l'UI
 * Utilisé par DataTable pour basculer entre table et cards mobile
 *
 * USAGE :
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
 *
 * BREAKPOINTS SmartPlanning :
 * - Mobile : < 768px (cards verticales)
 * - Tablet : 768px - 1023px (table compacte)
 * - Desktop : ≥ 1024px (table complète)
 */

'use client'

import { useEffect, useState } from 'react'

/**
 * Hook pour détecter un media query CSS
 *
 * @param query - Media query CSS (ex: "(max-width: 768px)")
 * @returns boolean - true si le media query match
 */
export function useMediaQuery(query: string): boolean {
  // État initial : false côté serveur pour éviter hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Vérifier si window est disponible (client-side uniquement)
    if (typeof window === 'undefined') {
      return
    }

    // Créer le media query matcher
    const media = window.matchMedia(query)

    // Mettre à jour l'état initial
    setMatches(media.matches)

    // Listener pour les changements (resize, orientation)
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Attacher le listener (compatible tous navigateurs)
    if (media.addEventListener) {
      media.addEventListener('change', listener)
    } else {
      // Fallback pour anciens navigateurs
      media.addListener(listener)
    }

    // Cleanup : retirer le listener au démontage
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener)
      } else {
        media.removeListener(listener)
      }
    }
  }, [query])

  return matches
}
