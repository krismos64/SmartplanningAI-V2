'use server'

/**
 * Server Actions pour le widget "Trials at risk" du dashboard admin.
 * Identifie les entreprises en période d'essai expirant dans les 7 prochains jours.
 * Réservé SYSTEM_ADMIN.
 *
 * @ticket SP-473
 */

import { auth } from '@/lib/auth'
import { hasRequiredRole } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

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
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

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
      _count: { select: { employees: { where: { isActive: true } } } },
      users: {
        where: { role: 'DIRECTOR' },
        select: { email: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { trialEndsAt: 'asc' },
  })

  return companies.map((c) => {
    const trialEndsAt = c.trialEndsAt!
    const msRemaining = trialEndsAt.getTime() - now.getTime()
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))

    const urgency: TrialAtRisk['urgency'] =
      daysRemaining <= 2 ? 'critical' : daysRemaining <= 5 ? 'warning' : 'info'

    return {
      companyId: c.id,
      companyName: c.name,
      trialEndsAt,
      daysRemaining,
      employeeCount: c._count.employees,
      ownerEmail: c.users[0]?.email ?? null,
      urgency,
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
