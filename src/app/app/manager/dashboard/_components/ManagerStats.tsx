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
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import {
  staggerContainer,
  staggerItem,
  useReducedMotion,
} from '@/lib/animations'
import { Users, CalendarClock, UserX } from 'lucide-react'
import { StatCard } from '@/components/dashboard'
import type { StatCardProps } from '@/types/dashboard'
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
  // Construction des StatCards (4 KPIs) avec variants Cyber Glass 3D
  const statCards: StatCardProps[] = [
    {
      title: 'Membres équipe',
      value: stats.teamSize,
      icon: Users,
      description: 'Collaborateurs actifs',
      variant: 'primary',
    },
    {
      title: 'Congés à valider',
      value: stats.pendingLeaveRequests,
      icon: CalendarClock,
      description:
        stats.pendingLeaveRequests > 0
          ? 'En attente de validation'
          : 'Aucune demande',
      variant: stats.pendingLeaveRequests > 0 ? 'warning' : 'success',
    },
    {
      title: "Absents aujourd'hui",
      value: stats.todayAbsences,
      icon: UserX,
      description:
        stats.todayAbsences > 0
          ? stats.todayAbsenceDetails
              .map((a) => `${a.employeeName} (${a.reason})`)
              .join(', ')
          : 'Équipe au complet',
      variant: stats.todayAbsences > 0 ? 'danger' : 'success',
    },
  ]

  const shouldReduceMotion = useReducedMotion()

  // Version sans animation pour reduced motion ou loading
  if (shouldReduceMotion || isLoading) {
    return (
      <div
        className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}
        role="region"
        aria-label="Statistiques équipe"
        data-testid="manager-stats"
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
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}
      role="region"
      aria-label="Statistiques équipe"
      data-testid="manager-stats"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={staggerItem}>
          <StatCard {...stat} />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default ManagerStats
