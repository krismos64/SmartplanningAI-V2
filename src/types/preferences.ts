/**
 * Types pour les préférences utilisateur
 *
 * @ticket SP-433 - Migration Prisma ajout champ preferences JSON
 * @see SP-275 - Préférences notifications
 * @see SP-276 - Préférences thème/affichage
 *
 * Structure stockée dans User.preferences (Json Prisma)
 */

// ============================================================================
// PRÉFÉRENCES D'AFFICHAGE (SP-276)
// ============================================================================

/**
 * Thème de l'application
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Format de date
 */
export type DateFormatPreference = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

/**
 * Format d'heure
 */
export type TimeFormatPreference = '24h' | '12h'

/**
 * Langue de l'interface
 */
export type LanguagePreference = 'fr' | 'en'

/**
 * Préférences d'affichage
 */
export interface DisplayPreferences {
  /** Thème (clair, sombre, système) */
  theme: ThemePreference
  /** Format de date */
  dateFormat: DateFormatPreference
  /** Format d'heure */
  timeFormat: TimeFormatPreference
  /** Langue de l'interface */
  language: LanguagePreference
}

// ============================================================================
// PRÉFÉRENCES NOTIFICATIONS (SP-275)
// ============================================================================

/**
 * Préférences de notification par canal
 */
export interface NotificationChannelPreferences {
  /** Notifications liées aux plannings */
  planning: boolean
  /** Notifications liées aux congés */
  leaves: boolean
  /** Notifications liées aux tâches */
  tasks: boolean
  /** Notifications système */
  system: boolean
}

/**
 * Préférences de notifications
 */
export interface NotificationPreferences {
  /** Notifications par email */
  email: NotificationChannelPreferences
  /** Notifications dans l'application */
  inApp: NotificationChannelPreferences
}

// ============================================================================
// PRÉFÉRENCES UTILISATEUR COMPLÈTES
// ============================================================================

/**
 * Structure complète des préférences utilisateur
 *
 * Stockée dans User.preferences (Json Prisma)
 */
export interface UserPreferences {
  /** Préférences d'affichage (thème, formats) */
  display?: DisplayPreferences
  /** Préférences de notifications */
  notifications?: NotificationPreferences
}

// ============================================================================
// VALEURS PAR DÉFAUT
// ============================================================================

/**
 * Valeurs par défaut pour les préférences d'affichage
 */
export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  theme: 'system',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  language: 'fr',
}

/**
 * Valeurs par défaut pour les préférences de notifications par canal
 */
export const DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES: NotificationChannelPreferences =
  {
    planning: true,
    leaves: true,
    tasks: true,
    system: true,
  }

/**
 * Valeurs par défaut pour les préférences de notifications
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: { ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES },
  inApp: { ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES },
}

/**
 * Valeurs par défaut complètes pour les préférences utilisateur
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  display: { ...DEFAULT_DISPLAY_PREFERENCES },
  notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
}

// ============================================================================
// OPTIONS POUR LES SELECTS UI
// ============================================================================

/**
 * Options pour le select de thème
 */
export const THEME_OPTIONS = [
  { value: 'system', label: 'Système' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
] as const

/**
 * Options pour le select de format de date
 */
export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: '31/12/2026 (FR)' },
  { value: 'MM/DD/YYYY', label: '12/31/2026 (US)' },
  { value: 'YYYY-MM-DD', label: '2026-12-31 (ISO)' },
] as const

/**
 * Options pour le select de format d'heure
 */
export const TIME_FORMAT_OPTIONS = [
  { value: '24h', label: '14:30 (24h)' },
  { value: '12h', label: '2:30 PM (12h)' },
] as const

/**
 * Options pour le select de langue
 */
export const LANGUAGE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const
