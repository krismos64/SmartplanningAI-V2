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
import { sendVerificationEmailCore } from '@/lib/services/verification.service'
import { logAuditAction } from '@/lib/services/audit/audit.service'
import type { UserRole } from '@prisma/client'
import type { CrudActionResult } from '@/types'

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

/** Nombre maximum de lignes pour l'export CSV (pattern exportAuditLogsCsv) */
const MAX_EXPORT_ROWS = 10_000

/** Filtres communs liste + export */
interface UsersFilterParams {
  search?: string
  role?: UserRole | 'ALL'
  companyId?: string
  verified?: VerifiedFilter
}

/**
 * Construit la clause WHERE Prisma à partir des filtres — partagée entre
 * getAllUsersAdmin et exportUsersCsvAdmin pour garantir que l'export
 * contient exactement le dataset affiché (SP-541).
 */
function buildUsersWhere(params?: UsersFilterParams) {
  return {
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
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Récupère tous les utilisateurs de toutes les entreprises.
 * Supporte recherche, filtrage par rôle, entreprise et statut de
 * vérification email, pagination.
 */
export async function getAllUsersAdmin(
  params?: UsersFilterParams & {
    page?: number
    pageSize?: number
  }
): Promise<GetAllUsersAdminResult> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 50
  const skip = (page - 1) * pageSize

  const where = buildUsersWhere(params)

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
 * Tracé dans AuditLog (STATUS_CHANGE) — désactiver un compte cross-company
 * est plus sensible qu'un renvoi d'email, il doit être traçable (SP-543).
 */
export async function toggleUserStatusAdmin(
  userId: string,
  active: boolean
): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: active },
    select: { id: true, email: true, companyId: true },
  })

  // Audit trail — fire-and-forget, jamais bloquant
  logAuditAction({
    action: 'STATUS_CHANGE',
    entityType: 'USER',
    entityId: updated.id,
    userId: session.user.id,
    ...(updated.companyId && { companyId: updated.companyId }),
    details: {
      operation: active ? 'admin_activate_user' : 'admin_deactivate_user',
      targetEmail: updated.email,
    },
  }).catch(console.error)

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

  // Envoi via le service cœur (invalide l'ancien token, crée un token 24h,
  // trace dans EmailLog). Contrairement au flux public anti-énumération,
  // l'admin reçoit l'outcome RÉEL : un échec SMTP silencieux laisserait
  // l'utilisateur bloqué avec un toast de succès mensonger.
  const outcome = await sendVerificationEmailCore(user.email)

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
      outcome: outcome.status,
    },
  }).catch(console.error)

  if (outcome.status !== 'SENT') {
    return {
      success: false,
      error:
        outcome.status === 'SEND_FAILED'
          ? "L'envoi de l'email a échoué (SMTP) — réessayez dans quelques minutes"
          : "L'utilisateur n'est plus éligible au renvoi",
    }
  }

  return { success: true }
}

/**
 * Exporte en CSV le dataset COMPLET des utilisateurs correspondant aux
 * filtres (pas seulement la page affichée) — fix SP-541.
 *
 * Généré côté serveur (pattern exportAuditLogsCsv) : le client ajoute le
 * BOM UTF-8 au moment du Blob. Limite de sécurité 10 000 lignes.
 */
export async function exportUsersCsvAdmin(
  params?: UsersFilterParams
): Promise<CrudActionResult<string>> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  try {
    const where = buildUsersWhere(params)

    const users = await prisma.user.findMany({
      where,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: MAX_EXPORT_ROWS,
    })

    const escape = (value: string) => value.replace(/"/g, '""')

    const header =
      'ID,Email,Nom,Rôle,Entreprise,Email vérifié,Statut,Inscription'
    const rows = users.map((u) =>
      [
        u.id,
        escape(u.email),
        escape(u.name ?? ''),
        u.role,
        escape(u.company?.name ?? ''),
        u.emailVerified ? 'Oui' : 'Non',
        u.isActive ? 'Actif' : 'Inactif',
        u.createdAt.toISOString().split('T')[0],
      ]
        .map((cell) => `"${cell}"`)
        .join(',')
    )

    return { success: true, data: [header, ...rows].join('\n') }
  } catch (error) {
    console.error('[exportUsersCsvAdmin] Error:', error)
    return {
      success: false,
      error: "Erreur lors de l'export des utilisateurs",
    }
  }
}
