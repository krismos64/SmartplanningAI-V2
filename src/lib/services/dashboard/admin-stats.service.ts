/**
 * Service de statistiques pour le role SYSTEM_ADMIN
 *
 * Recupere les donnees globales de la plateforme SaaS :
 * - Nombre total d'entreprises et utilisateurs
 * - Abonnements actifs
 * - MRR (Monthly Recurring Revenue)
 * - Taux de churn
 * - Croissance des entreprises (area chart)
 * - Revenue par plan (pie/bar chart)
 * - Distribution des statuts d'abonnement
 *
 * @ticket SP-144
 * @see Context7 - Prisma Best Practices Data Access Layer
 */

import { prisma } from '@/lib/prisma'
import type { AdminStatsResult, ServiceResult } from './types'
import {
  calculateTrend,
  getDefaultDateRange,
  getPreviousPeriod,
  getLastMonthsLabels,
} from './base-stats.service'

// Prix mensuels par plan (en EUR)
const PLAN_PRICES: Record<string, number> = {
  FREE: 0,
  STARTER: 29,
  BUSINESS: 99,
  ENTERPRISE: 299, // Prix de base, ajuste selon contrat
}

/**
 * Recupere les statistiques completes pour un admin
 * Note: Pas de verification d'acces car seul SYSTEM_ADMIN peut appeler ce service
 *
 * @returns Statistiques globales de la plateforme ou erreur
 */
export async function getAdminStats(): Promise<
  ServiceResult<AdminStatsResult>
> {
  try {
    // Recuperation des donnees en parallele
    const [
      totalCompanies,
      totalUsers,
      activeSubscriptions,
      mrr,
      churnRate,
      companiesGrowth,
      revenueByPlan,
      subscriptionStatusDistribution,
    ] = await Promise.all([
      getTotalCompanies(),
      getTotalUsers(),
      getActiveSubscriptionsCount(),
      getMRR(),
      getChurnRate(),
      getCompaniesGrowth(),
      getRevenueByPlan(),
      getSubscriptionStatusDistribution(),
    ])

    return {
      success: true,
      data: {
        totalCompanies,
        totalUsers,
        activeSubscriptions,
        mrr,
        churnRate,
        companiesGrowth,
        revenueByPlan,
        subscriptionStatusDistribution,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue'
    return {
      success: false,
      error: `Erreur lors de la recuperation des stats admin: ${message}`,
    }
  }
}

/**
 * Compte le nombre total d'entreprises avec tendance
 */
async function getTotalCompanies(): Promise<
  AdminStatsResult['totalCompanies']
> {
  const dateRange = getDefaultDateRange()
  const previousPeriod = getPreviousPeriod(dateRange)

  // Entreprises actives actuellement
  const current = await prisma.company.count({
    where: {
      isActive: true,
    },
  })

  // Entreprises a la fin de la periode precedente
  const previous = await prisma.company.count({
    where: {
      isActive: true,
      createdAt: { lte: previousPeriod.to },
    },
  })

  return {
    current,
    previous,
    trend: calculateTrend(current, previous),
  }
}

/**
 * Compte le nombre total d'utilisateurs avec tendance
 */
async function getTotalUsers(): Promise<AdminStatsResult['totalUsers']> {
  const dateRange = getDefaultDateRange()
  const previousPeriod = getPreviousPeriod(dateRange)

  // Utilisateurs actifs actuellement
  const current = await prisma.user.count({
    where: {
      isActive: true,
    },
  })

  // Utilisateurs a la fin de la periode precedente
  const previous = await prisma.user.count({
    where: {
      isActive: true,
      createdAt: { lte: previousPeriod.to },
    },
  })

  return {
    current,
    previous,
    trend: calculateTrend(current, previous),
  }
}

/**
 * Compte les abonnements actifs (ACTIVE + TRIAL)
 */
async function getActiveSubscriptionsCount(): Promise<number> {
  return prisma.subscription.count({
    where: {
      status: { in: ['ACTIVE', 'TRIAL'] },
    },
  })
}

/**
 * Calcule le MRR (Monthly Recurring Revenue) avec tendance
 */
async function getMRR(): Promise<AdminStatsResult['mrr']> {
  const dateRange = getDefaultDateRange()
  const previousPeriod = getPreviousPeriod(dateRange)

  // Abonnements actifs payants actuellement
  const currentSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      plan: true,
      planPrice: true,
      billingInterval: true,
    },
  })

  const currentMRR = calculateMRRFromSubscriptions(currentSubscriptions)

  // Abonnements a la fin de la periode precedente (approximation)
  const previousSubscriptions = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      createdAt: { lte: previousPeriod.to },
    },
    select: {
      plan: true,
      planPrice: true,
      billingInterval: true,
    },
  })

  const previousMRR = calculateMRRFromSubscriptions(previousSubscriptions)

  return {
    current: currentMRR,
    previous: previousMRR,
    trend: calculateTrend(currentMRR, previousMRR),
  }
}

/**
 * Calcule le MRR a partir d'une liste d'abonnements
 */
function calculateMRRFromSubscriptions(
  subscriptions: Array<{
    plan: string
    planPrice: number | null
    billingInterval: string | null
  }>
): number {
  return subscriptions.reduce((total, sub) => {
    // Utiliser le prix personnalise si disponible, sinon le prix par defaut
    let monthlyPrice = sub.planPrice ?? PLAN_PRICES[sub.plan] ?? 0

    // Si facturation annuelle, diviser par 12
    if (sub.billingInterval === 'year') {
      monthlyPrice = monthlyPrice / 12
    }

    return total + monthlyPrice
  }, 0)
}

/**
 * Calcule le taux de churn mensuel
 * (nombre d'entreprises annulees / total au debut du mois)
 */
async function getChurnRate(): Promise<number> {
  const dateRange = getDefaultDateRange()

  // Entreprises au debut du mois
  const startCount = await prisma.company.count({
    where: {
      createdAt: { lte: dateRange.from },
    },
  })

  if (startCount === 0) return 0

  // Entreprises desactivees ou abonnements annules pendant le mois
  const churned = await prisma.subscription.count({
    where: {
      status: 'CANCELED',
      canceledAt: { gte: dateRange.from, lte: dateRange.to },
    },
  })

  return Math.round((churned / startCount) * 100 * 100) / 100 // 2 decimales
}

/**
 * Recupere la croissance des entreprises sur 6 mois (pour area chart)
 */
async function getCompaniesGrowth(): Promise<
  AdminStatsResult['companiesGrowth']
> {
  const labels = getLastMonthsLabels(6)
  const now = new Date()

  const growth = await Promise.all(
    labels.map(async (month, index) => {
      // Calculer la date de fin pour ce mois
      const monthsAgo = 5 - index
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth() - monthsAgo + 1,
        0
      )

      // Compter les entreprises actives a cette date
      const count = await prisma.company.count({
        where: {
          isActive: true,
          createdAt: { lte: endDate },
        },
      })

      return { month, count }
    })
  )

  return growth
}

/**
 * Recupere le revenue par plan d'abonnement (pour pie/bar chart)
 */
async function getRevenueByPlan(): Promise<AdminStatsResult['revenueByPlan']> {
  // Grouper les abonnements par plan
  const subscriptionsByPlan = await prisma.subscription.groupBy({
    by: ['plan'],
    where: {
      status: 'ACTIVE',
    },
    _count: true,
  })

  // Calculer le revenue pour chaque plan
  const revenueByPlan = subscriptionsByPlan.map((item) => {
    const monthlyPrice = PLAN_PRICES[item.plan] ?? 0
    const revenue = monthlyPrice * item._count

    return {
      plan: getPlanLabel(item.plan),
      revenue,
      count: item._count,
    }
  })

  // Ajouter les plans sans abonnements avec 0
  const allPlans = ['FREE', 'STARTER', 'BUSINESS', 'ENTERPRISE']
  allPlans.forEach((plan) => {
    if (!revenueByPlan.find((r) => r.plan === getPlanLabel(plan))) {
      revenueByPlan.push({
        plan: getPlanLabel(plan),
        revenue: 0,
        count: 0,
      })
    }
  })

  return revenueByPlan.sort((a, b) => b.revenue - a.revenue)
}

/**
 * Recupere la distribution des statuts d'abonnement (pour pie chart)
 */
async function getSubscriptionStatusDistribution(): Promise<
  AdminStatsResult['subscriptionStatusDistribution']
> {
  const subscriptionsByStatus = await prisma.subscription.groupBy({
    by: ['status'],
    _count: true,
  })

  // Mapper vers les labels francais
  const statusLabels: Record<string, string> = {
    TRIAL: 'Essai',
    ACTIVE: 'Actif',
    PAST_DUE: 'Impayé',
    CANCELED: 'Annulé',
    EXPIRED: 'Expiré',
  }

  return subscriptionsByStatus.map((item) => ({
    status: statusLabels[item.status] || item.status,
    count: item._count,
  }))
}

/**
 * Retourne le label francais d'un plan
 */
function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    FREE: 'Gratuit',
    STARTER: 'Starter',
    BUSINESS: 'Business',
    ENTERPRISE: 'Enterprise',
  }
  return labels[plan] || plan
}

/**
 * Recupere uniquement le total d'entreprises (version simplifiee)
 */
export async function getAdminCompanyCountOnly(): Promise<
  ServiceResult<{ current: number; trend: number }>
> {
  try {
    const data = await getTotalCompanies()
    return {
      success: true,
      data: {
        current: data.current,
        trend: data.trend,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere uniquement le MRR (version simplifiee)
 */
export async function getAdminMRROnly(): Promise<
  ServiceResult<{ current: number; trend: number }>
> {
  try {
    const data = await getMRR()
    return {
      success: true,
      data: {
        current: data.current,
        trend: data.trend,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere uniquement le taux de churn (version simplifiee)
 */
export async function getAdminChurnRateOnly(): Promise<ServiceResult<number>> {
  try {
    const rate = await getChurnRate()
    return { success: true, data: rate }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

/**
 * Recupere les metriques principales pour un dashboard compact
 */
export async function getAdminQuickStats(): Promise<
  ServiceResult<{
    companies: number
    users: number
    mrr: number
    churn: number
  }>
> {
  try {
    const [companies, users, mrr, churn] = await Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      getMRR(),
      getChurnRate(),
    ])

    return {
      success: true,
      data: {
        companies,
        users,
        mrr: mrr.current,
        churn,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}
