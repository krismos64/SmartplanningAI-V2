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
 */
'use client'

import { Clock, Calendar, Plane, FileText } from 'lucide-react'
import { StatsGrid } from '@/components/dashboard'
import type { StatCardProps, TrendDirection } from '@/types/dashboard'
import type { EmployeeStatsResult, TrendValue } from '@/lib/services/dashboard/types'
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
  // Construction des StatCards
  const statCards: StatCardProps[] = [
    {
      title: 'Heures travaillees',
      value: formatHours(stats.hoursWorked.current),
      icon: Clock,
      trend: formatTrend(stats.hoursWorked),
      description: 'Ce mois',
    },
    {
      title: 'Shifts a venir',
      value: stats.upcomingShifts,
      icon: Calendar,
      description: 'Planifies',
    },
    {
      title: 'Solde conges',
      value: stats.leaveBalance.remaining,
      icon: Plane,
      unit: ' jours',
      description: `${stats.leaveBalance.used}/${stats.leaveBalance.total} utilises`,
    },
    {
      title: 'Demandes en attente',
      value: stats.pendingRequests,
      icon: FileText,
      description: stats.pendingRequests > 0 ? 'En cours de traitement' : 'Aucune demande',
    },
  ]

  return (
    <div className={cn(className)} role="region" aria-label="Statistiques employee">
      <StatsGrid
        stats={statCards}
        columns={4}
        isLoading={isLoading}
      />
    </div>
  )
}

export default EmployeeStats
