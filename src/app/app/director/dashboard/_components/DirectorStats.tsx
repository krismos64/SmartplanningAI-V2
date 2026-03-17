/**
 * DirectorStats - Grille de statistiques Director
 *
 * Affiche les 3 KPIs principaux de l'entreprise :
 * - Employes actifs
 * - Equipes
 * - Conges en attente
 *
 * @ticket SP-147
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import {
  staggerContainer,
  staggerItem,
  useReducedMotion,
} from '@/lib/animations'
import { Users, Building, Clock } from 'lucide-react'
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
 * Composant grille de statistiques Director (3 KPIs)
 *
 * @example
 * <DirectorStats stats={directorStatsResult} />
 */
export function DirectorStats({
  stats,
  isLoading = false,
  className,
}: DirectorStatsProps) {
  const statCards: StatCardProps[] = [
    {
      title: 'Employés actifs',
      value: stats.totalEmployees,
      icon: Users,
      description: 'Total entreprise',
      variant: 'primary',
    },
    {
      title: 'Équipes',
      value: stats.totalTeams,
      icon: Building,
      description: 'Départements actifs',
      variant: 'accent',
    },
    {
      title: 'Congés en attente',
      value: stats.pendingLeaveRequests,
      icon: Clock,
      description:
        stats.pendingLeaveRequests > 0
          ? 'À valider par les managers'
          : 'Aucune demande',
      variant: stats.pendingLeaveRequests > 0 ? 'warning' : 'success',
    },
  ]

  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion || isLoading) {
    return (
      <div
        className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}
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
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-3', className)}
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
