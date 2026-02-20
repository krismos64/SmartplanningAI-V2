'use server'

/**
 * Server Action - Monitoring système
 *
 * Collecte les données de santé et métriques de la plateforme.
 * Réservé au SYSTEM_ADMIN.
 *
 * @ticket SP-464
 */

import { checkPermission } from './crud-utils'
import { checkDatabaseHealth } from '@/lib/db-health'
import { getAdminQuickStats } from '@/lib/services/dashboard/admin-stats.service'
import { prisma } from '@/lib/prisma'
import type { HealthCheckResult } from '@/lib/db-health'
import type { CrudActionResult } from '@/types'

/**
 * Répartition des abonnements par statut
 */
export interface SubscriptionBreakdownItem {
  status: string
  count: number
}

/**
 * Snapshot complet du monitoring
 */
export interface MonitoringSnapshot {
  health: HealthCheckResult
  quickStats: {
    companies: number
    users: number
    mrr: number
    churn: number
  }
  subscriptionBreakdown: SubscriptionBreakdownItem[]
  timestamp: number
}

/**
 * Récupère un snapshot complet de l'état de la plateforme
 *
 * Vérifie RBAC SYSTEM_ADMIN avant toute requête.
 * Agrège en parallèle : health check DB, stats SaaS, répartition abonnements.
 */
export async function getMonitoringSnapshot(): Promise<
  CrudActionResult<MonitoringSnapshot>
> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  try {
    const [health, statsResult, breakdown] = await Promise.all([
      checkDatabaseHealth(),
      getAdminQuickStats(),
      prisma.subscription.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    const quickStats =
      statsResult.success && statsResult.data
        ? statsResult.data
        : { companies: 0, users: 0, mrr: 0, churn: 0 }

    const subscriptionBreakdown: SubscriptionBreakdownItem[] = breakdown.map(
      (item) => ({
        status: item.status,
        count: item._count,
      })
    )

    return {
      success: true,
      data: {
        health,
        quickStats,
        subscriptionBreakdown,
        timestamp: Date.now(),
      },
    }
  } catch (error) {
    console.error('[getMonitoringSnapshot] Error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération du snapshot monitoring',
    }
  }
}
