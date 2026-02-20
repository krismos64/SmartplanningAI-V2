'use client'

/**
 * SubscriptionPieChart - Répartition des abonnements en donut
 *
 * PieChartWidget avec couleurs sémantiques par statut.
 *
 * @ticket SP-465
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartWidget } from '@/components/charts'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import { cn } from '@/lib/utils'
import { PieChart } from 'lucide-react'
import type { SubscriptionDistributionItem } from '@/lib/actions/monitoring'

export interface SubscriptionPieChartProps {
  data: SubscriptionDistributionItem[]
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: CHART_COLORS.success,
  TRIAL: CHART_COLORS.primary[2],
  PAST_DUE: CHART_COLORS.warning,
  CANCELED: CHART_COLORS.neutral,
  EXPIRED: CHART_COLORS.danger,
  INCOMPLETE: CHART_COLORS.primary[4],
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  TRIAL: 'Essai',
  PAST_DUE: 'Impayé',
  CANCELED: 'Annulé',
  EXPIRED: 'Expiré',
  INCOMPLETE: 'Incomplet',
}

export function SubscriptionPieChart({
  data,
  className,
}: SubscriptionPieChartProps) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
  }))

  const colors = data.map(
    (d) => STATUS_COLORS[d.status] ?? CHART_COLORS.neutral
  )

  return (
    <Card
      className={cn('glass', className)}
      data-testid="subscription-pie-chart"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <PieChart className="h-5 w-5 text-primary" aria-hidden="true" />
          Répartition abonnements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PieChartWidget
          data={chartData}
          dataKey="value"
          height={250}
          innerRadius={50}
          outerRadius={90}
          showLegend
          showLabels
          colors={colors}
          disableAnimation={false}
          title="Répartition des abonnements"
        />
      </CardContent>
    </Card>
  )
}
