/**
 * DirectorTrendsChart - Graphique evolution des effectifs
 *
 * Affiche un AreaChartWidget avec l'evolution des effectifs
 * sur les 6 derniers mois.
 *
 * @ticket SP-147
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartWidget } from '@/components/charts'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface DirectorTrendsChartProps {
  /** Evolution des effectifs */
  employeeGrowth: DirectorStatsResult['employeeGrowth']
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Graphique d'aire pour l'evolution des effectifs
 *
 * @example
 * <DirectorTrendsChart employeeGrowth={stats.employeeGrowth} />
 */
export function DirectorTrendsChart({
  employeeGrowth,
  isLoading = false,
  className,
}: DirectorTrendsChartProps) {
  // Transformer les donnees pour l'AreaChart
  const chartData = employeeGrowth.map((item) => ({
    name: item.month,
    effectifs: item.count,
  }))

  // Calculer la croissance
  const firstCount = employeeGrowth[0]?.count ?? 0
  const lastCount = employeeGrowth[employeeGrowth.length - 1]?.count ?? 0
  const growth = firstCount > 0
    ? Math.round(((lastCount - firstCount) / firstCount) * 100)
    : 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">
              Evolution des effectifs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              6 derniers mois
            </p>
          </div>
          {/* Indicateur de croissance */}
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              growth >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            )}
          >
            {growth >= 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
            {growth >= 0 ? '+' : ''}{growth}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AreaChartWidget
          data={chartData}
          dataKey="effectifs"
          height={200}
          isLoading={isLoading}
          emptyMessage="Aucune donnee disponible"
          showGradient
          colors={[CHART_COLORS.primary[1]]}
          title="Evolution des effectifs"
        />
      </CardContent>
    </Card>
  )
}

export default DirectorTrendsChart
