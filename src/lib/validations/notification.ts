/**
 * Schémas de validation Zod pour les notifications
 *
 * @ticket SP-325
 * @description Validation des notifications, filtres et paramètres
 */

import { z } from 'zod'
import { NotificationType, NotificationPriority } from '@prisma/client'

// ─── Enums Zod synchronisés avec Prisma ─────────────────────────────

export const NotificationTypeSchema = z.nativeEnum(NotificationType)
export const NotificationPrioritySchema = z.nativeEnum(NotificationPriority)

// ─── Schéma de création de notification ─────────────────────────────

export const createNotificationSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  message: z
    .string()
    .min(1, 'Le message est requis')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères'),
  type: NotificationTypeSchema,
  priority: NotificationPrioritySchema.default('MEDIUM'),
  relatedType: z.string().max(100).optional().nullable(),
  relatedId: z.string().cuid().optional().nullable(),
  actionUrl: z.string().max(500).optional().nullable(),
  userId: z.string().cuid("ID d'utilisateur invalide"),
  companyId: z.string().cuid("ID d'entreprise invalide"),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

// ─── Schéma de mise à jour de notification ──────────────────────────

export const updateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  readAt: z.coerce.date().optional().nullable(),
})

export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>

// ─── Schéma de filtrage ─────────────────────────────────────────────

export const notificationFiltersSchema = z.object({
  userId: z.string().cuid().optional(),
  companyId: z.string().cuid().optional(),
  type: NotificationTypeSchema.optional(),
  priority: NotificationPrioritySchema.optional(),
  isRead: z.boolean().optional(),
  relatedType: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type NotificationFiltersInput = z.infer<typeof notificationFiltersSchema>

// ─── Schémas pour les factory functions ─────────────────────────────

export const planningNotificationActionSchema = z.enum([
  'created',
  'updated',
  'deleted',
])
export type PlanningNotificationAction = z.infer<
  typeof planningNotificationActionSchema
>

export const leaveNotificationActionSchema = z.enum([
  'requested',
  'approved',
  'rejected',
  'cancelled',
])
export type LeaveNotificationAction = z.infer<
  typeof leaveNotificationActionSchema
>

// ─── Schéma pour notification système bulk ──────────────────────────

export const systemNotificationSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères'),
  message: z
    .string()
    .min(1, 'Le message est requis')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères'),
  priority: NotificationPrioritySchema.default('MEDIUM'),
  actionUrl: z.string().max(500).optional().nullable(),
})

export type SystemNotificationInput = z.infer<typeof systemNotificationSchema>
