/**
 * Server Actions CRUD pour Companies
 *
 * @description Actions SUPER_ADMIN pour gestion des entreprises SaaS.
 * Utilise l'infrastructure SP-150 (withRoleCheck, validateData, handlePrismaError).
 *
 * @ticket SP-151
 * @see Context7 - Next.js 15 Server Actions + Prisma CRUD patterns
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withRoleCheck } from './crud-utils'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
} from './crud-helpers'
import {
  createCompanySchema,
  updateCompanySchema,
  companyFiltersSchema,
  type CreateCompanyInput,
  type UpdateCompanyInput,
  type CompanyFilters,
} from '@/lib/validations/company'
import type {
  CrudActionResult,
  DeleteActionResult,
  ListActionResult,
  ListQueryParams,
} from '@/types'

// ============================================================================
// Types
// ============================================================================

/**
 * Company avec compteurs relations pour affichage liste
 */
export interface CompanyWithCounts {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
    teams: number
    employees: number
  }
}

/**
 * Company complète pour détail/édition
 */
export interface CompanyDetail {
  id: string
  name: string
  slug: string
  logo: string | null
  email: string | null
  phone: string | null
  address: string | null
  workingHoursStart: string
  workingHoursEnd: string
  workingDays: string[]
  timezone: string
  trialEndsAt: Date | null
  subscriptionEndsAt: Date | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
    teams: number
    employees: number
  }
}

// ============================================================================
// Utilitaires
// ============================================================================

/**
 * Génère un slug unique pour une Company
 *
 * Pattern : "acme-corp" ou "acme-corp-2" si doublon
 */
async function generateUniqueSlug(name: string): Promise<string> {
  // Normalise le nom en slug
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace non-alphanumériques par -
    .replace(/^-+|-+$/g, '') // Supprime - début/fin
    .substring(0, 50) // Limite longueur

  // Vérifie si le slug existe déjà
  const existing = await prisma.company.findUnique({
    where: { slug: baseSlug },
    select: { id: true },
  })

  if (!existing) {
    return baseSlug
  }

  // Cherche le prochain numéro disponible
  const similarSlugs = await prisma.company.findMany({
    where: {
      slug: {
        startsWith: `${baseSlug}-`,
      },
    },
    select: { slug: true },
  })

  // Extrait les numéros existants
  const numbers = similarSlugs
    .map((c) => {
      const match = c.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`))
      return match && match[1] ? parseInt(match[1], 10) : 0
    })
    .filter((n) => n > 0)

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 2
  return `${baseSlug}-${nextNumber}`
}

// ============================================================================
// LIST - Récupérer toutes les Companies avec pagination
// ============================================================================

/**
 * Liste les Companies avec pagination, tri et filtres
 *
 * @param params - Paramètres de pagination et tri
 * @param filters - Filtres optionnels (plan, statut, isActive)
 * @returns Liste paginée des Companies
 */
export async function listCompanies(
  params: ListQueryParams = {},
  filters: CompanyFilters = {}
): Promise<ListActionResult<CompanyWithCounts>> {
  return withRoleCheck('SYSTEM_ADMIN', async () => {
    // Valide les filtres
    const filtersValidation = validateData(companyFiltersSchema, filters)
    const validFilters = filtersValidation.success ? filtersValidation.data : {}

    // Construit la clause WHERE
    const where: Record<string, unknown> = {}

    // Filtre par recherche textuelle
    if (validFilters.search) {
      where.OR = [
        { name: { contains: validFilters.search, mode: 'insensitive' } },
        { email: { contains: validFilters.search, mode: 'insensitive' } },
        { slug: { contains: validFilters.search, mode: 'insensitive' } },
      ]
    }

    // Filtre par plan (via relation Subscription)
    if (validFilters.subscriptionPlan) {
      where.subscription = {
        ...((where.subscription as Record<string, unknown>) || {}),
        plan: validFilters.subscriptionPlan,
      }
    }

    // Filtre par statut (via relation Subscription)
    if (validFilters.subscriptionStatus) {
      where.subscription = {
        ...((where.subscription as Record<string, unknown>) || {}),
        status: validFilters.subscriptionStatus,
      }
    }

    // Filtre par isActive
    if (validFilters.isActive !== undefined) {
      where.isActive = validFilters.isActive
    }

    // Pagination Prisma
    const { skip, take, orderBy } = getPaginationParams(params)

    // Requêtes parallèles : count + data
    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        skip,
        take,
        orderBy: orderBy ?? { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              users: true,
              teams: true,
              employees: true,
            },
          },
        },
      }),
    ])

    return formatPaginatedResult(companies, total, params)
  }) as Promise<ListActionResult<CompanyWithCounts>>
}

// ============================================================================
// GET - Récupérer une Company par ID
// ============================================================================

/**
 * Récupère les détails d'une Company
 *
 * @param id - ID de la Company
 * @returns Détails complets de la Company
 */
export async function getCompany(
  id: string
): Promise<CrudActionResult<CompanyDetail>> {
  return withRoleCheck('SYSTEM_ADMIN', async () => {
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        email: true,
        phone: true,
        address: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        workingDays: true,
        timezone: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            teams: true,
            employees: true,
          },
        },
      },
    })

    if (!company) {
      throw new Error('Entreprise non trouvée')
    }

    return company
  }) as Promise<CrudActionResult<CompanyDetail>>
}

// ============================================================================
// CREATE - Créer une nouvelle Company
// ============================================================================

/**
 * Crée une nouvelle Company
 *
 * @param data - Données du formulaire
 * @returns Company créée
 */
export async function createCompany(
  data: CreateCompanyInput
): Promise<CrudActionResult<CompanyDetail>> {
  return withRoleCheck('SYSTEM_ADMIN', async () => {
    // Validation Zod
    const validation = validateData(createCompanySchema, data)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const validData = validation.data

    // Génère un slug unique
    const slug = await generateUniqueSlug(validData.name)

    // Création en base
    const company = await prisma.company.create({
      data: {
        name: validData.name,
        slug,
        email: validData.email || null,
        phone: validData.phone || null,
        address: validData.address || null,
        timezone: validData.timezone || 'Europe/Paris',
        isActive: validData.isActive ?? true,
        // Valeurs par défaut planning
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00',
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        email: true,
        phone: true,
        address: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        workingDays: true,
        timezone: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            teams: true,
            employees: true,
          },
        },
      },
    })

    // Revalide le cache
    revalidatePath('/admin/companies')

    return company
  }) as Promise<CrudActionResult<CompanyDetail>>
}

// ============================================================================
// UPDATE - Modifier une Company
// ============================================================================

/**
 * Met à jour une Company existante
 *
 * @param data - Données avec ID obligatoire
 * @returns Company mise à jour
 */
export async function updateCompany(
  data: UpdateCompanyInput
): Promise<CrudActionResult<CompanyDetail>> {
  return withRoleCheck('SYSTEM_ADMIN', async () => {
    // Validation Zod
    const validation = validateData(updateCompanySchema, data)
    if (!validation.success) {
      throw new Error(validation.error)
    }

    const { id, ...updateData } = validation.data

    // Vérifie que la Company existe
    const existing = await prisma.company.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    })

    if (!existing) {
      throw new Error('Entreprise non trouvée')
    }

    // Si le nom change, génère un nouveau slug
    let newSlug: string | undefined
    if (updateData.name && updateData.name !== existing.name) {
      newSlug = await generateUniqueSlug(updateData.name)
    }

    // Mise à jour en base
    const company = await prisma.company.update({
      where: { id },
      data: {
        ...updateData,
        ...(newSlug && { slug: newSlug }),
        // Convertit les champs vides en null
        email: updateData.email || null,
        phone: updateData.phone || null,
        address: updateData.address || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        email: true,
        phone: true,
        address: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        workingDays: true,
        timezone: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            teams: true,
            employees: true,
          },
        },
      },
    })

    // Revalide le cache
    revalidatePath('/admin/companies')
    revalidatePath(`/admin/companies/${id}`)

    return company
  }) as Promise<CrudActionResult<CompanyDetail>>
}

// ============================================================================
// DELETE - Supprimer une Company
// ============================================================================

/**
 * Supprime une Company
 *
 * ATTENTION : Cascade delete sur Users, Teams, Employees, etc.
 *
 * @param id - ID de la Company à supprimer
 * @returns Succès ou erreur
 */
export async function deleteCompany(id: string): Promise<DeleteActionResult> {
  try {
    const authResult = await withRoleCheck('SYSTEM_ADMIN', async () => {
      // Vérifie que la Company existe
      const company = await prisma.company.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          _count: {
            select: { users: true, employees: true },
          },
        },
      })

      if (!company) {
        throw new Error('Entreprise non trouvée')
      }

      // Suppression (cascade configurée dans Prisma)
      await prisma.company.delete({
        where: { id },
      })

      // Revalide le cache
      revalidatePath('/admin/companies')

      return { deleted: true }
    })

    if (!authResult.success) {
      return authResult
    }

    return { success: true }
  } catch (error) {
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
    }
  }
}

// ============================================================================
// TOGGLE STATUS - Activer/Désactiver une Company
// ============================================================================

/**
 * Active ou désactive une Company
 *
 * @param id - ID de la Company
 * @param isActive - Nouveau statut
 * @returns Company mise à jour
 */
export async function toggleCompanyStatus(
  id: string,
  isActive: boolean
): Promise<CrudActionResult<CompanyDetail>> {
  return withRoleCheck('SYSTEM_ADMIN', async () => {
    const company = await prisma.company.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        email: true,
        phone: true,
        address: true,
        workingHoursStart: true,
        workingHoursEnd: true,
        workingDays: true,
        timezone: true,
        trialEndsAt: true,
        subscriptionEndsAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            teams: true,
            employees: true,
          },
        },
      },
    })

    revalidatePath('/admin/companies')
    revalidatePath(`/admin/companies/${id}`)

    return company
  }) as Promise<CrudActionResult<CompanyDetail>>
}
