/**
 * EmployeeLeaveBalance - Solde de conges en donut chart
 *
 * Affiche la repartition des conges utilises vs restants
 * sous forme de graphique circulaire (donut).
 *
 * @ticket SP-145
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartWidget } from '@/components/charts'
import { cn } from '@/lib/utils'
import { CHART_COLORS } from '@/components/charts/chartTheme'

interface LeaveBalance {
  remaining: number
  used: number
  total: number
}

export interface EmployeeLeaveBalanceProps {
  /** Donnees du solde de conges */
  leaveBalance: LeaveBalance
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate les donnees pour le graphique donut
 */
function formatChartData(balance: LeaveBalance) {
  return [
    { name: 'Utilises', value: balance.used },
    { name: 'Restants', value: balance.remaining },
  ]
}

/**
 * Composant solde de conges avec graphique donut
 *
 * @example
 * <EmployeeLeaveBalance
 *   leaveBalance={{ remaining: 15, used: 10, total: 25 }}
 * />
 */
export function EmployeeLeaveBalance({
  leaveBalance,
  isLoading = false,
  className,
}: EmployeeLeaveBalanceProps) {
  const chartData = formatChartData(leaveBalance)

  // Couleurs : vert pour restants, gris pour utilises
  const chartColors = [
    CHART_COLORS.neutral[0], // Utilises (gris)
    CHART_COLORS.status.success, // Restants (vert)
  ]

  // Pourcentage restant
  const percentRemaining = leaveBalance.total > 0
    ? Math.round((leaveBalance.remaining / leaveBalance.total) * 100)
    : 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Solde de conges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <PieChartWidget
            data={chartData}
            dataKey="value"
            height={200}
            isLoading={isLoading}
            showTooltip
            showLegend
            innerRadius={60}
            outerRadius={80}
            colors={chartColors}
            emptyMessage="Aucune donnee de conges"
            title="Repartition des conges"
          />

          {/* Label central */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center -mt-8">
                <p className="text-2xl font-bold">{leaveBalance.remaining}</p>
                <p className="text-xs text-muted-foreground">jours restants</p>
              </div>
            </div>
          )}
        </div>

        {/* Resume textuel */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Utilises</p>
            <p className="font-semibold">{leaveBalance.used} j</p>
          </div>
          <div>
            <p className="text-muted-foreground">Restants</p>
            <p className="font-semibold text-green-600">{leaveBalance.remaining} j</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-semibold">{leaveBalance.total} j</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{percentRemaining}% restants</span>
            <span>{100 - percentRemaining}% utilises</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${percentRemaining}%` }}
              role="progressbar"
              aria-valuenow={percentRemaining}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${percentRemaining}% de conges restants`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EmployeeLeaveBalance
