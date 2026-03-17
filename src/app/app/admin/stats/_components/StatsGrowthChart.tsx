/**
 * StatsGrowthChart — Graphique croissance entreprises (area chart)
 *
 * @ticket SP-475
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { AreaChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface StatsGrowthChartProps {
  companiesGrowth: Array<{ month: string; count: number }>
  className?: string
}

export function StatsGrowthChart({
  companiesGrowth,
  className,
}: StatsGrowthChartProps) {
  const shouldReduceMotion = useReducedMotion()

  const chartData = companiesGrowth.map((item) => ({
    name: item.month,
    value: item.count,
  }))

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Croissance entreprises
        </CardTitle>
        <p className="text-sm text-muted-foreground">6 derniers mois</p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <AreaChartWidget
            data={chartData}
            dataKey="value"
            height={250}
            showGrid
            showTooltip
            showGradient
            colors={['hsl(var(--chart-1))']}
          />
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnee disponible
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
      custom={0.3}
    >
      {content}
    </motion.div>
  )
}
