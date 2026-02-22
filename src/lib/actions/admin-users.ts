'use server'

/**
 * Server Actions pour la gestion cross-company des utilisateurs.
 * Réservé au SYSTEM_ADMIN — isolation multi-tenant intentionnellement levée.
 *
 * @ticket SP-472
 */

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
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
  companyId: string | null
  companyName: string | null
  createdAt: Date
  lastLoginAt: Date | null
}

export interface GetAllUsersAdminResult {
  users: AdminUserRow[]
  total: number
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Récupère tous les utilisateurs de toutes les entreprises.
 * Supporte recherche, filtrage par rôle et par entreprise, pagination.
 */
export async function getAllUsersAdmin(params?: {
  search?: string
  role?: UserRole | 'ALL'
  companyId?: string
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
