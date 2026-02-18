'use server'

/**
 * Server Actions pour les Audit Logs
 *
 * - getAuditLogs / exportAuditLogsCsv : admin (SYSTEM_ADMIN) — SP-445
 * - getUserActivity : utilisateur courant (tous rôles) — SP-463
 *
 * @ticket SP-445, SP-463
 */

import type { Prisma } from '@prisma/client'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkPermission } from '@/lib/actions/crud-utils'
import {
  getPaginationParams,
  formatPaginatedResult,
} from '@/lib/actions/crud-helpers'
import {
  auditLogFiltersSchema,
  type AuditLogFiltersInput,
} from '@/lib/validations/audit-logs'
import type { ListActionResult, CrudActionResult } from '@/types'
import type { AuditLogEntry } from '@/types/audit'

// ============================================================================
// CONSTANTES
// ============================================================================

/** Nombre maximum de lignes pour l'export CSV */
const MAX_EXPORT_ROWS = 10_000

/** Select commun pour les relations user/company */
const AUDIT_LOG_SELECT = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  userId: true,
  companyId: true,
  details: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.AuditLogSelect

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Construit la clause WHERE Prisma à partir des filtres validés
 */
function buildWhereClause(filters: {
  action?: string
  entityType?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {}

  if (filters.action) {
    where.action = filters.action as Prisma.AuditLogWhereInput['action']
  }

  if (filters.entityType) {
    where.entityType =
      filters.entityType as Prisma.AuditLogWhereInput['entityType']
  }

  if (filters.search) {
    where.user = {
      OR: [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ],
    }
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) {
      where.createdAt.gte = new Date(filters.dateFrom)
    }
    if (filters.dateTo) {
      // dateTo inclut la journée entière
      const endDate = new Date(filters.dateTo)
      endDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = endDate
    }
  }

  return where
}

/**
 * Transforme un enregistrement Prisma en AuditLogEntry
 */
function toAuditLogEntry(
  record: Prisma.AuditLogGetPayload<{ select: typeof AUDIT_LOG_SELECT }>
): AuditLogEntry {
  return {
    id: record.id,
    action: record.action,
    entityType: record.entityType,
    entityId: record.entityId,
    userId: record.userId,
    companyId: record.companyId,
    details: record.details as Record<string, unknown> | null,
    createdAt: record.createdAt,
    user: record.user,
    company: record.company,
  }
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère les logs d'audit avec filtres et pagination
 *
 * @param input - Filtres et pagination (validés via Zod)
 * @returns Liste paginée de AuditLogEntry
 */
export async function getAuditLogs(
  input: AuditLogFiltersInput = {}
): Promise<ListActionResult<AuditLogEntry>> {
  try {
    // 1. RBAC : SYSTEM_ADMIN uniquement
    const authResult = await checkPermission('SYSTEM_ADMIN')
    if (!authResult.success) {
      return authResult
    }

    // 2. Validation des filtres
    const validation = auditLogFiltersSchema.safeParse(input)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return {
        success: false,
        error: firstError?.message ?? 'Filtres invalides',
      }
    }

    const { page, pageSize, ...filters } = validation.data

    // 3. Construire la clause WHERE
    const where = buildWhereClause(filters)

    // 4. Pagination
    const { skip, take } = getPaginationParams({ page, pageSize })

    // 5. Requêtes parallèles (count + data)
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: AUDIT_LOG_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ])

    // 6. Formater le résultat
    const entries = logs.map(toAuditLogEntry)

    return {
      success: true,
      data: formatPaginatedResult(entries, total, { page, pageSize }),
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getAuditLogs] Error:', error)
    }
    return {
      success: false,
      error: "Erreur lors de la récupération des logs d'audit",
    }
  }
}

/**
 * Exporte les logs d'audit en CSV (max 10 000 lignes)
 *
 * @param input - Filtres (sans pagination)
 * @returns Contenu CSV en string
 */
export async function exportAuditLogsCsv(
  input: AuditLogFiltersInput = {}
): Promise<CrudActionResult<string>> {
  try {
    // 1. RBAC : SYSTEM_ADMIN uniquement
    const authResult = await checkPermission('SYSTEM_ADMIN')
    if (!authResult.success) {
      return authResult
    }

    // 2. Validation des filtres (on ignore page/pageSize)
    const validation = auditLogFiltersSchema.safeParse({
      ...input,
      page: 1,
      pageSize: 100,
    })
    if (!validation.success) {
      return {
        success: false,
        error: 'Filtres invalides',
      }
    }

    const { page: _page, pageSize: _pageSize, ...filters } = validation.data
    const where = buildWhereClause(filters)

    // 3. Récupérer les données (max 10 000)
    const logs = await prisma.auditLog.findMany({
      where,
      select: AUDIT_LOG_SELECT,
      orderBy: { createdAt: 'desc' },
      take: MAX_EXPORT_ROWS,
    })

    // 4. Générer le CSV
    const header =
      'Date,Utilisateur,Email,Action,Type Entité,ID Entité,Entreprise,Détails'
    const rows = logs.map((log) => {
      const date = log.createdAt.toISOString()
      const userName = (log.user.name ?? '').replace(/"/g, '""')
      const email = log.user.email.replace(/"/g, '""')
      const action = log.action
      const entityType = log.entityType
      const entityId = log.entityId ?? ''
      const companyName = (log.company?.name ?? '').replace(/"/g, '""')
      const details = log.details
        ? JSON.stringify(log.details).replace(/"/g, '""')
        : ''

      return `"${date}","${userName}","${email}","${action}","${entityType}","${entityId}","${companyName}","${details}"`
    })

    const csv = [header, ...rows].join('\n')

    return { success: true, data: csv }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[exportAuditLogsCsv] Error:', error)
    }
    return {
      success: false,
      error: "Erreur lors de l'export des logs",
    }
  }
}

// ============================================================================
// USER ACTIVITY (SP-463) — Accessible à tous les rôles authentifiés
// ============================================================================

/**
 * Paramètres pour getUserActivity
 */
export interface UserActivityInput {
  page?: number
  pageSize?: number
  action?: string
}

/** Page size par défaut pour l'activité utilisateur */
const USER_ACTIVITY_PAGE_SIZE = 20

/**
 * Récupère l'activité de l'utilisateur courant
 *
 * @security Le userId vient TOUJOURS de la session JWT — jamais d'un paramètre client.
 * Un utilisateur ne peut jamais voir l'activité d'un autre.
 *
 * @param input - Pagination et filtre action optionnel
 * @returns Liste paginée de AuditLogEntry (uniquement les logs du user connecté)
 *
 * @ticket SP-463
 */
export async function getUserActivity(
  input: UserActivityInput = {}
): Promise<ListActionResult<AuditLogEntry>> {
  try {
    // 1. Authentification (tous rôles)
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour voir votre activité',
      }
    }

    // 2. Construire la clause WHERE — isolation stricte par userId
    const where: Prisma.AuditLogWhereInput = {
      userId: session.user.id, // 🔒 Toujours depuis la session
    }

    // Filtre optionnel par action
    if (input.action) {
      where.action = input.action as Prisma.AuditLogWhereInput['action']
    }

    // 3. Pagination
    const page = Math.max(1, input.page ?? 1)
    const pageSize = Math.min(
      100,
      Math.max(1, input.pageSize ?? USER_ACTIVITY_PAGE_SIZE)
    )
    const skip = (page - 1) * pageSize

    // 4. Requêtes parallèles
    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        select: AUDIT_LOG_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ])

    // 5. Formater
    const entries = logs.map(toAuditLogEntry)
    const totalPages = Math.ceil(total / pageSize)

    return {
      success: true,
      data: { data: entries, total, page, pageSize, totalPages },
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getUserActivity] Error:', error)
    }
    return {
      success: false,
      error: 'Erreur lors de la récupération de votre activité',
    }
  }
}
