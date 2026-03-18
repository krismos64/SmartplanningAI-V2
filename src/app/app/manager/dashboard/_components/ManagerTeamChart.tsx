/**
 * ManagerTeamChart - Graphique de performance de l'equipe
 *
 * Affiche un graphique en barres horizontales des heures
 * travaillees par membre de l'equipe.
 *
 * @ticket SP-316
 * @ticket SP-431 - Animations Framer Motion
 */
'use client'

import { motion } from 'framer-motion'
import { fadeSlideUpVariants, useReducedMotion } from '@/lib/animations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChartWidget } from '@/components/charts'
import { cn } from '@/lib/utils'
import { CHART_COLORS } from '@/components/charts/chartTheme'

interface TeamMemberPerformance {
  name: string
  hoursWorked: number
  scheduledHours: number
}

export interface ManagerTeamChartProps {
  /** Donnees de performance par membre */
  teamPerformance: TeamMemberPerformance[]
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Formate les donnees pour le graphique
 * Calcule le pourcentage de completion par membre
 */
function formatChartData(performance: TeamMemberPerformance[]) {
  return performance.map((member) => {
    const completion =
      member.scheduledHours > 0
        ? Math.round((member.hoursWorked / member.scheduledHours) * 100)
        : 0
    return {
      name: member.name,
      heures: member.hoursWorked,
      completion,
    }
  })
}

/**
 * Composant graphique de performance equipe
 *
 * @example
 * <ManagerTeamChart
 *   teamPerformance={[
 *     { name: 'Alice D.', hoursWorked: 35, scheduledHours: 35 },
 *     { name: 'Bob M.', hoursWorked: 32, scheduledHours: 35 },
 *   ]}
 * />
 */
export function ManagerTeamChart({
  teamPerformance,
  isLoading = false,
  className,
}: ManagerTeamChartProps) {
  const chartData = formatChartData(teamPerformance)
  const shouldReduceMotion = useReducedMotion()

  const content = (
    <Card
      className={cn('overflow-hidden', className)}
      data-testid="manager-team-chart"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Heures travaillées ce mois
        </CardTitle>
      </CardHeader>
      <CardContent>
        {teamPerformance.length === 0 && !isLoading ? (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucun membre dans l&apos;équipe
            </p>
          </div>
        ) : (
          <BarChartWidget
            data={chartData}
            dataKey="heures"
            height={200}
            isLoading={isLoading}
            showGrid
            showTooltip
            barSize={24}
            colors={[CHART_COLORS.primary[0]]}
            emptyMessage="Aucune donnée de performance"
            title="Heures travaillées par membre"
          />
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
      transition={{ delay: 0.3 }}
    >
      {content}
    </motion.div>
  )
}

export default ManagerTeamChart
