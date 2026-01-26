/**
 * Server Actions CRUD pour Schedules
 *
 * @description Actions avec RBAC multi-role pour gestion des plannings.
 * - SYSTEM_ADMIN : Lecture cross-tenant uniquement (pas de modification)
 * - DIRECTOR : CRUD sur toute la company
 * - MANAGER : CRUD sur ses equipes uniquement
 * - EMPLOYEE : Lecture seule de ses schedules
 *
 * @ticket SP-394
 * @see Context7 - Next.js 15 Server Actions + Prisma transactions
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { UserRole, Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { validateData, handlePrismaError } from './crud-helpers'
import {
  createScheduleSchema,
  updateScheduleSchema,
  scheduleFiltersSchema,
  type CreateScheduleInput,
  type UpdateScheduleInput,
} from '@/lib/validations/schedule'
import type { CrudActionResult, DeleteActionResult } from '@/types'

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
  types: (
    | 'WORK'
    | 'MEETING'
    | 'BREAK'
    | 'TRAINING'
    | 'REMOTE'
    | 'ON_CALL'
    | 'OVERTIME'
  )[]
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  statuses: ('DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED')[]
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

    // Recuperer l'employeeId si existe
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: {
        id: true,
        managedTeams: {
          select: { id: true },
        },
      },
    })

    if (employee) {
      employeeId = employee.id
      managedTeamIds = employee.managedTeams.map((t) => t.id)
    }

    return {
      success: true,
      user: {
        id: userId,
        role,
        companyId,
        employeeId,
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

  // EMPLOYEE : uniquement ses schedules
  if (user.role === 'EMPLOYEE') {
    if (user.employeeId) {
      where.employeeId = user.employeeId
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
  if (filters.employeeId) where.employeeId = filters.employeeId
  if (filters.employeeIds?.length)
    where.employeeId = { in: filters.employeeIds }
  if (filters.teamId) where.teamId = filters.teamId
  if (filters.type) where.type = filters.type
  if (filters.types?.length) where.type = { in: filters.types }
  if (filters.status) where.status = filters.status
  if (filters.statuses?.length) where.status = { in: filters.statuses }
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
            select: { id: true, firstName: true, lastName: true },
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
          select: { id: true, firstName: true, lastName: true },
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

    // Creer les schedules en transaction
    const schedules = await prisma.$transaction(
      employeeIds.map((employeeId) =>
        prisma.schedule.create({
          data: {
            employeeId,
            companyId: validated.companyId,
            teamId: validated.teamId ?? null,
            startDate: validated.startDate,
            endDate: validated.endDate,
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
            scheduleGroupId: scheduleGroupId ?? null,
            createdById: user.id,
          },
          include: {
            employee: {
              select: { id: true, firstName: true, lastName: true },
            },
            team: {
              select: { id: true, name: true },
            },
          },
        })
      )
    )

    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

    return { success: true, data: schedules as ScheduleWithRelations[] }
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
          select: { id: true, firstName: true, lastName: true },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    revalidatePath('/app/schedules')
    revalidatePath(`/app/schedules/${validated.id}`)
    revalidatePath('/app/dashboard')

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

  const user = authResult.user

  try {
    // Recuperer le schedule
    const schedule = await prisma.schedule.findUnique({
      where: { id },
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

    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

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

    // Supprimer tous les schedules du groupe
    const result = await prisma.schedule.deleteMany({
      where: { scheduleGroupId },
    })

    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

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
              select: { id: true, firstName: true, lastName: true },
            },
            team: {
              select: { id: true, name: true },
            },
          },
        })
      )
    )

    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

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
  status: 'DRAFT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
): Promise<CrudActionResult<ScheduleWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

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
          select: { id: true, firstName: true, lastName: true },
        },
        team: {
          select: { id: true, name: true },
        },
      },
    })

    revalidatePath('/app/schedules')
    revalidatePath(`/app/schedules/${id}`)
    revalidatePath('/app/dashboard')

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
          select: { id: true, firstName: true, lastName: true },
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
          select: { id: true, firstName: true, lastName: true },
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
