/**
 * AdminPlansChart - Graphique de repartition des plans
 *
 * Affiche un PieChart de la repartition des abonnements par plan
 * avec legende et statistiques.
 *
 * @ticket SP-148
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { PieChartWidget } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AdminPlansChartProps {
  /** Repartition des revenus par plan */
  revenueByPlan: Array<{
    plan: string
    revenue: number
    count: number
  }>
  /** Distribution des statuts d'abonnement */
  subscriptionStatusDistribution: Array<{
    status: string
    count: number
  }>
  /** Classes CSS additionnelles */
  className?: string
}

// Couleurs pour les plans
const PLAN_COLORS: Record<string, string> = {
  Gratuit: 'hsl(var(--chart-4))',
  Starter: 'hsl(var(--chart-3))',
  Business: 'hsl(var(--chart-2))',
  Enterprise: 'hsl(var(--chart-1))',
}

/**
 * Formate un montant en EUR
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Composant graphique de repartition des plans
 *
 * @example
 * <AdminPlansChart
 *   revenueByPlan={[{ plan: 'Starter', revenue: 1000, count: 10 }]}
 *   subscriptionStatusDistribution={[{ status: 'Actif', count: 50 }]}
 * />
 */
export function AdminPlansChart({
  revenueByPlan,
  subscriptionStatusDistribution: _subscriptionStatusDistribution,
  className,
}: AdminPlansChartProps) {
  // Reserved for future status pie chart
  void _subscriptionStatusDistribution
  const shouldReduceMotion = useReducedMotion()

  // Transformer les donnees pour le PieChart (par nombre d'abonnements)
  const chartData = revenueByPlan
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: item.plan,
      value: item.count,
      color: PLAN_COLORS[item.plan] || 'hsl(var(--chart-5))',
    }))

  // Calculer le total des abonnements
  const totalSubscriptions = revenueByPlan.reduce(
    (sum, item) => sum + item.count,
    0
  )

  // Calculer le revenu total
  const totalRevenue = revenueByPlan.reduce(
    (sum, item) => sum + item.revenue,
    0
  )

  const content = (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Repartition des plans
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalSubscriptions} abonnements - {formatCurrency(totalRevenue)}/mois
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="space-y-4">
            <PieChartWidget
              data={chartData}
              dataKey="value"
              nameKey="name"
              height={160}
              innerRadius={40}
              outerRadius={70}
              showTooltip
            />

            {/* Legende detaillee */}
            <div className="space-y-2">
              {revenueByPlan.map((item) => {
                const percentage =
                  totalSubscriptions > 0
                    ? Math.round((item.count / totalSubscriptions) * 100)
                    : 0

                return (
                  <div
                    key={item.plan}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            PLAN_COLORS[item.plan] || 'hsl(var(--chart-5))',
                        }}
                      />
                      <span>{item.plan}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>{item.count} abos</span>
                      <span className="text-xs">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Aucun abonnement actif
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

export default AdminPlansChart
