'use client'

/**
 * Composant StatsGrid - Grille de cartes statistiques
 *
 * Organise plusieurs StatCard en grille responsive.
 * Gere l'etat de chargement global et l'empty state.
 *
 * @ticket SP-142
 */

import { cn } from '@/lib/utils'
import { StatCard } from './StatCard'
import type { StatsGridProps } from '@/types/dashboard'

/**
 * Configuration des colonnes selon la prop columns
 */
const GRID_COLUMNS = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const

/**
 * Grille responsive de cartes statistiques
 *
 * @example
 * // Grille basique
 * <StatsGrid stats={[
 *   { title: 'Utilisateurs', value: 1234 },
 *   { title: 'Revenus', value: '12 345 €' },
 * ]} />
 *
 * // Avec 3 colonnes et chargement
 * <StatsGrid stats={stats} columns={3} isLoading />
 */
export function StatsGrid({
  stats,
  columns = 4,
  isLoading = false,
  className,
}: StatsGridProps) {
  // Empty state
  if (!isLoading && (!stats || stats.length === 0)) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed p-8 text-center',
          className
        )}
        role="status"
        aria-label="Aucune statistique disponible"
      >
        <p className="text-sm text-muted-foreground">
          Aucune statistique disponible
        </p>
      </div>
    )
  }

  // Loading state : afficher des skeletons
  if (isLoading) {
    const skeletonCount = stats?.length || columns
    const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => ({
      title: `Loading ${i}`,
      value: 0,
      isLoading: true,
    }))

    return (
      <div
        className={cn('grid gap-4', GRID_COLUMNS[columns], className)}
        role="status"
        aria-busy="true"
        aria-label="Chargement des statistiques"
      >
        {skeletonItems.map((item, index) => (
          <StatCard key={`skeleton-${index}`} {...item} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', GRID_COLUMNS[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={stat.title || `stat-${index}`} {...stat} />
      ))}
    </div>
  )
}

export default StatsGrid
