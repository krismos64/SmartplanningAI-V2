'use client'

/**
 * Provider de consentement cookies RGPD
 *
 * @description Composant wrapper qui gère l'affichage de la bannière
 * et du modal de préférences. À intégrer dans le layout racine.
 * Utilise un Context React pour partager l'état entre tous les composants.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { CookieBanner } from './CookieBanner'
import { CookiePreferencesModal } from './CookiePreferencesModal'
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
 * Type du contexte de consentement cookies
 */
export interface CookieConsentContextValue {
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
 * Contexte de consentement cookies
 */
const CookieConsentContext = createContext<CookieConsentContextValue | null>(
  null
)

/**
 * Hook pour accéder au contexte de consentement cookies
 *
 * @throws Error si utilisé en dehors du CookieConsentProvider
 */
export function useCookieConsentContext(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error(
      'useCookieConsentContext doit être utilisé dans un CookieConsentProvider'
    )
  }
  return context
}

/**
 * Hook pour accéder au contexte de consentement cookies de manière optionnelle
 *
 * @returns Le contexte ou null si en dehors du Provider
 */
export function useCookieConsentContextOptional(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext)
}

export interface CookieConsentProviderProps {
  /** Contenu enfant à envelopper */
  children?: React.ReactNode
}

/**
 * Provider de consentement cookies
 *
 * @description Affiche automatiquement la bannière si nécessaire
 * et le modal de préférences quand demandé.
 * Peut envelopper des enfants pour leur donner accès au contexte.
 *
 * @example
 * ```tsx
 * // Dans layout.tsx
 * <body>
 *   <CookieConsentProvider>
 *     {children}
 *   </CookieConsentProvider>
 * </body>
 * ```
 */
export function CookieConsentProvider({
  children,
}: CookieConsentProviderProps) {
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

  const value: CookieConsentContextValue = {
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

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
      <CookieBanner />
      <CookiePreferencesModal />
    </CookieConsentContext.Provider>
  )
}

export default CookieConsentProvider
