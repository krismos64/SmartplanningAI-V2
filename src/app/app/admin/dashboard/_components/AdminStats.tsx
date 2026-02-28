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
 * @ticket SP-431 - Animations Framer Motion
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

  // Construction des StatCards (6 KPIs) avec variants Cyber Glass 3D
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
        stats.churnRate > 5 ? 'Attention requise' : 'Rétention saine',
      variant: stats.churnRate > 5 ? 'danger' : 'success',
    },
  ]

  const shouldReduceMotion = useReducedMotion()

  // Version sans animation pour reduced motion ou loading
  if (shouldReduceMotion || isLoading) {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', className)}
        role="region"
        aria-label="Statistiques plateforme"
      >
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} isLoading={isLoading} />
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
      aria-label="Statistiques plateforme"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default AdminStats
