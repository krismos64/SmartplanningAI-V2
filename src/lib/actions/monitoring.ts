'use server'

/**
 * Server Action - Monitoring système
 *
 * Collecte les données de santé et métriques de la plateforme.
 * Réservé au SYSTEM_ADMIN.
 *
 * @ticket SP-464, SP-465, SP-544
 */

import { checkPermission } from './crud-utils'
import { checkDatabaseHealth } from '@/lib/db-health'
import { getAdminQuickStats } from '@/lib/services/dashboard/admin-stats.service'
import { pingRedis } from '@/lib/redis'
import { getActiveSessions } from '@/lib/session-store'
import { prisma } from '@/lib/prisma'
import type { HealthCheckResult } from '@/lib/db-health'
import type { SubscriptionStatus } from '@prisma/client'
import type { CrudActionResult } from '@/types'

/**
 * Répartition des abonnements par statut
 */
export interface SubscriptionBreakdownItem {
  status: string
  count: number
}

/**
 * Santé Redis (SP-544)
 *
 * Statut "down" = mode dégradé, pas une panne : rate limiting en mémoire,
 * cache désactivé, sessions non tracées. L'application reste fonctionnelle.
 */
export interface RedisHealthInfo {
  status: 'up' | 'down'
  /** Latence du PING en ms, null si Redis est down */
  latency: number | null
}

/**
 * Session active (SP-544) — métadonnées d'affichage uniquement.
 * ip et userAgent sont volontairement exclus de l'UI (minimisation RGPD),
 * ils restent disponibles dans Redis pour investigation sécurité.
 */
export interface ActiveSessionInfo {
  userId: string
  email: string
  role: string
  companyId: string | null
  loginAt: string
  lastSeenAt: string
}

/**
 * Snapshot complet du monitoring
 */
export interface MonitoringSnapshot {
  health: HealthCheckResult
  redis: RedisHealthInfo
  activeSessions: ActiveSessionInfo[]
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
 * PING Redis avec mesure de latence.
 * Jamais bloquant : down → { status: 'down', latency: null }.
 */
async function checkRedisHealth(): Promise<RedisHealthInfo> {
  const start = Date.now()
  const isUp = await pingRedis()
  return {
    status: isUp ? 'up' : 'down',
    latency: isUp ? Date.now() - start : null,
  }
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
    const [health, redis, sessions, statsResult, breakdown] = await Promise.all(
      [
        checkDatabaseHealth(),
        checkRedisHealth(),
        getActiveSessions(),
        getAdminQuickStats(),
        prisma.subscription.groupBy({
          by: ['status'],
          _count: true,
        }),
      ]
    )

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

    // Sessions triées par activité récente, sans ip/userAgent (RGPD)
    const activeSessions: ActiveSessionInfo[] = sessions
      .map((s) => ({
        userId: s.userId,
        email: s.email,
        role: s.role,
        companyId: s.companyId,
        loginAt: s.loginAt,
        lastSeenAt: s.lastSeenAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
      )

    return {
      success: true,
      data: {
        health,
        redis,
        activeSessions,
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

// ============================================================================
// Chart Data — SP-465
// ============================================================================

/**
 * Point d'activité quotidien (audit logs)
 */
export interface DailyActivityPoint {
  date: string
  count: number
}

/**
 * Distribution des abonnements par statut (pour PieChart)
 */
export interface SubscriptionDistributionItem {
  status: SubscriptionStatus
  count: number
}

/**
 * Action la plus fréquente (pour BarChart)
 */
export interface TopActionItem {
  action: string
  count: number
}

/**
 * Données graphiques pour le monitoring
 */
export interface MonitoringChartData {
  auditActivity: DailyActivityPoint[]
  subscriptionDistribution: SubscriptionDistributionItem[]
  topActions: TopActionItem[]
  companyGrowth: DailyActivityPoint[]
}

/**
 * Génère un tableau de N jours consécutifs avec count=0
 */
function generateEmptyDays(days: number): Map<string, number> {
  const map = new Map<string, number>()
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0] ?? ''
    map.set(key, 0)
  }
  return map
}

/**
 * Récupère les données graphiques pour le monitoring
 *
 * Vérifie RBAC SYSTEM_ADMIN avant toute requête.
 * Agrège : activité audit 7j, distribution abonnements, top actions, croissance entreprises 30j.
 */
export async function getMonitoringChartData(): Promise<
  CrudActionResult<MonitoringChartData>
> {
  const authResult = await checkPermission('SYSTEM_ADMIN')
  if (!authResult.success) return authResult

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const [auditLogs, subscriptionGroups, topActionsRaw, companies] =
      await Promise.all([
        prisma.auditLog.findMany({
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true },
        }),
        prisma.subscription.groupBy({
          by: ['status'],
          _count: true,
        }),
        prisma.auditLog.groupBy({
          by: ['action'],
          where: { createdAt: { gte: sevenDaysAgo } },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 5,
        }),
        prisma.company.findMany({
          where: { createdAt: { gte: thirtyDaysAgo } },
          select: { createdAt: true },
        }),
      ])

    // auditActivity : agréger par jour (7 entrées)
    const activityMap = generateEmptyDays(7)
    for (const log of auditLogs) {
      const key = log.createdAt.toISOString().split('T')[0] ?? ''
      activityMap.set(key, (activityMap.get(key) ?? 0) + 1)
    }
    const auditActivity: DailyActivityPoint[] = Array.from(
      activityMap.entries()
    ).map(([date, count]) => ({ date, count }))

    // subscriptionDistribution
    const subscriptionDistribution: SubscriptionDistributionItem[] =
      subscriptionGroups.map((item) => ({
        status: item.status,
        count: item._count,
      }))

    // topActions
    const topActions: TopActionItem[] = topActionsRaw.map((item) => ({
      action: item.action,
      count: item._count.action,
    }))

    // companyGrowth : agréger par jour (30 entrées)
    const growthMap = generateEmptyDays(30)
    for (const company of companies) {
      const key = company.createdAt.toISOString().split('T')[0] ?? ''
      growthMap.set(key, (growthMap.get(key) ?? 0) + 1)
    }
    const companyGrowth: DailyActivityPoint[] = Array.from(
      growthMap.entries()
    ).map(([date, count]) => ({ date, count }))

    return {
      success: true,
      data: {
        auditActivity,
        subscriptionDistribution,
        topActions,
        companyGrowth,
      },
    }
  } catch (error) {
    console.error('[getMonitoringChartData] Error:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erreur lors de la récupération des données graphiques monitoring',
    }
  }
}
