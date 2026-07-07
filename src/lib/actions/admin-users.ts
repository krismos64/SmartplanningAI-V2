'use server'

/**
 * Server Actions pour la gestion cross-company des utilisateurs.
 * Réservé au SYSTEM_ADMIN — isolation multi-tenant intentionnellement levée.
 *
 * @ticket SP-472, SP-543
 */

import { z } from 'zod'

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { checkRateLimit } from '@/lib/rate-limit'
import { sendVerificationEmailAction } from '@/lib/actions/verification-actions'
import { logAuditAction } from '@/lib/services/audit/audit.service'
import type { UserRole } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

export interface AdminUserRow {
  id: string
  email: string
  name: string | null
  role: UserRole
  isActive: boolean
  emailVerified: Date | null
  companyId: string | null
  companyName: string | null
  createdAt: Date
  lastLoginAt: Date | null
}

export interface GetAllUsersAdminResult {
  users: AdminUserRow[]
  total: number
}

export interface CompanyOption {
  id: string
  name: string
}

export type VerifiedFilter = 'ALL' | 'VERIFIED' | 'UNVERIFIED'

export interface ResendVerificationResult {
  success: boolean
  error?: string
}

// ============================================================================
// Constantes internes (non exportées : fichier 'use server')
// ============================================================================

/** Rate limit renvoi vérification : 3 envois / heure / utilisateur cible */
const RESEND_RATE_LIMIT = { maxRequests: 3, windowMs: 60 * 60 * 1000 }

const userIdSchema = z.string().cuid()

// ============================================================================
// Actions
// ============================================================================

/**
 * Récupère tous les utilisateurs de toutes les entreprises.
 * Supporte recherche, filtrage par rôle, entreprise et statut de
 * vérification email, pagination.
 */
export async function getAllUsersAdmin(params?: {
  search?: string
  role?: UserRole | 'ALL'
  companyId?: string
  verified?: VerifiedFilter
  page?: number
  pageSize?: number
}): Promise<GetAllUsersAdminResult> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 50
  const skip = (page - 1) * pageSize

  const where = {
    ...(params?.search && {
      OR: [
        { email: { contains: params.search, mode: 'insensitive' as const } },
        { name: { contains: params.search, mode: 'insensitive' as const } },
      ],
    }),
    ...(params?.role && params.role !== 'ALL' && { role: params.role }),
    ...(params?.companyId && { companyId: params.companyId }),
    ...(params?.verified === 'VERIFIED' && { emailVerified: { not: null } }),
    ...(params?.verified === 'UNVERIFIED' && { emailVerified: null }),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { company: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      emailVerified: u.emailVerified,
      companyId: u.companyId,
      companyName: u.company?.name ?? null,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
    })),
    total,
  }
}

/**
 * Active/désactive un utilisateur (toggle isActive).
 * Log dans AuditLog via le caller si nécessaire.
 */
export async function toggleUserStatusAdmin(
  userId: string,
  active: boolean
): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: active },
  })

  return { success: true }
}

/**
 * Liste légère des entreprises (id + nom) pour alimenter le filtre
 * entreprise de la page admin Users.
 */
export async function getCompanyOptionsAdmin(): Promise<CompanyOption[]> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  return prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

/**
 * Renvoie un email de vérification à un utilisateur bloqué (SP-543).
 *
 * Depuis le verrou SP-526, un utilisateur au token expiré ne peut plus se
 * connecter : cette action est l'issue de secours côté support.
 *
 * @security
 * - RBAC SYSTEM_ADMIN + validation Zod du userId (cuid)
 * - Refus si utilisateur inexistant, déjà vérifié ou désactivé
 * - Rate limit Redis : 3 renvois / heure / utilisateur cible
 * - Audit trail obligatoire (UPDATE sur USER, fire-and-forget)
 * - Réutilise sendVerificationEmailAction : invalidation de l'ancien token,
 *   token 24h, envoi email, traçage EmailLog
 */
export async function resendVerificationEmailAdmin(
  userId: string
): Promise<ResendVerificationResult> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  // Validation Zod du paramètre
  const parsed = userIdSchema.safeParse(userId)
  if (!parsed.success) {
    return { success: false, error: 'Identifiant utilisateur invalide' }
  }

  // Charger l'utilisateur cible
  const user = await prisma.user.findUnique({
    where: { id: parsed.data },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      isActive: true,
      companyId: true,
    },
  })

  if (!user) {
    return { success: false, error: 'Utilisateur introuvable' }
  }

  if (user.emailVerified) {
    return { success: false, error: 'Cet email est déjà vérifié' }
  }

  if (!user.isActive) {
    return {
      success: false,
      error: 'Impossible de renvoyer un email à un compte désactivé',
    }
  }

  // Rate limit par utilisateur cible (évite le spam d'une boîte mail)
  const rateLimit = await checkRateLimit(
    `admin-resend-verification:${user.id}`,
    RESEND_RATE_LIMIT
  )
  if (!rateLimit.allowed) {
    return {
      success: false,
      error:
        'Limite atteinte : 3 renvois maximum par heure pour cet utilisateur',
    }
  }

  // Envoi (invalide l'ancien token, crée un token 24h, trace dans EmailLog)
  await sendVerificationEmailAction({ email: user.email })

  // Audit trail — fire-and-forget, jamais bloquant
  logAuditAction({
    action: 'UPDATE',
    entityType: 'USER',
    entityId: user.id,
    userId: session.user.id,
    ...(user.companyId && { companyId: user.companyId }),
    details: {
      operation: 'admin_resend_verification_email',
      targetEmail: user.email,
    },
  }).catch(console.error)

  return { success: true }
}
