/**
 * Validation Zod pour les filtres des logs d'audit
 *
 * @ticket SP-445
 */

import { z } from 'zod'

/**
 * Actions d'audit possibles (synchronisé avec Prisma AuditAction enum)
 */
const auditActionValues = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'STATUS_CHANGE',
  'IMPERSONATE',
  'PASSWORD_CHANGE',
] as const

/**
 * Types d'entités possibles (synchronisé avec Prisma AuditEntityType enum)
 */
const auditEntityTypeValues = [
  'COMPANY',
  'EMPLOYEE',
  'TEAM',
  'SCHEDULE',
  'LEAVE',
  'SUBSCRIPTION',
  'USER',
  'SETTINGS',
  'INCIDENT_NOTE',
  'AVAILABILITY',
] as const

/**
 * Schéma de validation des filtres pour la page audit logs
 */
export const auditLogFiltersSchema = z.object({
  action: z.enum(auditActionValues).optional(),
  entityType: z.enum(auditEntityTypeValues).optional(),
  search: z
    .string()
    .max(255, 'Recherche trop longue')
    .optional()
    .transform((v) => v?.trim() || undefined),
  dateFrom: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  dateTo: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
})

export type AuditLogFiltersInput = z.input<typeof auditLogFiltersSchema>
export type AuditLogFiltersData = z.output<typeof auditLogFiltersSchema>
