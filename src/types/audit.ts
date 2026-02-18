/**
 * Types pour le module Audit Trail
 *
 * @description Types TypeScript pour les logs d'audit.
 * Re-exporte les enums Prisma et définit les types métier
 * pour les filtres et les entrées de log enrichies.
 *
 * @ticket SP-442
 */

import type { AuditAction, AuditEntityType, AuditLog } from '@prisma/client'

export type { AuditAction, AuditEntityType, AuditLog }

/**
 * Filtres pour la consultation des logs d'audit
 *
 * Utilisé par la Server Action listAuditLogs() et le composant AuditLogFilters.
 */
export interface AuditLogFilters {
  action?: AuditAction
  entityType?: AuditEntityType
  companyId?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

/**
 * Entrée de log d'audit enrichie avec relations
 *
 * Inclut les données User et Company pour l'affichage dans la DataTable.
 */
export interface AuditLogEntry {
  id: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string | null
  userId: string
  companyId: string | null
  details: Record<string, unknown> | null
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
  }
  company: {
    id: string
    name: string
  } | null
}
