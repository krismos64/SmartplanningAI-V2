/**
 * Server Actions CRUD pour Employees
 *
 * @description Actions avec RBAC multi-role pour gestion des employes.
 * - SUPER_ADMIN : Acces a tous les employes de toutes les companies
 * - DIRECTOR : Acces uniquement aux employes de sa company
 * - MANAGER : Acces uniquement aux employes de ses equipes
 * - EMPLOYEE : Aucun acces
 *
 * @ticket SP-152
 * @see Context7 - Next.js 15 Server Actions + Prisma dynamic WHERE
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
} from './crud-utils'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeFiltersSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type EmployeeFilters,
  type EmployeeWithCounts,
} from '@/lib/validations/employee'
import type {
  CrudActionResult,
  DeleteActionResult,
  ListActionResult,
  ListQueryParams,
} from '@/types'

// ============================================================================
// Types internes
// ============================================================================

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
 * Roles autorises pour acceder aux employees (pas EMPLOYEE)
 */
const ALLOWED_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER']

/**
 * Verifie l'authentification et recupere le contexte RBAC complet
 *
 * Pour un MANAGER, recupere son employeeId et ses equipes gerees.
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

    const role = session.user.role as UserRole

    // Verifie que le role est autorise
    if (!ALLOWED_ROLES.includes(role)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    const userId = session.user.id
    const companyId = session.user.companyId ?? null

    // Pour un MANAGER, on doit recuperer son employeeId et ses equipes gerees
    let employeeId: string | null = null
    let managedTeamIds: string[] = []

    if (role === 'MANAGER') {
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

      // Si le manager n'a pas d'equipes, il ne peut pas voir d'employes
      if (managedTeamIds.length === 0) {
        return {
          success: false,
          error: "Vous ne gérez aucune équipe",
        }
      }
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
      error: 'Erreur de verification des permissions',
    }
  }
}

/**
 * Construit la clause WHERE Prisma selon le role utilisateur
 *
 * - SUPER_ADMIN : pas de filtre (tous les employes)
 * - DIRECTOR : filtre par companyId
 * - MANAGER : filtre par teamId IN managedTeamIds
 */
function buildRBACWhereClause(
  user: AuthenticatedUser,
  filters: EmployeeFilters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  // Filtre RBAC selon le role
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      // SUPER_ADMIN : peut filtrer par companyId optionnellement
      if (filters.companyId) {
        where.companyId = filters.companyId
      }
      break

    case 'DIRECTOR':
      // DIRECTOR : uniquement sa company
      if (!user.companyId) {
        throw new Error('Utilisateur sans company associée')
      }
      where.companyId = user.companyId
      break

    case 'MANAGER':
      // MANAGER : uniquement ses equipes
      where.teamId = { in: user.managedTeamIds }
      break
  }

  // Filtres additionnels (communs a tous les roles)
  if (filters.teamId) {
    // Pour MANAGER, verifie que l'equipe est dans ses equipes gerees
    if (user.role === 'MANAGER') {
      if (!user.managedTeamIds.includes(filters.teamId)) {
        throw new Error("Vous n'avez pas accès à cette équipe")
      }
    }
    where.teamId = filters.teamId
  }

  if (filters.department) {
    where.department = filters.department
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive
  }

  if (filters.skill) {
    where.skills = { has: filters.skill }
  }

  // Recherche textuelle
  if (filters.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { jobTitle: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return where
}

/**
 * Verifie que l'utilisateur a acces a un employe specifique
 */
async function canAccessEmployee(
  user: AuthenticatedUser,
  employeeId: string
): Promise<{ hasAccess: boolean; employee?: EmployeeWithCounts }> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          schedules: true,
          leaveRequests: true,
        },
      },
    },
  })

  if (!employee) {
    return { hasAccess: false }
  }

  // Verification selon le role
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return { hasAccess: true, employee }

    case 'DIRECTOR':
      if (employee.companyId !== user.companyId) {
        return { hasAccess: false }
      }
      return { hasAccess: true, employee }

    case 'MANAGER':
      if (!employee.teamId || !user.managedTeamIds.includes(employee.teamId)) {
        return { hasAccess: false }
      }
      return { hasAccess: true, employee }

    default:
      return { hasAccess: false }
  }
}

// ============================================================================
// LIST - Recuperer les Employees avec pagination
// ============================================================================

/**
 * Liste les Employees avec pagination, tri et filtres RBAC
 *
 * @param params - Parametres de pagination et tri
 * @param filters - Filtres optionnels
 * @returns Liste paginee des Employees selon le role
 */
export async function listEmployees(
  params: ListQueryParams = {},
  filters: EmployeeFilters = {}
): Promise<ListActionResult<EmployeeWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Valide les filtres
    const filtersValidation = validateData(employeeFiltersSchema, filters)
    const validFilters = filtersValidation.success ? filtersValidation.data : {}

    // Construit la clause WHERE avec RBAC
    const where = buildRBACWhereClause(user, validFilters)

    // Pagination Prisma
    const { skip, take, orderBy } = getPaginationParams(params)

    // Requetes paralleles : count + data
    const [total, employees] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              schedules: true,
              leaveRequests: true,
            },
          },
        },
      }),
    ])

    return {
      success: true,
      data: formatPaginatedResult(employees, total, params),
    }
  } catch (error) {
    console.error('[listEmployees] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET - Recuperer un Employee par ID
// ============================================================================

/**
 * Recupere les details d'un Employee
 *
 * @param id - ID de l'Employee
 * @returns Details complets de l'Employee
 */
export async function getEmployee(
  id: string
): Promise<CrudActionResult<EmployeeWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    const { hasAccess, employee } = await canAccessEmployee(user, id)

    if (!hasAccess || !employee) {
      return {
        success: false,
        error: 'Employé non trouvé ou accès non autorisé',
      }
    }

    return {
      success: true,
      data: employee,
    }
  } catch (error) {
    console.error('[getEmployee] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// CREATE - Creer un nouvel Employee
// ============================================================================

/**
 * Cree un nouvel Employee
 *
 * - SUPER_ADMIN : peut creer dans n'importe quelle company
 * - DIRECTOR : peut creer dans sa company uniquement
 * - MANAGER : peut creer uniquement dans ses equipes (teamId obligatoire)
 *
 * @param data - Donnees du formulaire
 * @returns Employee cree
 */
export async function createEmployee(
  data: CreateEmployeeInput
): Promise<CrudActionResult<EmployeeWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Validation Zod
    const validation = validateData(createEmployeeSchema, data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const validData = validation.data

    // Verification RBAC pour la creation
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        // Peut creer n'importe ou
        break

      case 'DIRECTOR':
        // Doit creer dans sa company
        if (!user.companyId) {
          return {
            success: false,
            error: 'Utilisateur sans company associée',
          }
        }
        if (validData.companyId !== user.companyId) {
          return {
            success: false,
            error: "Vous ne pouvez créer des employés que dans votre entreprise",
          }
        }
        break

      case 'MANAGER':
        // Doit creer dans une de ses equipes
        if (!validData.teamId) {
          return {
            success: false,
            error: "Vous devez affecter l'employé à une de vos équipes",
            field: 'teamId',
          }
        }
        if (!user.managedTeamIds.includes(validData.teamId)) {
          return {
            success: false,
            error: "Vous ne pouvez créer des employés que dans vos équipes",
            field: 'teamId',
          }
        }
        // Verifie que l'equipe appartient a la bonne company
        const team = await prisma.team.findUnique({
          where: { id: validData.teamId },
          select: { companyId: true },
        })
        if (!team) {
          return {
            success: false,
            error: "Équipe non trouvée",
            field: 'teamId',
          }
        }
        // Force la companyId a celle de l'equipe
        validData.companyId = team.companyId
        break
    }

    // Creation en base
    const employee = await prisma.employee.create({
      data: {
        firstName: validData.firstName,
        lastName: validData.lastName,
        jobTitle: validData.jobTitle || null,
        department: validData.department || null,
        phone: validData.phone || null,
        hireDate: validData.hireDate ? new Date(validData.hireDate) : null,
        weeklyHours: validData.weeklyHours ?? 35,
        skills: validData.skills ?? [],
        companyId: validData.companyId,
        teamId: validData.teamId || null,
        ...(validData.userId && { userId: validData.userId }),
        isActive: validData.isActive ?? true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            leaveRequests: true,
          },
        },
      },
    })

    // Revalide le cache
    revalidatePath('/dashboard/employees')

    return {
      success: true,
      data: employee,
    }
  } catch (error) {
    console.error('[createEmployee] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
      field: prismaError.field,
    }
  }
}

// ============================================================================
// UPDATE - Modifier un Employee
// ============================================================================

/**
 * Met a jour un Employee existant
 *
 * @param data - Donnees avec ID obligatoire
 * @returns Employee mis a jour
 */
export async function updateEmployee(
  data: UpdateEmployeeInput
): Promise<CrudActionResult<EmployeeWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Validation Zod
    const validation = validateData(updateEmployeeSchema, data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: validation.field,
      }
    }

    const { id, ...updateData } = validation.data

    // Verifie l'acces a l'employe
    const { hasAccess, employee: existing } = await canAccessEmployee(user, id)

    if (!hasAccess || !existing) {
      return {
        success: false,
        error: 'Employé non trouvé ou accès non autorisé',
      }
    }

    // Pour un MANAGER, verifie que si teamId change, c'est vers une de ses equipes
    if (user.role === 'MANAGER' && updateData.teamId) {
      if (!user.managedTeamIds.includes(updateData.teamId)) {
        return {
          success: false,
          error: "Vous ne pouvez affecter l'employé qu'à vos équipes",
          field: 'teamId',
        }
      }
    }

    // Mise a jour en base
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(updateData.firstName && { firstName: updateData.firstName }),
        ...(updateData.lastName && { lastName: updateData.lastName }),
        ...(updateData.jobTitle !== undefined && {
          jobTitle: updateData.jobTitle || null,
        }),
        ...(updateData.department !== undefined && {
          department: updateData.department || null,
        }),
        ...(updateData.phone !== undefined && {
          phone: updateData.phone || null,
        }),
        ...(updateData.hireDate !== undefined && {
          hireDate: updateData.hireDate ? new Date(updateData.hireDate) : null,
        }),
        ...(updateData.weeklyHours !== undefined && {
          weeklyHours: updateData.weeklyHours,
        }),
        ...(updateData.skills !== undefined && { skills: updateData.skills }),
        ...(updateData.teamId !== undefined && {
          teamId: updateData.teamId || null,
        }),
        ...(updateData.isActive !== undefined && {
          isActive: updateData.isActive,
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            leaveRequests: true,
          },
        },
      },
    })

    // Revalide le cache
    revalidatePath('/dashboard/employees')
    revalidatePath(`/dashboard/employees/${id}`)

    return {
      success: true,
      data: employee,
    }
  } catch (error) {
    console.error('[updateEmployee] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
      field: prismaError.field,
    }
  }
}

// ============================================================================
// DELETE - Supprimer un Employee
// ============================================================================

/**
 * Supprime un Employee
 *
 * ATTENTION : Seuls SUPER_ADMIN et DIRECTOR peuvent supprimer.
 * MANAGER peut seulement desactiver (soft delete via toggleEmployeeStatus).
 *
 * @param id - ID de l'Employee a supprimer
 * @returns Succes ou erreur
 */
export async function deleteEmployee(id: string): Promise<DeleteActionResult> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  // MANAGER ne peut pas supprimer
  if (user.role === 'MANAGER') {
    return {
      success: false,
      error: 'Vous ne pouvez pas supprimer des employés. Désactivez-les à la place.',
    }
  }

  try {
    // Verifie l'acces
    const { hasAccess, employee } = await canAccessEmployee(user, id)

    if (!hasAccess || !employee) {
      return {
        success: false,
        error: 'Employé non trouvé ou accès non autorisé',
      }
    }

    // Verifie s'il y a des dependances
    if (employee._count && employee._count.schedules > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : ${employee._count.schedules} planning(s) associé(s). Désactivez l'employé à la place.`,
      }
    }

    // Suppression
    await prisma.employee.delete({
      where: { id },
    })

    // Revalide le cache
    revalidatePath('/dashboard/employees')

    return { success: true }
  } catch (error) {
    console.error('[deleteEmployee] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// TOGGLE STATUS - Activer/Desactiver un Employee
// ============================================================================

/**
 * Active ou desactive un Employee (soft delete pour MANAGER)
 *
 * @param id - ID de l'Employee
 * @param isActive - Nouveau statut
 * @returns Employee mis a jour
 */
export async function toggleEmployeeStatus(
  id: string,
  isActive: boolean
): Promise<CrudActionResult<EmployeeWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Verifie l'acces
    const { hasAccess, employee: existing } = await canAccessEmployee(user, id)

    if (!hasAccess || !existing) {
      return {
        success: false,
        error: 'Employé non trouvé ou accès non autorisé',
      }
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { isActive },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            leaveRequests: true,
          },
        },
      },
    })

    revalidatePath('/dashboard/employees')
    revalidatePath(`/dashboard/employees/${id}`)

    return {
      success: true,
      data: employee,
    }
  } catch (error) {
    console.error('[toggleEmployeeStatus] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET EMPLOYEES BY TEAM - Pour les selects
// ============================================================================

/**
 * Recupere les employes d'une equipe (pour les selects)
 *
 * @param teamId - ID de l'equipe
 * @returns Liste des employes actifs de l'equipe
 */
export async function getEmployeesByTeam(
  teamId: string
): Promise<CrudActionResult<Pick<EmployeeWithCounts, 'id' | 'firstName' | 'lastName'>[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Verifie l'acces a l'equipe
    if (user.role === 'MANAGER' && !user.managedTeamIds.includes(teamId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette équipe",
      }
    }

    if (user.role === 'DIRECTOR') {
      // Verifie que l'equipe appartient a sa company
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { companyId: true },
      })
      if (!team || team.companyId !== user.companyId) {
        return {
          success: false,
          error: "Vous n'avez pas accès à cette équipe",
        }
      }
    }

    const employees = await prisma.employee.findMany({
      where: {
        teamId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { lastName: 'asc' },
    })

    return {
      success: true,
      data: employees,
    }
  } catch (error) {
    console.error('[getEmployeesByTeam] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET TEAMS FOR SELECT - Pour les formulaires
// ============================================================================

/**
 * Recupere les equipes accessibles pour les selects
 *
 * @returns Liste des equipes selon le role
 */
export async function getTeamsForSelect(): Promise<
  CrudActionResult<{ id: string; name: string }[]>
> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    switch (user.role) {
      case 'SYSTEM_ADMIN':
        // Toutes les equipes
        break

      case 'DIRECTOR':
        // Equipes de sa company
        where.companyId = user.companyId
        break

      case 'MANAGER':
        // Seulement ses equipes gerees
        where.id = { in: user.managedTeamIds }
        break
    }

    const teams = await prisma.team.findMany({
      where,
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    })

    return {
      success: true,
      data: teams,
    }
  } catch (error) {
    console.error('[getTeamsForSelect] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}
