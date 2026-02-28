/**
 * EmployeeSchedule - Planning hebdomadaire de l'employe
 *
 * Affiche un graphique en barres des heures travaillees
 * par jour de la semaine en cours.
 *
 * @ticket SP-145
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChartWidget } from '@/components/charts'
import { cn } from '@/lib/utils'
import { CHART_COLORS } from '@/components/charts/chartTheme'

interface WeeklyScheduleDay {
  day: string
  hours: number
}

export interface EmployeeScheduleProps {
  /** Planning de la semaine */
  weeklySchedule: WeeklyScheduleDay[]
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate les donnees pour le graphique
 */
function formatChartData(schedule: WeeklyScheduleDay[]) {
  return schedule.map((item) => ({
    name: item.day,
    heures: item.hours,
  }))
}

/**
 * Calcule le total d'heures de la semaine
 */
function calculateTotalHours(schedule: WeeklyScheduleDay[]): number {
  return schedule.reduce((total, day) => total + day.hours, 0)
}

/**
 * Composant planning hebdomadaire avec graphique
 *
 * @example
 * <EmployeeSchedule
 *   weeklySchedule={[
 *     { day: 'Lun', hours: 8 },
 *     { day: 'Mar', hours: 7.5 },
 *   ]}
 * />
 */
export function EmployeeSchedule({
  weeklySchedule,
  isLoading = false,
  className,
}: EmployeeScheduleProps) {
  const chartData = formatChartData(weeklySchedule)
  const totalHours = calculateTotalHours(weeklySchedule)

  // Format total heures
  const formatTotal = (hours: number): string => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    if (m === 0) return `${h}h`
    return `${h}h${m.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Mon planning cette semaine
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Total :{' '}
          <span className="font-semibold text-foreground">
            {formatTotal(totalHours)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <BarChartWidget
          data={chartData}
          dataKey="heures"
          height={200}
          isLoading={isLoading}
          showGrid
          showTooltip
          barSize={32}
          colors={[CHART_COLORS.primary[0]]}
          emptyMessage="Aucun shift planifié cette semaine"
          title="Planning hebdomadaire"
        />
      </CardContent>
    </Card>
  )
}

export default EmployeeSchedule
