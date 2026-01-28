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
  type LeaveRequest,
  type LeaveBalance,
} from '@prisma/client'
import { auth } from '@/lib/auth'
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
  type LeaveRequestFilters,
} from '@/lib/validations/leave'
import { calculateWorkingDays, hasEnoughBalance } from '@/lib/leave-utils'
import {
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
} from '@/lib/email/templates/leave-decision'
import type { ListActionResult, ListQueryParams } from '@/types'
import type { LeaveEmailData } from '@/types'

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
    },
  },
} as const

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string
    teamId: string | null
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

const LEAVE_PATHS = ['/app/dashboard/conges', '/app/dashboard/leaves']

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

    revalidatePath(LEAVE_PATHS[0])
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

    revalidatePath(LEAVE_PATHS[0])
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

      revalidatePath(LEAVE_PATHS[0])
      return { success: true, data: updated }
    }

    // PENDING : simple annulation
    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: LeaveRequestStatus.CANCELLED },
    })

    revalidatePath(LEAVE_PATHS[0])
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
        email: leaveRequest.employee.email,
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

    revalidatePath(LEAVE_PATHS[0])
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
  const authResult = await getAuthenticatedUser(['DIRECTOR', 'SYSTEM_ADMIN'])
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

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

    revalidatePath(LEAVE_PATHS[0])
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
// 11. checkLeaveConflicts - Vérifier chevauchements équipe
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
