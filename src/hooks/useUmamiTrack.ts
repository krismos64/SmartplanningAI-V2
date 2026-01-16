'use client'

/**
 * Hook pour tracker des events custom avec Umami Analytics
 *
 * @description Permet d'envoyer des events personnalisés à Umami
 * uniquement si le consentement analytics a été donné (RGPD).
 *
 * @see SP-345 - Intégration Umami Analytics
 * @see https://umami.is/docs/track-events
 *
 * @example
 * ```tsx
 * function CTAButton() {
 *   const { track } = useUmamiTrack()
 *
 *   const handleClick = () => {
 *     track('cta-click', { location: 'hero' })
 *     // ... reste de la logique
 *   }
 *
 *   return <button onClick={handleClick}>S'inscrire</button>
 * }
 * ```
 *
 * @example Events disponibles dans SmartPlanning :
 * ```tsx
 * // Clic sur CTA
 * track('cta-click', { location: 'hero' | 'pricing' | 'footer' })
 *
 * // Inscription
 * track('signup-start', { source: 'landing' | 'pricing' })
 * track('signup-complete', { plan: 'free' | 'pro' | 'enterprise' })
 *
 * // Connexion
 * track('login', { method: 'email' | 'google' | 'github' })
 *
 * // Navigation
 * track('pricing-view', { plan: 'free' | 'pro' | 'enterprise' })
 *
 * // Contact
 * track('contact-submit', { subject: string })
 *
 * // Utilisation features
 * track('feature-use', { feature: 'planning' | 'team' | 'export' })
 * ```
 */

import { useCallback, useEffect, useState } from 'react'
import { isCategoryAccepted } from '@/lib/cookies'

/**
 * Données d'un event Umami
 * Clé-valeur avec types primitifs uniquement
 */
export interface UmamiEventData {
  [key: string]: string | number | boolean
}

/**
 * Retour du hook useUmamiTrack
 */
export interface UseUmamiTrackReturn {
  /** Fonction pour tracker un event */
  track: (eventName: string, eventData?: UmamiEventData) => void
  /** Indique si le tracking est actif (consentement donné) */
  isEnabled: boolean
}

/**
 * Hook pour tracker des events Umami avec respect du consentement RGPD
 *
 * @returns {UseUmamiTrackReturn} Objet avec la fonction track et l'état isEnabled
 */
export function useUmamiTrack(): UseUmamiTrackReturn {
  const [isEnabled, setIsEnabled] = useState(false)

  // Vérifie le consentement au montage et lors des changements
  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = isCategoryAccepted('analytics')
      setIsEnabled(hasConsent)
    }

    // Vérification initiale (côté client uniquement)
    if (typeof window !== 'undefined') {
      checkConsent()
    }

    // Écoute les changements de consentement
    const handleConsentChange = () => {
      checkConsent()
    }

    window.addEventListener('cookie-consent-changed', handleConsentChange)

    return () => {
      window.removeEventListener('cookie-consent-changed', handleConsentChange)
    }
  }, [])

  /**
   * Envoie un event à Umami
   *
   * @param eventName - Nom de l'event (ex: 'cta-click', 'signup-complete')
   * @param eventData - Données additionnelles (optionnel)
   */
  const track = useCallback((eventName: string, eventData?: UmamiEventData) => {
    // Vérifie le consentement à chaque appel (peut avoir changé)
    if (!isCategoryAccepted('analytics')) {
      return
    }

    // Vérifie que umami est chargé
    if (typeof window !== 'undefined' && typeof window.umami !== 'undefined') {
      window.umami.track(eventName, eventData)
    }
  }, [])

  return { track, isEnabled }
}

// Déclaration TypeScript pour l'API Umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: UmamiEventData) => void
    }
  }
}

export default useUmamiTrack
