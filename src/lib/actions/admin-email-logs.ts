'use server'

/**
 * Server Actions — Journal EmailLog cross-company (SP-545)
 *
 * Réservé au SYSTEM_ADMIN. Donne la visibilité manquante sur la
 * délivrabilité des emails (l'incident Sprint 16 — PaymentConfirmed
 * jamais envoyé — était invisible faute de cette vue).
 *
 * Couverture actuelle d'EmailLog : billing (avec déduplication
 * idempotente), auth (WELCOME, EMAIL_VERIFICATION), admin (message,
 * broadcast). Extension aux emails métier suivie dans SP-547.
 *
 * @ticket SP-545
 */

import { checkPermission } from '@/lib/actions/crud-utils'
import { prisma } from '@/lib/prisma'
import {
  emailLogFiltersSchema,
  type EmailLogFiltersInput,
} from '@/lib/validations/email-logs'
import type { Prisma } from '@prisma/client'
import type { CrudActionResult } from '@/types'

// ============================================================================
// Types
// ============================================================================

export interface AdminEmailLogRow {
  id: string
  emailType: string
  recipientEmail: string
  status: string
  sentAt: Date
  companyId: string
  companyName: string
  subscriptionId: string | null
  metadata: unknown
}

export interface GetEmailLogsAdminResult {
  logs: AdminEmailLogRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface EmailLogsKpis {
  /** Emails envoyés sur les 7 derniers jours */
  total7d: number
  /** Échecs (FAILED + BOUNCED) sur les 7 derniers jours */
  failed7d: number
  /** Taux d'échec 7 jours en pourcentage (0 si aucun envoi) */
  failureRate7d: number
  /** Répartition par type (top 5, 7 derniers jours) */
  topTypes: { emailType: string; count: number }[]
}

// ============================================================================
// Helpers
// ============================================================================

function buildWhereClause(filters: {
  emailType?: string
  companyId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}): Prisma.EmailLogWhereInput {
  const where: Prisma.EmailLogWhereInput = {}

  if (filters.emailType) {
    // startsWith : matche aussi les types suffixés `TYPE:dedupe`
    // (pattern send-billing pour les emails récurrents)
    where.emailType = { startsWith: filters.emailType }
  }
  if (filters.companyId) {
    where.companyId = filters.companyId
  }
  if (filters.status) {
    where.status = filters.status
  }
  if (filters.dateFrom || filters.dateTo) {
    where.sentAt = {
      ...(filters.dateFrom && {
        gte: new Date(`${filters.dateFrom}T00:00:00`),
      }),
      ...(filters.dateTo && {
        lte: new Date(`${filters.dateTo}T23:59:59.999`),
      }),
    }
  }

  return where
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Liste paginée cross-tenant des logs d'emails.
 * Filtres validés par Zod (pattern getAuditLogs), URL bookmarkables.
 */
export async function getEmailLogsAdmin(
  input: EmailLogFiltersInput = {}
): Promise<CrudActionResult<GetEmailLogsAdminResult>> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  const validation = emailLogFiltersSchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: 'Filtres invalides' }
  }

  const { page, pageSize, ...filters } = validation.data
  const where = buildWhereClause(filters)

  try {
    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        include: { company: { select: { name: true } } },
        orderBy: { sentAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.emailLog.count({ where }),
    ])

    return {
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log.id,
          emailType: log.emailType,
          recipientEmail: log.recipientEmail,
          status: log.status,
          sentAt: log.sentAt,
          companyId: log.companyId,
          companyName: log.company.name,
          subscriptionId: log.subscriptionId,
          metadata: log.metadata,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  } catch (error) {
    console.error('[getEmailLogsAdmin] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des logs emails',
    }
  }
}

/**
 * KPIs de synthèse : volume 7 jours, taux d'échec, top types.
 */
export async function getEmailLogsKpisAdmin(): Promise<
  CrudActionResult<EmailLogsKpis>
> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [total7d, failed7d, topTypesRaw] = await Promise.all([
      prisma.emailLog.count({ where: { sentAt: { gte: sevenDaysAgo } } }),
      prisma.emailLog.count({
        where: {
          sentAt: { gte: sevenDaysAgo },
          status: { in: ['FAILED', 'BOUNCED'] },
        },
      }),
      prisma.emailLog.groupBy({
        by: ['emailType'],
        where: { sentAt: { gte: sevenDaysAgo } },
        _count: true,
        orderBy: { _count: { emailType: 'desc' } },
        take: 5,
      }),
    ])

    return {
      success: true,
      data: {
        total7d,
        failed7d,
        failureRate7d:
          total7d > 0 ? Math.round((failed7d / total7d) * 1000) / 10 : 0,
        topTypes: topTypesRaw.map((item) => ({
          emailType: item.emailType,
          count: item._count,
        })),
      },
    }
  } catch (error) {
    console.error('[getEmailLogsKpisAdmin] Error:', error)
    return {
      success: false,
      error: 'Erreur lors du calcul des indicateurs emails',
    }
  }
}
