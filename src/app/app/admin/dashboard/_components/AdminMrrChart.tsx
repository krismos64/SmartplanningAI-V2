/**
 * AdminMrrChart - Graphique d'evolution du MRR
 *
 * Affiche un AreaChart de l'evolution des entreprises sur 6 mois
 * (proxy pour l'evolution du MRR).
 *
 * @ticket SP-148
 */
'use client'

import { AreaChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AdminMrrChartProps {
  /** Donnees de croissance des entreprises */
  companiesGrowth: Array<{
    month: string
    count: number
  }>
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Calcule la croissance en pourcentage
 */
function calculateGrowth(
  data: Array<{ month: string; count: number }>
): number {
  if (!data || data.length < 2) return 0
  const first = data[0]?.count ?? 0
  const last = data[data.length - 1]?.count ?? 0
  if (first === 0) return 0
  return Math.round(((last - first) / first) * 100)
}

/**
 * Composant graphique d'evolution MRR
 *
 * @example
 * <AdminMrrChart companiesGrowth={[{ month: 'Jan', count: 10 }]} />
 */
export function AdminMrrChart({
  companiesGrowth,
  className,
}: AdminMrrChartProps) {
  const growth = calculateGrowth(companiesGrowth)
  const isPositive = growth >= 0

  // Transformer les donnees pour le chart
  const chartData = companiesGrowth.map((item) => ({
    name: item.month,
    value: item.count,
  }))

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">
              Evolution des entreprises
            </CardTitle>
            <p className="text-sm text-muted-foreground">6 derniers mois</p>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-red-500/10 text-red-600'
            )}
          >
            {isPositive ? (
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
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
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
                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
                <polyline points="16 17 22 17 22 11" />
              </svg>
            )}
            {isPositive ? '+' : ''}
            {growth}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <AreaChartWidget
            data={chartData}
            dataKey="value"
            height={200}
            showGrid
            showTooltip
            showGradient
            colors={['hsl(var(--chart-1))']}
          />
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnee disponible
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdminMrrChart
