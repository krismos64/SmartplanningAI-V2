/**
 * DirectorStats - Grille de statistiques Director
 *
 * Affiche les 6 KPIs principaux de l'entreprise via StatsGrid :
 * - Employes actifs
 * - Equipes
 * - Conges en attente
 * - Heures planifiees (mois)
 * - Taux de presence
 * - Absences 7 jours
 *
 * @ticket SP-147
 * @ticket SP-317 - Ajout heures planifiees et absences 7j
 */
'use client'

import {
  Users,
  Building,
  Clock,
  Calendar,
  TrendingUp,
  UserMinus,
} from 'lucide-react'
import { StatsGrid } from '@/components/dashboard'
import type { StatCardProps } from '@/types/dashboard'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface DirectorStatsProps {
  /** Donnees de statistiques */
  stats: DirectorStatsResult
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant grille de statistiques Director (6 KPIs)
 *
 * @example
 * <DirectorStats stats={directorStatsResult} />
 */
export function DirectorStats({
  stats,
  isLoading = false,
  className,
}: DirectorStatsProps) {
  // Construction des StatCards (6 KPIs)
  const statCards: StatCardProps[] = [
    {
      title: 'Employes actifs',
      value: stats.totalEmployees,
      icon: Users,
      description: 'Total entreprise',
    },
    {
      title: 'Equipes',
      value: stats.totalTeams,
      icon: Building,
      description: 'Departements actifs',
    },
    {
      title: 'Conges en attente',
      value: stats.pendingLeaveRequests,
      icon: Clock,
      description:
        stats.pendingLeaveRequests > 0
          ? 'A valider par les managers'
          : 'Aucune demande',
    },
    {
      title: 'Heures planifiees',
      value: stats.plannedHoursThisMonth,
      unit: 'h',
      icon: Calendar,
      description: 'Ce mois',
    },
    {
      title: 'Taux de presence',
      value: stats.averageAttendanceRate,
      unit: '%',
      icon: TrendingUp,
      description: 'Moyenne entreprise',
    },
    {
      title: 'Absences 7j',
      value: stats.absencesLast7Days,
      icon: UserMinus,
      description:
        stats.absencesLast7Days > 0 ? 'Derniers 7 jours' : 'Aucune absence',
    },
  ]

  return (
    <div
      className={cn(className)}
      role="region"
      aria-label="Statistiques entreprise"
    >
      <StatsGrid stats={statCards} columns={3} isLoading={isLoading} />
    </div>
  )
}

export default DirectorStats
