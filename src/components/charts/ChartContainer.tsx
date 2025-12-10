'use client'

/**
 * ChartContainer - Wrapper responsive pour les charts Recharts
 *
 * Encapsule les charts avec :
 * - ResponsiveContainer pour l'adaptation automatique
 * - Gestion des etats loading et empty
 * - Accessibilite integree
 *
 * @ticket SP-143
 */

import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { CHART_HEIGHTS } from './chartTheme'
import type { ChartContainerProps } from '@/types/charts'

/**
 * Message par defaut pour l'etat vide
 */
const DEFAULT_EMPTY_MESSAGE = 'Aucune donnee disponible'

/**
 * Wrapper responsive pour les charts
 *
 * @example
 * // Basique
 * <ChartContainer>
 *   <LineChart data={data}>...</LineChart>
 * </ChartContainer>
 *
 * // Avec hauteur personnalisee et loading
 * <ChartContainer height={400} isLoading>
 *   <LineChart data={data}>...</LineChart>
 * </ChartContainer>
 */
export function ChartContainer({
  height = CHART_HEIGHTS.md,
  isLoading = false,
  isEmpty = false,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  className,
  children,
}: ChartContainerProps) {
  // Etat de chargement
  if (isLoading) {
    return (
      <div
        className={cn('w-full', className)}
        style={{ height }}
        role="status"
        aria-busy="true"
        aria-label="Chargement du graphique"
        data-testid="chart-loading"
      >
        <div className="flex h-full w-full flex-col gap-4 p-4">
          {/* Skeleton pour le titre */}
          <Skeleton className="h-4 w-32" />
          {/* Skeleton pour le graphique */}
          <div className="flex flex-1 items-end gap-2">
            <Skeleton className="h-[60%] flex-1" />
            <Skeleton className="h-[80%] flex-1" />
            <Skeleton className="h-[45%] flex-1" />
            <Skeleton className="h-[70%] flex-1" />
            <Skeleton className="h-[55%] flex-1" />
            <Skeleton className="h-[90%] flex-1" />
            <Skeleton className="h-[65%] flex-1" />
          </div>
          {/* Skeleton pour la legende */}
          <div className="flex justify-center gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    )
  }

  // Etat vide
  if (isEmpty) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-center rounded-lg border border-dashed',
          className
        )}
        style={{ height }}
        role="status"
        aria-label={emptyMessage}
        data-testid="chart-empty"
      >
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  // Rendu normal avec ResponsiveContainer
  return (
    <div
      className={cn('w-full', className)}
      style={{ height }}
      role="img"
      aria-label="Graphique"
      data-testid="chart-container"
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export default ChartContainer
