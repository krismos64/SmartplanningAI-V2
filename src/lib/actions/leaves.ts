/**
 * Server Actions CRUD pour le module Leave Management
 *
 * @description Actions avec RBAC multi-role pour gestion des congés.
 * - EMPLOYEE : Ses propres demandes (créer, annuler)
 * - MANAGER : Équipe (approuver/refuser)
 * - DIRECTOR : Entreprise entière (approuver/refuser, modifier soldes)
 * - SYSTEM_ADMIN : Cross-tenant (lecture)
 *
 * @ticket SP-410
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import {
  LeaveRequestStatus,
  LeaveType,
  UserRole,
  Prisma,
  type LeaveRequest,
  type LeaveBalance,
} from '@prisma/client'
import { auth } from '@/lib/auth'
import { logAuditAction } from '@/lib/services/audit'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
  canAccessCompanyEntity,
} from './crud-helpers'
import {
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  updateLeaveBalanceSchema,
  leaveRequestFiltersSchema,
  LEAVE_TYPE_LABELS,
  LEAVE_STATUS_LABELS,
  type LeaveRequestFilters,
} from '@/lib/validations/leave'
import { calculateWorkingDays, hasEnoughBalance } from '@/lib/leave-utils'
import {
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
} from '@/lib/email/templates/leave-decision'
import { sendLeaveRequestedEmail } from '@/lib/email/templates/leave-requested'
import { assertNotImpersonating } from '@/lib/impersonation'
import type { ListActionResult, ListQueryParams } from '@/types'
import type { LeaveEmailData, LeaveRequestedEmailData } from '@/types'
import { createLeaveNotification } from '@/lib/actions/notifications'

// ============================================================================
// Types
// ============================================================================

interface AuthenticatedUser {
  id: string
  role: UserRole
  companyId: string | null
  employeeId: string | null
  managedTeamIds: string[]
}

type AccessCheckResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string }

/** Résultat d'action avec warning optionnel */
type ActionResult<T> =
  | { success: true; data: T; warning?: string }
  | { success: false; error: string; field?: string }

/** Types de congé qui décomptent un solde */
const LEAVE_TYPES_WITH_BALANCE: LeaveType[] = [
  LeaveType.PAID_LEAVE,
  LeaveType.RTT,
]

/** Include standard pour les demandes de congé */
const LEAVE_REQUEST_INCLUDE = {
  employee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      teamId: true,
      userId: true,
      user: {
        select: {
          image: true,
        },
      },
    },
  },
} as const

export type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    user?: {
      image: string | null
    } | null
  }
}

type LeaveBalanceWithRemaining = LeaveBalance & {
  paidLeaveRemaining: number
  rttRemaining: number
}

type LeaveStats = {
  byStatus: Record<LeaveRequestStatus, number>
  byType: Record<LeaveType, number>
  total: number
}

type ConflictCheckResult = {
  hasConflict: boolean
  percentAbsent: number
  absentEmployees: string[]
  warning?: string
}

// ============================================================================
// Auth + RBAC
// ============================================================================

const ALL_ROLES: UserRole[] = [
  'SYSTEM_ADMIN',
  'DIRECTOR',
  'MANAGER',
  'EMPLOYEE',
]

async function getAuthenticatedUser(
  allowedRoles: UserRole[] = ALL_ROLES
): Promise<AccessCheckResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      }
    }

    const role = session.user.role
    if (!allowedRoles.includes(role)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    const userId = session.user.id
    const companyId = session.user.companyId ?? null

    let employeeId: string | null = null
    let managedTeamIds: string[] = []

    // Récupérer le contexte employé
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        managedTeams: { select: { id: true } },
      },
    })

    if (employee) {
      employeeId = employee.id
      managedTeamIds = (employee.managedTeams ?? []).map((t) => t.id)
    }

    return {
      success: true,
      user: { id: userId, role, companyId, employeeId, managedTeamIds },
    }
  } catch (error) {
    console.error('[getAuthenticatedUser] Error:', error)
    return { success: false, error: 'Erreur de vérification des permissions' }
  }
}

/**
 * Construit la clause WHERE pour les demandes de congé selon le rôle
 */
function buildLeaveRBACWhere(user: AuthenticatedUser): Record<string, unknown> {
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return {}
    case 'DIRECTOR':
      return { companyId: user.companyId }
    case 'MANAGER':
      return {
        companyId: user.companyId,
        employee: { teamId: { in: user.managedTeamIds } },
      }
    case 'EMPLOYEE':
      return { employeeId: user.employeeId }
    default:
      return { id: 'NEVER_MATCH' }
  }
}

const LEAVE_PATH = '/app/dashboard/conges'

// ============================================================================
// 1. getLeaveRequests - Liste paginée avec filtres RBAC
// ============================================================================

export async function getLeaveRequests(
  filters?: LeaveRequestFilters,
  params: ListQueryParams = {}
): Promise<ListActionResult<LeaveRequestWithEmployee>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    // Valider les filtres si fournis
    if (filters) {
      const validation = validateData(leaveRequestFiltersSchema, filters)
      if (!validation.success)
        return { success: false, error: validation.error }
    }

    const rbacWhere = buildLeaveRBACWhere(user)
    const filterWhere: Record<string, unknown> = {}

    if (filters?.status) filterWhere.status = filters.status
    if (filters?.type) filterWhere.type = filters.type
    if (filters?.employeeId) filterWhere.employeeId = filters.employeeId
    if (filters?.teamId) filterWhere.employee = { teamId: filters.teamId }
    if (filters?.startDate || filters?.endDate) {
      filterWhere.startDate = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      }
    }

    const where = { ...rbacWhere, ...filterWhere }
    const { skip, take, orderBy } = getPaginationParams(params)

    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: LEAVE_REQUEST_INCLUDE,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
      }),
      prisma.leaveRequest.count({ where }),
    ])

    return {
      success: true,
      data: formatPaginatedResult(data, total, params),
    }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 2. getLeaveRequestById - Détail avec vérification accès
// ============================================================================

export async function getLeaveRequestById(
  id: string
): Promise<ActionResult<LeaveRequestWithEmployee>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: LEAVE_REQUEST_INCLUDE,
    })

    if (!leaveRequest) {
      return { success: false, error: 'Demande de congé non trouvée' }
    }

    // Vérification multi-tenant
    if (!canAccessCompanyEntity(user.companyId, leaveRequest.companyId)) {
      return { success: false, error: "Vous n'avez pas accès à cette demande" }
    }

    // Vérification RBAC
    if (
      user.role === 'EMPLOYEE' &&
      leaveRequest.employeeId !== user.employeeId
    ) {
      return { success: false, error: "Vous n'avez pas accès à cette demande" }
    }
    if (
      user.role === 'MANAGER' &&
      leaveRequest.employee.teamId &&
      !user.managedTeamIds.includes(leaveRequest.employee.teamId)
    ) {
      return { success: false, error: "Vous n'avez pas accès à cette demande" }
    }

    return { success: true, data: leaveRequest }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 3. createLeaveRequest - Création avec validation métier
// ============================================================================

export async function createLeaveRequest(
  input: unknown
): Promise<ActionResult<LeaveRequest>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  // Validation Zod
  const validation = validateData(createLeaveRequestSchema, input)
  if (!validation.success)
    return { success: false, error: validation.error, field: validation.field }
  const data = validation.data

  try {
    // Vérifier que l'employé existe et appartient à la même entreprise
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: {
        id: true,
        companyId: true,
        firstName: true,
        lastName: true,
        email: true,
        teamId: true,
      },
    })

    if (!employee) {
      return { success: false, error: 'Employé non trouvé' }
    }
    if (!canAccessCompanyEntity(user.companyId, employee.companyId)) {
      return { success: false, error: "Vous n'avez pas accès à cet employé" }
    }

    // Seul le propriétaire ou un supérieur peut créer une demande
    if (user.role === 'EMPLOYEE' && user.employeeId !== data.employeeId) {
      return {
        success: false,
        error: 'Vous ne pouvez créer une demande que pour vous-même',
      }
    }

    // Calculer les jours ouvrés
    const days = calculateWorkingDays(
      data.startDate,
      data.endDate,
      data.halfDay
    )

    // Vérifier le solde si CP ou RTT
    if (LEAVE_TYPES_WITH_BALANCE.includes(data.type)) {
      const year = data.startDate.getFullYear()
      const balance = await prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId: data.employeeId, year } },
      })

      if (balance && !hasEnoughBalance(balance, data.type, days)) {
        const typeLabel =
          data.type === LeaveType.PAID_LEAVE ? 'congés payés' : 'RTT'
        return { success: false, error: `Solde de ${typeLabel} insuffisant` }
      }
    }

    // Vérifier les chevauchements d'équipe (warning non bloquant)
    let warning: string | undefined
    if (employee.teamId) {
      const conflictResult = await checkLeaveConflicts(
        data.employeeId,
        data.startDate,
        data.endDate
      )
      if (conflictResult.success && conflictResult.data.hasConflict) {
        warning = conflictResult.data.warning
      }
    }

    // Créer la demande
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        halfDay: data.halfDay,
        halfDayPeriod: data.halfDayPeriod ?? null,
        reason: data.reason,
        status: LeaveRequestStatus.PENDING,
        employeeId: data.employeeId,
        companyId: employee.companyId,
      },
    })

    // SSE : Notifier les managers via notification in-app (fire-and-forget)
    prisma.employee
      .findMany({
        where: {
          managedTeams: employee.teamId
            ? { some: { id: employee.teamId } }
            : undefined,
          isActive: true,
          userId: { not: null },
        },
        select: { userId: true },
      })
      .then((managers) => {
        for (const m of managers) {
          if (m.userId) {
            createLeaveNotification(
              leaveRequest.id,
              m.userId,
              'requested'
            ).catch(console.error)
          }
        }
      })
      .catch(console.error)

    // SP-415: Notifier les managers de la nouvelle demande par email (en background)
    notifyManagersOfNewLeaveRequest(
      leaveRequest.id,
      employee,
      data.type,
      data.startDate,
      data.endDate,
      days,
      data.reason
    ).catch((err) =>
      console.error('[createLeaveRequest] Email notification error:', err)
    )

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'CREATE',
      entityType: 'LEAVE',
      entityId: leaveRequest.id,
      userId: user.id,
      companyId: employee.companyId,
      details: {
        type: data.type,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        days,
        employeeId: data.employeeId,
      },
    }).catch(console.error)

    revalidatePath(LEAVE_PATH)
    return { success: true, data: leaveRequest, warning }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 4. updateLeaveRequest - Modification (owner + PENDING only)
// ============================================================================

export async function updateLeaveRequest(
  id: string,
  input: unknown
): Promise<ActionResult<LeaveRequest>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const validation = validateData(createLeaveRequestSchema, input)
  if (!validation.success)
    return { success: false, error: validation.error, field: validation.field }
  const data = validation.data

  try {
    const existing = await prisma.leaveRequest.findUnique({ where: { id } })
    if (!existing) return { success: false, error: 'Demande non trouvée' }

    // Seul le propriétaire peut modifier
    if (existing.employeeId !== user.employeeId) {
      return {
        success: false,
        error: 'Vous ne pouvez modifier que vos propres demandes',
      }
    }

    // Seulement si PENDING
    if (existing.status !== LeaveRequestStatus.PENDING) {
      return {
        success: false,
        error: 'Seules les demandes en attente peuvent être modifiées',
      }
    }

    const days = calculateWorkingDays(
      data.startDate,
      data.endDate,
      data.halfDay
    )

    // Revérifier le solde
    if (LEAVE_TYPES_WITH_BALANCE.includes(data.type)) {
      const year = data.startDate.getFullYear()
      const balance = await prisma.leaveBalance.findUnique({
        where: { employeeId_year: { employeeId: data.employeeId, year } },
      })
      if (balance && !hasEnoughBalance(balance, data.type, days)) {
        return { success: false, error: 'Solde insuffisant' }
      }
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        days,
        halfDay: data.halfDay,
        halfDayPeriod: data.halfDayPeriod ?? null,
        reason: data.reason,
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'LEAVE',
      entityId: id,
      userId: user.id,
      companyId: existing.companyId,
      details: {
        type: data.type,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        days,
      },
    }).catch(console.error)

    revalidatePath(LEAVE_PATH)
    return { success: true, data: updated }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 5. cancelLeaveRequest - Annulation avec recrédit solde
// ============================================================================

export async function cancelLeaveRequest(
  id: string
): Promise<ActionResult<LeaveRequest>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id } })
    if (!leaveRequest) return { success: false, error: 'Demande non trouvée' }

    // Seul le propriétaire peut annuler
    if (leaveRequest.employeeId !== user.employeeId) {
      return {
        success: false,
        error: 'Vous ne pouvez annuler que vos propres demandes',
      }
    }

    // Vérifier le statut
    if (leaveRequest.status === LeaveRequestStatus.CANCELLED) {
      return { success: false, error: 'Cette demande est déjà annulée' }
    }
    if (leaveRequest.status === LeaveRequestStatus.REJECTED) {
      return {
        success: false,
        error: 'Impossible d\u2019annuler une demande refusée',
      }
    }

    // Si APPROVED et type avec solde → recrédit via transaction
    if (
      leaveRequest.status === LeaveRequestStatus.APPROVED &&
      LEAVE_TYPES_WITH_BALANCE.includes(leaveRequest.type)
    ) {
      const days = calculateWorkingDays(
        leaveRequest.startDate,
        leaveRequest.endDate,
        leaveRequest.halfDay
      )
      const year = leaveRequest.startDate.getFullYear()
      const balanceField =
        leaveRequest.type === LeaveType.PAID_LEAVE ? 'paidLeaveUsed' : 'rttUsed'

      const [updated] = await prisma.$transaction([
        prisma.leaveRequest.update({
          where: { id },
          data: { status: LeaveRequestStatus.CANCELLED },
        }),
        prisma.leaveBalance.update({
          where: {
            employeeId_year: { employeeId: leaveRequest.employeeId, year },
          },
          data: { [balanceField]: { decrement: days } },
        }),
      ])

      // SP-444 : Audit trail (fire-and-forget)
      logAuditAction({
        action: 'STATUS_CHANGE',
        entityType: 'LEAVE',
        entityId: id,
        userId: user.id,
        companyId: leaveRequest.companyId,
        details: {
          from: leaveRequest.status,
          to: 'CANCELLED',
          balanceRecredited: true,
        },
      }).catch(console.error)

      // SSE : Notifier les managers de l'annulation (fire-and-forget)
      notifyCancelledLeaveToManagers(leaveRequest.employeeId, id)

      revalidatePath(LEAVE_PATH)
      return { success: true, data: updated }
    }

    // PENDING : simple annulation
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.CANCELLED },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'STATUS_CHANGE',
      entityType: 'LEAVE',
      entityId: id,
      userId: user.id,
      companyId: leaveRequest.companyId,
      details: { from: leaveRequest.status, to: 'CANCELLED' },
    }).catch(console.error)

    // SSE : Notifier les managers de l'annulation (fire-and-forget)
    notifyCancelledLeaveToManagers(leaveRequest.employeeId, id)

    revalidatePath(LEAVE_PATH)
    return { success: true, data: updated }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 6. reviewLeaveRequest - Approbation/Refus (MANAGER, DIRECTOR)
// ============================================================================

export async function reviewLeaveRequest(
  id: string,
  input: unknown
): Promise<ActionResult<LeaveRequest>> {
  const authResult = await getAuthenticatedUser([
    'MANAGER',
    'DIRECTOR',
    'SYSTEM_ADMIN',
  ])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const validation = validateData(updateLeaveRequestSchema, input)
  if (!validation.success)
    return { success: false, error: validation.error, field: validation.field }
  const data = validation.data

  try {
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: LEAVE_REQUEST_INCLUDE,
    })

    if (!leaveRequest) return { success: false, error: 'Demande non trouvée' }

    // Multi-tenant
    if (!canAccessCompanyEntity(user.companyId, leaveRequest.companyId)) {
      return { success: false, error: "Vous n'avez pas accès à cette demande" }
    }

    // MANAGER ne peut valider que son équipe
    if (
      user.role === 'MANAGER' &&
      leaveRequest.employee.teamId &&
      !user.managedTeamIds.includes(leaveRequest.employee.teamId)
    ) {
      return {
        success: false,
        error: 'Vous ne pouvez valider que les demandes de votre équipe',
      }
    }

    // Seulement les demandes PENDING
    if (leaveRequest.status !== LeaveRequestStatus.PENDING) {
      return {
        success: false,
        error: 'Seules les demandes en attente peuvent être validées',
      }
    }

    // Transaction : mise à jour + débit solde si APPROVED
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.leaveRequest.update({
        where: { id },
        data: {
          status: data.status,
          reviewComment: data.reviewComment,
          reviewedById: user.id,
          reviewedAt: new Date(),
        },
      })

      // Si APPROVED et type avec solde → débiter
      if (
        data.status === LeaveRequestStatus.APPROVED &&
        LEAVE_TYPES_WITH_BALANCE.includes(result.type)
      ) {
        const days = calculateWorkingDays(
          result.startDate,
          result.endDate,
          result.halfDay
        )
        const year = result.startDate.getFullYear()
        const balanceField =
          result.type === LeaveType.PAID_LEAVE ? 'paidLeaveUsed' : 'rttUsed'

        await tx.leaveBalance.upsert({
          where: { employeeId_year: { employeeId: result.employeeId, year } },
          create: {
            employeeId: result.employeeId,
            companyId: leaveRequest.companyId,
            year,
            [balanceField]: days,
          },
          update: { [balanceField]: { increment: days } },
        })
      }

      return result
    })

    // Envoi email hors transaction (non bloquant)
    try {
      const emailData: LeaveEmailData = {
        firstName: leaveRequest.employee.firstName,
        email: leaveRequest.employee.email ?? '',
        leaveType: leaveRequest.type,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
      }

      if (data.status === LeaveRequestStatus.APPROVED) {
        await sendLeaveApprovedEmail(emailData)
      } else if (data.status === LeaveRequestStatus.REJECTED) {
        await sendLeaveRejectedEmail({
          ...emailData,
          rejectionReason: data.reviewComment ?? '',
        })
      }
    } catch (emailError) {
      console.error('[reviewLeaveRequest] Email error:', emailError)
      // Ne pas bloquer l'action si l'email échoue
    }

    // SSE : Notifier l'employé de la décision (fire-and-forget)
    if (leaveRequest.employee.userId) {
      createLeaveNotification(
        id,
        leaveRequest.employee.userId,
        data.status === LeaveRequestStatus.APPROVED ? 'approved' : 'rejected'
      ).catch(console.error)
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'STATUS_CHANGE',
      entityType: 'LEAVE',
      entityId: id,
      userId: user.id,
      companyId: leaveRequest.companyId,
      details: {
        from: 'PENDING',
        to: data.status,
        reviewComment: data.reviewComment ?? null,
      },
    }).catch(console.error)

    revalidatePath(LEAVE_PATH)
    return { success: true, data: updated }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 7. getLeaveBalance - Solde employé pour une année
// ============================================================================

export async function getLeaveBalance(
  employeeId?: string,
  year?: number
): Promise<ActionResult<LeaveBalanceWithRemaining>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    const targetEmployeeId = employeeId ?? user.employeeId
    if (!targetEmployeeId) {
      return { success: false, error: 'Employé non identifié' }
    }

    const targetYear = year ?? new Date().getFullYear()

    // RBAC : vérifier l'accès
    if (user.role === 'EMPLOYEE' && targetEmployeeId !== user.employeeId) {
      return {
        success: false,
        error: 'Vous ne pouvez consulter que votre propre solde',
      }
    }

    if (user.role === 'MANAGER') {
      const targetEmployee = await prisma.employee.findUnique({
        where: { id: targetEmployeeId },
        select: { teamId: true },
      })
      if (
        targetEmployee?.teamId &&
        !user.managedTeamIds.includes(targetEmployee.teamId)
      ) {
        return {
          success: false,
          error: "Vous n'avez pas accès au solde de cet employé",
        }
      }
    }

    // Récupérer ou créer le solde
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_year: { employeeId: targetEmployeeId, year: targetYear },
      },
      create: {
        employeeId: targetEmployeeId,
        companyId: user.companyId!,
        year: targetYear,
      },
      update: {},
    })

    return {
      success: true,
      data: {
        ...balance,
        paidLeaveRemaining: balance.paidLeaveTotal - balance.paidLeaveUsed,
        rttRemaining: balance.rttTotal - balance.rttUsed,
      },
    }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 8. updateLeaveBalance - Modification des soldes (DIRECTOR)
// ============================================================================

export async function updateLeaveBalance(
  employeeId: string,
  year: number,
  input: unknown
): Promise<ActionResult<LeaveBalance>> {
  const authResult = await getAuthenticatedUser([
    'DIRECTOR',
    'SYSTEM_ADMIN',
    'MANAGER',
  ])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const validation = validateData(updateLeaveBalanceSchema, input)
  if (!validation.success)
    return { success: false, error: validation.error, field: validation.field }
  const data = validation.data

  try {
    // Vérifier que l'employé appartient à la même entreprise
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { companyId: true },
    })

    if (!employee) return { success: false, error: 'Employé non trouvé' }
    if (!canAccessCompanyEntity(user.companyId, employee.companyId)) {
      return { success: false, error: "Vous n'avez pas accès à cet employé" }
    }

    const balance = await prisma.leaveBalance.upsert({
      where: { employeeId_year: { employeeId, year } },
      create: {
        employeeId,
        companyId: employee.companyId,
        year,
        ...data,
        updatedById: user.id,
      },
      update: {
        ...data,
        updatedById: user.id,
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'LEAVE',
      entityId: balance.id,
      userId: user.id,
      companyId: employee.companyId,
      details: {
        employeeId,
        year,
        balanceUpdate: data as unknown as Prisma.InputJsonValue,
      },
    }).catch(console.error)

    revalidatePath(LEAVE_PATH)
    return { success: true, data: balance }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 9. getTeamAbsences - Absences d'une période (calendrier)
// ============================================================================

export async function getTeamAbsences(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult<LeaveRequestWithEmployee[]>> {
  const authResult = await getAuthenticatedUser([
    'MANAGER',
    'DIRECTOR',
    'SYSTEM_ADMIN',
  ])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    // MANAGER : vérifier accès à l'équipe
    if (user.role === 'MANAGER' && !user.managedTeamIds.includes(teamId)) {
      return { success: false, error: "Vous n'avez pas accès à cette équipe" }
    }

    const absences = await prisma.leaveRequest.findMany({
      where: {
        employee: { teamId },
        status: LeaveRequestStatus.APPROVED,
        // Chevauchement : startDate <= endDate AND endDate >= startDate
        startDate: { lte: endDate },
        endDate: { gte: startDate },
        ...(user.companyId && { companyId: user.companyId }),
      },
      include: LEAVE_REQUEST_INCLUDE,
      orderBy: { startDate: 'asc' },
    })

    return { success: true, data: absences }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 10. getLeaveStats - Statistiques pour dashboard
// ============================================================================

export async function getLeaveStats(
  teamId?: string
): Promise<ActionResult<LeaveStats>> {
  const authResult = await getAuthenticatedUser([
    'MANAGER',
    'DIRECTOR',
    'SYSTEM_ADMIN',
  ])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    const where: Record<string, unknown> = {}
    if (user.companyId) where.companyId = user.companyId
    if (teamId) where.employee = { teamId }
    else if (user.role === 'MANAGER')
      where.employee = { teamId: { in: user.managedTeamIds } }

    const requests = await prisma.leaveRequest.findMany({
      where,
      select: { status: true, type: true },
    })

    const byStatus = {} as Record<LeaveRequestStatus, number>
    const byType = {} as Record<LeaveType, number>

    // Initialiser
    for (const s of Object.values(LeaveRequestStatus)) byStatus[s] = 0
    for (const t of Object.values(LeaveType)) byType[t] = 0

    for (const r of requests) {
      byStatus[r.status]++
      byType[r.type]++
    }

    return {
      success: true,
      data: { byStatus, byType, total: requests.length },
    }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 11. getAllLeaveBalances - Liste paginée des soldes (DIRECTOR)
// ============================================================================

type LeaveBalanceWithEmployee = LeaveBalance & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    team: { id: string; name: string } | null
  }
  paidLeaveRemaining: number
  rttRemaining: number
}

export async function getAllLeaveBalances(
  year?: number,
  params: ListQueryParams = {}
): Promise<ListActionResult<LeaveBalanceWithEmployee>> {
  const authResult = await getAuthenticatedUser(['DIRECTOR', 'SYSTEM_ADMIN'])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    const targetYear = year ?? new Date().getFullYear()
    const where: Record<string, unknown> = { year: targetYear }
    if (user.companyId) where.companyId = user.companyId

    const { skip, take, orderBy } = getPaginationParams(params)

    const [rawData, total] = await Promise.all([
      prisma.leaveBalance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              teamId: true,
              team: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take,
        orderBy: orderBy ?? { employee: { lastName: 'asc' } },
      }),
      prisma.leaveBalance.count({ where }),
    ])

    // Ajouter les champs calculés
    const data = rawData.map((b) => ({
      ...b,
      paidLeaveRemaining: b.paidLeaveTotal - b.paidLeaveUsed,
      rttRemaining: b.rttTotal - b.rttUsed,
    }))

    return {
      success: true,
      data: formatPaginatedResult(data, total, params),
    }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 12. checkLeaveConflicts - Vérifier chevauchements équipe
// ============================================================================

export async function checkLeaveConflicts(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<ActionResult<ConflictCheckResult>> {
  try {
    // Récupérer l'équipe de l'employé
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { teamId: true },
    })

    if (!employee?.teamId) {
      return {
        success: true,
        data: { hasConflict: false, percentAbsent: 0, absentEmployees: [] },
      }
    }

    // Compter les membres de l'équipe
    const teamMemberCount = await prisma.employee.count({
      where: { teamId: employee.teamId, isActive: true },
    })

    if (teamMemberCount === 0) {
      return {
        success: true,
        data: { hasConflict: false, percentAbsent: 0, absentEmployees: [] },
      }
    }

    // Compter les absences APPROVED/PENDING qui chevauchent la période
    const absentMembers = await prisma.leaveRequest.findMany({
      where: {
        employee: { teamId: employee.teamId },
        employeeId: { not: employeeId },
        status: {
          in: [LeaveRequestStatus.APPROVED, LeaveRequestStatus.PENDING],
        },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        employee: { select: { firstName: true, lastName: true } },
      },
      distinct: ['employeeId'],
    })

    const percentAbsent = Math.round(
      ((absentMembers.length + 1) / teamMemberCount) * 100
    )
    const hasConflict = percentAbsent > 50
    const absentEmployees = absentMembers.map(
      (m) => `${m.employee.firstName} ${m.employee.lastName}`
    )

    return {
      success: true,
      data: {
        hasConflict,
        percentAbsent,
        absentEmployees,
        warning: hasConflict
          ? `Attention : ${percentAbsent}% de l'équipe sera absente sur cette période`
          : undefined,
      },
    }
  } catch (error) {
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 13. notifyManagersOfNewLeaveRequest - Helper pour envoi email aux managers
// ============================================================================

/**
 * Notifie les managers de l'équipe d'une nouvelle demande de congé
 * Fallback aux directeurs si aucun manager n'est trouvé
 *
 * @ticket SP-415
 * @internal Cette fonction est appelée en background, elle ne doit pas bloquer
 */
async function notifyManagersOfNewLeaveRequest(
  requestId: string,
  employee: {
    id: string
    companyId: string
    firstName: string
    lastName: string
    teamId: string | null
  },
  leaveType: LeaveType,
  startDate: Date,
  endDate: Date,
  totalDays: number,
  reason?: string
): Promise<void> {
  try {
    const employeeName = `${employee.firstName} ${employee.lastName}`

    // Chercher le(s) manager(s) de l'équipe
    let managers: { email: string | null; firstName: string }[] = []

    if (employee.teamId) {
      // Trouver les managers de l'équipe via la relation managedTeams
      const teamManagers = await prisma.employee.findMany({
        where: {
          managedTeams: { some: { id: employee.teamId } },
          isActive: true,
        },
        select: { email: true, firstName: true },
      })
      managers = teamManagers
    }

    // Fallback : si aucun manager, notifier les directeurs de l'entreprise
    if (managers.length === 0) {
      const directors = await prisma.user.findMany({
        where: {
          companyId: employee.companyId,
          role: UserRole.DIRECTOR,
        },
        select: {
          email: true,
          employee: { select: { firstName: true } },
        },
      })
      managers = directors.map((d) => ({
        email: d.email,
        firstName: d.employee?.firstName ?? 'Directeur',
      }))
    }

    // Envoyer un email à chaque manager/directeur
    const emailPromises = managers
      .filter((m) => m.email)
      .map((manager) => {
        const emailData: LeaveRequestedEmailData = {
          managerEmail: manager.email!,
          managerName: manager.firstName,
          employeeName,
          leaveType,
          startDate,
          endDate,
          totalDays,
          reason,
          requestId,
        }
        return sendLeaveRequestedEmail(emailData)
      })

    await Promise.allSettled(emailPromises)
  } catch (error) {
    // Log mais ne pas propager l'erreur
    console.error('[notifyManagersOfNewLeaveRequest] Error:', error)
  }
}

// ============================================================================
// 14. EXPORT CSV - Export des congés au format CSV (SP-333)
// ============================================================================

import {
  generateCsv,
  formatDateFr,
  formatDateTimeFr,
  formatBooleanFr,
  type CsvColumn,
} from '@/lib/csv'
import type { CsvExportActionResult, LeaveExportFilters } from '@/types'

/**
 * Type interne pour l'export CSV des congés
 */
interface LeaveForCsvExport {
  startDate: Date
  endDate: Date
  days: number
  type: string
  status: string
  halfDay: boolean
  halfDayPeriod: string | null
  reason: string | null
  reviewedAt: Date | null
  employee: { firstName: string; lastName: string }
}

/**
 * Labels français pour les périodes de demi-journée
 */
const HALF_DAY_PERIOD_LABELS: Record<string, string> = {
  AM: 'Matin',
  PM: 'Après-midi',
}

/**
 * Colonnes pour l'export CSV des congés
 */
const LEAVE_CSV_COLUMNS: CsvColumn<LeaveForCsvExport>[] = [
  {
    key: (l) => `${l.employee.lastName} ${l.employee.firstName}`,
    header: 'Employé',
  },
  {
    key: 'type',
    header: 'Type',
    format: (v) => LEAVE_TYPE_LABELS[v as LeaveType] ?? String(v),
  },
  {
    key: 'startDate',
    header: 'Date début',
    format: (v) => formatDateFr(v as Date),
  },
  {
    key: 'endDate',
    header: 'Date fin',
    format: (v) => formatDateFr(v as Date),
  },
  { key: 'days', header: 'Jours' },
  {
    key: 'halfDay',
    header: 'Demi-journée',
    format: (v) => formatBooleanFr(v as boolean),
  },
  {
    key: 'halfDayPeriod',
    header: 'Période',
    format: (v) => {
      if (!v) return ''
      const strVal = v as string
      return HALF_DAY_PERIOD_LABELS[strVal] ?? strVal
    },
  },
  {
    key: 'status',
    header: 'Statut',
    format: (v) =>
      LEAVE_STATUS_LABELS[String(v) as LeaveRequestStatus] ?? String(v),
  },
  { key: 'reason', header: 'Motif' },
  {
    key: 'reviewedAt',
    header: 'Validé le',
    format: (v) => formatDateTimeFr(v as Date | null),
  },
]

/**
 * Exporte les demandes de congés au format CSV
 *
 * RBAC :
 * - SYSTEM_ADMIN : Toutes les demandes
 * - DIRECTOR : Demandes de son entreprise
 * - MANAGER : Demandes de ses équipes
 * - EMPLOYEE : Ses propres demandes uniquement
 *
 * @param filters - Filtres optionnels (dates, statut, type, équipe)
 * @returns Fichier CSV avec les congés
 *
 * @ticket SP-333
 */
export async function exportLeavesCsv(
  filters?: LeaveExportFilters
): Promise<CsvExportActionResult> {
  try {
    // 1️⃣ Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const { role, companyId } = session.user
    const userId = session.user.id

    // 2️⃣ Construire la requête avec RBAC
    const where: Prisma.LeaveRequestWhereInput = {}

    switch (role) {
      case 'EMPLOYEE': {
        // EMPLOYEE : ses propres demandes seulement
        const employee = await prisma.employee.findUnique({
          where: { userId },
          select: { id: true },
        })
        if (!employee) {
          return { success: false, error: 'Profil employé non trouvé' }
        }
        where.employeeId = employee.id
        break
      }

      case 'DIRECTOR':
        if (!companyId) {
          return {
            success: false,
            error: 'Utilisateur sans entreprise associée',
          }
        }
        where.companyId = companyId
        break

      case 'MANAGER': {
        const employee = await prisma.employee.findUnique({
          where: { userId },
          include: { managedTeams: { select: { id: true } } },
        })

        if (!employee) {
          return { success: false, error: 'Profil employé non trouvé' }
        }

        const managedTeamIds = employee.managedTeams.map((t) => t.id)
        if (managedTeamIds.length === 0) {
          return { success: false, error: 'Vous ne gérez aucune équipe' }
        }

        where.employee = { teamId: { in: managedTeamIds } }
        break
      }

      case 'SYSTEM_ADMIN':
        // Pas de filtre RBAC
        break
    }

    // 3️⃣ Appliquer les filtres optionnels
    if (filters?.startDate || filters?.endDate) {
      where.startDate = {}
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate)
      }
    }

    if (filters?.status) {
      where.status = filters.status as LeaveRequestStatus
    }

    if (filters?.type) {
      where.type = filters.type as LeaveType
    }

    if (filters?.teamId) {
      // Pour MANAGER, vérifier que l'équipe est dans ses équipes gérées
      if (role === 'MANAGER') {
        const employee = await prisma.employee.findUnique({
          where: { userId },
          include: { managedTeams: { select: { id: true } } },
        })
        const managedTeamIds = employee?.managedTeams.map((t) => t.id) ?? []
        if (!managedTeamIds.includes(filters.teamId)) {
          return {
            success: false,
            error: "Vous n'avez pas accès à cette équipe",
          }
        }
      }
      where.employee = {
        ...(where.employee as Prisma.EmployeeWhereInput),
        teamId: filters.teamId,
      }
    }

    // 4️⃣ Récupérer les données
    const leaves = await prisma.leaveRequest.findMany({
      where,
      select: {
        startDate: true,
        endDate: true,
        days: true,
        type: true,
        status: true,
        halfDay: true,
        halfDayPeriod: true,
        reason: true,
        reviewedAt: true,
        employee: { select: { firstName: true, lastName: true } },
      },
      orderBy: [{ startDate: 'desc' }],
      take: 10000, // Limite de sécurité
    })

    // 5️⃣ Générer le CSV
    const result = generateCsv(
      leaves as LeaveForCsvExport[],
      LEAVE_CSV_COLUMNS,
      {
        filename: 'conges-export',
      }
    )

    // 6️⃣ Log de traçabilité
    console.warn(
      `[exportLeavesCsv] User ${userId} (${role}) exported ${leaves.length} leave requests at ${new Date().toISOString()}`
    )

    // SP-444 : Audit trail export RGPD (fire-and-forget)
    logAuditAction({
      action: 'EXPORT',
      entityType: 'LEAVE',
      userId,
      companyId: companyId ?? undefined,
      details: {
        count: leaves.length,
        filters: (filters ?? null) as Prisma.InputJsonValue,
      },
    }).catch(console.error)

    return { success: true, data: result }
  } catch (error) {
    console.error('[exportLeavesCsv] Error:', error)
    return { success: false, error: "Erreur lors de l'export" }
  }
}

// ============================================================================
// Helpers internes
// ============================================================================

/**
 * Notifie les managers de l'équipe d'un employé qu'un congé a été annulé.
 * Fire-and-forget : toute erreur est logguée sans bloquer le flux principal.
 */
function notifyCancelledLeaveToManagers(
  employeeId: string,
  leaveRequestId: string
): void {
  prisma.employee
    .findUnique({
      where: { id: employeeId },
      select: {
        team: {
          select: {
            manager: { select: { userId: true } },
          },
        },
      },
    })
    .then((employee) => {
      const managerUserId = employee?.team?.manager?.userId
      if (managerUserId) {
        createLeaveNotification(leaveRequestId, managerUserId, 'cancelled').catch(
          console.error
        )
      }
    })
    .catch(console.error)
}
