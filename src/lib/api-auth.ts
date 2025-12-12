/**
 * Helper pour protéger les API routes avec RBAC
 *
 * @description Fournit des utilitaires pour sécuriser les API routes :
 * - Vérification d'authentification
 * - Vérification de rôle (RBAC)
 * - HOC pour wrapper les handlers
 *
 * Ces helpers centralisent la logique de sécurité et garantissent
 * des réponses d'erreur cohérentes (401/403) sur toutes les API.
 *
 * @example
 * // Utilisation simple avec requireRole
 * export async function GET() {
 *   const { error, session } = await requireRole('SYSTEM_ADMIN')
 *   if (error) return error
 *   // session est garanti non-null avec le bon rôle
 *   return NextResponse.json({ data: '...' })
 * }
 *
 * @example
 * // Utilisation avec HOC
 * export const GET = withRoleProtection('SYSTEM_ADMIN', async (req, session) => {
 *   return NextResponse.json({ users: [], requestedBy: session.user.email })
 * })
 *
 * @see https://authjs.dev/guides/role-based-access-control
 * @ticket SP-110
 */

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import type { UserRole } from '@prisma/client'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'

/**
 * Type pour le résultat des fonctions de vérification d'auth
 */
type AuthResult =
  | { error: NextResponse; session: null }
  | { error: null; session: Session }

/**
 * Codes d'erreur standardisés pour les API
 */
export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES]

/**
 * Vérifie l'authentification et retourne la session
 *
 * Utilise NextAuth `auth()` pour récupérer la session.
 * Retourne une erreur 401 si l'utilisateur n'est pas connecté.
 *
 * @returns Object avec `error` (NextResponse 401) ou `session` (Session)
 *
 * @example
 * export async function GET() {
 *   const { error, session } = await requireAuth()
 *   if (error) return error
 *
 *   // session.user est garanti disponible
 *   return NextResponse.json({ user: session.user })
 * }
 */
export async function requireAuth(): Promise<AuthResult> {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json(
        {
          error: 'Non authentifié',
          code: API_ERROR_CODES.UNAUTHORIZED,
          message: 'Vous devez être connecté pour accéder à cette ressource',
        },
        { status: 401 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Vérifie l'authentification ET le rôle minimum requis
 *
 * Combine la vérification d'authentification avec la vérification RBAC.
 * Retourne 401 si non connecté, 403 si rôle insuffisant.
 *
 * @param requiredRole - Rôle minimum requis pour accéder à la ressource
 * @returns Object avec `error` (NextResponse 401/403) ou `session` (Session)
 *
 * @example
 * // Dans une API route admin
 * export async function GET() {
 *   const { error, session } = await requireRole('SYSTEM_ADMIN')
 *   if (error) return error
 *
 *   // session.user.role est garanti SYSTEM_ADMIN ou supérieur
 *   return NextResponse.json({ adminData: '...' })
 * }
 *
 * @example
 * // Protection par rôle manager ou supérieur
 * export async function POST(request: Request) {
 *   const { error, session } = await requireRole('MANAGER')
 *   if (error) return error
 *
 *   // Accessible aux MANAGER, DIRECTOR, SYSTEM_ADMIN
 *   const body = await request.json()
 *   return NextResponse.json({ created: true })
 * }
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthResult> {
  const { error, session } = await requireAuth()

  if (error) {
    return { error, session: null }
  }

  // Vérification du rôle avec la hiérarchie RBAC
  if (!hasRequiredRole(session.user.role, requiredRole)) {
    return {
      error: NextResponse.json(
        {
          error: 'Accès refusé',
          code: API_ERROR_CODES.FORBIDDEN,
          message: `Rôle ${requiredRole} ou supérieur requis`,
          requiredRole,
          userRole: session.user.role,
        },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * HOC (Higher-Order Component) pour wrapper une API route avec protection par rôle
 *
 * Simplifie la protection des API routes en encapsulant la vérification
 * d'authentification et de rôle. Le handler reçoit directement la session
 * garantie non-null.
 *
 * @param requiredRole - Rôle minimum requis pour accéder à la route
 * @param handler - Fonction handler qui reçoit (request, session)
 * @returns Handler wrappé avec protection RBAC
 *
 * @example
 * // src/app/api/admin/users/route.ts
 * import { withRoleProtection } from '@/lib/api-auth'
 * import { NextResponse } from 'next/server'
 * import { prisma } from '@/lib/prisma'
 *
 * export const GET = withRoleProtection('SYSTEM_ADMIN', async (req, session) => {
 *   const users = await prisma.user.findMany()
 *   return NextResponse.json({
 *     users,
 *     requestedBy: session.user.email,
 *     requestedAt: new Date().toISOString(),
 *   })
 * })
 *
 * @example
 * // Route POST avec body
 * export const POST = withRoleProtection('DIRECTOR', async (req, session) => {
 *   const body = await req.json()
 *   // session.user.companyId disponible pour filtrer par entreprise
 *   return NextResponse.json({ success: true, companyId: session.user.companyId })
 * })
 */
export function withRoleProtection<T>(
  requiredRole: UserRole,
  handler: (request: Request, session: Session) => Promise<T>
) {
  return async (request: Request): Promise<T | NextResponse> => {
    const { error, session } = await requireRole(requiredRole)

    if (error) {
      return error
    }

    return handler(request, session)
  }
}

/**
 * Vérifie que l'utilisateur appartient à une entreprise spécifique
 *
 * Utile pour l'isolation multi-tenant : vérifie que l'utilisateur
 * a accès aux données de l'entreprise demandée.
 *
 * @param session - Session utilisateur
 * @param companyId - ID de l'entreprise à vérifier
 * @returns true si l'utilisateur a accès, false sinon
 *
 * @example
 * export async function GET(req: Request, { params }: { params: { companyId: string } }) {
 *   const { error, session } = await requireAuth()
 *   if (error) return error
 *
 *   if (!canAccessCompany(session, params.companyId)) {
 *     return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
 *   }
 *
 *   // Continuer avec les données de l'entreprise
 * }
 */
export function canAccessCompany(session: Session, companyId: string): boolean {
  // SYSTEM_ADMIN peut accéder à toutes les entreprises
  if (session.user.role === 'SYSTEM_ADMIN') {
    return true
  }

  // Les autres utilisateurs ne peuvent accéder qu'à leur propre entreprise
  return session.user.companyId === companyId
}

/**
 * Helper pour créer une réponse d'erreur API standardisée
 *
 * @param code - Code d'erreur
 * @param message - Message d'erreur
 * @param status - Code HTTP (défaut: 500)
 * @param details - Détails additionnels optionnels
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      code,
      ...(details && { details }),
    },
    { status }
  )
}
