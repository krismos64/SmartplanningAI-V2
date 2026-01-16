'use client'

/**
 * Hook React pour la gestion du consentement cookies
 *
 * @description Hook qui utilise le Context si disponible, sinon fonctionne en standalone.
 * Pour une utilisation normale dans l'app, les composants doivent être enfants de
 * CookieConsentProvider. Ce hook est gardé pour la rétrocompatibilité avec les tests.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import { useCallback, useEffect, useState } from 'react'
import {
  ACCEPT_ALL_PREFERENCES,
  applyConsentPreferences,
  CookieConsent,
  CookiePreferences,
  DEFAULT_PREFERENCES,
  getConsent,
  setConsent,
} from '@/lib/cookies'

/**
 * État retourné par le hook
 */
export interface UseCookieConsentReturn {
  /** Indique si le consentement a été donné (bannière affichée ou non) */
  hasConsented: boolean
  /** Indique si le hook est initialisé (côté client) */
  isLoaded: boolean
  /** Consentement complet avec timestamp */
  consent: CookieConsent | null
  /** Préférences actuelles */
  preferences: CookiePreferences
  /** Accepte tous les cookies */
  acceptAll: () => void
  /** Refuse tous les cookies non essentiels */
  rejectAll: () => void
  /** Sauvegarde des préférences personnalisées */
  savePreferences: (preferences: CookiePreferences) => void
  /** Ouvre le modal de préférences */
  openPreferences: () => void
  /** Ferme le modal de préférences */
  closePreferences: () => void
  /** État du modal de préférences */
  isPreferencesOpen: boolean
}

/**
 * Hook pour gérer le consentement cookies RGPD
 *
 * @description Ce hook fonctionne en mode standalone pour les tests unitaires.
 * Dans l'application réelle, les composants cookies utilisent useCookieConsentContext
 * qui partage l'état via le CookieConsentProvider.
 *
 * @example
 * ```tsx
 * const { hasConsented, acceptAll, rejectAll, openPreferences } = useCookieConsent()
 *
 * if (!hasConsented) {
 *   return <CookieBanner onAccept={acceptAll} onReject={rejectAll} />
 * }
 * ```
 */
export function useCookieConsent(): UseCookieConsentReturn {
  const [isLoaded, setIsLoaded] = useState(false)
  const [consent, setConsentState] = useState<CookieConsent | null>(null)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Charge le consentement au montage (côté client uniquement)
  useEffect(() => {
    const currentConsent = getConsent()
    setConsentState(currentConsent)
    setIsLoaded(true)

    // Applique les préférences existantes (charge les scripts si autorisé)
    if (currentConsent) {
      applyConsentPreferences()
    }
  }, [])

  const hasConsented = consent !== null

  const preferences = consent?.preferences ?? DEFAULT_PREFERENCES

  const handleAcceptAll = useCallback(() => {
    setConsent(ACCEPT_ALL_PREFERENCES)
    setConsentState(getConsent())
    applyConsentPreferences()
    setIsPreferencesOpen(false)
  }, [])

  const handleRejectAll = useCallback(() => {
    setConsent(DEFAULT_PREFERENCES)
    setConsentState(getConsent())
    applyConsentPreferences()
    setIsPreferencesOpen(false)
  }, [])

  const handleSavePreferences = useCallback(
    (newPreferences: CookiePreferences) => {
      setConsent({
        ...newPreferences,
        essential: true, // Toujours forcé
      })
      setConsentState(getConsent())
      applyConsentPreferences()
      setIsPreferencesOpen(false)
    },
    []
  )

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true)
  }, [])

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false)
  }, [])

  return {
    hasConsented,
    isLoaded,
    consent,
    preferences,
    acceptAll: handleAcceptAll,
    rejectAll: handleRejectAll,
    savePreferences: handleSavePreferences,
    openPreferences,
    closePreferences,
    isPreferencesOpen,
  }
}

export default useCookieConsent
