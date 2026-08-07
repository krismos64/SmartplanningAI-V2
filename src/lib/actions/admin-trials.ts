'use server'

/**
 * Server Actions pour le widget "Trials at risk" du dashboard admin.
 * Identifie les entreprises en période d'essai expirant dans les 7 prochains jours.
 * Réservé SYSTEM_ADMIN.
 *
 * L'urgence croise deux dimensions : le temps restant et l'engagement réel.
 * Le calendrier seul ne dit rien de ce qui se joue, un compte à 500 plannings
 * et un compte vide expirant le même jour n'appellent pas la même action.
 *
 * @ticket SP-473, SP-562
 */

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import {
  MS_PER_DAY,
  daysSince,
  deriveEngagement,
  deriveUrgency,
  type TrialEngagement,
} from '@/lib/billing/trial-engagement'

// ============================================================================
// Types
// ============================================================================

export interface TrialAtRisk {
  companyId: string
  companyName: string
  trialEndsAt: Date
  daysRemaining: number
  employeeCount: number
  ownerEmail: string | null
  urgency: 'critical' | 'warning' | 'info'
  /** Nombre de plannings créés depuis le début de l'essai */
  scheduleCount: number
  /** Dernière connexion du directeur, null s'il ne s'est jamais connecté */
  lastLoginAt: Date | null
  /** Jours écoulés depuis la dernière connexion, null si jamais connecté */
  daysSinceLastLogin: number | null
  engagement: TrialEngagement
}

// ============================================================================
// Actions
// ============================================================================

/**
 * Retourne les entreprises en période d'essai expirant dans les 7 prochains jours.
 * Triées par urgence (les plus proches d'abord).
 */
export async function getTrialsAtRisk(): Promise<TrialAtRisk[]> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * MS_PER_DAY)

  const companies = await prisma.company.findMany({
    where: {
      subscription: { status: 'TRIAL' },
      trialEndsAt: {
        lte: in7Days,
        gte: now,
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      trialEndsAt: true,
      _count: {
        select: {
          employees: { where: { isActive: true } },
          schedules: true,
        },
      },
      users: {
        where: { role: 'DIRECTOR' },
        select: { email: true, lastLoginAt: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { trialEndsAt: 'asc' },
  })

  return companies.map((c) => {
    const trialEndsAt = c.trialEndsAt!
    const msRemaining = trialEndsAt.getTime() - now.getTime()
    const daysRemaining = Math.ceil(msRemaining / MS_PER_DAY)

    const director = c.users[0]
    const lastLoginAt = director?.lastLoginAt ?? null
    const daysSinceLastLogin = lastLoginAt ? daysSince(lastLoginAt, now) : null

    const employeeCount = c._count?.employees ?? 0
    const scheduleCount = c._count?.schedules ?? 0

    const engagement = deriveEngagement({
      employeeCount,
      scheduleCount,
      daysSinceLastLogin,
    })

    return {
      companyId: c.id,
      companyName: c.name,
      trialEndsAt,
      daysRemaining,
      employeeCount,
      ownerEmail: director?.email ?? null,
      urgency: deriveUrgency({ daysRemaining, engagement }),
      scheduleCount,
      lastLoginAt,
      daysSinceLastLogin,
      engagement,
    }
  })
}

/**
 * Prolonge l'essai d'une entreprise de 7 jours supplémentaires.
 * Action admin manuelle.
 */
export async function extendTrial(
  companyId: string
): Promise<{ success: boolean }> {
  const session = await auth()
  if (!session?.user || !hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized')
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { trialEndsAt: true },
  })

  if (!company?.trialEndsAt) {
    throw new Error('Company not found or no trial')
  }

  const newEnd = new Date(
    company.trialEndsAt.getTime() + 7 * 24 * 60 * 60 * 1000
  )

  await prisma.company.update({
    where: { id: companyId },
    data: { trialEndsAt: newEnd },
  })

  return { success: true }
}
