/**
 * Chargement conditionnel des scripts tiers selon le consentement
 *
 * @description Gère le chargement des scripts analytics et autres
 * uniquement si l'utilisateur a donné son consentement.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

import { isCategoryAccepted } from './cookie-consent'

/**
 * Vérifie si le code s'exécute côté client
 */
const isClient = typeof window !== 'undefined'

/**
 * ID de mesure Google Analytics (à configurer dans .env)
 * Format: G-XXXXXXXXXX
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Charge le script Google Analytics 4 si le consentement est donné
 *
 * @description Ne charge le script que si :
 * - L'utilisateur a accepté la catégorie "analytics"
 * - Un ID de mesure GA est configuré
 * - Le script n'est pas déjà chargé
 */
export function loadAnalyticsScripts(): void {
  if (!isClient) return
  if (!isCategoryAccepted('analytics')) return
  if (!GA_MEASUREMENT_ID) return

  // Vérifie si déjà chargé
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
    return
  }

  // Charge le script gtag.js
  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  script.async = true
  document.head.appendChild(script)

  // Configure gtag
  window.dataLayer = window.dataLayer || []
  function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true, // Anonymisation IP pour RGPD
    cookie_flags: 'SameSite=None;Secure',
  })

  // Expose gtag globalement
  window.gtag = gtag
}

/**
 * Supprime les cookies analytics si le consentement est retiré
 *
 * @description Supprime les cookies Google Analytics :
 * - _ga
 * - _ga_*
 * - _gid
 * - _gat
 */
export function removeAnalyticsCookies(): void {
  if (!isClient) return

  const analyticsCookies = ['_ga', '_gid', '_gat']
  const domain = window.location.hostname

  // Supprime les cookies connus
  analyticsCookies.forEach((name) => {
    document.cookie = `${name}=; path=/; domain=${domain}; max-age=0`
    document.cookie = `${name}=; path=/; domain=.${domain}; max-age=0`
  })

  // Supprime les cookies _ga_* (format dynamique)
  document.cookie.split(';').forEach((cookie) => {
    const cookieName = cookie.split('=')[0]?.trim()
    if (cookieName?.startsWith('_ga_')) {
      document.cookie = `${cookieName}=; path=/; domain=${domain}; max-age=0`
      document.cookie = `${cookieName}=; path=/; domain=.${domain}; max-age=0`
    }
  })
}

/**
 * Applique les préférences de cookies (charge ou supprime les scripts)
 *
 * @description À appeler après chaque modification du consentement
 */
export function applyConsentPreferences(): void {
  if (!isClient) return

  if (isCategoryAccepted('analytics')) {
    loadAnalyticsScripts()
  } else {
    removeAnalyticsCookies()
  }
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}
