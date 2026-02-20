'use client'

/**
 * CompanyGrowthChart - Nouvelles entreprises sur 30 jours
 *
 * AreaChartWidget affichant le nombre de créations d'entreprises par jour.
 *
 * @ticket SP-465
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartWidget } from '@/components/charts'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import { cn } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import type { DailyActivityPoint } from '@/lib/actions/monitoring'

export interface CompanyGrowthChartProps {
  data: DailyActivityPoint[]
  className?: string
}

export function CompanyGrowthChart({
  data,
  className,
}: CompanyGrowthChartProps) {
  const chartData = data.map((d) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    }),
    count: d.count,
  }))

  return (
    <Card className={cn('glass', className)} data-testid="company-growth-chart">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
          Nouvelles entreprises (30 jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AreaChartWidget
          data={chartData}
          dataKey="count"
          height={250}
          showGradient
          colors={[CHART_COLORS.success]}
          disableAnimation={false}
          title="Nouvelles entreprises"
        />
      </CardContent>
    </Card>
  )
}
