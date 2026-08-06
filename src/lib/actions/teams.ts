/**
 * Server Actions CRUD pour Teams
 *
 * @description Actions avec RBAC multi-role pour gestion des equipes.
 * - SYSTEM_ADMIN : Acces a toutes les equipes
 * - DIRECTOR : Acces uniquement aux equipes de sa company (CRUD complet)
 * - MANAGER : Lecture seule de ses equipes + gestion membres
 * - EMPLOYEE : Aucun acces
 *
 * @ticket SP-153
 * @see Context7 - Prisma many-to-many connect/disconnect patterns
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { invalidateDashboardCache, invalidateEmployeesCache } from '@/lib/cache'
import { UserRole, type Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
} from './crud-helpers'
import { logAuditAction } from '@/lib/services/audit'
import {
  assertNotImpersonating,
  getEffectiveSessionData,
} from '@/lib/impersonation'
import {
  createTeamSchema,
  updateTeamSchema,
  teamFiltersSchema,
  teamMemberSchema,
  assignManagerSchema,
  type CreateTeamInput,
  type UpdateTeamInput,
  type TeamFilters,
  type TeamWithCounts,
  type TeamWithDetails,
  type TeamMemberInfo,
} from '@/lib/validations/team'
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
// Invalidation des caches
// ============================================================================

/**
 * Invalide tout ce qui depend de la composition des equipes.
 *
 * Les stats du dashboard DIRECTOR (dont `totalTeams`, qui pilote la checklist
 * de demarrage) sont servies par un cache Redis de 300 s : sans cette
 * invalidation, une equipe fraichement creee restait affichee comme etape
 * non faite pendant 5 minutes.
 *
 * `/app/dashboard` seul ne couvre pas les routes par role : les deux
 * dashboards manager et director doivent etre revalides explicitement.
 */
async function invalidateTeamCaches(
  companyId: string,
  teamId?: string
): Promise<void> {
  // Les mouvements d'equipe changent le `teamId` des employes concernes :
  // les listes d'employes mises en cache doivent tomber elles aussi.
  await Promise.all([
    invalidateDashboardCache(companyId),
    invalidateEmployeesCache(companyId),
  ])

  revalidatePath('/app/director/teams')
  if (teamId) {
    revalidatePath(`/app/director/teams/${teamId}`)
  }
  revalidatePath('/app/dashboard/employees')
  revalidatePath('/app/manager/dashboard')
  revalidatePath('/app/director/dashboard')
}

/**
 * Rattache un manager comme membre de l'equipe qu'il dirige.
 *
 * `Team.managerId` (relation TeamManager) et `Employee.teamId` (relation
 * TeamMembers) sont independantes : designer quelqu'un manager ne le faisait
 * pas apparaitre dans sa propre equipe cote profil.
 *
 * Le rattachement n'ecrase jamais une appartenance existante : un employe deja
 * membre d'une equipe garde la sienne (un `teamId` unique ne peut pas
 * representer plusieurs equipes managees).
 */
async function attachManagerToTeam(
  managerId: string,
  teamId: string
): Promise<void> {
  try {
    await prisma.employee.updateMany({
      where: { id: managerId, teamId: null },
      data: { teamId },
    })
  } catch (error) {
    // Non bloquant : l'equipe est creee/modifiee, seul le confort d'affichage
    // du profil manager est degrade.
    console.error('[attachManagerToTeam] Error:', error)
  }
}

// ============================================================================
// Fonctions d'authentification et RBAC
// ============================================================================

/**
 * Roles autorises pour acceder aux teams
 */
const ALLOWED_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER']

/**
 * Roles autorises pour creer/modifier/supprimer des teams
 */
const WRITE_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'DIRECTOR']

/**
 * Verifie l'authentification et recupere le contexte RBAC complet
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

    const effective = await getEffectiveSessionData(session)
    const role = effective.role as UserRole

    // Verifie que le role est autorise
    if (!ALLOWED_ROLES.includes(role)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    const userId = effective.userId
    const companyId = effective.companyId ?? null

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
 */
function buildRBACWhereClause(
  user: AuthenticatedUser,
  filters: TeamFilters
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
      // MANAGER : uniquement ses equipes gerees
      where.id = { in: user.managedTeamIds }
      break
  }

  // Filtres additionnels
  if (filters.managerId) {
    where.managerId = filters.managerId
  }

  if (filters.hasNoManager) {
    where.managerId = null
  }

  // Recherche textuelle
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  return where
}

/**
 * Verifie que l'utilisateur a acces a une equipe specifique
 */
async function canAccessTeam(
  user: AuthenticatedUser,
  teamId: string
): Promise<{ hasAccess: boolean; team?: TeamWithCounts }> {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: { email: true, image: true },
          },
        },
      },
      company: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          employees: true,
          schedules: true,
        },
      },
    },
  })

  if (!team) {
    return { hasAccess: false }
  }

  // Verification selon le role
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return { hasAccess: true, team }

    case 'DIRECTOR':
      if (team.companyId !== user.companyId) {
        return { hasAccess: false }
      }
      return { hasAccess: true, team }

    case 'MANAGER':
      if (!user.managedTeamIds.includes(team.id)) {
        return { hasAccess: false }
      }
      return { hasAccess: true, team }

    default:
      return { hasAccess: false }
  }
}

/**
 * Verifie que l'utilisateur peut modifier une equipe
 */
function canWriteTeam(user: AuthenticatedUser): boolean {
  return WRITE_ROLES.includes(user.role)
}

// ============================================================================
// LIST - Recuperer les Teams avec pagination
// ============================================================================

/**
 * Liste les Teams avec pagination, tri et filtres RBAC
 */
export async function listTeams(
  params: ListQueryParams = {},
  filters: TeamFilters = {}
): Promise<ListActionResult<TeamWithCounts>> {
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
    const filtersValidation = validateData(teamFiltersSchema, filters)
    const validFilters = filtersValidation.success ? filtersValidation.data : {}

    // Construit la clause WHERE avec RBAC
    const where = buildRBACWhereClause(user, validFilters)

    // Pagination Prisma
    const { skip, take, orderBy } = getPaginationParams(params)

    // Requetes paralleles : count + data
    const [total, teams] = await Promise.all([
      prisma.team.count({ where }),
      prisma.team.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { name: 'asc' },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: { email: true, image: true },
              },
            },
          },
          company: {
            select: { id: true, name: true },
          },
          _count: {
            select: {
              employees: true,
              schedules: true,
            },
          },
        },
      }),
    ])

    return {
      success: true,
      data: formatPaginatedResult(teams, total, params),
    }
  } catch (error) {
    console.error('[listTeams] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET - Recuperer une Team par ID
// ============================================================================

/**
 * Recupere les details d'une Team avec ses membres
 */
export async function getTeam(
  id: string
): Promise<CrudActionResult<TeamWithDetails>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            isActive: true,
            user: {
              select: { email: true, image: true },
            },
          },
          orderBy: { lastName: 'asc' },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    if (!team) {
      return {
        success: false,
        error: 'Équipe non trouvée',
      }
    }

    // Verification RBAC
    switch (user.role) {
      case 'SYSTEM_ADMIN':
        break

      case 'DIRECTOR':
        if (team.companyId !== user.companyId) {
          return {
            success: false,
            error: 'Équipe non trouvée ou accès non autorisé',
          }
        }
        break

      case 'MANAGER':
        if (!user.managedTeamIds.includes(team.id)) {
          return {
            success: false,
            error: 'Équipe non trouvée ou accès non autorisé',
          }
        }
        break

      default:
        return {
          success: false,
          error: "Vous n'avez pas les permissions nécessaires",
        }
    }

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[getTeam] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// CREATE - Creer une nouvelle Team
// ============================================================================

/**
 * Cree une nouvelle Team
 *
 * - SYSTEM_ADMIN : peut creer dans n'importe quelle company
 * - DIRECTOR : peut creer dans sa company uniquement
 * - MANAGER : ne peut PAS creer
 */
export async function createTeam(
  data: CreateTeamInput
): Promise<CrudActionResult<TeamWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Verifie les permissions d'ecriture
  if (!canWriteTeam(user)) {
    return {
      success: false,
      error: "Vous n'avez pas les permissions pour créer une équipe",
    }
  }

  try {
    // Validation Zod
    const validation = validateData(createTeamSchema, data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: 'field' in validation ? validation.field : undefined,
      }
    }

    const validData = validation.data as CreateTeamInput

    // Verification RBAC pour la company
    if (user.role === 'DIRECTOR') {
      if (!user.companyId) {
        return {
          success: false,
          error: 'Utilisateur sans company associée',
        }
      }
      if (validData.companyId !== user.companyId) {
        return {
          success: false,
          error: 'Vous ne pouvez créer des équipes que dans votre entreprise',
        }
      }
    }

    // Si un manager est specifie, verifie qu'il appartient a la meme company
    if (validData.managerId && validData.managerId !== '') {
      const manager = await prisma.employee.findUnique({
        where: { id: validData.managerId },
        select: { companyId: true },
      })

      if (!manager) {
        return {
          success: false,
          error: 'Manager non trouvé',
          field: 'managerId',
        }
      }

      if (manager.companyId !== validData.companyId) {
        return {
          success: false,
          error: 'Le manager doit appartenir à la même entreprise',
          field: 'managerId',
        }
      }
    }

    // Creation en base
    const team = await prisma.team.create({
      data: {
        name: validData.name,
        description: validData.description || null,
        color: validData.color,
        companyId: validData.companyId,
        managerId:
          validData.managerId && validData.managerId !== ''
            ? validData.managerId
            : null,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    // Rattache le manager comme membre de l'equipe qu'il dirige, s'il n'a pas
    // deja une equipe. `Team.managerId` et `Employee.teamId` sont deux relations
    // distinctes : sans ce rattachement, le manager apparaissait bien en tete
    // de l'equipe mais son propre profil affichait « aucune equipe ».
    if (team.managerId) {
      await attachManagerToTeam(team.managerId, team.id)
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'CREATE',
      entityType: 'TEAM',
      entityId: team.id,
      userId: user.id,
      companyId: validData.companyId,
      details: { name: validData.name, managerId: validData.managerId || null },
    }).catch(console.error)

    await invalidateTeamCaches(validData.companyId, team.id)

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[createTeam] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
      field: prismaError.field,
    }
  }
}

// ============================================================================
// UPDATE - Modifier une Team
// ============================================================================

/**
 * Met a jour une Team existante
 */
export async function updateTeam(
  data: UpdateTeamInput
): Promise<CrudActionResult<TeamWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Verifie les permissions d'ecriture
  if (!canWriteTeam(user)) {
    return {
      success: false,
      error: "Vous n'avez pas les permissions pour modifier une équipe",
    }
  }

  try {
    // Validation Zod
    const validation = validateData(updateTeamSchema, data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: 'field' in validation ? validation.field : undefined,
      }
    }

    const validatedData = validation.data as UpdateTeamInput
    const { id, ...updateData } = validatedData

    // Verifie l'acces a l'equipe
    const { hasAccess, team: existing } = await canAccessTeam(user, id)

    if (!hasAccess || !existing) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Si un nouveau manager est specifie, verifie qu'il appartient a la meme company
    if (updateData.managerId && updateData.managerId !== '') {
      const manager = await prisma.employee.findUnique({
        where: { id: updateData.managerId },
        select: { companyId: true },
      })

      if (!manager) {
        return {
          success: false,
          error: 'Manager non trouvé',
          field: 'managerId',
        }
      }

      if (manager.companyId !== existing.companyId) {
        return {
          success: false,
          error: 'Le manager doit appartenir à la même entreprise',
          field: 'managerId',
        }
      }
    }

    // Mise a jour en base
    const team = await prisma.team.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && {
          description: updateData.description || null,
        }),
        ...(updateData.color && { color: updateData.color }),
        ...(updateData.managerId !== undefined && {
          managerId:
            updateData.managerId && updateData.managerId !== ''
              ? updateData.managerId
              : null,
        }),
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    // Nouveau manager designe : le rattacher a l'equipe (voir attachManagerToTeam)
    if (team.managerId) {
      await attachManagerToTeam(team.managerId, team.id)
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'TEAM',
      entityId: id,
      userId: user.id,
      companyId: existing.companyId,
      details: updateData as unknown as Prisma.InputJsonValue,
    }).catch(console.error)

    await invalidateTeamCaches(existing.companyId, id)

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[updateTeam] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
      field: prismaError.field,
    }
  }
}

// ============================================================================
// DELETE - Supprimer une Team (soft delete via isActive n'existe pas)
// ============================================================================

/**
 * Supprime une Team
 *
 * ATTENTION : Seuls SUPER_ADMIN et DIRECTOR peuvent supprimer.
 * Les employes de l'equipe seront detaches (teamId = null).
 */
export async function deleteTeam(id: string): Promise<DeleteActionResult> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Verifie les permissions d'ecriture
  if (!canWriteTeam(user)) {
    return {
      success: false,
      error: "Vous n'avez pas les permissions pour supprimer une équipe",
    }
  }

  try {
    // Verifie l'acces
    const { hasAccess, team } = await canAccessTeam(user, id)

    if (!hasAccess || !team) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Verifie s'il y a des plannings associes
    if (team._count && team._count.schedules > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : ${team._count.schedules} planning(s) associé(s).`,
      }
    }

    // Detache les employes de l'equipe avant suppression
    await prisma.employee.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    })

    // Suppression
    await prisma.team.delete({
      where: { id },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'DELETE',
      entityType: 'TEAM',
      entityId: id,
      userId: user.id,
      companyId: team.companyId,
      details: { name: team.name },
    }).catch(console.error)

    await invalidateTeamCaches(team.companyId)

    return { success: true }
  } catch (error) {
    console.error('[deleteTeam] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// ASSIGN MANAGER - Assigner un manager a une equipe
// ============================================================================

/**
 * Assigne ou retire un manager d'une equipe
 */
export async function assignManager(
  teamId: string,
  managerId: string | null
): Promise<CrudActionResult<TeamWithCounts>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  // Seuls SYSTEM_ADMIN et DIRECTOR peuvent assigner un manager
  if (!canWriteTeam(user)) {
    return {
      success: false,
      error: "Vous n'avez pas les permissions pour assigner un manager",
    }
  }

  try {
    // Validation
    const validation = validateData(assignManagerSchema, { teamId, managerId })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: 'field' in validation ? validation.field : undefined,
      }
    }

    // Verifie l'acces a l'equipe
    const { hasAccess, team: existing } = await canAccessTeam(user, teamId)

    if (!hasAccess || !existing) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Si un manager est specifie, verifie qu'il appartient a la meme company
    if (managerId && managerId !== '') {
      const manager = await prisma.employee.findUnique({
        where: { id: managerId },
        select: { companyId: true },
      })

      if (!manager) {
        return {
          success: false,
          error: 'Manager non trouvé',
        }
      }

      if (manager.companyId !== existing.companyId) {
        return {
          success: false,
          error: 'Le manager doit appartenir à la même entreprise',
        }
      }
    }

    // Mise a jour
    const team = await prisma.team.update({
      where: { id: teamId },
      data: {
        managerId: managerId && managerId !== '' ? managerId : null,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'TEAM',
      entityId: teamId,
      userId: user.id,
      companyId: existing.companyId,
      details: {
        field: 'managerId',
        from: existing.managerId ?? null,
        to: managerId,
      },
    }).catch(console.error)

    // Rattache le nouveau manager comme membre (voir attachManagerToTeam)
    if (team.managerId) {
      await attachManagerToTeam(team.managerId, teamId)
    }

    await invalidateTeamCaches(existing.companyId, teamId)

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[assignManager] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// ADD TEAM MEMBER - Ajouter un membre a une equipe
// ============================================================================

/**
 * Ajoute un employe a une equipe
 *
 * - SYSTEM_ADMIN / DIRECTOR : peuvent ajouter a n'importe quelle equipe de leur scope
 * - MANAGER : peut ajouter uniquement a SES equipes
 */
export async function addTeamMember(
  teamId: string,
  employeeId: string
): Promise<CrudActionResult<TeamWithDetails>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Validation
    const validation = validateData(teamMemberSchema, { teamId, employeeId })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: 'field' in validation ? validation.field : undefined,
      }
    }

    // Verifie l'acces a l'equipe
    const { hasAccess, team: existingTeam } = await canAccessTeam(user, teamId)

    if (!hasAccess || !existingTeam) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Verifie que l'employe existe et appartient a la meme company
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true, teamId: true, userId: true },
    })

    if (!employee) {
      return {
        success: false,
        error: 'Employé non trouvé',
      }
    }

    if (employee.companyId !== existingTeam.companyId) {
      return {
        success: false,
        error: "L'employé doit appartenir à la même entreprise",
      }
    }

    if (employee.teamId === teamId) {
      return {
        success: false,
        error: "L'employé fait déjà partie de cette équipe",
      }
    }

    // Ajoute l'employe a l'equipe (remplace l'ancienne equipe)
    await prisma.employee.update({
      where: { id: employeeId },
      data: { teamId },
    })

    // Sync messagerie TEAM (fire-and-forget, SP-504)
    if (employee.userId) {
      import('@/lib/services/team-conversation-sync')
        .then(({ syncTeamConversationMember }) =>
          syncTeamConversationMember(teamId, employee.userId!, 'add')
        )
        .catch(console.error)
    }

    // Recupere l'equipe mise a jour avec tous les membres
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            isActive: true,
            user: {
              select: { email: true, image: true },
            },
          },
          orderBy: { lastName: 'asc' },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    if (!team) {
      return {
        success: false,
        error: "Erreur lors de la récupération de l'équipe",
      }
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'TEAM',
      entityId: teamId,
      userId: user.id,
      companyId: existingTeam.companyId,
      details: { action: 'addMember', employeeId },
    }).catch(console.error)

    // SP-480 : Email de bienvenue dans l'équipe (fire-and-forget)
    const addedEmployee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { firstName: true, email: true },
    })
    if (addedEmployee?.email) {
      const { canSendEmailToEmployee } = await import(
        '@/lib/email/check-preference'
      )
      const canSend = await canSendEmailToEmployee(
        addedEmployee.email,
        'planning'
      )
      if (canSend) {
        const managerName = team.manager
          ? `${(team.manager as { firstName: string }).firstName} ${(team.manager as { lastName: string }).lastName}`
          : null
        const { sendTeamMemberAddedEmail } = await import(
          '@/lib/email/templates/team-notifications'
        )
        sendTeamMemberAddedEmail({
          firstName: addedEmployee.firstName,
          email: addedEmployee.email,
          teamName: team.name,
          managerName,
        }).catch(console.error)
      }
    }

    await invalidateTeamCaches(existingTeam.companyId, teamId)

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[addTeamMember] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// REMOVE TEAM MEMBER - Retirer un membre d'une equipe
// ============================================================================

/**
 * Retire un employe d'une equipe
 */
export async function removeTeamMember(
  teamId: string,
  employeeId: string
): Promise<CrudActionResult<TeamWithDetails>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const impersonationBlock = await assertNotImpersonating()
  if (impersonationBlock) return impersonationBlock

  const user = authResult.user

  try {
    // Validation
    const validation = validateData(teamMemberSchema, { teamId, employeeId })
    if (!validation.success) {
      return {
        success: false,
        error: validation.error,
        field: 'field' in validation ? validation.field : undefined,
      }
    }

    // Verifie l'acces a l'equipe
    const { hasAccess, team: existingTeam } = await canAccessTeam(user, teamId)

    if (!hasAccess || !existingTeam) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Verifie que l'employe fait partie de l'equipe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, teamId: true, userId: true },
    })

    if (!employee) {
      return {
        success: false,
        error: 'Employé non trouvé',
      }
    }

    if (employee.teamId !== teamId) {
      return {
        success: false,
        error: "L'employé ne fait pas partie de cette équipe",
      }
    }

    // Retire l'employe de l'equipe
    await prisma.employee.update({
      where: { id: employeeId },
      data: { teamId: null },
    })

    // Sync messagerie TEAM (fire-and-forget, SP-504)
    if (employee.userId) {
      import('@/lib/services/team-conversation-sync')
        .then(({ syncTeamConversationMember }) =>
          syncTeamConversationMember(teamId, employee.userId!, 'remove')
        )
        .catch(console.error)
    }

    // Recupere l'equipe mise a jour
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: { email: true, image: true },
            },
          },
        },
        company: {
          select: { id: true, name: true },
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            isActive: true,
            user: {
              select: { email: true, image: true },
            },
          },
          orderBy: { lastName: 'asc' },
        },
        _count: {
          select: {
            employees: true,
            schedules: true,
          },
        },
      },
    })

    if (!team) {
      return {
        success: false,
        error: "Erreur lors de la récupération de l'équipe",
      }
    }

    // SP-444 : Audit trail (fire-and-forget)
    logAuditAction({
      action: 'UPDATE',
      entityType: 'TEAM',
      entityId: teamId,
      userId: user.id,
      companyId: existingTeam.companyId,
      details: { action: 'removeMember', employeeId },
    }).catch(console.error)

    await invalidateTeamCaches(existingTeam.companyId, teamId)

    return {
      success: true,
      data: team,
    }
  } catch (error) {
    console.error('[removeTeamMember] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET TEAM MEMBERS - Recuperer les membres d'une equipe
// ============================================================================

/**
 * Recupere la liste des membres d'une equipe
 */
export async function getTeamMembers(
  teamId: string
): Promise<CrudActionResult<TeamMemberInfo[]>> {
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
    const { hasAccess } = await canAccessTeam(user, teamId)

    if (!hasAccess) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    const members = await prisma.employee.findMany({
      where: { teamId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        isActive: true,
        user: {
          select: { email: true, image: true },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    return {
      success: true,
      data: members,
    }
  } catch (error) {
    console.error('[getTeamMembers] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET AVAILABLE EMPLOYEES - Employes sans equipe
// ============================================================================

/**
 * Recupere les employes disponibles (sans equipe ou d'une autre equipe)
 * pour les ajouter a une equipe
 */
export async function getAvailableEmployees(
  teamId: string
): Promise<CrudActionResult<TeamMemberInfo[]>> {
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
    const { hasAccess, team } = await canAccessTeam(user, teamId)

    if (!hasAccess || !team) {
      return {
        success: false,
        error: 'Équipe non trouvée ou accès non autorisé',
      }
    }

    // Recupere les employes de la meme company qui ne sont pas dans cette equipe
    const employees = await prisma.employee.findMany({
      where: {
        companyId: team.companyId,
        isActive: true,
        OR: [{ teamId: null }, { teamId: { not: teamId } }],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        isActive: true,
        user: {
          select: { email: true, image: true },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    return {
      success: true,
      data: employees,
    }
  } catch (error) {
    console.error('[getAvailableEmployees] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// GET MANAGERS FOR SELECT - Pour les formulaires
// ============================================================================

/**
 * Recupere les employes eligibles comme manager
 * (employes actifs de la company)
 */
export async function getManagersForSelect(
  companyId: string
): Promise<CrudActionResult<TeamMemberInfo[]>> {
  const authResult = await getAuthenticatedUser()

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.error,
    }
  }

  const user = authResult.user

  try {
    // Verifie l'acces a la company
    if (user.role === 'DIRECTOR' && user.companyId !== companyId) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette entreprise",
      }
    }

    const managers = await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        isActive: true,
        user: {
          select: { email: true, image: true },
        },
      },
      orderBy: { lastName: 'asc' },
    })

    return {
      success: true,
      data: managers,
    }
  } catch (error) {
    console.error('[getManagersForSelect] Error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}
