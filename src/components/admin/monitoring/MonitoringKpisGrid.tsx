'use client'

/**
 * MonitoringKpisGrid - Grille KPIs monitoring SaaS
 *
 * Affiche 4 StatCards avec métriques clés : entreprises, utilisateurs, MRR, churn.
 * Réutilise le pattern StatsGrid + StatCard existant.
 *
 * @ticket SP-464
 */

import { StatsGrid } from '@/components/dashboard'
import { Building2, Users, Euro, TrendingDown } from 'lucide-react'
import type { StatCardProps } from '@/types/dashboard'

export interface MonitoringKpisGridProps {
  companies: number
  users: number
  mrr: number
  churn: number
  className?: string
}

export function MonitoringKpisGrid({
  companies,
  users,
  mrr,
  churn,
  className,
}: MonitoringKpisGridProps) {
  const stats: StatCardProps[] = [
    {
      title: 'Entreprises actives',
      value: companies,
      icon: Building2,
      variant: 'primary',
    },
    {
      title: 'Utilisateurs actifs',
      value: users,
      icon: Users,
      variant: 'info',
    },
    {
      title: 'MRR',
      value: `${mrr.toFixed(2)} €`,
      icon: Euro,
      variant: 'success',
    },
    {
      title: 'Taux de churn',
      value: `${churn}%`,
      icon: TrendingDown,
      variant: churn > 5 ? 'danger' : churn > 2 ? 'warning' : 'success',
    },
  ]

  return (
    <div data-testid="monitoring-kpis-grid" className={className}>
      <StatsGrid stats={stats} columns={4} />
    </div>
  )
}
