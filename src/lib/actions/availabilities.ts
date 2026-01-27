/**
 * Server Actions CRUD pour Availabilities (Indisponibilités)
 *
 * @description Actions avec RBAC multi-role pour gestion des indisponibilités.
 * - SYSTEM_ADMIN : Lecture cross-tenant uniquement (pas de modification)
 * - DIRECTOR : CRUD sur toute la company
 * - MANAGER : CRUD sur ses équipes uniquement
 * - EMPLOYEE : CRUD sur ses propres indisponibilités uniquement
 *
 * @ticket SP-401
 * @see Context7 - Next.js 15 Server Actions + Prisma transactions
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { UserRole, Prisma, AvailabilityType } from '@prisma/client'
import { auth } from '@/lib/auth'
import { validateData, handlePrismaError } from './crud-helpers'
import {
  createAvailabilitySchema,
  updateAvailabilitySchema,
  availabilityFiltersSchema,
  type CreateAvailabilityInput,
  type UpdateAvailabilityInput,
} from '@/lib/validations/availability'
import type { CrudActionResult, DeleteActionResult } from '@/types'

// ============================================================================
// Types
// ============================================================================

/**
 * Availability avec relations pour affichage
 */
export type AvailabilityWithRelations = {
  id: string
  startDate: Date
  endDate: Date
  startTime: string | null
  endTime: string | null
  type: AvailabilityType
  reason: string | null
  isRecurring: boolean
  recurrenceRule: Prisma.JsonValue
  employeeId: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  employee: {
    id: string
    firstName: string
    lastName: string
  }
}

/**
 * Résultat de liste paginée
 */
export type AvailabilitiesListResult = {
  availabilities: AvailabilityWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Filtres partiels (sans valeurs requises, elles seront remplies par défaut)
 */
export type AvailabilityFiltersInput = Partial<{
  companyId: string
  employeeId: string
  employeeIds: string[]
  type: AvailabilityType
  types: AvailabilityType[]
  startDate: Date
  endDate: Date
  isRecurring: boolean
  page: number
  limit: number
  sortBy: 'startDate' | 'endDate' | 'createdAt' | 'type'
  sortOrder: 'asc' | 'desc'
}>

/**
 * Utilisateur authentifié avec contexte RBAC
 */
interface AuthenticatedUser {
  id: string
  role: UserRole
  companyId: string | null
  employeeId: string | null
  managedTeamIds: string[]
}

/**
 * Résultat de vérification d'accès
 */
type AccessCheckResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string }

// ============================================================================
// Fonctions d'authentification et RBAC
// ============================================================================

/**
 * Récupère l'utilisateur authentifié avec son contexte RBAC
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

    // Récupérer l'employeeId si existe
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
 * Vérifie si l'utilisateur peut accéder à une availability (lecture)
 */
async function canAccessAvailability(
  user: AuthenticatedUser,
  availability: { employeeId: string; companyId: string }
): Promise<boolean> {
  // SYSTEM_ADMIN : lecture cross-tenant
  if (user.role === 'SYSTEM_ADMIN') return true

  // Doit être dans la même company
  if (user.companyId !== availability.companyId) return false

  // DIRECTOR : accès à toute la company
  if (user.role === 'DIRECTOR') return true

  // MANAGER : accès aux équipes qu'il gère
  if (user.role === 'MANAGER') {
    const emp = await prisma.employee.findUnique({
      where: { id: availability.employeeId },
      select: { teamId: true },
    })
    if (emp?.teamId && user.managedTeamIds.includes(emp.teamId)) {
      return true
    }
    return false
  }

  // EMPLOYEE : accès uniquement à ses propres availabilities
  if (user.role === 'EMPLOYEE') {
    return user.employeeId === availability.employeeId
  }

  return false
}

/**
 * Vérifie si l'utilisateur peut modifier/supprimer une availability
 */
async function canModifyAvailability(
  user: AuthenticatedUser,
  availability: { employeeId: string; companyId: string }
): Promise<boolean> {
  // SYSTEM_ADMIN : lecture seule, pas de modification
  if (user.role === 'SYSTEM_ADMIN') return false

  // EMPLOYEE : peut modifier ses propres availabilities
  if (user.role === 'EMPLOYEE') {
    return user.employeeId === availability.employeeId
  }

  // DIRECTOR et MANAGER : peuvent modifier selon leurs accès
  return canAccessAvailability(user, availability)
}

/**
 * Construit la clause WHERE Prisma selon le rôle et les filtres
 */
function buildWhereClause(
  user: AuthenticatedUser,
  filters: AvailabilityFiltersInput
): Prisma.AvailabilityWhereInput {
  const where: Prisma.AvailabilityWhereInput = {}

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

  // EMPLOYEE : uniquement ses availabilities
  if (user.role === 'EMPLOYEE') {
    if (user.employeeId) {
      where.employeeId = user.employeeId
    } else {
      return { id: 'impossible' }
    }
  }

  // MANAGER : uniquement les équipes qu'il gère
  if (user.role === 'MANAGER') {
    if (user.managedTeamIds.length > 0) {
      where.employee = { teamId: { in: user.managedTeamIds } }
    } else {
      return { id: 'impossible' }
    }
  }

  // Filtres additionnels
  if (filters.employeeId) where.employeeId = filters.employeeId
  if (filters.employeeIds?.length)
    where.employeeId = { in: filters.employeeIds }
  if (filters.type) where.type = filters.type
  if (filters.types?.length) where.type = { in: filters.types }
  if (filters.isRecurring !== undefined) where.isRecurring = filters.isRecurring

  // Filtre par période
  if (filters.startDate || filters.endDate) {
    const andConditions: Prisma.AvailabilityWhereInput[] = []
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

  return where
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Récupère la liste des availabilities avec filtres et pagination
 */
export async function getAvailabilities(
  filters: AvailabilityFiltersInput = {}
): Promise<CrudActionResult<AvailabilitiesListResult>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Valider les filtres et appliquer les défauts
    const filtersValidation = validateData(availabilityFiltersSchema, {
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

    // Requête avec pagination
    const [availabilities, total] = await prisma.$transaction([
      prisma.availability.findMany({
        where,
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { [sortBy]: sortOrder } as Record<string, 'asc' | 'desc'>,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.availability.count({ where }),
    ])

    return {
      success: true,
      data: {
        availabilities: availabilities as AvailabilityWithRelations[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('[getAvailabilities] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Récupère une availability par son ID
 */
export async function getAvailabilityById(
  id: string
): Promise<CrudActionResult<AvailabilityWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    const availability = await prisma.availability.findUnique({
      where: { id },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    if (!availability) {
      return { success: false, error: 'Indisponibilité non trouvée' }
    }

    // Vérifier les permissions
    const canAccess = await canAccessAvailability(user, availability)

    if (!canAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    return { success: true, data: availability as AvailabilityWithRelations }
  } catch (error) {
    console.error('[getAvailabilityById] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Crée une availability
 */
export async function createAvailability(
  input: CreateAvailabilityInput
): Promise<CrudActionResult<AvailabilityWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  // SYSTEM_ADMIN ne peut pas créer
  if (user.role === 'SYSTEM_ADMIN') {
    return { success: false, error: 'Action non autorisée pour ce rôle' }
  }

  try {
    // Valider les données
    const validation = validateData(createAvailabilitySchema, input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const validated = validation.data

    // Vérifier l'accès à la company
    if (user.companyId !== validated.companyId) {
      return { success: false, error: 'Accès non autorisé à cette entreprise' }
    }

    // Vérifier que l'employé existe et appartient à la company
    const employee = await prisma.employee.findUnique({
      where: { id: validated.employeeId },
      select: {
        id: true,
        companyId: true,
        teamId: true,
        firstName: true,
        lastName: true,
      },
    })

    if (!employee) {
      return { success: false, error: 'Employé non trouvé' }
    }

    if (employee.companyId !== validated.companyId) {
      return {
        success: false,
        error: 'Employé non valide pour cette entreprise',
      }
    }

    // Vérifier les permissions selon le rôle
    if (user.role === 'EMPLOYEE') {
      // EMPLOYEE ne peut créer que pour lui-même
      if (user.employeeId !== validated.employeeId) {
        return {
          success: false,
          error: 'Vous ne pouvez créer des indisponibilités que pour vous-même',
        }
      }
    } else if (user.role === 'MANAGER') {
      // MANAGER ne peut créer que pour les employés de ses équipes
      if (!employee.teamId || !user.managedTeamIds.includes(employee.teamId)) {
        return {
          success: false,
          error: `Vous ne pouvez pas gérer l'employé ${employee.firstName} ${employee.lastName}`,
        }
      }
    }
    // DIRECTOR peut créer pour tous les employés de la company

    // Créer l'availability
    const availability = await prisma.availability.create({
      data: {
        employeeId: validated.employeeId,
        companyId: validated.companyId,
        startDate: validated.startDate,
        endDate: validated.endDate,
        startTime: validated.startTime ?? null,
        endTime: validated.endTime ?? null,
        type: validated.type,
        reason: validated.reason ?? null,
        isRecurring: validated.isRecurring,
        recurrenceRule: validated.recurrenceRule ?? Prisma.JsonNull,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    })

    revalidatePath('/app/availabilities')
    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

    return {
      success: true,
      data: availability as AvailabilityWithRelations,
    }
  } catch (error) {
    console.error('[createAvailability] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Met à jour une availability
 */
export async function updateAvailability(
  input: UpdateAvailabilityInput
): Promise<CrudActionResult<AvailabilityWithRelations>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Valider les données
    const validation = validateData(updateAvailabilitySchema, input)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const validated = validation.data

    // Récupérer l'availability existante
    const existing = await prisma.availability.findUnique({
      where: { id: validated.id },
    })

    if (!existing) {
      return { success: false, error: 'Indisponibilité non trouvée' }
    }

    // Vérifier les permissions de modification
    const canModify = await canModifyAvailability(user, existing)

    if (!canModify) {
      return { success: false, error: 'Modification non autorisée' }
    }

    // Mettre à jour
    const updated = await prisma.availability.update({
      where: { id: validated.id },
      data: {
        ...(validated.startDate && { startDate: validated.startDate }),
        ...(validated.endDate && { endDate: validated.endDate }),
        ...(validated.startTime !== undefined && {
          startTime: validated.startTime,
        }),
        ...(validated.endTime !== undefined && { endTime: validated.endTime }),
        ...(validated.type && { type: validated.type }),
        ...(validated.reason !== undefined && { reason: validated.reason }),
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
      },
    })

    revalidatePath('/app/availabilities')
    revalidatePath(`/app/availabilities/${validated.id}`)
    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

    return { success: true, data: updated as AvailabilityWithRelations }
  } catch (error) {
    console.error('[updateAvailability] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Supprime une availability
 */
export async function deleteAvailability(
  id: string
): Promise<DeleteActionResult> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Récupérer l'availability
    const availability = await prisma.availability.findUnique({
      where: { id },
    })

    if (!availability) {
      return { success: false, error: 'Indisponibilité non trouvée' }
    }

    // Vérifier les permissions
    const canModify = await canModifyAvailability(user, availability)

    if (!canModify) {
      return { success: false, error: 'Suppression non autorisée' }
    }

    await prisma.availability.delete({ where: { id } })

    revalidatePath('/app/availabilities')
    revalidatePath('/app/schedules')
    revalidatePath('/app/dashboard')

    return { success: true }
  } catch (error) {
    console.error('[deleteAvailability] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Récupère les availabilities pour un employé spécifique (pour calendrier)
 */
export async function getEmployeeAvailabilities(
  employeeId: string,
  startDate: Date,
  endDate: Date
): Promise<CrudActionResult<AvailabilityWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Vérifier que l'employé existe et est accessible
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true, teamId: true },
    })

    if (!employee) {
      return { success: false, error: 'Employé non trouvé' }
    }

    // Vérifier l'accès
    const canAccess = await canAccessAvailability(user, {
      employeeId,
      companyId: employee.companyId,
    })

    if (!canAccess) {
      return { success: false, error: 'Accès non autorisé' }
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        employeeId,
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { startDate: 'asc' },
    })

    return {
      success: true,
      data: availabilities as AvailabilityWithRelations[],
    }
  } catch (error) {
    console.error('[getEmployeeAvailabilities] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Récupère les availabilities pour plusieurs employés (pour vue équipe)
 */
export async function getTeamAvailabilities(
  teamId: string,
  startDate: Date,
  endDate: Date
): Promise<CrudActionResult<AvailabilityWithRelations[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Vérifier que l'équipe existe
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, companyId: true },
    })

    if (!team) {
      return { success: false, error: 'Équipe non trouvée' }
    }

    // Vérifier l'accès
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

    const availabilities = await prisma.availability.findMany({
      where: {
        employee: { teamId },
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { employee: { lastName: 'asc' } }],
    })

    return {
      success: true,
      data: availabilities as AvailabilityWithRelations[],
    }
  } catch (error) {
    console.error('[getTeamAvailabilities] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

/**
 * Compte les availabilities par type pour une période
 */
export async function getAvailabilitiesStats(
  companyId: string,
  startDate: Date,
  endDate: Date
): Promise<CrudActionResult<Record<AvailabilityType, number>>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  // Vérifier l'accès à la company
  if (user.role !== 'SYSTEM_ADMIN' && user.companyId !== companyId) {
    return { success: false, error: 'Accès non autorisé' }
  }

  // EMPLOYEE ne peut pas voir les stats globales
  if (user.role === 'EMPLOYEE') {
    return { success: false, error: 'Accès non autorisé' }
  }

  try {
    const stats = await prisma.availability.groupBy({
      by: ['type'],
      where: {
        companyId,
        endDate: { gte: startDate },
        startDate: { lte: endDate },
      },
      _count: { id: true },
    })

    // Initialiser tous les types à 0
    const result: Record<AvailabilityType, number> = {
      UNAVAILABLE: 0,
      PREFERRED: 0,
      VACATION: 0,
      SICK: 0,
      TRAINING: 0,
      OTHER: 0,
    }

    // Remplir avec les valeurs réelles
    for (const stat of stats) {
      result[stat.type] = stat._count.id
    }

    return { success: true, data: result }
  } catch (error) {
    console.error('[getAvailabilitiesStats] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

// ============================================================================
// Récupération des indisponibilités pour le calendrier (SP-402)
// ============================================================================

/**
 * Availability avec employé pour affichage calendrier
 */
export type AvailabilityWithEmployee = {
  id: string
  startDate: Date
  endDate: Date
  startTime: string | null
  endTime: string | null
  type: AvailabilityType
  reason: string | null
  isRecurring: boolean
  recurrenceRule: Prisma.JsonValue
  employeeId: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  employee: {
    id: string
    firstName: string
    lastName: string
  }
}

/**
 * Récupère les indisponibilités pour une période donnée (pour overlay calendrier)
 *
 * RBAC:
 * - EMPLOYEE : ses propres indisponibilités uniquement
 * - MANAGER : indisponibilités de ses équipes
 * - DIRECTOR : toutes les indisponibilités de la company
 * - SYSTEM_ADMIN : lecture cross-tenant
 *
 * @ticket SP-402
 */
export async function getAvailabilitiesForCalendar(
  companyId: string,
  startDate: Date,
  endDate: Date,
  teamId?: string,
  employeeIds?: string[]
): Promise<CrudActionResult<AvailabilityWithEmployee[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  const user = authResult.user

  try {
    // Construire la clause WHERE de base
    const where: Prisma.AvailabilityWhereInput = {
      // Chevauchement de dates : l'indispo commence avant la fin ET finit après le début
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    }

    // Filtrer par company selon le rôle
    if (user.role === 'SYSTEM_ADMIN') {
      // SYSTEM_ADMIN : cross-tenant avec companyId obligatoire
      where.companyId = companyId
    } else {
      // Autres rôles : uniquement leur company
      if (!user.companyId || user.companyId !== companyId) {
        return {
          success: false,
          error: "Vous n'avez pas accès à cette entreprise",
        }
      }
      where.companyId = user.companyId
    }

    // Filtrer selon le rôle
    if (user.role === 'EMPLOYEE') {
      // EMPLOYEE : uniquement ses propres indisponibilités
      if (!user.employeeId) {
        return { success: true, data: [] }
      }
      where.employeeId = user.employeeId
    } else if (user.role === 'MANAGER') {
      // MANAGER : indisponibilités de ses équipes
      if (user.managedTeamIds.length === 0) {
        return { success: true, data: [] }
      }

      // Récupérer les employés des équipes gérées
      const teamEmployees = await prisma.employee.findMany({
        where: {
          teamId: { in: user.managedTeamIds },
        },
        select: { id: true },
      })

      const managedEmployeeIds = teamEmployees.map((e) => e.id)

      if (managedEmployeeIds.length === 0) {
        return { success: true, data: [] }
      }

      // Appliquer le filtre employeeIds si fourni (intersection)
      if (employeeIds && employeeIds.length > 0) {
        const filteredIds = employeeIds.filter((id) =>
          managedEmployeeIds.includes(id)
        )
        if (filteredIds.length === 0) {
          return { success: true, data: [] }
        }
        where.employeeId = { in: filteredIds }
      } else {
        where.employeeId = { in: managedEmployeeIds }
      }
    } else {
      // DIRECTOR : toutes les indisponibilités de la company
      // Filtrer par employeeIds si fourni
      if (employeeIds && employeeIds.length > 0) {
        where.employeeId = { in: employeeIds }
      }
    }

    // Filtrer par équipe si spécifié
    if (teamId) {
      const teamEmployees = await prisma.employee.findMany({
        where: { teamId },
        select: { id: true },
      })

      const teamEmployeeIds = teamEmployees.map((e) => e.id)

      if (teamEmployeeIds.length === 0) {
        return { success: true, data: [] }
      }

      // Intersection avec le filtre existant
      if (where.employeeId && typeof where.employeeId === 'object' && 'in' in where.employeeId) {
        const existingIds = where.employeeId.in as string[]
        const intersection = existingIds.filter((id) =>
          teamEmployeeIds.includes(id)
        )
        if (intersection.length === 0) {
          return { success: true, data: [] }
        }
        where.employeeId = { in: intersection }
      } else if (!where.employeeId) {
        where.employeeId = { in: teamEmployeeIds }
      }
    }

    // Récupérer les indisponibilités (limité à 200 pour performance)
    const availabilities = await prisma.availability.findMany({
      where,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { employee: { lastName: 'asc' } }],
      take: 200,
    })

    return {
      success: true,
      data: availabilities as AvailabilityWithEmployee[],
    }
  } catch (error) {
    console.error('[getAvailabilitiesForCalendar] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}

// ============================================================================
// Détection de conflits (SP-400)
// ============================================================================

/**
 * Types d'indisponibilité considérés comme "hard" (bloquants)
 */
const HARD_CONFLICT_TYPES: AvailabilityType[] = [
  'VACATION',
  'SICK',
  'UNAVAILABLE',
]

/**
 * Availability avec informations employé pour affichage des conflits
 */
export type AvailabilityConflict = AvailabilityWithRelations & {
  isHardConflict: boolean
}

/**
 * Résultat de la vérification de conflits
 */
export type ConflictCheckResult = {
  hasConflict: boolean
  hasHardConflict: boolean
  hasSoftConflict: boolean
  conflicts: AvailabilityConflict[]
  hardConflicts: AvailabilityConflict[]
  softConflicts: AvailabilityConflict[]
}

/**
 * Vérifie les conflits entre une période et les indisponibilités d'employés
 *
 * @param employeeIds - Liste des IDs des employés à vérifier
 * @param startDate - Date de début de la période à vérifier
 * @param endDate - Date de fin de la période à vérifier
 * @param startTime - Heure de début (optionnelle, format HH:mm)
 * @param endTime - Heure de fin (optionnelle, format HH:mm)
 * @param excludeAvailabilityId - ID d'une availability à exclure (pour l'édition)
 *
 * @returns Résultat avec conflits séparés en hard/soft
 */
export async function checkAvailabilityConflicts(
  employeeIds: string[],
  startDate: Date,
  endDate: Date,
  startTime?: string | null,
  endTime?: string | null,
  excludeAvailabilityId?: string
): Promise<CrudActionResult<ConflictCheckResult>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return { success: false, error: authResult.error }
  }

  if (!employeeIds.length) {
    return {
      success: true,
      data: {
        hasConflict: false,
        hasHardConflict: false,
        hasSoftConflict: false,
        conflicts: [],
        hardConflicts: [],
        softConflicts: [],
      },
    }
  }

  try {
    // Récupérer toutes les indisponibilités qui chevauchent la période
    const whereClause: Prisma.AvailabilityWhereInput = {
      employeeId: { in: employeeIds },
      // Chevauchement de dates : l'indispo commence avant la fin ET finit après le début
      startDate: { lte: endDate },
      endDate: { gte: startDate },
    }

    // Exclure une availability spécifique (pour l'édition)
    if (excludeAvailabilityId) {
      whereClause.id = { not: excludeAvailabilityId }
    }

    const availabilities = await prisma.availability.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { employee: { lastName: 'asc' } }],
    })

    // Filtrer les conflits en tenant compte des heures si spécifiées
    const filteredAvailabilities = availabilities.filter((avail) => {
      // Si l'indisponibilité est sur toute la journée, c'est toujours un conflit
      if (!avail.startTime || !avail.endTime) {
        return true
      }

      // Si le créneau à créer est sur toute la journée, c'est toujours un conflit
      if (!startTime || !endTime) {
        return true
      }

      // Vérifier le chevauchement des heures
      // L'indisponibilité commence avant la fin du créneau ET finit après le début
      return avail.startTime < endTime && avail.endTime > startTime
    })

    // Séparer en hard et soft conflicts
    const conflicts: AvailabilityConflict[] = filteredAvailabilities.map(
      (avail) => ({
        ...avail,
        isHardConflict: HARD_CONFLICT_TYPES.includes(avail.type),
      })
    ) as AvailabilityConflict[]

    const hardConflicts = conflicts.filter((c) => c.isHardConflict)
    const softConflicts = conflicts.filter((c) => !c.isHardConflict)

    return {
      success: true,
      data: {
        hasConflict: conflicts.length > 0,
        hasHardConflict: hardConflicts.length > 0,
        hasSoftConflict: softConflicts.length > 0,
        conflicts,
        hardConflicts,
        softConflicts,
      },
    }
  } catch (error) {
    console.error('[checkAvailabilityConflicts] Error:', error)
    const prismaError = handlePrismaError(error)
    return { success: false, error: prismaError.error }
  }
}
