/**
 * API Route - Entity Name Resolution
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 * @see Context7 - Next.js 15 API Routes Best Practices
 *
 * OBJECTIF :
 * Résout l'ID d'une entité vers son nom lisible pour les breadcrumbs.
 * Requêtes légères avec select minimal pour la performance.
 *
 * ENDPOINT : GET /api/entities/[type]/[id]
 *
 * TYPES SUPPORTÉS :
 * - employees : Employés (firstName + lastName)
 * - teams : Équipes (name)
 * - companies : Entreprises (name)
 * - schedules : Plannings (name ou date)
 * - leave-requests : Demandes de congés (employee name + type)
 *
 * SÉCURITÉ :
 * - Validation du type d'entité
 * - Validation du format de l'ID (UUID, CUID, numeric)
 * - Requêtes Prisma avec select minimal
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Types d'entités supportés
 */
const VALID_ENTITY_TYPES = [
  'employees',
  'teams',
  'companies',
  'schedules',
  'leave-requests',
] as const

type EntityType = (typeof VALID_ENTITY_TYPES)[number]

/**
 * Patterns de validation pour les IDs
 */
const ID_PATTERNS = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  cuid: /^c[a-z0-9]{24,}$/i,
  numeric: /^\d+$/,
}

/**
 * Valide le format de l'ID
 */
function isValidId(id: string): boolean {
  return (
    ID_PATTERNS.uuid.test(id) ||
    ID_PATTERNS.cuid.test(id) ||
    ID_PATTERNS.numeric.test(id)
  )
}

/**
 * Valide le type d'entité
 */
function isValidEntityType(type: string): type is EntityType {
  return VALID_ENTITY_TYPES.includes(type as EntityType)
}

/**
 * Résout le nom d'un employé
 */
async function resolveEmployeeName(id: string): Promise<string | null> {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      firstName: true,
      lastName: true,
    },
  })

  if (!employee) return null
  return `${employee.firstName} ${employee.lastName}`.trim()
}

/**
 * Résout le nom d'une équipe
 */
async function resolveTeamName(id: string): Promise<string | null> {
  const team = await prisma.team.findUnique({
    where: { id },
    select: { name: true },
  })

  return team?.name ?? null
}

/**
 * Résout le nom d'une entreprise
 */
async function resolveCompanyName(id: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { id },
    select: { name: true },
  })

  return company?.name ?? null
}

/**
 * Résout le nom d'un planning
 */
async function resolveScheduleName(id: string): Promise<string | null> {
  const schedule = await prisma.schedule.findUnique({
    where: { id },
    select: {
      title: true,
      startDate: true,
    },
  })

  if (!schedule) return null

  // Utiliser le titre si présent, sinon formater la date
  if (schedule.title) {
    return schedule.title
  }

  // Formater la date de début
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(schedule.startDate)
}

/**
 * Résout le nom d'une demande de congés
 */
async function resolveLeaveRequestName(id: string): Promise<string | null> {
  const leaveRequest = await prisma.leaveRequest.findUnique({
    where: { id },
    select: {
      type: true,
      employee: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  })

  if (!leaveRequest) return null

  const employeeName =
    `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`.trim()

  // Traduire le type de congé
  const leaveTypeLabels: Record<string, string> = {
    ANNUAL: 'Congés annuels',
    SICK: 'Maladie',
    UNPAID: 'Sans solde',
    MATERNITY: 'Maternité',
    PATERNITY: 'Paternité',
    BEREAVEMENT: 'Décès',
    OTHER: 'Autre',
  }

  const leaveType = leaveTypeLabels[leaveRequest.type] || leaveRequest.type

  return `${leaveType} - ${employeeName}`
}

/**
 * Résout le nom selon le type d'entité
 */
async function resolveEntityName(
  type: EntityType,
  id: string
): Promise<string | null> {
  switch (type) {
    case 'employees':
      return resolveEmployeeName(id)
    case 'teams':
      return resolveTeamName(id)
    case 'companies':
      return resolveCompanyName(id)
    case 'schedules':
      return resolveScheduleName(id)
    case 'leave-requests':
      return resolveLeaveRequestName(id)
    default:
      return null
  }
}

/**
 * Type pour les paramètres de route dynamique Next.js 15
 */
type RouteContext = {
  params: Promise<{
    type: string
    id: string
  }>
}

/**
 * GET /api/entities/[type]/[id]
 *
 * Retourne le nom d'une entité pour affichage dans les breadcrumbs
 *
 * @param request - NextRequest
 * @param context - Context avec params dynamiques
 * @returns NextResponse avec le nom ou une erreur
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // Next.js 15 : params est une Promise
    const params = await context.params
    const { type, id } = params

    // Validation du type d'entité
    if (!isValidEntityType(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Type d'entité invalide: ${type}`,
          validTypes: VALID_ENTITY_TYPES,
        },
        { status: 400 }
      )
    }

    // Validation du format de l'ID
    if (!isValidId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID invalide",
        },
        { status: 400 }
      )
    }

    // Résolution du nom
    const name = await resolveEntityName(type, id)

    // Entité non trouvée
    if (name === null) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entité non trouvée',
        },
        { status: 404 }
      )
    }

    // Succès
    return NextResponse.json(
      {
        success: true,
        data: {
          id,
          type,
          name,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    console.error('❌ Erreur résolution entité:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la résolution',
      },
      { status: 500 }
    )
  }
}
