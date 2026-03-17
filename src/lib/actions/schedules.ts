/**
 * Server Actions CRUD pour Schedules
 *
 * @description Actions avec RBAC multi-role pour gestion des plannings.
 * - SYSTEM_ADMIN : Lecture cross-tenant uniquement (pas de modification)
 * - DIRECTOR : CRUD sur toute la company
 * - MANAGER : CRUD sur ses equipes uniquement
 * - EMPLOYEE : Lecture seule de ses schedules
 *
 * @ticket SP-394, SP-399
 * @see Context7 - Next.js 15 Server Actions + Prisma transactions
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { UserRole, Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { validateData, handlePrismaError } from './crud-helpers'
import { logAuditAction } from '@/lib/services/audit'
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleFiltersSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from '@/lib/validations/schedule'
import { createPlanningNotification } from '@/lib/actions/notifications'
import type { CrudActionResult, DeleteActionResult } from '@/types'
import {
  generateOccurrences,
  generateRecurrenceGroupId,
  MAX_TOTAL_SCHEDULES,
  type RecurrenceRule,
} from '@/lib/utils/recurrence'
import { assertNotImpersonating } from '@/lib/impersonation'

// ============================================================================
// Types
// ============================================================================

/**
 * Schedule avec relations pour affichage
 */
export type ScheduleWithRelations = {
  id: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  type: string
  status: string
  title: string | null
  description: string | null
  location: string | null
  color: string | null
  isRecurring: boolean
  recurrenceRule: Prisma.JsonValue
  recurrenceGroupId: string | null
  scheduleGroupId: string | null
  employeeId: string
  teamId: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  employee: {
    id: string
    firstName: string
    lastName: string
    user?: {
      image: string | null
    } | null
  }
  team: {
    id: string
    name: string
  } | null
}

/**
 * Resultat de liste paginee
 */
export type SchedulesListResult = {
  schedules: ScheduleWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Filtres partiels (sans valeurs requises, elles seront remplies par défaut)
 */
export type ScheduleFiltersInput = Partial<{
  companyId: string
  employeeId: string
  employeeIds: string[]
  teamId: string
  type:
    | 'WORK'
    | 'MEETING'
    | 'BREAK'
    | 'TRAINING'
    | 'REMOTE'
    | 'ON_CALL'
    | 'OVERTIME'
    | 'REST'
  types: (
    | 'WORK'
    | 'MEETING'
    | 'BREAK'
    | 'TRAINING'
    | 'REMOTE'
    | 'ON_CALL'
    | 'OVERTIME'
    | 'REST'
  )[]
  status: 'DRAFT' | 'CONFIRMED'
  statuses: ('DRAFT' | 'CONFIRMED')[]
  startDate: Date
  endDate: Date
  isRecurring: boolean
  search: string
  page: number
  limit: number
  sortBy: 'startDate' | 'endDate' | 'createdAt' | 'title' | 'type' | 'status'
  sortOrder: 'asc' | 'desc'
}>

/**
 * Utilisateur authentifie avec contexte RBAC
 */
interface AuthenticatedUser {
  id: string
  role: UserRole
  companyId: string | null
  employeeId: string | null
  teamId: string | null
  managedTeamIds: string[]
}

/**
 * Resultat de verification d'acces
 */
type AccessCheckResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string }

// ============================================================================
// Fonctions d'authentification et RBAC
// ============================================================================

/**
 * Recupere l'utilisateur authentifie avec son contexte RBAC
 */
async function getAuthenticatedUser(): Promise<AccessCheckResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      }
    }

    const userId = session.user.id
    const role = session.user.role
    const companyId = session.user.companyId ?? null

    let employeeId: string | null = null
    let managedTeamIds: string[] = []

    // Recuperer l'employeeId et teamId si existe
    let teamId: string | null = null

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        teamId: true,
        managedTeams: {
          select: { id: true },
        },
      },
    })

    if (employee) {
      employeeId = employee.id
      teamId = employee.teamId
      managedTeamIds = employee.managedTeams.map((t) => t.id)
    }

    return {
      success: true,
      user: {
        id: userId,
        role,
        companyId,
        employeeId,
        teamId,
        managedTeamIds,
      },
    }
  } catch (error) {
    console.error('[getAuthenticatedUser] Error:', error)
    return {
      success: false,
      error: 'Erreur de vérification des permissions',
    }
  }
}

/**
 * Verifie si l'utilisateur peut acceder a un schedule (lecture)
 */
async function canAccessSchedule(
  user: AuthenticatedUser,
  schedule: { employeeId: string; teamId: string | null; companyId: string }
): Promise<boolean> {
  // SYSTEM_ADMIN : lecture cross-tenant
  if (user.role === 'SYSTEM_ADMIN') return true

  // Doit etre dans la meme company
  if (user.companyId !== schedule.companyId) return false

  // DIRECTOR : acces a toute la company
  if (user.role === 'DIRECTOR') return true

  // MANAGER : acces aux equipes qu'il gere
  if (user.role === 'MANAGER') {
    if (schedule.teamId && user.managedTeamIds.includes(schedule.teamId)) {
      return true
    }
    // Si pas de team sur le schedule, verifier si l'employe est dans une equipe geree
    const emp = await prisma.employee.findUnique({
      where: { id: schedule.employeeId },
      select: { teamId: true },
    })
    if (emp?.teamId && user.managedTeamIds.includes(emp.teamId)) {
      return true
    }
    return false
  }

  // EMPLOYEE : acces uniquement a ses propres schedules
  if (user.role === 'EMPLOYEE') {
    return user.employeeId === schedule.employeeId
  }

  return false
}

/**
 * Verifie si l'utilisateur peut modifier/supprimer un schedule
 */
async function canModifySchedule(
  user: AuthenticatedUser,
  schedule: { employeeId: string; teamId: string | null; companyId: string }
): Promise<boolean> {
  // SYSTEM_ADMIN : lecture seule, pas de modification
  if (user.role === 'SYSTEM_ADMIN') return false

  // EMPLOYEE : ne peut pas modifier les schedules
  if (user.role === 'EMPLOYEE') return false

  // DIRECTOR et MANAGER : peuvent modifier selon leurs acces
  return canAccessSchedule(user, schedule)
}

/**
 * Construit la clause WHERE Prisma selon le role et les filtres
 */
function buildWhereClause(
  user: AuthenticatedUser,
  filters: ScheduleFiltersInput
): Prisma.ScheduleWhereInput {
  const where: Prisma.ScheduleWhereInput = {}

  // Filtre par company (obligatoire sauf SYSTEM_ADMIN)
  if (user.role === 'SYSTEM_ADMIN') {
    if (filters.companyId) where.companyId = filters.companyId
  } else {
    if (!user.companyId) {
      // Retourner un where impossible si pas de company
      return { id: 'impossible' }
    }
    where.companyId = user.companyId
  }

  // EMPLOYEE : ses schedules + ceux de son equipe (CONFIRMED uniquement)
  if (user.role === 'EMPLOYEE') {
    if (user.employeeId) {
      where.status = 'CONFIRMED'
      if (user.teamId) {
        where.OR = [
          { employeeId: user.employeeId },
          { employee: { teamId: user.teamId } },
        ]
      } else {
        where.employeeId = user.employeeId
      }
    } else {
      return { id: 'impossible' }
    }
  }

  // MANAGER : uniquement les equipes qu'il gere
  if (user.role === 'MANAGER') {
    if (user.managedTeamIds.length > 0) {
      where.OR = [
        { teamId: { in: user.managedTeamIds } },
        { employee: { teamId: { in: user.managedTeamIds } } },
      ]
    } else {
      return { id: 'impossible' }
    }
  }

  // Filtres additionnels
  if (user.role === 'EMPLOYEE' && user.teamId) {
    // EMPLOYEE avec equipe : filtrer dans le perimetre RBAC (equipe)
    if (filters.employeeId) {
      // Remplacer le OR large par un filtre sur cet employe + contrainte equipe
      where.OR = [
        {
          employeeId: filters.employeeId,
          employee: { teamId: user.teamId },
        },
      ]
    }
    // teamId et employeeIds ignores : l'EMPLOYEE ne peut voir que son equipe
  } else {
    if (filters.employeeId) where.employeeId = filters.employeeId
    if (filters.employeeIds?.length)
      where.employeeId = { in: filters.employeeIds }
    if (filters.teamId) where.teamId = filters.teamId
  }
  if (filters.type) where.type = filters.type
  if (filters.types?.length) where.type = { in: filters.types }
  // EMPLOYEE : toujours CONFIRMED, ne pas laisser ecraser par le filtre
  if (user.role !== 'EMPLOYEE') {
    if (filters.status) where.status = filters.status
    if (filters.statuses?.length) where.status = { in: filters.statuses }
  }
  if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring

  // Filtre par periode
  if (filters.startDate || filters.endDate) {
    const andConditions: Prisma.ScheduleWhereInput[] = []
    if (filters.startDate) {
      andConditions.push({ endDate: { gte: filters.startDate } })
    }
    if (filters.endDate) {
      andConditions.push({ startDate: { lte: filters.endDate } })
    }
    if (andConditions.length > 0) {
      where.AND = andConditions
    }
  }

  // Recherche textuelle
  if (filters.search) {
    const searchConditions: Prisma.ScheduleWhereInput[] = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      {
        employee: {
          firstName: { contains: filters.search, mode: 'insensitive' },
        },
      },
      {
        employee: {
          lastName: { contains: filters.search, mode: 'insensitive' },
        },
      },
    ]
    if (where.OR) {
      // Combiner avec les conditions RBAC existantes
      where.AND = [
        ...((where.AND as Prisma.ScheduleWhereInput[]) || []),
        { OR: searchConditions },
      ]
    } else {
      where.OR = searchConditions
    }
  }

  return where
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Recupere la liste des schedules avec filtres et pagination
 */
export async function getSchedules(
  filters: ScheduleFiltersInput = {}
): Promise<CrudActionResult<SchedulesListResult>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Valider les filtres et appliquer les defauts
    const filtersValidation = validateData(scheduleFiltersSchema, {
      page: 1,
      limit: 20,
      sortBy: 'startDate',
      sortOrder: 'asc',
      ...filters,
    })

    if (!filtersValidation.success) {
      return { success: false, error: filtersValidation.error }
    }

    const validFilters = filtersValidation.data

    // Extraire les valeurs avec garantie de définition (schema a des defaults)
    const page = validFilters.page ?? 1
    const limit = validFilters.limit ?? 20
    const sortBy = validFilters.sortBy ?? 'startDate'
    const sortOrder = validFilters.sortOrder ?? 'asc'

    // Construire le where selon les permissions
    const where = buildWhereClause(user, validFilters)

    // Requete avec pagination
    const [schedules, total] = await prisma.$transaction([
      prisma.schedule.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: { select: { image: true } },
            },
          },
          team: {
            select: { id: true, name: true },
          },
        },
        orderBy: { [sortBy]: sortOrder } as Record<string, 'asc' | 'desc'>,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.schedule.count({ where }),
    ])

    return {
      success: true,
      data: {
        schedules: schedules as ScheduleWithRelations[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('[getSchedules] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Recupere un schedule par son ID
 */
export async function getScheduleById(
  id: string
): Promise<CrudActionResult<ScheduleWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { image: true } },
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Verifier les permissions
    const canAccess = await canAccessSchedule(user, schedule)

    if (!canAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    return { success: true, data: schedule as ScheduleWithRelations }
  } catch (error) {
    console.error('[getScheduleById] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Cree un ou plusieurs schedules
 * Support multi-employes via employeeIds
 */
export async function createSchedule(
  input: CreateScheduleInput
): Promise<CrudActionResult<ScheduleWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Verifier le role (EMPLOYEE et SYSTEM_ADMIN ne peuvent pas creer)
  if (user.role === 'EMPLOYEE') {
    return { success: false, error: 'Vous ne pouvez pas créer de planning' }
  }
  if (user.role === 'SYSTEM_ADMIN') {
    return { success: false, error: 'Action non autorisée pour ce rôle' }
  }

  try {
    // Valider les donnees
    const validation = validateData(createScheduleSchema, input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const validated = validation.data

    // Verifier l'acces a la company
    if (user.companyId !== validated.companyId) {
      return { success: false, error: 'Accès non autorisé à cette entreprise' }
    }

    // Determiner les employeeIds
    const employeeIds = validated.employeeIds?.length
      ? validated.employeeIds
      : validated.employeeId
        ? [validated.employeeId]
        : []

    if (employeeIds.length === 0) {
      return { success: false, error: 'Au moins un employé requis' }
    }

    // Verifier que tous les employes appartiennent a la company
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        companyId: validated.companyId,
      },
      include: { team: { select: { id: true } } },
    })

    if (employees.length !== employeeIds.length) {
      return {
        success: false,
        error: 'Un ou plusieurs employés sont invalides',
      }
    }

    // Pour MANAGER, verifier qu'il gere bien ces employes
    if (user.role === 'MANAGER') {
      for (const emp of employees) {
        if (!emp.teamId || !user.managedTeamIds.includes(emp.teamId)) {
          return {
            success: false,
            error: `Vous ne pouvez pas gérer l'employé ${emp.firstName} ${emp.lastName}`,
          }
        }
      }
    }

    // Generer un scheduleGroupId si multi-employes
    const scheduleGroupId =
      employeeIds.length > 1
        ? `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        : undefined

    // Gestion de la récurrence (SP-399)
    let occurrenceDates: { startDate: Date; endDate: Date }[] = [
      { startDate: validated.startDate, endDate: validated.endDate },
    ]
    let recurrenceGroupId: string | undefined

    if (validated.isRecurring && validated.recurrenceRule) {
      // Parser et valider la règle de récurrence
      const rule = validated.recurrenceRule as RecurrenceRule

      // Générer toutes les occurrences
      occurrenceDates = generateOccurrences(
        validated.startDate,
        validated.endDate,
        rule
      )

      // Vérifier la limite totale de créneaux
      const totalSchedules = occurrenceDates.length * employeeIds.length
      if (totalSchedules > MAX_TOTAL_SCHEDULES) {
        return {
          success: false,
          error: `Le nombre total de créneaux (${totalSchedules}) dépasse la limite autorisée (${MAX_TOTAL_SCHEDULES})`,
        }
      }

      // Générer l'ID de groupe de récurrence
      recurrenceGroupId = generateRecurrenceGroupId()
    }

    // Construire la liste des créations (employés × occurrences)
    const createOperations: Prisma.ScheduleCreateArgs[] = []

    for (const employeeId of employeeIds) {
      for (const occurrence of occurrenceDates) {
        createOperations.push({
          data: {
            employeeId,
            companyId: validated.companyId,
            teamId: validated.teamId ?? null,
            startDate: occurrence.startDate,
            endDate: occurrence.endDate,
            startTime: validated.startTime,
            endTime: validated.endTime,
            type: validated.type,
            status: validated.status,
            title: validated.title ?? null,
            description: validated.description ?? null,
            location: validated.location ?? null,
            color: validated.color ?? null,
            isRecurring: validated.isRecurring,
            recurrenceRule: validated.recurrenceRule ?? Prisma.JsonNull,
            recurrenceGroupId: recurrenceGroupId ?? null,
            scheduleGroupId: scheduleGroupId ?? null,
            createdById: user.id,
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userId: true,
                user: { select: { image: true } },
              },
            },
            team: {
              select: { id: true, name: true },
            },
          },
        })
      }
    }

    // Creer les schedules en transaction
    const schedules = await prisma.$transaction(
      createOperations.map((op) => prisma.schedule.create(op))
    )

    // SP-444 : Audit trail (fire-and-forget)
    for (const s of schedules) {
      logAuditAction({
        action: 'CREATE',
        entityType: 'SCHEDULE',
        entityId: s.id,
        userId: user.id,
        companyId: validated.companyId,
        details: {
          employeeId: s.employeeId,
          type: validated.type,
          startDate: validated.startDate.toISOString(),
          isRecurring: validated.isRecurring,
        },
      }).catch(console.error)
    }

    // SSE : Notifier les employés du nouveau planning (fire-and-forget)
    const notifyEmpIds = [...new Set(schedules.map((s) => s.employeeId))]
    prisma.employee
      .findMany({
        where: { id: { in: notifyEmpIds }, userId: { not: null } },
        select: { id: true, userId: true },
      })
      .then((employees) => {
        const userIdMap = new Map(employees.map((e) => [e.id, e.userId]))
        for (const s of schedules) {
          const uid = userIdMap.get(s.employeeId)
          if (uid) {
            createPlanningNotification(s.id, uid, 'created').catch(
              console.error
            )
          }
        }
      })
      .catch(console.error)

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return {
      success: true,
      data: schedules as unknown as ScheduleWithRelations[],
    }
  } catch (error) {
    console.error('[createSchedule] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Met a jour un schedule
 */
export async function updateSchedule(
  input: UpdateScheduleInput
): Promise<CrudActionResult<ScheduleWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Valider les donnees
    const validation = validateData(updateScheduleSchema, input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const validated = validation.data

    // Recuperer le schedule existant
    const existing = await prisma.schedule.findUnique({
      where: { id: validated.id },
    })

    if (!existing) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Verifier les permissions de modification
    const canModify = await canModifySchedule(user, existing)

    if (!canModify) {
      return { success: false, error: 'Modification non autorisée' }
    }

    // Mettre a jour
    const updated = await prisma.schedule.update({
      where: { id: validated.id },
      data: {
        ...(validated.teamId !== undefined && { teamId: validated.teamId }),
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
        ...(validated.startTime && { startTime: validated.startTime }),
        ...(validated.endTime && { endTime: validated.endTime }),
        ...(validated.type && { type: validated.type }),
        ...(validated.status && { status: validated.status }),
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.description !== undefined && {
          description: validated.description,
        }),
        ...(validated.location !== undefined && {
          location: validated.location,
        }),
        ...(validated.color !== undefined && { color: validated.color }),
        ...(validated.isRecurring !== undefined && {
          isRecurring: validated.isRecurring,
        }),
        ...(validated.recurrenceRule !== undefined && {
          recurrenceRule: validated.recurrenceRule ?? Prisma.JsonNull,
        }),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { image: true } },
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'SCHEDULE',
      entityId: validated.id,
      userId: user.id,
      companyId: existing.companyId,
      details: {
        employeeId: existing.employeeId,
        type: validated.type ?? existing.type,
      },
    }).catch(console.error)

    // SSE : Notifier l'employé de la modification (fire-and-forget)
    prisma.employee
      .findUnique({
        where: { id: updated.employeeId },
        select: { userId: true },
      })
      .then((emp) => {
        if (emp?.userId) {
          createPlanningNotification(updated.id, emp.userId, 'updated').catch(
            console.error
          )
        }
      })
      .catch(console.error)

    revalidatePath('/app/schedules')
    revalidatePath(`/app/schedules/${validated.id}`)
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: updated as ScheduleWithRelations }
  } catch (error) {
    console.error('[updateSchedule] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Supprime un schedule
 */
export async function deleteSchedule(id: string): Promise<DeleteActionResult> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Recuperer le schedule avec le userId de l'employé
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { employee: { select: { userId: true } } },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Verifier les permissions
    const canModify = await canModifySchedule(user, schedule)

    if (!canModify) {
      return { success: false, error: 'Suppression non autorisée' }
    }

    await prisma.schedule.delete({ where: { id } })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'SCHEDULE',
      entityId: id,
      userId: user.id,
      companyId: schedule.companyId,
      details: { employeeId: schedule.employeeId, type: schedule.type },
    }).catch(console.error)

    // Notification SSE : planning supprimé (fire-and-forget)
    if (schedule.employee?.userId) {
      createPlanningNotification(id, schedule.employee.userId, 'deleted').catch(
        console.error
      )
    }

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return { success: true }
  } catch (error) {
    console.error('[deleteSchedule] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Supprime plusieurs schedules (par groupe)
 */
export async function deleteScheduleGroup(
  scheduleGroupId: string
): Promise<CrudActionResult<{ deletedCount: number }>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Recuperer tous les schedules du groupe
    const schedules = await prisma.schedule.findMany({
      where: { scheduleGroupId },
    })

    if (schedules.length === 0) {
      return { success: false, error: 'Aucun planning trouvé dans ce groupe' }
    }

    // Verifier les permissions pour chaque schedule
    for (const schedule of schedules) {
      const canModify = await canModifySchedule(user, schedule)
      if (!canModify) {
        return {
          success: false,
          error: 'Suppression non autorisée pour certains plannings',
        }
      }
    }

    // Collecter les employeeIds uniques et leurs scheduleIds pour les notifications
    const employeeScheduleMap = new Map<string, string>()
    for (const s of schedules) {
      if (!employeeScheduleMap.has(s.employeeId)) {
        employeeScheduleMap.set(s.employeeId, s.id)
      }
    }

    // Récupérer les userIds des employés concernés
    const employees = await prisma.employee.findMany({
      where: { id: { in: [...employeeScheduleMap.keys()] } },
      select: { id: true, userId: true },
    })

    // Supprimer tous les schedules du groupe
    const result = await prisma.schedule.deleteMany({
      where: { scheduleGroupId },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'SCHEDULE',
      userId: user.id,
      companyId: schedules[0]?.companyId ?? undefined,
      details: { scheduleGroupId, deletedCount: result.count },
    }).catch(console.error)

    // Notifications SSE : planning supprimé pour chaque employé (fire-and-forget)
    for (const emp of employees) {
      if (emp.userId) {
        const scheduleId = employeeScheduleMap.get(emp.id)
        if (scheduleId) {
          createPlanningNotification(scheduleId, emp.userId, 'deleted').catch(
            console.error
          )
        }
      }
    }

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: { deletedCount: result.count } }
  } catch (error) {
    console.error('[deleteScheduleGroup] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Duplique un schedule (ou groupe de schedules)
 */
export async function duplicateSchedule(
  id: string,
  options: {
    shiftDays?: number // Decaler de X jours
    newEmployeeIds?: string[] // Assigner a d'autres employes
  } = {}
): Promise<CrudActionResult<ScheduleWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Verifier le role
  if (user.role === 'EMPLOYEE' || user.role === 'SYSTEM_ADMIN') {
    return { success: false, error: 'Action non autorisée pour ce rôle' }
  }

  try {
    // Recuperer le schedule original
    const original = await prisma.schedule.findUnique({
      where: { id },
    })

    if (!original) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Verifier l'acces
    const canAccess = await canAccessSchedule(user, original)

    if (!canAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Calculer les nouvelles dates
    const shiftMs = (options.shiftDays || 7) * 24 * 60 * 60 * 1000
    const newStartDate = new Date(original.startDate.getTime() + shiftMs)
    const newEndDate = new Date(original.endDate.getTime() + shiftMs)

    // Determiner les employes cibles
    const employeeIds = options.newEmployeeIds?.length
      ? options.newEmployeeIds
      : [original.employeeId]

    // Verifier que les employes sont valides et accessibles
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        companyId: original.companyId,
      },
      select: { id: true, firstName: true, lastName: true, teamId: true },
    })

    if (employees.length !== employeeIds.length) {
      return {
        success: false,
        error: 'Un ou plusieurs employés sont invalides',
      }
    }

    // Pour MANAGER, verifier les permissions
    if (user.role === 'MANAGER') {
      for (const emp of employees) {
        if (!emp.teamId || !user.managedTeamIds.includes(emp.teamId)) {
          return {
            success: false,
            error: `Vous ne pouvez pas gérer l'employé ${emp.firstName} ${emp.lastName}`,
          }
        }
      }
    }

    // Generer un nouveau scheduleGroupId si multi-employes
    const scheduleGroupId =
      employeeIds.length > 1
        ? `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
        : undefined

    // Creer les nouveaux schedules
    const duplicates = await prisma.$transaction(
      employeeIds.map((employeeId) =>
        prisma.schedule.create({
          data: {
            employeeId,
            companyId: original.companyId,
            teamId: original.teamId,
            startDate: newStartDate,
            endDate: newEndDate,
            startTime: original.startTime,
            endTime: original.endTime,
            type: original.type,
            status: 'DRAFT', // Toujours en brouillon
            title: original.title,
            description: original.description,
            location: original.location,
            color: original.color,
            isRecurring: false, // Ne pas dupliquer la recurrence
            recurrenceRule: Prisma.JsonNull,
            scheduleGroupId: scheduleGroupId ?? null,
            createdById: user.id,
          },
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                userId: true,
                user: { select: { image: true } },
              },
            },
            team: {
              select: { id: true, name: true },
            },
          },
        })
      )
    )

    // SP-444 : Audit trail (fire-and-forget)
    for (const dup of duplicates) {
      logAuditAction({
        action: 'CREATE',
        entityType: 'SCHEDULE',
        entityId: dup.id,
        userId: user.id,
        companyId: original.companyId,
        details: { duplicatedFrom: id, employeeId: dup.employeeId },
      }).catch(console.error)
    }

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: duplicates as ScheduleWithRelations[] }
  } catch (error) {
    console.error('[duplicateSchedule] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Change le statut d'un schedule (DRAFT -> CONFIRMED, etc.)
 */
export async function updateScheduleStatus(
  id: string,
  status: 'DRAFT' | 'CONFIRMED'
): Promise<CrudActionResult<ScheduleWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    const canModify = await canModifySchedule(user, schedule)

    if (!canModify) {
      return { success: false, error: 'Modification non autorisée' }
    }

    const updated = await prisma.schedule.update({
      where: { id },
      data: { status },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { image: true } },
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'STATUS_CHANGE',
      entityType: 'SCHEDULE',
      entityId: id,
      userId: user.id,
      companyId: schedule.companyId,
      details: { from: schedule.status, to: status },
    }).catch(console.error)

    revalidatePath('/app/schedules')
    revalidatePath(`/app/schedules/${id}`)
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: updated as ScheduleWithRelations }
  } catch (error) {
    console.error('[updateScheduleStatus] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Recupere les schedules pour un employe specifique (pour calendrier)
 */
export async function getEmployeeSchedules(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<CrudActionResult<ScheduleWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Verifier que l'employe existe et est accessible
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true, teamId: true },
    })

    if (!employee) {
      return { success: false, error: 'Employé non trouvé' }
    }

    // Verifier l'acces
    const canAccess = await canAccessSchedule(user, {
      employeeId,
      teamId: employee.teamId,
      companyId: employee.companyId,
    })

    if (!canAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        employeeId,
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { image: true } },
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    return { success: true, data: schedules as ScheduleWithRelations[] }
  } catch (error) {
    console.error('[getEmployeeSchedules] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Recupere les schedules pour une equipe (pour vue equipe)
 */
export async function getTeamSchedules(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<CrudActionResult<ScheduleWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Verifier que l'equipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, companyId: true },
    })

    if (!team) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    // Verifier l'acces
    if (user.role === 'SYSTEM_ADMIN') {
      // OK
    } else if (user.companyId !== team.companyId) {
      return { success: false, error: 'Accès non autorisé' }
    } else if (
      user.role === 'MANAGER' &&
      !user.managedTeamIds.includes(teamId)
    ) {
      return { success: false, error: 'Accès non autorisé à cette équipe' }
    } else if (user.role === 'EMPLOYEE') {
      return { success: false, error: 'Accès non autorisé' }
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        teamId,
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: { select: { image: true } },
          },
        },
        team: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { employee: { lastName: 'asc' } }],
    })

    return { success: true, data: schedules as ScheduleWithRelations[] }
  } catch (error) {
    console.error('[getTeamSchedules] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

// ============================================================================
// FONCTIONS POUR CRÉNEAUX RÉCURRENTS (SP-399)
// ============================================================================

/**
 * Récupère le nombre de créneaux d'une série récurrente
 */
export async function getRecurrenceGroupCounts(
  scheduleId: string
): Promise<CrudActionResult<{ single: number; future: number; all: number }>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  try {
    // Récupérer le schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: {
        id: true,
        recurrenceGroupId: true,
        startDate: true,
        employeeId: true,
        companyId: true,
      },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    if (!schedule.recurrenceGroupId) {
      return {
        success: true,
        data: { single: 1, future: 0, all: 1 },
      }
    }

    // Compter tous les créneaux de la série
    const allCount = await prisma.schedule.count({
      where: { recurrenceGroupId: schedule.recurrenceGroupId },
    })

    // Compter les créneaux futurs (y compris celui-ci)
    const futureCount = await prisma.schedule.count({
      where: {
        recurrenceGroupId: schedule.recurrenceGroupId,
        startDate: { gte: schedule.startDate },
      },
    })

    return {
      success: true,
      data: {
        single: 1,
        future: futureCount,
        all: allCount,
      },
    }
  } catch (error) {
    console.error('[getRecurrenceGroupCounts] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Supprime des créneaux récurrents selon la portée choisie
 * @param scheduleId - ID du créneau de référence
 * @param scope - 'single' | 'future' | 'all'
 */
export async function deleteRecurringSchedules(
  scheduleId: string,
  scope: 'single' | 'future' | 'all'
): Promise<CrudActionResult<{ deletedCount: number }>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Récupérer le schedule de référence
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Vérifier les permissions
    const canModify = await canModifySchedule(user, schedule)
    if (!canModify) {
      return { success: false, error: 'Suppression non autorisée' }
    }

    let deletedCount = 0

    switch (scope) {
      case 'single':
        // Supprimer uniquement ce créneau
        await prisma.schedule.delete({ where: { id: scheduleId } })
        deletedCount = 1
        break

      case 'future':
        if (!schedule.recurrenceGroupId) {
          // Pas de groupe, supprimer juste celui-ci
          await prisma.schedule.delete({ where: { id: scheduleId } })
          deletedCount = 1
        } else {
          // Récupérer tous les créneaux futurs du groupe pour vérifier les permissions
          const futureSchedules = await prisma.schedule.findMany({
            where: {
              recurrenceGroupId: schedule.recurrenceGroupId,
              startDate: { gte: schedule.startDate },
            },
          })

          // Vérifier les permissions pour chacun
          for (const s of futureSchedules) {
            const canMod = await canModifySchedule(user, s)
            if (!canMod) {
              return {
                success: false,
                error: 'Suppression non autorisée pour certains plannings',
              }
            }
          }

          // Supprimer tous les futurs
          const result = await prisma.schedule.deleteMany({
            where: {
              recurrenceGroupId: schedule.recurrenceGroupId,
              startDate: { gte: schedule.startDate },
            },
          })
          deletedCount = result.count
        }
        break

      case 'all':
        if (!schedule.recurrenceGroupId) {
          // Pas de groupe, supprimer juste celui-ci
          await prisma.schedule.delete({ where: { id: scheduleId } })
          deletedCount = 1
        } else {
          // Récupérer tous les créneaux du groupe pour vérifier les permissions
          const allSchedules = await prisma.schedule.findMany({
            where: { recurrenceGroupId: schedule.recurrenceGroupId },
          })

          // Vérifier les permissions pour chacun
          for (const s of allSchedules) {
            const canMod = await canModifySchedule(user, s)
            if (!canMod) {
              return {
                success: false,
                error: 'Suppression non autorisée pour certains plannings',
              }
            }
          }

          // Supprimer tous
          const result = await prisma.schedule.deleteMany({
            where: { recurrenceGroupId: schedule.recurrenceGroupId },
          })
          deletedCount = result.count
        }
        break
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'SCHEDULE',
      entityId: scheduleId,
      userId: user.id,
      companyId: schedule.companyId,
      details: {
        scope,
        recurrenceGroupId: schedule.recurrenceGroupId,
        deletedCount,
      },
    }).catch(console.error)

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: { deletedCount } }
  } catch (error) {
    console.error('[deleteRecurringSchedules] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Type pour les mises à jour groupées de créneaux récurrents
 */
type RecurringScheduleUpdates = {
  teamId?: string | null
  startDate?: Date
  endDate?: Date
  startTime?: string
  endTime?: string
  type?:
    | 'WORK'
    | 'MEETING'
    | 'BREAK'
    | 'TRAINING'
    | 'REMOTE'
    | 'ON_CALL'
    | 'OVERTIME'
  status?: 'DRAFT' | 'CONFIRMED'
  title?: string | null
  description?: string | null
  location?: string | null
  color?: string | null
}

/**
 * Met à jour des créneaux récurrents selon la portée choisie
 * @param scheduleId - ID du créneau de référence
 * @param scope - 'single' | 'future' | 'all'
 * @param updates - Données à mettre à jour
 */
export async function updateRecurringSchedules(
  scheduleId: string,
  scope: 'single' | 'future' | 'all',
  updates: RecurringScheduleUpdates
): Promise<CrudActionResult<{ updatedCount: number }>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Récupérer le schedule de référence
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      return { success: false, error: 'Planning non trouvé' }
    }

    // Vérifier les permissions
    const canModify = await canModifySchedule(user, schedule)
    if (!canModify) {
      return { success: false, error: 'Modification non autorisée' }
    }

    // Préparer les données de mise à jour (exclure id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {}
    if (updates.teamId !== undefined) updateData.teamId = updates.teamId
    if (updates.startTime) updateData.startTime = updates.startTime
    if (updates.endTime) updateData.endTime = updates.endTime
    if (updates.type) updateData.type = updates.type
    if (updates.status) updateData.status = updates.status
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined)
      updateData.description = updates.description
    if (updates.location !== undefined) updateData.location = updates.location
    if (updates.color !== undefined) updateData.color = updates.color

    let updatedCount = 0

    switch (scope) {
      case 'single':
        // Mettre à jour uniquement ce créneau
        // Pour single, on peut aussi mettre à jour les dates
        if (updates.startDate) updateData.startDate = updates.startDate
        if (updates.endDate) updateData.endDate = updates.endDate

        await prisma.schedule.update({
          where: { id: scheduleId },
          data: updateData,
        })
        updatedCount = 1
        break

      case 'future':
        if (!schedule.recurrenceGroupId) {
          // Pas de groupe, mettre à jour juste celui-ci
          if (updates.startDate) updateData.startDate = updates.startDate
          if (updates.endDate) updateData.endDate = updates.endDate

          await prisma.schedule.update({
            where: { id: scheduleId },
            data: updateData,
          })
          updatedCount = 1
        } else {
          // Récupérer tous les créneaux futurs du groupe
          const futureSchedules = await prisma.schedule.findMany({
            where: {
              recurrenceGroupId: schedule.recurrenceGroupId,
              startDate: { gte: schedule.startDate },
            },
          })

          // Vérifier les permissions pour chacun
          for (const s of futureSchedules) {
            const canMod = await canModifySchedule(user, s)
            if (!canMod) {
              return {
                success: false,
                error: 'Modification non autorisée pour certains plannings',
              }
            }
          }

          // Mettre à jour tous les futurs (sans changer les dates)
          const result = await prisma.schedule.updateMany({
            where: {
              recurrenceGroupId: schedule.recurrenceGroupId,
              startDate: { gte: schedule.startDate },
            },
            data: updateData,
          })
          updatedCount = result.count
        }
        break

      case 'all':
        if (!schedule.recurrenceGroupId) {
          // Pas de groupe, mettre à jour juste celui-ci
          if (updates.startDate) updateData.startDate = updates.startDate
          if (updates.endDate) updateData.endDate = updates.endDate

          await prisma.schedule.update({
            where: { id: scheduleId },
            data: updateData,
          })
          updatedCount = 1
        } else {
          // Récupérer tous les créneaux du groupe
          const allSchedules = await prisma.schedule.findMany({
            where: { recurrenceGroupId: schedule.recurrenceGroupId },
          })

          // Vérifier les permissions pour chacun
          for (const s of allSchedules) {
            const canMod = await canModifySchedule(user, s)
            if (!canMod) {
              return {
                success: false,
                error: 'Modification non autorisée pour certains plannings',
              }
            }
          }

          // Mettre à jour tous (sans changer les dates)
          const result = await prisma.schedule.updateMany({
            where: { recurrenceGroupId: schedule.recurrenceGroupId },
            data: updateData,
          })
          updatedCount = result.count
        }
        break
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'SCHEDULE',
      entityId: scheduleId,
      userId: user.id,
      companyId: schedule.companyId,
      details: {
        scope,
        recurrenceGroupId: schedule.recurrenceGroupId,
        updatedCount,
      },
    }).catch(console.error)

    revalidatePath('/app/schedules')
    revalidatePath('/app/tableau-de-bord')

    return { success: true, data: { updatedCount } }
  } catch (error) {
    console.error('[updateRecurringSchedules] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

// ============================================================================
// EXPORT CSV - Export des plannings au format CSV (SP-333)
// ============================================================================

import {
  generateCsv,
  formatDateFr,
  formatDayOfWeek,
  type CsvColumn,
} from '@/lib/csv'
import type { CsvExportActionResult, ScheduleExportFilters } from '@/types'
import {
  scheduleTypeLabels,
  scheduleStatusLabels,
} from '@/lib/validations/schedule'

/**
 * Type interne pour l'export CSV des plannings
 */
interface ScheduleForCsvExport {
  startDate: Date
  startTime: string
  endTime: string
  type: string
  status: string
  title: string | null
  location: string | null
  employee: { firstName: string; lastName: string }
  team: { name: string } | null
}

/**
 * Calcule la durée en heures entre deux horaires
 */
function calculateDuration(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const startMinutes = (startH ?? 0) * 60 + (startM ?? 0)
  const endMinutes = (endH ?? 0) * 60 + (endM ?? 0)
  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100
}

/**
 * Colonnes pour l'export CSV des plannings
 */
const SCHEDULE_CSV_COLUMNS: CsvColumn<ScheduleForCsvExport>[] = [
  {
    key: (s) => `${s.employee.lastName} ${s.employee.firstName}`,
    header: 'Employé',
  },
  {
    key: 'startDate',
    header: 'Date',
    format: (v) => formatDateFr(v as Date),
  },
  {
    key: (s) => formatDayOfWeek(s.startDate),
    header: 'Jour',
  },
  { key: 'startTime', header: 'Début' },
  { key: 'endTime', header: 'Fin' },
  {
    key: (s) => calculateDuration(s.startTime, s.endTime).toFixed(1),
    header: 'Durée (h)',
  },
  {
    key: 'type',
    header: 'Type',
    format: (v) =>
      scheduleTypeLabels[v as keyof typeof scheduleTypeLabels] ?? String(v),
  },
  {
    key: 'status',
    header: 'Statut',
    format: (v) =>
      scheduleStatusLabels[v as keyof typeof scheduleStatusLabels] ?? String(v),
  },
  {
    key: (s) => s.team?.name ?? '',
    header: 'Équipe',
  },
  { key: 'location', header: 'Lieu' },
  { key: 'title', header: 'Titre' },
]

/**
 * Exporte les plannings au format CSV
 *
 * RBAC :
 * - SYSTEM_ADMIN : Tous les plannings (lecture seule)
 * - DIRECTOR : Plannings de son entreprise
 * - MANAGER : Plannings de ses équipes
 * - EMPLOYEE : Non autorisé (lecture seule des siens via autre endpoint)
 *
 * @param filters - Filtres optionnels (dates, équipe, employé)
 * @returns Fichier CSV avec les plannings
 *
 * @ticket SP-333
 */
export async function exportSchedulesCsv(
  filters?: ScheduleExportFilters
): Promise<CsvExportActionResult> {
  try {
    // 1️⃣ Vérifier l'authentification
    const authResult = await getAuthenticatedUser()

    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const user = authResult.user

    // 2️⃣ Construire la requête avec RBAC
    const where: Prisma.ScheduleWhereInput = {}

    switch (user.role) {
      case 'SYSTEM_ADMIN':
        // Pas de filtre RBAC
        break

      case 'DIRECTOR':
        if (!user.companyId) {
          return {
            success: false,
            error: 'Utilisateur sans entreprise associée',
          }
        }
        where.companyId = user.companyId
        break

      case 'MANAGER':
        if (user.managedTeamIds.length === 0) {
          return { success: false, error: 'Vous ne gérez aucune équipe' }
        }
        where.employee = { teamId: { in: user.managedTeamIds } }
        break

      case 'EMPLOYEE':
        if (!user.companyId) {
          return {
            success: false,
            error: 'Utilisateur sans entreprise associée',
          }
        }
        where.companyId = user.companyId
        where.status = 'CONFIRMED'
        if (user.employeeId) {
          if (user.teamId) {
            where.OR = [
              { employeeId: user.employeeId },
              { employee: { teamId: user.teamId } },
            ]
          } else {
            where.employeeId = user.employeeId
          }
        } else {
          return { success: false, error: 'Employé non trouvé' }
        }
        break
    }

    // 3️⃣ Appliquer les filtres de période
    if (filters?.startDate || filters?.endDate) {
      where.startDate = {}
      if (filters.startDate) {
        where.startDate.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        where.startDate.lte = new Date(filters.endDate)
      }
    }

    if (filters?.teamId && user.role !== 'EMPLOYEE') {
      // Pour MANAGER, vérifier que l'équipe est dans ses équipes gérées
      if (
        user.role === 'MANAGER' &&
        !user.managedTeamIds.includes(filters.teamId)
      ) {
        return { success: false, error: "Vous n'avez pas accès à cette équipe" }
      }
      where.employee = {
        ...(where.employee as Prisma.EmployeeWhereInput),
        teamId: filters.teamId,
      }
    }

    if (filters?.employeeId && user.role !== 'EMPLOYEE') {
      where.employeeId = filters.employeeId
    }

    // 4️⃣ Récupérer les données
    const schedules = await prisma.schedule.findMany({
      where,
      select: {
        startDate: true,
        startTime: true,
        endTime: true,
        type: true,
        status: true,
        title: true,
        location: true,
        employee: { select: { firstName: true, lastName: true } },
        team: { select: { name: true } },
      },
      orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
      take: 10000, // Limite de sécurité
    })

    // 5️⃣ Générer le CSV
    const result = generateCsv(
      schedules as ScheduleForCsvExport[],
      SCHEDULE_CSV_COLUMNS,
      {
        filename: 'plannings-export',
      }
    )

    // 6️⃣ Log de traçabilité
    console.warn(
      `[exportSchedulesCsv] User ${user.id} (${user.role}) exported ${schedules.length} schedules at ${new Date().toISOString()}`
    )

    // SP-444 : Audit trail export RGPD (fire-and-forget)
    logAuditAction({
      action: 'EXPORT',
      entityType: 'SCHEDULE',
      userId: user.id,
      companyId: user.companyId ?? undefined,
      details: {
        count: schedules.length,
        filters: (filters ?? null) as Prisma.InputJsonValue,
      },
    }).catch(console.error)

    return { success: true, data: result }
  } catch (error) {
    console.error('[exportSchedulesCsv] Error:', error)
    return { success: false, error: "Erreur lors de l'export" }
  }
}
