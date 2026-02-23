/**
 * StatsSubscriptionChart — Graphique distribution abonnements (pie chart)
 *
 * @ticket SP-475
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { PieChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatsSubscriptionChartProps {
  subscriptionStatusDistribution: Array<{ status: string; count: number }>
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  Actif: 'hsl(var(--chart-1))',
  Essai: 'hsl(var(--chart-3))',
  Impaye: 'hsl(var(--chart-5))',
  Annule: 'hsl(var(--chart-4))',
  Expire: 'hsl(var(--muted-foreground))',
  Incomplet: 'hsl(var(--chart-2))',
}

export function StatsSubscriptionChart({
  subscriptionStatusDistribution,
  className,
}: StatsSubscriptionChartProps) {
  const shouldReduceMotion = useReducedMotion()
  const totalSubs = subscriptionStatusDistribution.reduce(
    (sum, s) => sum + s.count,
    0
  )

  const chartData = subscriptionStatusDistribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.status,
      value: item.count,
      color: STATUS_COLORS[item.status] || 'hsl(var(--chart-5))',
    }))

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Distribution abonnements
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalSubs} abonnements au total
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <PieChartWidget
              data={chartData}
              dataKey="value"
              nameKey="name"
              height={200}
              innerRadius={45}
              outerRadius={80}
              showTooltip
            />
            <div className="space-y-2">
              {subscriptionStatusDistribution.map((item) => {
                const pct =
                  totalSubs > 0
                    ? Math.round((item.count / totalSubs) * 100)
                    : 0
                return (
                  <div
                    key={item.status}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            STATUS_COLORS[item.status] ||
                            'hsl(var(--chart-5))',
                        }}
                      />
                      <span>{item.status}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucun abonnement
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (shouldReduceMotion) return content

  return (
    <motion.div
      variants={fadeSlideUpVariants}
      initial="hidden"
      animate="visible"
      custom={0.5}
    >
      {content}
    </motion.div>
  )
}
