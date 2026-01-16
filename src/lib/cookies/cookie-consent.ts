/**
 * Fonctions de gestion du consentement cookies
 *
 * @description Utilitaires pour lire, écrire et gérer le cookie de consentement
 * RGPD. Fonctionne côté client uniquement.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import {
  ACCEPT_ALL_PREFERENCES,
  CONSENT_COOKIE_MAX_AGE_DAYS,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  CookieConsent,
  CookiePreferences,
  DEFAULT_PREFERENCES,
} from './types'

/**
 * Vérifie si le code s'exécute côté client
 */
const isClient = typeof window !== 'undefined'

/**
 * Récupère le consentement stocké dans le cookie
 *
 * @returns Le consentement ou null si non trouvé/invalide
 */
export function getConsent(): CookieConsent | null {
  if (!isClient) return null

  try {
    const cookieValue = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`))
      ?.split('=')[1]

    if (!cookieValue) return null

    const decoded = decodeURIComponent(cookieValue)
    const consent = JSON.parse(decoded) as CookieConsent

    // Valide la structure
    if (
      typeof consent.version !== 'number' ||
      typeof consent.timestamp !== 'string' ||
      typeof consent.preferences !== 'object' ||
      typeof consent.preferences.essential !== 'boolean' ||
      typeof consent.preferences.analytics !== 'boolean' ||
      typeof consent.preferences.functional !== 'boolean'
    ) {
      return null
    }

    return consent
  } catch {
    return null
  }
}

/**
 * Sauvegarde le consentement dans un cookie
 *
 * @param preferences - Les préférences à sauvegarder
 */
export function setConsent(preferences: CookiePreferences): void {
  if (!isClient) return

  const consent: CookieConsent = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    preferences: {
      ...preferences,
      essential: true, // Toujours forcé à true
    },
  }

  const maxAge = CONSENT_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 // En secondes
  const cookieValue = encodeURIComponent(JSON.stringify(consent))

  // Cookie sécurisé avec SameSite=Lax pour fonctionner avec les redirections
  document.cookie = `${CONSENT_COOKIE_NAME}=${cookieValue}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Supprime le cookie de consentement
 */
export function clearConsent(): void {
  if (!isClient) return

  document.cookie = `${CONSENT_COOKIE_NAME}=; path=/; max-age=0`
}

/**
 * Vérifie si l'utilisateur a déjà donné son consentement
 *
 * @returns true si un consentement valide existe
 */
export function hasConsented(): boolean {
  return getConsent() !== null
}

/**
 * Vérifie si une catégorie spécifique est acceptée
 *
 * @param category - La catégorie à vérifier
 * @returns true si acceptée, false sinon (défaut: refusé)
 */
export function isCategoryAccepted(category: keyof CookiePreferences): boolean {
  const consent = getConsent()
  if (!consent) return category === 'essential' // Essentiels toujours acceptés
  return consent.preferences[category]
}

/**
 * Accepte tous les cookies
 */
export function acceptAll(): void {
  setConsent(ACCEPT_ALL_PREFERENCES)
}

/**
 * Refuse tous les cookies non essentiels
 */
export function rejectAll(): void {
  setConsent(DEFAULT_PREFERENCES)
}

/**
 * Récupère les préférences actuelles ou les valeurs par défaut
 *
 * @returns Les préférences de cookies
 */
export function getPreferences(): CookiePreferences {
  const consent = getConsent()
  return consent?.preferences ?? DEFAULT_PREFERENCES
}

/**
 * Formate la date du consentement pour l'affichage
 *
 * @param timestamp - Date ISO du consentement
 * @returns Date formatée en français "16/01/2026 à 10:00"
 */
export function formatConsentDate(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    // Vérifie si la date est valide
    if (isNaN(date.getTime())) {
      return 'Date inconnue'
    }
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return `${dateStr} à ${timeStr}`
  } catch {
    return 'Date inconnue'
  }
}
