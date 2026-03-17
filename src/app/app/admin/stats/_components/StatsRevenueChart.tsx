/**
 * StatsRevenueChart — Graphique revenus par plan (bar chart)
 *
 * @ticket SP-475
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { BarChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatsRevenueChartProps {
  revenueByPlan: Array<{ plan: string; revenue: number; count: number }>
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function StatsRevenueChart({
  revenueByPlan,
  className,
}: StatsRevenueChartProps) {
  const shouldReduceMotion = useReducedMotion()

  const totalRevenue = revenueByPlan.reduce((sum, r) => sum + r.revenue, 0)

  const chartData = revenueByPlan.map((item) => ({
    name: item.plan,
    value: item.revenue,
  }))

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Revenus par plan
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          MRR total : {formatCurrency(totalRevenue)}
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <BarChartWidget
            data={chartData}
            dataKey="value"
            height={250}
            showGrid
            showTooltip
            colors={['hsl(var(--chart-2))']}
          />
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucun revenu disponible
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
      custom={0.4}
    >
      {content}
    </motion.div>
  )
}
