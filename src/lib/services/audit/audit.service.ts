/**
 * Service Audit Trail
 *
 * Enregistre les actions utilisateurs dans la table audit_logs.
 * Pattern fire-and-forget : ne jamais await ce service dans les mutations.
 * Les erreurs sont loguées en console mais ne bloquent jamais l'action principale.
 *
 * @ticket SP-443
 * @see prisma/schema.prisma - modèle AuditLog
 */

import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import type { AuditAction, AuditEntityType } from '@prisma/client'

/**
 * Paramètres pour logAuditAction
 *
 * @property action - Type d'action (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @property entityType - Type d'entité concernée (EMPLOYEE, SCHEDULE, etc.)
 * @property entityId - ID de l'entité (optionnel pour LOGIN/LOGOUT)
 * @property userId - ID de l'utilisateur qui effectue l'action
 * @property companyId - ID de l'entreprise (optionnel pour SYSTEM_ADMIN)
 * @property details - Données supplémentaires (before/after, IP, etc.)
 */
export interface LogAuditActionParams {
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  userId: string
  companyId?: string
  details?: Prisma.InputJsonValue
}

/**
 * Enregistre une action dans le journal d'audit
 *
 * Cette fonction est conçue pour être appelée en fire-and-forget :
 * ```typescript
 * logAuditAction({ ... }).catch(console.error)
 * ```
 *
 * Elle ne propage JAMAIS d'exception grâce à son try/catch interne.
 * En cas d'erreur Prisma, l'erreur est loguée en console sans bloquer
 * l'action principale.
 *
 * @param params - Paramètres de l'entrée d'audit
 */
export async function logAuditAction(
  params: LogAuditActionParams
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        userId: params.userId,
        companyId: params.companyId ?? null,
        ...(params.details !== undefined && { details: params.details }),
      },
    })
  } catch (error) {
    // Erreur silencieuse : ne jamais bloquer l'action principale
    console.error('[AuditLog] Failed to log action:', {
      action: params.action,
      entityType: params.entityType,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
