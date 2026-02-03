/**
 * Utilitaires pour la gestion des préférences utilisateur
 *
 * @ticket SP-433 - Migration Prisma ajout champ preferences JSON
 *
 * Fonctions de parsing et serialization pour le champ User.preferences (Json Prisma)
 *
 * ✅ Via Context7 (Prisma JSON field best practices)
 * - Le champ Json Prisma retourne `unknown` ou `Prisma.JsonValue`
 * - Il faut valider et parser les données avant utilisation
 * - Deep merge avec les valeurs par défaut pour rétrocompatibilité
 */

import type {
  UserPreferences,
  DisplayPreferences,
  NotificationPreferences,
  NotificationChannelPreferences,
} from '@/types/preferences'
import {
  DEFAULT_USER_PREFERENCES,
  DEFAULT_DISPLAY_PREFERENCES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
} from '@/types/preferences'
import { userPreferencesSchema } from '@/lib/validations/preferences'

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse et valide les préférences utilisateur depuis le JSON Prisma
 *
 * - Retourne les valeurs par défaut si l'input est null/undefined
 * - Valide avec Zod et fusionne avec les defaults
 * - Safe pour les données corrompues (fallback aux defaults)
 *
 * @param raw - Valeur brute du champ User.preferences (Prisma.JsonValue)
 * @returns Préférences validées et complètes
 *
 * @example
 * const user = await prisma.user.findUnique({ where: { id } })
 * const prefs = parseUserPreferences(user.preferences)
 * console.log(prefs.display.theme) // 'system' | 'light' | 'dark'
 */
export function parseUserPreferences(raw: unknown): UserPreferences {
  // Cas null/undefined : retourner les defaults
  if (raw === null || raw === undefined) {
    return structuredClone(DEFAULT_USER_PREFERENCES)
  }

  // Cas non-object : retourner les defaults
  if (typeof raw !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[parseUserPreferences] Invalid preferences type, using defaults:',
        typeof raw
      )
    }
    return structuredClone(DEFAULT_USER_PREFERENCES)
  }

  // Valider avec Zod
  const result = userPreferencesSchema.safeParse(raw)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[parseUserPreferences] Invalid preferences, using defaults:',
        result.error.errors
      )
    }
    return structuredClone(DEFAULT_USER_PREFERENCES)
  }

  // Deep merge avec les defaults pour garantir toutes les propriétés
  return mergePreferencesWithDefaults(result.data)
}

/**
 * Parse les préférences d'affichage uniquement
 *
 * @param raw - Valeur brute (peut être partielle)
 * @returns Préférences d'affichage complètes
 */
export function parseDisplayPreferences(raw: unknown): DisplayPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_DISPLAY_PREFERENCES }
  }

  const rawObj = raw as Record<string, unknown>

  return {
    theme: isValidTheme(rawObj.theme)
      ? rawObj.theme
      : DEFAULT_DISPLAY_PREFERENCES.theme,
    dateFormat: isValidDateFormat(rawObj.dateFormat)
      ? rawObj.dateFormat
      : DEFAULT_DISPLAY_PREFERENCES.dateFormat,
    timeFormat: isValidTimeFormat(rawObj.timeFormat)
      ? rawObj.timeFormat
      : DEFAULT_DISPLAY_PREFERENCES.timeFormat,
    language: isValidLanguage(rawObj.language)
      ? rawObj.language
      : DEFAULT_DISPLAY_PREFERENCES.language,
  }
}

/**
 * Parse les préférences de notifications uniquement
 *
 * @param raw - Valeur brute (peut être partielle)
 * @returns Préférences de notifications complètes
 */
export function parseNotificationPreferences(
  raw: unknown
): NotificationPreferences {
  if (!raw || typeof raw !== 'object') {
    return structuredClone(DEFAULT_NOTIFICATION_PREFERENCES)
  }

  const rawObj = raw as Record<string, unknown>

  return {
    email: parseNotificationChannelPreferences(rawObj.email),
    inApp: parseNotificationChannelPreferences(rawObj.inApp),
  }
}

/**
 * Parse les préférences d'un canal de notification
 */
function parseNotificationChannelPreferences(
  raw: unknown
): NotificationChannelPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES }
  }

  const rawObj = raw as Record<string, unknown>

  return {
    planning:
      typeof rawObj.planning === 'boolean'
        ? rawObj.planning
        : DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES.planning,
    leaves:
      typeof rawObj.leaves === 'boolean'
        ? rawObj.leaves
        : DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES.leaves,
    tasks:
      typeof rawObj.tasks === 'boolean'
        ? rawObj.tasks
        : DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES.tasks,
    system:
      typeof rawObj.system === 'boolean'
        ? rawObj.system
        : DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES.system,
  }
}

// ============================================================================
// MERGE
// ============================================================================

/**
 * Fusionne des préférences partielles avec les valeurs par défaut
 *
 * @param partial - Préférences partielles (peuvent manquer des champs)
 * @returns Préférences complètes avec tous les champs
 */
export function mergePreferencesWithDefaults(
  partial: Partial<UserPreferences>
): UserPreferences {
  return {
    display: {
      ...DEFAULT_DISPLAY_PREFERENCES,
      ...partial.display,
    },
    notifications: {
      email: {
        ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
        ...partial.notifications?.email,
      },
      inApp: {
        ...DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES,
        ...partial.notifications?.inApp,
      },
    },
  }
}

// ============================================================================
// SERIALIZATION
// ============================================================================

/**
 * Sérialise les préférences pour sauvegarde en base de données
 *
 * Prisma accepte directement les objets pour les champs Json,
 * mais cette fonction permet de nettoyer/valider avant sauvegarde.
 *
 * @param prefs - Préférences à sauvegarder
 * @returns Objet prêt pour Prisma (pas besoin de JSON.stringify)
 */
export function serializeUserPreferences(
  prefs: Partial<UserPreferences>
): Record<string, unknown> {
  // Valider avant serialization
  const result = userPreferencesSchema.safeParse(prefs)

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[serializeUserPreferences] Invalid preferences:',
        result.error.errors
      )
    }
    // Retourner les defaults si invalide
    return DEFAULT_USER_PREFERENCES as Record<string, unknown>
  }

  return result.data as Record<string, unknown>
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Vérifie si une valeur est un thème valide
 */
function isValidTheme(value: unknown): value is 'light' | 'dark' | 'system' {
  return value === 'light' || value === 'dark' || value === 'system'
}

/**
 * Vérifie si une valeur est un format de date valide
 */
function isValidDateFormat(
  value: unknown
): value is 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' {
  return (
    value === 'DD/MM/YYYY' || value === 'MM/DD/YYYY' || value === 'YYYY-MM-DD'
  )
}

/**
 * Vérifie si une valeur est un format d'heure valide
 */
function isValidTimeFormat(value: unknown): value is '24h' | '12h' {
  return value === '24h' || value === '12h'
}

/**
 * Vérifie si une valeur est une langue valide
 */
function isValidLanguage(value: unknown): value is 'fr' | 'en' {
  return value === 'fr' || value === 'en'
}

// ============================================================================
// UTILS
// ============================================================================

/**
 * Vérifie si les notifications email sont activées pour un type donné
 */
export function isEmailNotificationEnabled(
  prefs: UserPreferences,
  type: keyof NotificationChannelPreferences
): boolean {
  return prefs.notifications?.email?.[type] ?? true
}

/**
 * Vérifie si les notifications in-app sont activées pour un type donné
 */
export function isInAppNotificationEnabled(
  prefs: UserPreferences,
  type: keyof NotificationChannelPreferences
): boolean {
  return prefs.notifications?.inApp?.[type] ?? true
}
