/**
 * Helpers pour le mode impersonation SYSTEM_ADMIN
 *
 * Gère le cycle de vie du cookie `sp-impersonation` :
 * - startImpersonation() : pose le cookie HttpOnly
 * - getImpersonationContext() : lit le cookie (Edge-compatible via Request)
 * - getImpersonationContextFromHeaders() : lit le cookie via next/headers
 * - stopImpersonation() : supprime le cookie
 * - assertNotImpersonating() : bloque les Server Actions sensibles
 *
 * @ticket SP-447
 */

import { cookies } from 'next/headers'

import type { ImpersonationContext } from '@/types/auth'
import { IMPERSONATION_COOKIE_NAME, IMPERSONATION_MAX_AGE } from '@/types/auth'

// ============================================================================
// Cookie Management
// ============================================================================

/**
 * Démarre l'impersonation en posant le cookie sp-impersonation
 *
 * Appelé depuis l'API route POST /api/admin/impersonate.
 * Le cookie est HttpOnly, Secure (prod), SameSite=lax, Path=/.
 *
 * @param context - Contexte d'impersonation à sérialiser dans le cookie
 */
export async function startImpersonation(
  context: ImpersonationContext
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(IMPERSONATION_COOKIE_NAME, JSON.stringify(context), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: IMPERSONATION_MAX_AGE,
  })
}

/**
 * Lit le contexte d'impersonation depuis le cookie (Edge-compatible)
 *
 * Utilise request.cookies (Web API standard) au lieu de next/headers
 * pour fonctionner dans le middleware Edge Runtime sans import Prisma.
 *
 * @param request - Requête HTTP (disponible dans le middleware)
 * @returns Le contexte d'impersonation ou null si absent/invalide
 */
export function getImpersonationContext(
  request: Request
): ImpersonationContext | null {
  // request.headers contient le cookie header, mais on utilise
  // l'API cookies si c'est un NextRequest, sinon on parse manuellement
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = parseCookieHeader(cookieHeader)
  const value = cookies[IMPERSONATION_COOKIE_NAME]
  if (!value) return null

  return parseImpersonationCookie(value)
}

/**
 * Lit le contexte d'impersonation via next/headers (Server Components / API Routes)
 *
 * @returns Le contexte d'impersonation ou null si absent/invalide
 */
export async function getImpersonationContextFromHeaders(): Promise<ImpersonationContext | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(IMPERSONATION_COOKIE_NAME)
  if (!cookie?.value) return null

  return parseImpersonationCookie(cookie.value)
}

/**
 * Supprime le cookie sp-impersonation
 *
 * Appelé depuis l'API route DELETE /api/admin/impersonate.
 */
export async function stopImpersonation(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(IMPERSONATION_COOKIE_NAME)
}

/** Résultat de blocage impersonation, compatible CrudActionResult */
type ImpersonationBlockResult = { success: false; error: string }

/**
 * Vérifie qu'aucune impersonation n'est active
 *
 * À appeler en première ligne des Server Actions de mutation :
 * ```typescript
 * const impersonationBlock = await assertNotImpersonating()
 * if (impersonationBlock) return impersonationBlock
 * ```
 *
 * @returns null si pas d'impersonation, { success: false, error } sinon
 * @ticket SP-447, SP-454
 */
export async function assertNotImpersonating(): Promise<ImpersonationBlockResult | null> {
  const context = await getImpersonationContextFromHeaders()
  if (context) {
    return {
      success: false,
      error:
        'Action non disponible en mode support. Le mode support est en lecture seule.',
    }
  }
  return null
}

// ============================================================================
// Helpers internes
// ============================================================================

/**
 * Parse un cookie header manuellement (Edge-compatible, pas de dépendance)
 */
function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {}
  const pairs = header.split(';')
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=')
    if (eqIdx === -1) continue
    const key = pair.substring(0, eqIdx).trim()
    const value = pair.substring(eqIdx + 1).trim()
    result[key] = decodeURIComponent(value)
  }
  return result
}

/**
 * Parse et valide le contenu JSON du cookie d'impersonation
 *
 * @returns Le contexte validé ou null si invalide/expiré
 */
function parseImpersonationCookie(value: string): ImpersonationContext | null {
  try {
    // Next.js peut URL-encoder la valeur du cookie JSON
    const decoded = value.startsWith('%7B') ? decodeURIComponent(value) : value
    const parsed: unknown = JSON.parse(decoded)
    if (!isValidImpersonationContext(parsed)) return null

    // Vérifier l'expiration côté applicatif
    const elapsed = Date.now() - parsed.startedAt
    if (elapsed > IMPERSONATION_MAX_AGE * 1000) return null

    return parsed
  } catch {
    return null
  }
}

/**
 * Type guard pour valider la structure du contexte d'impersonation
 */
function isValidImpersonationContext(
  value: unknown
): value is ImpersonationContext {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.originalAdminId === 'string' &&
    typeof obj.targetUserId === 'string' &&
    typeof obj.targetCompanyId === 'string' &&
    typeof obj.targetRole === 'string' &&
    typeof obj.targetEmail === 'string' &&
    typeof obj.targetCompanyName === 'string' &&
    typeof obj.startedAt === 'number'
  )
}
