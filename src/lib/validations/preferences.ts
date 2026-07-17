/**
 * Schémas Zod pour la validation des préférences utilisateur
 *
 * @ticket SP-433 - Migration Prisma ajout champ preferences JSON
 * @see SP-275 - Préférences notifications
 * @see SP-276 - Préférences thème/affichage
 *
 * ✅ Via Context7 (Zod v3 best practices)
 * - z.enum() pour les types union stricts
 * - .default() pour les valeurs par défaut
 * - z.infer<> pour l'inférence de types TypeScript
 */

import { z } from 'zod'

// ============================================================================
// PRÉFÉRENCES D'AFFICHAGE
// ============================================================================

/**
 * Schéma pour le thème
 */
export const themePreferenceSchema = z
  .enum(['light', 'dark', 'system'])
  .default('system')

/**
 * Schéma pour le format de date
 */
export const dateFormatPreferenceSchema = z
  .enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  .default('DD/MM/YYYY')

/**
 * Schéma pour le format d'heure
 */
export const timeFormatPreferenceSchema = z.enum(['24h', '12h']).default('24h')

/**
 * Schéma pour la langue
 */
export const languagePreferenceSchema = z.enum(['fr', 'en']).default('fr')

/**
 * Schéma pour les préférences d'affichage
 */
export const displayPreferencesSchema = z.object({
  theme: themePreferenceSchema,
  dateFormat: dateFormatPreferenceSchema,
  timeFormat: timeFormatPreferenceSchema,
  language: languagePreferenceSchema,
})

// ============================================================================
// PRÉFÉRENCES NOTIFICATIONS
// ============================================================================

/**
 * Schéma pour les préférences de notification par canal
 */
export const notificationChannelPreferencesSchema = z.object({
  planning: z.boolean().default(true),
  leaves: z.boolean().default(true),
  tasks: z.boolean().default(true),
  system: z.boolean().default(true),
})

/**
 * Schéma pour les préférences de notifications
 */
export const notificationPreferencesSchema = z.object({
  email: notificationChannelPreferencesSchema,
  inApp: notificationChannelPreferencesSchema,
})

// ============================================================================
// PRÉFÉRENCES ONBOARDING
// ============================================================================

/**
 * Schéma pour les préférences d'onboarding
 */
export const onboardingPreferencesSchema = z.object({
  hasSeenWelcome: z.boolean().default(false),
})

// ============================================================================
// PRÉFÉRENCES UTILISATEUR COMPLÈTES
// ============================================================================

/**
 * Schéma complet pour les préférences utilisateur
 *
 * - Tous les champs sont optionnels pour permettre les mises à jour partielles
 * - Les valeurs par défaut sont appliquées via les sous-schémas
 */
export const userPreferencesSchema = z.object({
  display: displayPreferencesSchema.optional(),
  notifications: notificationPreferencesSchema.optional(),
  onboarding: onboardingPreferencesSchema.optional(),
})

// ============================================================================
// SCHÉMAS DE MISE À JOUR (PARTIELS)
// ============================================================================

/**
 * Schéma pour la mise à jour des préférences d'affichage
 * Tous les champs sont optionnels
 */
export const updateDisplayPreferencesSchema = z.object({
  theme: themePreferenceSchema.optional(),
  dateFormat: dateFormatPreferenceSchema.optional(),
  timeFormat: timeFormatPreferenceSchema.optional(),
  language: languagePreferenceSchema.optional(),
})

/**
 * Schéma pour la mise à jour des préférences de notifications par canal
 * Tous les champs sont optionnels
 */
export const updateNotificationChannelPreferencesSchema = z.object({
  planning: z.boolean().optional(),
  leaves: z.boolean().optional(),
  tasks: z.boolean().optional(),
  system: z.boolean().optional(),
})

/**
 * Schéma pour la mise à jour des préférences de notifications
 */
export const updateNotificationPreferencesSchema = z.object({
  email: updateNotificationChannelPreferencesSchema.optional(),
  inApp: updateNotificationChannelPreferencesSchema.optional(),
})

/**
 * Schéma pour la mise à jour des préférences d'onboarding
 * Tous les champs sont optionnels
 */
export const updateOnboardingPreferencesSchema = z.object({
  hasSeenWelcome: z.boolean().optional(),
})

/**
 * Schéma pour la mise à jour complète des préférences
 */
export const updateUserPreferencesSchema = z.object({
  display: updateDisplayPreferencesSchema.optional(),
  notifications: updateNotificationPreferencesSchema.optional(),
  onboarding: updateOnboardingPreferencesSchema.optional(),
})

// ============================================================================
// TYPES INFÉRÉS
// ============================================================================

export type DisplayPreferencesInput = z.infer<typeof displayPreferencesSchema>
export type NotificationChannelPreferencesInput = z.infer<
  typeof notificationChannelPreferencesSchema
>
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>
export type OnboardingPreferencesInput = z.infer<
  typeof onboardingPreferencesSchema
>
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>

export type UpdateDisplayPreferencesInput = z.infer<
  typeof updateDisplayPreferencesSchema
>
export type UpdateNotificationPreferencesInput = z.infer<
  typeof updateNotificationPreferencesSchema
>
export type UpdateOnboardingPreferencesInput = z.infer<
  typeof updateOnboardingPreferencesSchema
>
export type UpdateUserPreferencesInput = z.infer<
  typeof updateUserPreferencesSchema
>

// ============================================================================
// LABELS FR POUR L'UI
// ============================================================================

export const DISPLAY_PREFERENCES_LABELS = {
  theme: 'Thème',
  dateFormat: 'Format de date',
  timeFormat: "Format d'heure",
  language: 'Langue',
} as const

export const NOTIFICATION_CHANNEL_LABELS = {
  planning: 'Plannings',
  leaves: 'Congés',
  tasks: 'Tâches',
  system: 'Système',
} as const

export const NOTIFICATION_PREFERENCES_LABELS = {
  email: 'Notifications par email',
  inApp: "Notifications dans l'application",
} as const
