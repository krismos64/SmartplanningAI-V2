/**
 * StatsKpiGrid — Grille 6 KPIs pour la page stats admin
 *
 * Replique le pattern AdminStats mais pour la page stats dediee.
 *
 * @ticket SP-475
 */
'use client'

import { motion } from 'framer-motion'
import {
  staggerContainer,
  staggerItem,
  useReducedMotion,
} from '@/lib/animations'
import {
  Building,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard'
import type { StatCardProps, TrendData } from '@/types/dashboard'
import type { AdminStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface StatsKpiGridProps {
  stats: AdminStatsResult
  className?: string
}

function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k EUR`
  }
  return `${amount} EUR`
}

function toTrendData(trendPercent: number): TrendData {
  return {
    value: Math.abs(trendPercent),
    direction: trendPercent > 0 ? 'up' : trendPercent < 0 ? 'down' : 'neutral',
    label: 'vs mois dernier',
  }
}

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

export function StatsKpiGrid({ stats, className }: StatsKpiGridProps) {
  const conversionRate = calculateConversionRate(stats)
  const shouldReduceMotion = useReducedMotion()

  const statCards: StatCardProps[] = [
    {
      title: 'Entreprises',
      value: stats.totalCompanies.current,
      icon: Building,
      trend: toTrendData(stats.totalCompanies.trend),
      description: 'Entreprises actives',
      variant: 'primary',
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers.current,
      icon: Users,
      trend: toTrendData(stats.totalUsers.trend),
      description: 'Utilisateurs plateforme',
      variant: 'info',
    },
    {
      title: 'Abonnements actifs',
      value: stats.activeSubscriptions,
      icon: CreditCard,
      description: 'Trial + Paid',
      variant: 'accent',
    },
    {
      title: 'MRR',
      value: formatCurrency(stats.mrr.current),
      icon: DollarSign,
      trend: toTrendData(stats.mrr.trend),
      description: 'Revenus mensuels recurrents',
      variant: 'success',
    },
    {
      title: 'Taux conversion',
      value: conversionRate,
      unit: '%',
      icon: TrendingUp,
      description: 'Trial vers Paid',
      variant: conversionRate >= 50 ? 'success' : 'warning',
    },
    {
      title: 'Taux churn',
      value: stats.churnRate,
      unit: '%',
      icon: TrendingDown,
      description:
        stats.churnRate > 5 ? 'Attention requise' : 'Retention saine',
      variant: stats.churnRate > 5 ? 'danger' : 'success',
    },
  ]

  if (shouldReduceMotion) {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', className)}
        role="region"
        aria-label="Indicateurs cles de performance"
        data-testid="stats-kpi-grid"
      >
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', className)}
      role="region"
      aria-label="Indicateurs cles de performance"
      data-testid="stats-kpi-grid"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  )
}
