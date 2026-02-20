'use client'

/**
 * ActivityChart - Activité plateforme sur 7 jours
 *
 * AreaChartWidget affichant le nombre d'actions audit par jour.
 *
 * @ticket SP-465
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartWidget } from '@/components/charts'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import { cn } from '@/lib/utils'
import { Activity } from 'lucide-react'
import type { DailyActivityPoint } from '@/lib/actions/monitoring'

export interface ActivityChartProps {
  data: DailyActivityPoint[]
  className?: string
}

export function ActivityChart({ data, className }: ActivityChartProps) {
  const chartData = data.map((d) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }),
    count: d.count,
  }))

  return (
    <Card className={cn('glass', className)} data-testid="activity-chart">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
          Activité plateforme (7 derniers jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChartWidget
          data={chartData}
          dataKey="count"
          height={250}
          showGradient
          colors={[CHART_COLORS.primary[0]]}
          disableAnimation={false}
          title="Activité plateforme"
        />
      </CardContent>
    </Card>
  )
}
