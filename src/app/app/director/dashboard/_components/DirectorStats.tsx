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
  Users,
  Building,
  Clock,
  Calendar,
  TrendingUp,
  UserMinus,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard'
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
  // Construction des StatCards (6 KPIs) avec variants Cyber Glass 3D
  const statCards: StatCardProps[] = [
    {
      title: 'Employes actifs',
      value: stats.totalEmployees,
      icon: Users,
      description: 'Total entreprise',
      variant: 'primary',
    },
    {
      title: 'Equipes',
      value: stats.totalTeams,
      icon: Building,
      description: 'Departements actifs',
      variant: 'accent',
    },
    {
      title: 'Conges en attente',
      value: stats.pendingLeaveRequests,
      icon: Clock,
      description:
        stats.pendingLeaveRequests > 0
          ? 'A valider par les managers'
          : 'Aucune demande',
      variant: stats.pendingLeaveRequests > 0 ? 'warning' : 'success',
    },
    {
      title: 'Heures planifiees',
      value: stats.plannedHoursThisMonth,
      unit: 'h',
      icon: Calendar,
      description: 'Ce mois',
      variant: 'info',
    },
    {
      title: 'Taux de presence',
      value: stats.averageAttendanceRate,
      unit: '%',
      icon: TrendingUp,
      description: 'Moyenne entreprise',
      variant: 'success',
    },
    {
      title: 'Absences 7j',
      value: stats.absencesLast7Days,
      icon: UserMinus,
      description:
        stats.absencesLast7Days > 0 ? 'Derniers 7 jours' : 'Aucune absence',
      variant: stats.absencesLast7Days > 0 ? 'danger' : 'success',
    },
  ]

  const shouldReduceMotion = useReducedMotion()

  // Version sans animation pour reduced motion ou loading
  if (shouldReduceMotion || isLoading) {
    return (
      <div
        className={cn('grid grid-cols-2 gap-4 md:grid-cols-3', className)}
        role="region"
        aria-label="Statistiques entreprise"
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
      aria-label="Statistiques entreprise"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default DirectorStats
