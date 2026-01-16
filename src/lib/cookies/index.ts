/**
 * Module de gestion du consentement cookies RGPD
 *
 * @description Exporte toutes les fonctions et types pour la gestion
 * du consentement cookies conforme au RGPD.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

// Types
export type {
  CookieCategory,
  CookieCategoryConfig,
  CookieConsent,
  CookiePreferences,
  ConsentAction,
  ConsentStatus,
} from './types'

// Constantes
export {
  ACCEPT_ALL_PREFERENCES,
  CONSENT_COOKIE_MAX_AGE_DAYS,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  COOKIE_CATEGORIES,
  DEFAULT_PREFERENCES,
} from './types'

// Fonctions de gestion du consentement
export {
  acceptAll,
  clearConsent,
  formatConsentDate,
  getConsent,
  getPreferences,
  hasConsented,
  isCategoryAccepted,
  rejectAll,
  setConsent,
} from './cookie-consent'

// Chargement conditionnel des scripts
export {
  applyConsentPreferences,
  loadAnalyticsScripts,
  removeAnalyticsCookies,
} from './scripts'
