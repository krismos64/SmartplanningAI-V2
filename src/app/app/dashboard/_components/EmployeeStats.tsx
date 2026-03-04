/**
 * EmployeeStats - Grille de statistiques Employee
 *
 * Affiche les KPIs principaux de l'employe via StatsGrid :
 * - Heures travaillees ce mois (avec tendance)
 * - Shifts a venir
 * - Solde conges restants
 * - Demandes en attente
 *
 * @ticket SP-145
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import {
  staggerContainer,
  staggerItem,
  useReducedMotion,
} from '@/lib/animations'
import { Clock, Calendar, Plane, FileText } from 'lucide-react'
import { StatCard } from '@/components/dashboard'
import type { StatCardProps, TrendDirection } from '@/types/dashboard'
import type {
  EmployeeStatsResult,
  TrendValue,
} from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface EmployeeStatsProps {
  /** Donnees de statistiques */
  stats: EmployeeStatsResult
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Determine la direction de tendance
 */
function getTrendDirection(trend: number): TrendDirection {
  if (trend > 0) return 'up'
  if (trend < 0) return 'down'
  return 'neutral'
}

/**
 * Convertit un TrendValue en TrendData pour StatCard
 */
function formatTrend(trendValue: TrendValue): {
  value: number
  direction: TrendDirection
  label: string
} {
  return {
    value: Math.abs(trendValue.trend),
    direction: getTrendDirection(trendValue.trend),
    label: 'vs mois dernier',
  }
}

/**
 * Formate les heures en format lisible
 */
function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

/**
 * Composant grille de statistiques Employee
 *
 * @example
 * <EmployeeStats stats={employeeStatsResult} />
 */
export function EmployeeStats({
  stats,
  isLoading = false,
  className,
}: EmployeeStatsProps) {
  // Construction des StatCards avec variants Cyber Glass 3D
  const statCards: StatCardProps[] = [
    {
      title: 'Heures travaillées',
      value: formatHours(stats.hoursWorked.current),
      icon: Clock,
      trend: formatTrend(stats.hoursWorked),
      description: 'Ce mois',
      variant: 'primary',
    },
    {
      title: 'Plannings à venir',
      value: stats.upcomingShifts,
      icon: Calendar,
      description: 'Planifiés',
      variant: 'info',
    },
    {
      title: 'Solde congés',
      value: stats.leaveBalance.remaining,
      icon: Plane,
      unit: ' jours',
      description: `${stats.leaveBalance.used}/${stats.leaveBalance.total} utilisés`,
      variant: 'success',
    },
    {
      title: 'Demandes en attente',
      value: stats.pendingRequests,
      icon: FileText,
      description:
        stats.pendingRequests > 0 ? 'En cours de traitement' : 'Aucune demande',
      variant: stats.pendingRequests > 0 ? 'warning' : 'default',
    },
  ]

  const shouldReduceMotion = useReducedMotion()

  // Version sans animation pour reduced motion ou loading
  if (shouldReduceMotion || isLoading) {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}
        role="region"
        aria-label="Statistiques employé"
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
      className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}
      role="region"
      aria-label="Statistiques employé"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default EmployeeStats
