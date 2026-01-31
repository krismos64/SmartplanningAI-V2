/**
 * AdminSignupsChart - Graphique des inscriptions mensuelles
 *
 * Affiche un BarChart des nouvelles inscriptions par mois.
 *
 * @ticket SP-148
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { BarChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AdminSignupsChartProps {
  /** Donnees de croissance des entreprises */
  companiesGrowth: Array<{
    month: string
    count: number
  }>
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Calcule les nouvelles inscriptions par mois (delta)
 * Le premier mois n'a pas de delta (pas de mois precedent)
 */
function calculateMonthlySignups(
  data: Array<{ month: string; count: number }>
): Array<{ name: string; value: number }> {
  if (!data || data.length === 0) return []

  return data.map((item, index) => {
    // Premier mois : pas de delta possible
    if (index === 0) {
      return { name: item.month, value: 0 }
    }
    const previousCount = data[index - 1]?.count ?? 0
    const delta = Math.max(0, item.count - previousCount)
    return {
      name: item.month,
      value: delta,
    }
  })
}

/**
 * Calcule le total des inscriptions
 */
function calculateTotalSignups(
  data: Array<{ name: string; value: number }>
): number {
  return data.reduce((sum, item) => sum + item.value, 0)
}

/**
 * Composant graphique des inscriptions
 *
 * @example
 * <AdminSignupsChart companiesGrowth={[{ month: 'Jan', count: 10 }]} />
 */
export function AdminSignupsChart({
  companiesGrowth,
  className,
}: AdminSignupsChartProps) {
  const chartData = calculateMonthlySignups(companiesGrowth)
  const totalSignups = calculateTotalSignups(chartData)
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
            Nouvelles inscriptions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {totalSignups} nouvelles entreprises sur 6 mois
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <BarChartWidget
            data={chartData}
            dataKey="value"
            height={200}
            showGrid
            showTooltip
            colors={['hsl(var(--chart-2))']}
          />
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucune donnee disponible
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (shouldReduceMotion) {
    return content
  }

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

export default AdminSignupsChart
