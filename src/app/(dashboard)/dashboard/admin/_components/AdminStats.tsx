/**
 * AdminStats - Grille de statistiques Super Admin
 *
 * Affiche les 6 KPIs principaux de la plateforme SaaS via StatsGrid :
 * - Total entreprises
 * - Total utilisateurs
 * - Abonnements actifs
 * - MRR (Monthly Recurring Revenue)
 * - Taux de conversion Trial -> Paid
 * - Taux de churn
 *
 * @ticket SP-148
 */
'use client'

import {
  Building,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { StatsGrid } from '@/components/dashboard'
import type { StatCardProps, TrendData } from '@/types/dashboard'
import type { AdminStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface AdminStatsProps {
  /** Donnees de statistiques */
  stats: AdminStatsResult
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate un montant en EUR
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k EUR`
  }
  return `${amount} EUR`
}

/**
 * Calcule le taux de conversion Trial -> Paid
 * (approximation basee sur les abonnements actifs vs trial)
 */
function calculateConversionRate(stats: AdminStatsResult): number {
  const trialCount =
    stats.subscriptionStatusDistribution.find((s) => s.status === 'Essai')
      ?.count ?? 0
  const activeCount =
    stats.subscriptionStatusDistribution.find((s) => s.status === 'Actif')
      ?.count ?? 0

  const total = trialCount + activeCount
  if (total === 0) return 0

  return Math.round((activeCount / total) * 100)
}

/**
 * Convertit un pourcentage de trend en TrendData
 */
function toTrendData(trendPercent: number): TrendData {
  return {
    value: Math.abs(trendPercent),
    direction: trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'neutral',
    label: 'vs mois dernier',
  }
}

/**
 * Composant grille de statistiques Super Admin (6 KPIs)
 *
 * @example
 * <AdminStats stats={adminStatsResult} />
 */
export function AdminStats({
  stats,
  isLoading = false,
  className,
}: AdminStatsProps) {
  const conversionRate = calculateConversionRate(stats)

  // Construction des StatCards (6 KPIs)
  const statCards: StatCardProps[] = [
    {
      title: 'Entreprises',
      value: stats.totalCompanies.current,
      icon: Building,
      trend: toTrendData(stats.totalCompanies.trend),
      description: 'Entreprises actives',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers.current,
      icon: Users,
      trend: toTrendData(stats.totalUsers.trend),
      description: 'Utilisateurs plateforme',
    },
    {
      title: 'Abonnements actifs',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      description: 'Trial + Paid',
    },
    {
      title: 'MRR',
      value: formatCurrency(stats.mrr.current),
      icon: DollarSign,
      trend: toTrendData(stats.mrr.trend),
      description: 'Revenus mensuels recurrents',
    },
    {
      title: 'Taux conversion',
      value: conversionRate,
      unit: '%',
      icon: TrendingUp,
      description: 'Trial vers Paid',
    },
    {
      title: 'Taux churn',
      value: stats.churnRate,
      unit: '%',
      icon: TrendingDown,
      description:
        stats.churnRate > 5 ? 'Attention requise' : 'Retention saine',
    },
  ]

  return (
    <div
      className={cn(className)}
      role="region"
      aria-label="Statistiques plateforme"
    >
      <StatsGrid stats={statCards} columns={3} isLoading={isLoading} />
    </div>
  )
}

export default AdminStats
