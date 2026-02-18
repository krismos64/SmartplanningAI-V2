/**
 * Server Actions CRUD pour Employees
 *
 * @description Actions avec RBAC multi-role pour gestion des employes.
 * - SUPER_ADMIN : Acces a tous les employes de toutes les companies
 * - DIRECTOR : Acces uniquement aux employes de sa company
 * - MANAGER : Acces uniquement aux employes de ses equipes
 * - EMPLOYEE : Aucun acces
 *
 * @ticket SP-152, SP-439
 * @see Context7 - Next.js 15 Server Actions + Prisma dynamic WHERE
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { UserRole, type Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
} from './crud-helpers'
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
import { logAuditAction } from '@/lib/services/audit'
import { syncEmployeeCountToStripe } from '@/lib/services/stripe'

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

    const role = session.user.role

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
          error: 'Vous ne gérez aucune équipe',
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
): Record<string, unknown> {
  const where: Record<string, unknown> = {}

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
            error:
              'Vous ne pouvez créer des employés que dans votre entreprise',
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
            error: 'Vous ne pouvez créer des employés que dans vos équipes',
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
            error: 'Équipe non trouvée',
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

    // SP-439 : Sync Stripe quantity (fire-and-forget)
    syncEmployeeCountToStripe(validData.companyId).catch((err) => {
      console.error('[SP-439] Stripe sync failed after employee creation:', err)
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      userId: user.id,
      companyId: validData.companyId,
      details: {
        firstName: validData.firstName,
        lastName: validData.lastName,
        teamId: validData.teamId || null,
      },
    }).catch(console.error)

    // Revalide le cache
    revalidatePath('/app/dashboard/employees')

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

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'EMPLOYEE',
      entityId: id,
      userId: user.id,
      companyId: existing.companyId,
      details: updateData as unknown as Prisma.InputJsonValue,
    }).catch(console.error)

    // Revalide le cache
    revalidatePath('/app/dashboard/employees')
    revalidatePath(`/app/dashboard/employees/${id}`)

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
      error:
        'Vous ne pouvez pas supprimer des employés. Désactivez-les à la place.',
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

    // SP-439 : Sync Stripe quantity (fire-and-forget)
    syncEmployeeCountToStripe(employee.companyId).catch((err) => {
      console.error('[SP-439] Stripe sync failed after employee deletion:', err)
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'EMPLOYEE',
      entityId: id,
      userId: user.id,
      companyId: employee.companyId,
      details: {
        firstName: employee.firstName,
        lastName: employee.lastName,
      },
    }).catch(console.error)

    // Revalide le cache
    revalidatePath('/app/dashboard/employees')

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

    // SP-439 : Sync Stripe quantity (fire-and-forget)
    syncEmployeeCountToStripe(existing.companyId).catch((err) => {
      console.error(
        '[SP-439] Stripe sync failed after employee status toggle:',
        err
      )
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'STATUS_CHANGE',
      entityType: 'EMPLOYEE',
      entityId: id,
      userId: user.id,
      companyId: existing.companyId,
      details: { from: !isActive, to: isActive },
    }).catch(console.error)

    revalidatePath('/app/dashboard/employees')
    revalidatePath(`/app/dashboard/employees/${id}`)

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
): Promise<
  CrudActionResult<Pick<EmployeeWithCounts, 'id' | 'firstName' | 'lastName'>[]>
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
export async function getEmployeesForSelect(): Promise<
  CrudActionResult<
    {
      id: string
      firstName: string
      lastName: string
      weeklyHours: number
      image?: string | null
    }[]
  >
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
    const where: Record<string, unknown> = { isActive: true }

    switch (user.role) {
      case 'SYSTEM_ADMIN':
        break

      case 'DIRECTOR':
        where.companyId = user.companyId
        break

      case 'MANAGER':
        where.teams = {
          some: {
            teamId: { in: user.managedTeamIds },
          },
        }
        break
    }

    const employees = await prisma.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        weeklyHours: true,
        user: {
          select: {
            image: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    })

    // Aplatir l'image du user vers l'employé
    const data = employees.map((emp) => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      weeklyHours: emp.weeklyHours,
      image: emp.user?.image ?? null,
    }))

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('[getEmployeesForSelect] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// BULK DELETE - Supprimer plusieurs Employees
// ============================================================================

/**
 * Resultat de la suppression en masse
 */
export interface BulkDeleteResult {
  deletedCount: number
  skippedNames: string[]
}

/**
 * Supprime plusieurs Employees en une seule operation
 *
 * ATTENTION : Seuls SUPER_ADMIN et DIRECTOR peuvent supprimer.
 * Les employes avec des schedules associes sont ignores.
 *
 * @param ids - IDs des Employees a supprimer
 * @returns Nombre supprimes + noms ignores
 */
export async function bulkDeleteEmployees(
  ids: string[]
): Promise<CrudActionResult<BulkDeleteResult>> {
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
      error:
        'Vous ne pouvez pas supprimer des employés. Désactivez-les à la place.',
    }
  }

  if (!ids.length) {
    return {
      success: false,
      error: 'Aucun employé sélectionné',
    }
  }

  try {
    // Recupere les employes avec leurs counts pour verifier l'acces et les dependances
    const employees = await prisma.employee.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyId: true,
        teamId: true,
        _count: {
          select: { schedules: true },
        },
      },
    })

    const toDelete: string[] = []
    const skippedNames: string[] = []
    const affectedCompanyIds = new Set<string>()

    for (const emp of employees) {
      // Verification RBAC
      let hasAccess = false
      switch (user.role) {
        case 'SYSTEM_ADMIN':
          hasAccess = true
          break
        case 'DIRECTOR':
          hasAccess = emp.companyId === user.companyId
          break
      }

      if (!hasAccess) {
        skippedNames.push(`${emp.firstName} ${emp.lastName}`)
        continue
      }

      toDelete.push(emp.id)
      affectedCompanyIds.add(emp.companyId)
    }

    // Suppression en batch : d'abord les dependances, puis les employes
    if (toDelete.length > 0) {
      await prisma.$transaction([
        prisma.team.updateMany({
          where: { managerId: { in: toDelete } },
          data: { managerId: null },
        }),
        prisma.leaveRequest.deleteMany({
          where: { employeeId: { in: toDelete } },
        }),
        prisma.schedule.deleteMany({
          where: { employeeId: { in: toDelete } },
        }),
        prisma.employee.deleteMany({
          where: { id: { in: toDelete } },
        }),
      ])

      // SP-439 : Sync Stripe quantity pour chaque company affectée (fire-and-forget)
      for (const cId of affectedCompanyIds) {
        syncEmployeeCountToStripe(cId).catch((err) => {
          console.error('[SP-439] Stripe sync failed after bulk delete:', err)
        })
      }

      // SP-444 : Audit trail pour chaque employé supprimé (fire-and-forget)
      for (const empId of toDelete) {
        logAuditAction({
          action: 'DELETE',
          entityType: 'EMPLOYEE',
          entityId: empId,
          userId: user.id,
          companyId: user.companyId ?? undefined,
          details: { bulk: true, totalDeleted: toDelete.length },
        }).catch(console.error)
      }
    }

    revalidatePath('/app/dashboard/employees')

    return {
      success: true,
      data: {
        deletedCount: toDelete.length,
        skippedNames,
      },
    }
  } catch (error) {
    console.error('[bulkDeleteEmployees] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// EXPORT CSV - Export des employés au format CSV (SP-333)
// ============================================================================

import {
  generateCsv,
  formatDateFr,
  formatBooleanFr,
  type CsvColumn,
} from '@/lib/csv'
import type { CsvExportActionResult, EmployeeExportFilters } from '@/types'

/**
 * Type interne pour l'export CSV des employés
 */
interface EmployeeForCsvExport {
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  jobTitle: string | null
  department: string | null
  hireDate: Date | null
  weeklyHours: number
  isActive: boolean
  createdAt: Date
  team: { name: string } | null
}

/**
 * Colonnes pour l'export CSV des employés
 */
const EMPLOYEE_CSV_COLUMNS: CsvColumn<EmployeeForCsvExport>[] = [
  { key: 'firstName', header: 'Prénom' },
  { key: 'lastName', header: 'Nom' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Téléphone' },
  { key: 'jobTitle', header: 'Poste' },
  { key: 'department', header: 'Département' },
  { key: (e) => e.team?.name ?? '', header: 'Équipe' },
  {
    key: 'hireDate',
    header: 'Date embauche',
    format: (v) => formatDateFr(v as Date | null),
  },
  { key: 'weeklyHours', header: 'Heures/semaine' },
  {
    key: 'isActive',
    header: 'Actif',
    format: (v) => formatBooleanFr(v as boolean),
  },
  {
    key: 'createdAt',
    header: 'Date création',
    format: (v) => formatDateFr(v as Date),
  },
]

/**
 * Exporte les employés au format CSV
 *
 * RBAC :
 * - SYSTEM_ADMIN : Tous les employés de tous les tenants
 * - DIRECTOR : Tous les employés de son entreprise
 * - MANAGER : Employés de ses équipes uniquement
 * - EMPLOYEE : Non autorisé
 *
 * @param filters - Filtres optionnels (teamId, isActive)
 * @returns Fichier CSV avec les employés
 *
 * @ticket SP-333
 */
export async function exportEmployeesCsv(
  filters?: EmployeeExportFilters
): Promise<CsvExportActionResult> {
  try {
    // 1️⃣ Vérifier l'authentification et les permissions
    const authResult = await getAuthenticatedUser()

    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const user = authResult.user

    // 2️⃣ Construire la requête avec RBAC
    const where: Record<string, unknown> = {}

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
        where.teamId = { in: user.managedTeamIds }
        break
    }

    // 3️⃣ Appliquer les filtres optionnels
    if (filters?.teamId) {
      // Pour MANAGER, vérifier que l'équipe est dans ses équipes gérées
      if (
        user.role === 'MANAGER' &&
        !user.managedTeamIds.includes(filters.teamId)
      ) {
        return { success: false, error: "Vous n'avez pas accès à cette équipe" }
      }
      where.teamId = filters.teamId
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }

    // 4️⃣ Récupérer les données
    const employees = await prisma.employee.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        department: true,
        hireDate: true,
        weeklyHours: true,
        isActive: true,
        createdAt: true,
        team: { select: { name: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 10000, // Limite de sécurité
    })

    // 5️⃣ Générer le CSV
    const result = generateCsv(
      employees as EmployeeForCsvExport[],
      EMPLOYEE_CSV_COLUMNS,
      {
        filename: 'employes-export',
      }
    )

    // 6️⃣ Log de traçabilité RGPD
    console.warn(
      `[exportEmployeesCsv] User ${user.id} (${user.role}) exported ${employees.length} employees at ${new Date().toISOString()}`
    )

    // SP-444 : Audit trail export RGPD (fire-and-forget)
    logAuditAction({
      action: 'EXPORT',
      entityType: 'EMPLOYEE',
      userId: user.id,
      companyId: user.companyId ?? undefined,
      details: {
        count: employees.length,
        filters: (filters ?? null) as Prisma.InputJsonValue,
      },
    }).catch(console.error)

    return { success: true, data: result }
  } catch (error) {
    console.error('[exportEmployeesCsv] Error:', error)
    return { success: false, error: "Erreur lors de l'export" }
  }
}

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
    const where: Record<string, unknown> = {}

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
