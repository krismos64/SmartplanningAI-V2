/**
 * Utilitaires Server Actions pour operations CRUD
 *
 * @description Fonctions generiques reutilisables pour :
 * - Verification des permissions (RBAC)
 * - Validation Zod cote serveur
 * - Gestion des erreurs Prisma
 * - Logging d'activite
 *
 * @ticket SP-150
 * @see Context7 - Next.js 15 Server Actions error handling
 * @see Context7 - Prisma error codes P2002 P2003 P2025
 */

'use server'

import { Prisma, UserRole } from '@prisma/client'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import type { CrudActionResult, PaginatedResult, ListQueryParams } from '@/types'

// ============================================================================
// Types internes
// ============================================================================

/**
 * Session utilisateur enrichie
 */
interface AuthenticatedUser {
  id: string
  role: UserRole
  companyId: string | null
}

/**
 * Resultat de validation Zod
 */
type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }

// ============================================================================
// Verification des permissions
// ============================================================================

/**
 * Verifie l'authentification et le role de l'utilisateur
 *
 * Wrapper pour les Server Actions qui necessite une verification RBAC.
 * Retourne l'utilisateur authentifie si les permissions sont suffisantes.
 *
 * @param requiredRole - Role minimum requis
 * @returns CrudActionResult avec les donnees utilisateur ou erreur
 *
 * @example
 * const authResult = await checkPermission('DIRECTOR')
 * if (!authResult.success) return authResult
 * const { id, role, companyId } = authResult.data
 */
export async function checkPermission(
  requiredRole: UserRole
): Promise<CrudActionResult<AuthenticatedUser>> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      }
    }

    const userRole = session.user.role

    if (!hasRequiredRole(userRole as UserRole, requiredRole)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    return {
      success: true,
      data: {
        id: session.user.id,
        role: userRole as UserRole,
        companyId: session.user.companyId ?? null,
      },
    }
  } catch (error) {
    console.error('[checkPermission] Error:', error)
    return {
      success: false,
      error: 'Erreur de verification des permissions',
    }
  }
}

/**
 * HOF pour executer une action avec verification de role
 *
 * Simplifie la creation de Server Actions protegees.
 *
 * @param requiredRole - Role minimum requis
 * @param action - Fonction a executer si les permissions sont valides
 * @returns Resultat de l'action ou erreur de permission
 *
 * @example
 * export async function deleteCompany(id: string) {
 *   return withRoleCheck('SYSTEM_ADMIN', async (user) => {
 *     await prisma.company.delete({ where: { id } })
 *     return { deleted: true }
 *   })
 * }
 */
export async function withRoleCheck<T>(
  requiredRole: UserRole,
  action: (user: AuthenticatedUser) => Promise<T>
): Promise<CrudActionResult<T>> {
  const authResult = await checkPermission(requiredRole)

  if (!authResult.success) {
    return authResult
  }

  try {
    const result = await action(authResult.data)
    return { success: true, data: result }
  } catch (error) {
    console.error('[withRoleCheck] Action error:', error)
    const prismaError = handlePrismaError(error)
    return {
      success: false,
      error: prismaError.error,
      field: prismaError.field,
    }
  }
}

// ============================================================================
// Validation Zod
// ============================================================================

/**
 * Valide les donnees avec un schema Zod
 *
 * Utilise safeParse pour eviter les exceptions.
 * Retourne le premier message d'erreur avec le champ concerne.
 *
 * @param schema - Schema Zod a utiliser
 * @param data - Donnees a valider
 * @returns Resultat de validation avec donnees typees ou erreur
 *
 * @example
 * const validation = validateData(createCompanySchema, formData)
 * if (!validation.success) {
 *   return { success: false, error: validation.error, field: validation.field }
 * }
 * const validatedData = validation.data
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)

  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: firstError?.message ?? 'Données invalides',
      field: firstError?.path.join('.') || undefined,
    }
  }

  return { success: true, data: result.data }
}

/**
 * Version async de validateData pour les schemas avec refinements async
 */
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<ValidationResult<T>> {
  const result = await schema.safeParseAsync(data)

  if (!result.success) {
    const firstError = result.error.errors[0]
    return {
      success: false,
      error: firstError?.message ?? 'Données invalides',
      field: firstError?.path.join('.') || undefined,
    }
  }

  return { success: true, data: result.data }
}

// ============================================================================
// Gestion des erreurs Prisma
// ============================================================================

/**
 * Codes d'erreur Prisma courants
 *
 * @see https://www.prisma.io/docs/reference/api-reference/error-reference
 */
const PRISMA_ERROR_CODES = {
  /** Violation de contrainte unique */
  UNIQUE_CONSTRAINT: 'P2002',
  /** Violation de cle etrangere */
  FOREIGN_KEY_CONSTRAINT: 'P2003',
  /** Enregistrement non trouve */
  NOT_FOUND: 'P2025',
} as const

/**
 * Traduit les erreurs Prisma en messages utilisateur
 *
 * Gere les codes d'erreur courants (P2002, P2003, P2025).
 *
 * @param error - Erreur capturee
 * @returns Message d'erreur traduit avec champ optionnel
 *
 * @example
 * try {
 *   await prisma.user.create(...)
 * } catch (error) {
 *   const { error: message, field } = handlePrismaError(error)
 *   return { success: false, error: message, field }
 * }
 */
export function handlePrismaError(error: unknown): {
  error: string
  field?: string
} {
  // Erreurs Prisma connues
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case PRISMA_ERROR_CODES.UNIQUE_CONSTRAINT: {
        const target = error.meta?.target as string[] | undefined
        const field = target?.[0]

        // Messages personnalises par champ
        if (field === 'email') {
          return { error: 'Cet email est déjà utilisé', field: 'email' }
        }
        if (field === 'slug') {
          return { error: 'Ce nom est déjà pris', field: 'name' }
        }
        if (field === 'siret') {
          return { error: 'Ce SIRET est déjà enregistré', field: 'siret' }
        }

        return { error: 'Cette valeur existe déjà', field }
      }

      case PRISMA_ERROR_CODES.FOREIGN_KEY_CONSTRAINT: {
        const fieldName = error.meta?.field_name as string | undefined
        return {
          error: 'Référence invalide vers une autre entité',
          field: fieldName,
        }
      }

      case PRISMA_ERROR_CODES.NOT_FOUND:
        return { error: 'Enregistrement non trouvé' }

      default:
        console.error('[Prisma Error]', error.code, error.message)
        return { error: 'Erreur de base de données' }
    }
  }

  // Erreurs Prisma de validation
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('[Prisma Validation Error]', error.message)
    return { error: 'Données invalides' }
  }

  // Erreurs generiques
  if (error instanceof Error) {
    console.error('[Generic Error]', error.message)
    return { error: error.message }
  }

  return { error: 'Une erreur inattendue est survenue' }
}

// ============================================================================
// Utilitaires de pagination
// ============================================================================

/**
 * Calcule les parametres de pagination pour Prisma
 *
 * @param params - Parametres de requete
 * @returns Objet avec skip, take et orderBy pour Prisma
 */
export function getPaginationParams(params: ListQueryParams): {
  skip: number
  take: number
  orderBy?: Record<string, 'asc' | 'desc'>
} {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10))

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: params.sortBy
      ? { [params.sortBy]: params.sortOrder ?? 'asc' }
      : undefined,
  }
}

/**
 * Formate le resultat pagine
 *
 * @param data - Donnees de la page
 * @param total - Nombre total d'elements
 * @param params - Parametres de requete
 * @returns Resultat pagine formate
 */
export function formatPaginatedResult<T>(
  data: T[],
  total: number,
  params: ListQueryParams
): PaginatedResult<T> {
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10))
  const totalPages = Math.ceil(total / pageSize)

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

// ============================================================================
// Revalidation du cache
// ============================================================================

/**
 * Revalide les paths apres une mutation
 *
 * @param paths - Chemins a revalider
 */
export function revalidatePaths(paths: string[]): void {
  for (const path of paths) {
    revalidatePath(path)
  }
}

// ============================================================================
// Logging d'activite
// ============================================================================

/**
 * Types d'actions pour le log d'activite
 */
export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'

/**
 * Log une activite dans la base de donnees
 *
 * Utilise pour l'audit trail et l'historique des modifications.
 * Ne bloque pas l'action principale en cas d'echec.
 *
 * @param userId - ID de l'utilisateur
 * @param action - Type d'action
 * @param entityType - Type d'entite (Company, User, Team, etc.)
 * @param entityId - ID de l'entite
 * @param details - Details supplementaires (optionnel)
 */
export function logActivity(
  userId: string,
  action: ActivityAction,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
): void {
  // Note: ActivityLog doit exister dans le schema Prisma
  // Si le modele n'existe pas encore, on log en console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Activity]', {
      userId,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    })
  }

  // TODO: Implementer quand le modele ActivityLog sera cree
  // Exemple d'implementation future:
  // prisma.activityLog.create({
  //   data: {
  //     userId,
  //     action,
  //     entityType,
  //     entityId,
  //     details: details ? JSON.stringify(details) : null,
  //   },
  // }).catch(err => console.error('[logActivity] Error:', err))
}

// ============================================================================
// Verification multi-tenant
// ============================================================================

/**
 * Verifie que l'utilisateur a acces a une entite de sa company
 *
 * Utilise pour les operations qui doivent respecter l'isolation multi-tenant.
 *
 * @param userCompanyId - ID de la company de l'utilisateur
 * @param entityCompanyId - ID de la company de l'entite
 * @returns true si l'acces est autorise
 */
export function canAccessCompanyEntity(
  userCompanyId: string | null,
  entityCompanyId: string
): boolean {
  // SYSTEM_ADMIN n'a pas de companyId mais a acces a tout
  if (userCompanyId === null) {
    return true
  }

  return userCompanyId === entityCompanyId
}

/**
 * Verifie l'acces multi-tenant et retourne une erreur si non autorise
 */
export function checkCompanyAccess(
  userCompanyId: string | null,
  entityCompanyId: string
): CrudActionResult<true> {
  if (!canAccessCompanyEntity(userCompanyId, entityCompanyId)) {
    return {
      success: false,
      error: "Vous n'avez pas accès à cette ressource",
    }
  }

  return { success: true, data: true }
}
