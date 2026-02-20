'use client'

/**
 * TopActionsChart - Top 5 actions audit (barres horizontales)
 *
 * BarChartWidget horizontal affichant les actions les plus fréquentes.
 *
 * @ticket SP-465
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChartWidget } from '@/components/charts'
import { CHART_COLORS } from '@/components/charts/chartTheme'
import { cn } from '@/lib/utils'
import { BarChart3 } from 'lucide-react'
import type { TopActionItem } from '@/lib/actions/monitoring'

export interface TopActionsChartProps {
  data: TopActionItem[]
  className?: string
}

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  DELETE: 'Suppression',
  LOGIN: 'Connexion',
  LOGOUT: 'Déconnexion',
  EXPORT: 'Export',
  STATUS_CHANGE: 'Changement statut',
  IMPERSONATE: 'Impersonation',
  PASSWORD_CHANGE: 'Mot de passe',
}

export function TopActionsChart({ data, className }: TopActionsChartProps) {
  const chartData = data.map((d) => ({
    name: ACTION_LABELS[d.action] ?? d.action,
    count: d.count,
  }))

  return (
    <Card className={cn('glass', className)} data-testid="top-actions-chart">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          Top actions (7 jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <BarChartWidget
          data={chartData}
          dataKey="count"
          height={250}
          horizontal
          colors={[...CHART_COLORS.primary]}
          disableAnimation={false}
          title="Top 5 actions audit"
        />
      </CardContent>
    </Card>
  )
}
