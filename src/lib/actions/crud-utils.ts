/**
 * Server Actions utilitaires pour operations CRUD
 *
 * @description Fonctions async Server Actions pour :
 * - Verification des permissions (RBAC)
 * - Validation Zod cote serveur (async)
 *
 * Les fonctions synchrones utilitaires sont dans crud-helpers.ts
 *
 * @ticket SP-150
 * @see Context7 - Next.js 15 Server Actions error handling
 * @see Context7 - Prisma error codes P2002 P2003 P2025
 */

'use server'

import { UserRole } from '@prisma/client'
import { z } from 'zod'

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { handlePrismaError } from './crud-helpers'
import type { CrudActionResult } from '@/types'

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

    if (!hasRequiredRole(userRole, requiredRole)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    return {
      success: true,
      data: {
        id: session.user.id,
        role: userRole,
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
// Validation Zod (async)
// ============================================================================

/**
 * Version async de validateData pour les schemas avec refinements async
 */
export async function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string; field?: string }> {
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
