/**
 * ManagerStats - Grille de statistiques Manager
 *
 * Affiche les 4 KPIs principaux de l'equipe via StatsGrid :
 * - Membres equipe
 * - Conges a valider
 * - Absents aujourd'hui
 * - Heures equipe (mois)
 *
 * @ticket SP-316
 */
'use client'

import { Users, CalendarClock, UserX, Clock } from 'lucide-react'
import { StatsGrid } from '@/components/dashboard'
import type { StatCardProps, TrendDirection } from '@/types/dashboard'
import type { ManagerStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface ManagerStatsProps {
  /** Donnees de statistiques */
  stats: ManagerStatsResult
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
 * Formate les heures en format lisible
 */
function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

/**
 * Composant grille de statistiques Manager (4 KPIs)
 *
 * @example
 * <ManagerStats stats={managerStatsResult} />
 */
export function ManagerStats({
  stats,
  isLoading = false,
  className,
}: ManagerStatsProps) {
  // Construction des StatCards (4 KPIs)
  const statCards: StatCardProps[] = [
    {
      title: 'Membres equipe',
      value: stats.teamSize,
      icon: Users,
      description: 'Collaborateurs actifs',
    },
    {
      title: 'Conges a valider',
      value: stats.pendingLeaveRequests,
      icon: CalendarClock,
      description:
        stats.pendingLeaveRequests > 0
          ? 'En attente de validation'
          : 'Aucune demande',
    },
    {
      title: "Absents aujourd'hui",
      value: stats.todayAbsences,
      icon: UserX,
      description:
        stats.todayAbsences > 0
          ? 'Collaborateurs absents'
          : 'Equipe au complet',
    },
    {
      title: 'Heures equipe',
      value: formatHours(stats.teamHoursWorked.current),
      icon: Clock,
      trend: {
        value: Math.abs(stats.teamHoursWorked.trend),
        direction: getTrendDirection(stats.teamHoursWorked.trend),
        label: 'vs mois dernier',
      },
      description: 'Ce mois',
    },
  ]

  return (
    <div
      className={cn(className)}
      role="region"
      aria-label="Statistiques equipe"
      data-testid="manager-stats"
    >
      <StatsGrid stats={statCards} columns={4} isLoading={isLoading} />
    </div>
  )
}

export default ManagerStats
