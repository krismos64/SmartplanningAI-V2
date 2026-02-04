/**
 * Helper pour le mapping des types de notification vers les catégories de préférences
 *
 * @ticket SP-275 - Préférences Notifications
 *
 * Ce helper permet de mapper les NotificationType de Prisma vers les catégories
 * de préférences utilisateur (planning, leaves, tasks, system).
 */

import type { NotificationType } from '@prisma/client'
import type { NotificationChannelPreferences } from '@/types/preferences'

// ============================================================================
// MAPPING TYPE → CATÉGORIE
// ============================================================================

/**
 * Mapping entre NotificationType (Prisma) et catégorie de préférence utilisateur
 *
 * Les types INFO, SUCCESS, WARNING, ERROR, INCIDENT sont considérés comme "système"
 */
export const NOTIFICATION_TYPE_TO_CATEGORY: Record<
  NotificationType,
  keyof NotificationChannelPreferences
> = {
  PLANNING: 'planning',
  LEAVE: 'leaves',
  TASK: 'tasks',
  SYSTEM: 'system',
  INFO: 'system',
  SUCCESS: 'system',
  WARNING: 'system',
  ERROR: 'system',
  INCIDENT: 'system',
}

/**
 * Obtient la catégorie de préférence pour un type de notification
 *
 * @param type - Type de notification Prisma
 * @returns Catégorie de préférence (planning, leaves, tasks, system)
 *
 * @example
 * getNotificationCategory('PLANNING') // 'planning'
 * getNotificationCategory('LEAVE') // 'leaves'
 * getNotificationCategory('INFO') // 'system'
 */
export function getNotificationCategory(
  type: NotificationType
): keyof NotificationChannelPreferences {
  return NOTIFICATION_TYPE_TO_CATEGORY[type] || 'system'
}

// ============================================================================
// DESCRIPTIONS UI
// ============================================================================

/**
 * Descriptions des catégories pour l'UI
 */
export const NOTIFICATION_CATEGORY_DESCRIPTIONS: Record<
  keyof NotificationChannelPreferences,
  string
> = {
  planning: 'Créneaux assignés, modifications de planning, suppressions',
  leaves: 'Demandes de congés, approbations, refus, annulations',
  tasks: 'Rappels de vos notes personnelles et tâches',
  system: 'Annonces importantes, maintenance, alertes de sécurité',
}

/**
 * Icônes des catégories (noms Lucide React)
 */
export const NOTIFICATION_CATEGORY_ICONS: Record<
  keyof NotificationChannelPreferences,
  string
> = {
  planning: 'Calendar',
  leaves: 'Palmtree',
  tasks: 'CheckSquare',
  system: 'Bell',
}

/**
 * Couleurs des catégories pour l'UI
 */
export const NOTIFICATION_CATEGORY_COLORS: Record<
  keyof NotificationChannelPreferences,
  string
> = {
  planning: 'bg-blue-500/10 text-blue-500',
  leaves: 'bg-green-500/10 text-green-500',
  tasks: 'bg-orange-500/10 text-orange-500',
  system: 'bg-purple-500/10 text-purple-500',
}
