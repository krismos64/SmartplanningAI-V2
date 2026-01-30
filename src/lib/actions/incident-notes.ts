/**
 * Server Actions CRUD pour les notes d'incident
 *
 * @description Actions avec RBAC selon la visibilité des notes.
 * - EMPLOYEE : Voit uniquement ses propres notes avec visibility=ALL
 * - MANAGER : Son équipe (MANAGER_DIRECTOR + ALL)
 * - DIRECTOR/ADMIN : Toutes les notes de l'entreprise
 *
 * @ticket SP-425
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { IncidentNoteVisibility, UserRole, type Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
  canAccessCompanyEntity,
} from './crud-helpers'
import {
  incidentNoteCreateSchema,
  incidentNoteUpdateSchema,
  incidentNoteFiltersSchema,
  type IncidentNoteCreateInput,
  type IncidentNoteUpdateInput,
  type IncidentNoteFilters,
} from '@/lib/validations/incident-note'
import type { ListActionResult, ListQueryParams } from '@/types'

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

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }

// ============================================================================
// Prisma Include
// ============================================================================

const INCIDENT_NOTE_INCLUDE = {
  subject: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      teamId: true,
      team: { select: { id: true, name: true } },
    },
  },
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  company: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.IncidentNoteInclude

export type IncidentNoteWithRelations = Prisma.IncidentNoteGetPayload<{
  include: typeof INCIDENT_NOTE_INCLUDE
}>

// ============================================================================
// Auth + RBAC
// ============================================================================

const WRITE_ROLES: UserRole[] = ['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER']

async function getAuthenticatedUser(
  allowedRoles: UserRole[] = ['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE']
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
 * Vérifie si l'utilisateur peut accéder à une note selon sa visibilité
 */
function checkNoteAccess(
  user: AuthenticatedUser,
  note: {
    visibility: IncidentNoteVisibility
    subjectId: string
    authorId: string
    companyId: string
    subject?: { teamId: string | null } | null
  }
): boolean {
  // SYSTEM_ADMIN : accès total
  if (user.role === 'SYSTEM_ADMIN') return true

  // Vérifier l'isolation multi-tenant
  if (!canAccessCompanyEntity(user.companyId, note.companyId)) return false

  // DIRECTOR : accès à toutes les notes de son entreprise
  if (user.role === 'DIRECTOR') return true

  // MANAGER : selon visibilité
  if (user.role === 'MANAGER') {
    // DIRECTOR_ONLY : pas d'accès pour les managers
    if (note.visibility === 'DIRECTOR_ONLY') return false

    // MANAGER_DIRECTOR ou ALL : vérifier que le sujet est dans son équipe
    const subjectTeamId = note.subject?.teamId
    if (!subjectTeamId || !user.managedTeamIds.includes(subjectTeamId)) {
      return false
    }
    return true
  }

  // EMPLOYEE : seulement ses propres notes avec visibility=ALL
  if (user.role === 'EMPLOYEE') {
    if (note.visibility !== 'ALL') return false
    if (note.subjectId !== user.employeeId) return false
    return true
  }

  return false
}

/**
 * Construit la clause WHERE pour les notes selon le rôle
 */
function buildIncidentNoteRBACWhere(
  user: AuthenticatedUser
): Prisma.IncidentNoteWhereInput {
  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return {}

    case 'DIRECTOR':
      return { companyId: user.companyId! }

    case 'MANAGER':
      return {
        companyId: user.companyId!,
        visibility: { in: ['MANAGER_DIRECTOR', 'ALL'] },
        subject: { teamId: { in: user.managedTeamIds } },
      }

    case 'EMPLOYEE':
      return {
        companyId: user.companyId!,
        visibility: 'ALL',
        subjectId: user.employeeId!,
      }

    default:
      return { id: 'NEVER_MATCH' }
  }
}

const INCIDENT_PATH = '/app/dashboard/incidents'

// ============================================================================
// 1. createIncidentNote - Création (MANAGER+ uniquement)
// ============================================================================

export async function createIncidentNote(
  input: IncidentNoteCreateInput
): Promise<ActionResult<IncidentNoteWithRelations>> {
  const authResult = await getAuthenticatedUser(WRITE_ROLES)
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  // Validation Zod
  const validation = validateData(incidentNoteCreateSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }
  const data = validation.data

  try {
    // Vérifier que l'employé sujet existe
    const subject = await prisma.employee.findUnique({
      where: { id: data.subjectId },
      select: { id: true, companyId: true, teamId: true },
    })

    if (!subject) {
      return { success: false, error: 'Employé non trouvé', field: 'subjectId' }
    }

    // Vérifier l'accès multi-tenant
    if (!canAccessCompanyEntity(user.companyId, subject.companyId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cet employé",
      }
    }

    // MANAGER : vérifier que l'employé est dans son équipe
    if (user.role === 'MANAGER') {
      if (!subject.teamId || !user.managedTeamIds.includes(subject.teamId)) {
        return {
          success: false,
          error:
            'Vous ne pouvez créer des notes que pour les membres de vos équipes',
          field: 'subjectId',
        }
      }
    }

    // Créer la note
    const note = await prisma.incidentNote.create({
      data: {
        title: data.title,
        content: data.content,
        date: data.date,
        visibility: data.visibility,
        subjectId: data.subjectId,
        authorId: user.id,
        companyId: subject.companyId,
      },
      include: INCIDENT_NOTE_INCLUDE,
    })

    revalidatePath(INCIDENT_PATH)
    return { success: true, data: note }
  } catch (error) {
    console.error('[createIncidentNote] Error:', error)
    const { error: message, field } = handlePrismaError(error)
    return { success: false, error: message, field }
  }
}

// ============================================================================
// 2. getIncidentNotes - Liste paginée avec RBAC
// ============================================================================

export async function getIncidentNotes(
  filters?: IncidentNoteFilters,
  params: ListQueryParams = {}
): Promise<ListActionResult<IncidentNoteWithRelations>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    // Valider les filtres si fournis
    if (filters) {
      const validation = validateData(incidentNoteFiltersSchema, filters)
      if (!validation.success) {
        return { success: false, error: validation.error }
      }
    }

    // Construire le WHERE avec RBAC
    const rbacWhere = buildIncidentNoteRBACWhere(user)
    const filterWhere: Prisma.IncidentNoteWhereInput = {}

    if (filters?.subjectId) filterWhere.subjectId = filters.subjectId
    if (filters?.authorId) filterWhere.authorId = filters.authorId
    if (filters?.visibility) filterWhere.visibility = filters.visibility

    // Filtres par date
    if (filters?.startDate || filters?.endDate) {
      filterWhere.date = {
        ...(filters.startDate && { gte: filters.startDate }),
        ...(filters.endDate && { lte: filters.endDate }),
      }
    }

    // Recherche textuelle
    if (filters?.search) {
      filterWhere.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const where: Prisma.IncidentNoteWhereInput = {
      AND: [rbacWhere, filterWhere],
    }

    const { skip, take, orderBy } = getPaginationParams(params)

    const [data, total] = await Promise.all([
      prisma.incidentNote.findMany({
        where,
        include: INCIDENT_NOTE_INCLUDE,
        skip,
        take,
        orderBy: orderBy ?? { date: 'desc' },
      }),
      prisma.incidentNote.count({ where }),
    ])

    return {
      success: true,
      data: formatPaginatedResult(data, total, params),
    }
  } catch (error) {
    console.error('[getIncidentNotes] Error:', error)
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 3. getIncidentNoteById - Récupération par ID avec vérification accès
// ============================================================================

export async function getIncidentNoteById(
  id: string
): Promise<ActionResult<IncidentNoteWithRelations>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    const note = await prisma.incidentNote.findUnique({
      where: { id },
      include: INCIDENT_NOTE_INCLUDE,
    })

    if (!note) {
      return { success: false, error: 'Note non trouvée' }
    }

    // Vérifier l'accès
    if (!checkNoteAccess(user, note)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette note",
      }
    }

    return { success: true, data: note }
  } catch (error) {
    console.error('[getIncidentNoteById] Error:', error)
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 4. getMyIncidentNotes - Notes où l'utilisateur est le sujet (EMPLOYEE)
// ============================================================================

export async function getMyIncidentNotes(): Promise<
  ActionResult<IncidentNoteWithRelations[]>
> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  if (!user.employeeId) {
    return { success: false, error: 'Profil employé non trouvé' }
  }

  try {
    const notes = await prisma.incidentNote.findMany({
      where: {
        subjectId: user.employeeId,
        visibility: 'ALL',
        companyId: user.companyId!,
      },
      include: INCIDENT_NOTE_INCLUDE,
      orderBy: { date: 'desc' },
    })

    return { success: true, data: notes }
  } catch (error) {
    console.error('[getMyIncidentNotes] Error:', error)
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 5. updateIncidentNote - Modification (auteur ou DIRECTOR+)
// ============================================================================

export async function updateIncidentNote(
  id: string,
  input: IncidentNoteUpdateInput
): Promise<ActionResult<IncidentNoteWithRelations>> {
  const authResult = await getAuthenticatedUser(WRITE_ROLES)
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  // Validation Zod
  const validation = validateData(incidentNoteUpdateSchema, input)
  if (!validation.success) {
    return { success: false, error: validation.error, field: validation.field }
  }
  const data = validation.data

  try {
    // Récupérer la note existante
    const existing = await prisma.incidentNote.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        companyId: true,
      },
    })

    if (!existing) {
      return { success: false, error: 'Note non trouvée' }
    }

    // Vérifier l'accès multi-tenant
    if (!canAccessCompanyEntity(user.companyId, existing.companyId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette note",
      }
    }

    // Vérifier les droits de modification : auteur OU DIRECTOR/ADMIN
    const isAuthor = existing.authorId === user.id
    const isDirectorOrAdmin =
      user.role === 'DIRECTOR' || user.role === 'SYSTEM_ADMIN'

    if (!isAuthor && !isDirectorOrAdmin) {
      return {
        success: false,
        error: "Seul l'auteur ou un directeur peut modifier cette note",
      }
    }

    // Mettre à jour
    const updated = await prisma.incidentNote.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.date && { date: data.date }),
        ...(data.visibility && { visibility: data.visibility }),
      },
      include: INCIDENT_NOTE_INCLUDE,
    })

    revalidatePath(INCIDENT_PATH)
    return { success: true, data: updated }
  } catch (error) {
    console.error('[updateIncidentNote] Error:', error)
    const { error: message, field } = handlePrismaError(error)
    return { success: false, error: message, field }
  }
}

// ============================================================================
// 6. deleteIncidentNote - Suppression (auteur ou DIRECTOR+)
// ============================================================================

export async function deleteIncidentNote(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedUser(WRITE_ROLES)
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    // Récupérer la note existante
    const existing = await prisma.incidentNote.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        companyId: true,
      },
    })

    if (!existing) {
      return { success: false, error: 'Note non trouvée' }
    }

    // Vérifier l'accès multi-tenant
    if (!canAccessCompanyEntity(user.companyId, existing.companyId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette note",
      }
    }

    // Vérifier les droits de suppression : auteur OU DIRECTOR/ADMIN
    const isAuthor = existing.authorId === user.id
    const isDirectorOrAdmin =
      user.role === 'DIRECTOR' || user.role === 'SYSTEM_ADMIN'

    if (!isAuthor && !isDirectorOrAdmin) {
      return {
        success: false,
        error: "Seul l'auteur ou un directeur peut supprimer cette note",
      }
    }

    // Supprimer
    await prisma.incidentNote.delete({ where: { id } })

    revalidatePath(INCIDENT_PATH)
    return { success: true, data: { id } }
  } catch (error) {
    console.error('[deleteIncidentNote] Error:', error)
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}

// ============================================================================
// 7. getIncidentNotesForEmployee - Notes d'un employé (pour fiche employé)
// ============================================================================

export async function getIncidentNotesForEmployee(
  employeeId: string
): Promise<ActionResult<IncidentNoteWithRelations[]>> {
  const authResult = await getAuthenticatedUser()
  if (!authResult.success) return { success: false, error: authResult.error }
  const { user } = authResult

  try {
    // Vérifier que l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { id: true, companyId: true, teamId: true },
    })

    if (!employee) {
      return { success: false, error: 'Employé non trouvé' }
    }

    // Vérifier l'accès multi-tenant
    if (!canAccessCompanyEntity(user.companyId, employee.companyId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cet employé",
      }
    }

    // Construire le WHERE selon le rôle
    let visibilityFilter: IncidentNoteVisibility[] = []

    switch (user.role) {
      case 'SYSTEM_ADMIN':
      case 'DIRECTOR':
        visibilityFilter = ['DIRECTOR_ONLY', 'MANAGER_DIRECTOR', 'ALL']
        break

      case 'MANAGER':
        // Vérifier que l'employé est dans son équipe
        if (
          !employee.teamId ||
          !user.managedTeamIds.includes(employee.teamId)
        ) {
          return {
            success: false,
            error: "Vous n'avez pas accès aux notes de cet employé",
          }
        }
        visibilityFilter = ['MANAGER_DIRECTOR', 'ALL']
        break

      case 'EMPLOYEE':
        // Un employé ne peut voir que ses propres notes avec visibility=ALL
        if (employeeId !== user.employeeId) {
          return {
            success: false,
            error: "Vous n'avez pas accès aux notes de cet employé",
          }
        }
        visibilityFilter = ['ALL']
        break
    }

    const notes = await prisma.incidentNote.findMany({
      where: {
        subjectId: employeeId,
        visibility: { in: visibilityFilter },
      },
      include: INCIDENT_NOTE_INCLUDE,
      orderBy: { date: 'desc' },
    })

    return { success: true, data: notes }
  } catch (error) {
    console.error('[getIncidentNotesForEmployee] Error:', error)
    const { error: message } = handlePrismaError(error)
    return { success: false, error: message }
  }
}
