/**
 * Helper pour émettre des notifications via SSE
 *
 * @ticket SP-327
 * @description Fonction utilitaire pour émettre une notification vers les clients connectés
 */

import { sseManager } from './sse-emitter'
import type { NotificationListItem } from '@/types/notification'
import type { Notification } from '@prisma/client'

/**
 * Convertit une notification Prisma en NotificationListItem
 */
function toNotificationListItem(
  notification: Notification
): NotificationListItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    priority: notification.priority,
    actionUrl: notification.actionUrl,
    relatedType: notification.relatedType,
    relatedId: notification.relatedId,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  }
}

/**
 * Émet une notification via SSE à un utilisateur spécifique
 *
 * Cette fonction est non-bloquante et ne doit pas faire échouer
 * l'opération principale si l'émission SSE échoue.
 *
 * @param userId - ID de l'utilisateur destinataire
 * @param notification - Notification Prisma à émettre
 *
 * @example
 * // Dans un server action après création
 * const notification = await prisma.notification.create({ ... })
 * emitNotification(userId, notification)
 */
export function emitNotification(
  userId: string,
  notification: Notification
): void {
  try {
    const listItem = toNotificationListItem(notification)
    sseManager.emitToUser(userId, listItem)
  } catch (error) {
    // Log silencieux - ne pas faire échouer l'opération principale
    console.error('[emitNotification] Error:', error)
  }
}

/**
 * Émet une notification à plusieurs utilisateurs
 *
 * @param userIds - Liste des IDs utilisateurs
 * @param notification - Notification Prisma à émettre
 */
export function emitNotificationToUsers(
  userIds: string[],
  notification: Notification
): void {
  try {
    const listItem = toNotificationListItem(notification)
    sseManager.emitToUsers(userIds, listItem)
  } catch (error) {
    console.error('[emitNotificationToUsers] Error:', error)
  }
}

/**
 * Émet une notification déjà formatée
 *
 * @param userId - ID de l'utilisateur destinataire
 * @param notification - Notification formatée
 */
export function emitNotificationItem(
  userId: string,
  notification: NotificationListItem
): void {
  try {
    sseManager.emitToUser(userId, notification)
  } catch (error) {
    console.error('[emitNotificationItem] Error:', error)
  }
}
