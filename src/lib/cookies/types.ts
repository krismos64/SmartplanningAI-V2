/**
 * Types pour la gestion du consentement cookies RGPD
 *
 * @description Définit les types TypeScript pour le système de consentement
 * cookies conforme au RGPD avec choix granulaire par catégorie.
 *
 * @see SP-283 - Bannière Cookies : Consent manager avec choix granulaire
 */

/**
 * Catégories de cookies disponibles
 */
export type CookieCategory = 'essential' | 'analytics' | 'functional'

/**
 * Préférences de consentement par catégorie
 */
export interface CookiePreferences {
  /** Cookies essentiels - Toujours actifs, non modifiables */
  essential: true
  /** Cookies analytics - Google Analytics, mesure d'audience */
  analytics: boolean
  /** Cookies fonctionnels - Thème, langue, préférences UI */
  functional: boolean
}

/**
 * Structure complète du consentement stocké
 */
export interface CookieConsent {
  /** Version du format pour migrations futures */
  version: number
  /** Date ISO du consentement */
  timestamp: string
  /** Préférences par catégorie */
  preferences: CookiePreferences
}

/**
 * Configuration d'une catégorie de cookies pour l'affichage
 */
export interface CookieCategoryConfig {
  /** Identifiant de la catégorie */
  id: CookieCategory
  /** Nom affiché */
  name: string
  /** Description de la catégorie */
  description: string
  /** Si true, ne peut pas être désactivé */
  required: boolean
}

/**
 * État du consentement dans l'application
 */
export type ConsentStatus = 'unknown' | 'accepted' | 'rejected' | 'partial'

/**
 * Actions possibles sur le consentement
 */
export type ConsentAction = 'accept_all' | 'reject_all' | 'save_preferences'

/**
 * Version actuelle du format de consentement
 */
export const CONSENT_VERSION = 1

/**
 * Nom du cookie de consentement
 */
export const CONSENT_COOKIE_NAME = 'cookie-consent'

/**
 * Durée de vie du cookie en jours (12 mois = 365 jours)
 */
export const CONSENT_COOKIE_MAX_AGE_DAYS = 365

/**
 * Configuration des catégories de cookies
 */
export const COOKIE_CATEGORIES: CookieCategoryConfig[] = [
  {
    id: 'essential',
    name: 'Cookies essentiels',
    description:
      'Indispensables au fonctionnement du site (authentification, sécurité, mémorisation de vos choix de cookies). Ils ne peuvent pas être désactivés.',
    required: true,
  },
  {
    id: 'analytics',
    name: 'Cookies analytiques',
    description:
      "Nous permettent de mesurer l'audience et de comprendre comment vous utilisez le site pour l'améliorer. Les données sont anonymisées.",
    required: false,
  },
  {
    id: 'functional',
    name: 'Cookies fonctionnels',
    description:
      'Mémorisent vos préférences (thème, langue, état de la sidebar) pour personnaliser votre expérience.',
    required: false,
  },
]

/**
 * Préférences par défaut (tout refusé sauf essentiels)
 */
export const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  functional: false,
}

/**
 * Préférences quand tout est accepté
 */
export const ACCEPT_ALL_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: true,
  functional: true,
}
