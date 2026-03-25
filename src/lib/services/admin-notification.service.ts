/**
 * Service de notifications SYSTEM_ADMIN
 *
 * @description Fournit la liste des user IDs SYSTEM_ADMIN actifs
 * et la factory createAdminNotification pour l'envoi de notifications.
 *
 * IMPORTANT : Ce fichier n'a PAS de directive 'use server' pour pouvoir
 * être importé dynamiquement depuis les routes API et services sans
 * provoquer de 503 en production (Next.js 15 transforme les fichiers
 * 'use server' en endpoints, incompatibles avec le dynamic import).
 *
 * @ticket SP-476
 */

import { prisma } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications/emit-notification'
import type { NotificationType, NotificationPriority } from '@prisma/client'

/**
 * Recupere les IDs des utilisateurs SYSTEM_ADMIN actifs.
 *
 * @returns Liste des user IDs SYSTEM_ADMIN
 */
export async function getSystemAdminUserIds(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: {
      role: 'SYSTEM_ADMIN',
      isActive: true,
    },
    select: { id: true },
  })

  return admins.map((a) => a.id)
}

interface AdminNotificationParams {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  actionUrl?: string
}

/**
 * Cree une notification pour tous les SYSTEM_ADMIN actifs.
 * Utilise en fire-and-forget depuis les triggers (inscription,
 * paiement echoue, trial expire, impersonation).
 *
 * @ticket SP-476
 */
export async function createAdminNotification(
  params: AdminNotificationParams
): Promise<void> {
  const adminIds = await getSystemAdminUserIds()
  if (adminIds.length === 0) return

  const now = new Date()

  await prisma.notification.createMany({
    data: adminIds.map((userId) => ({
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority ?? 'MEDIUM',
      actionUrl: params.actionUrl ?? null,
      userId,
      companyId: null,
    })),
  })

  // Recuperer les notifications creees pour emettre via SSE
  const created = await prisma.notification.findMany({
    where: {
      userId: { in: adminIds },
      title: params.title,
      type: params.type,
      createdAt: { gte: now },
    },
  })

  // Emettre via SSE a chaque admin connecte
  for (const notif of created) {
    emitNotification(notif.userId, notif)
  }
}
