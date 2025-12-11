/**
 * DirectorTeamsChart - Graphique repartition des equipes
 *
 * Affiche un PieChartWidget avec la repartition des effectifs
 * par equipe. Utilise les couleurs du theme.
 *
 * @ticket SP-147
 */
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChartWidget } from '@/components/charts'
import { getChartColors } from '@/components/charts/chartTheme'
import type { DirectorStatsResult } from '@/lib/services/dashboard/types'
import { cn } from '@/lib/utils'

export interface DirectorTeamsChartProps {
  /** Statistiques par equipe */
  teamStats: DirectorStatsResult['teamStats']
  /** Etat de chargement */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Graphique circulaire de repartition des equipes
 *
 * @example
 * <DirectorTeamsChart teamStats={stats.teamStats} />
 */
export function DirectorTeamsChart({
  teamStats,
  isLoading = false,
  className,
}: DirectorTeamsChartProps) {
  // Transformer les donnees pour le PieChart
  const chartData = teamStats.map((team) => ({
    name: team.name,
    value: team.employees,
  }))

  // Generer les couleurs automatiquement
  const colors = getChartColors(chartData.length)

  // Calculer le total
  const totalEmployees = teamStats.reduce((sum, team) => sum + team.employees, 0)

  // Verifier si donnees vides
  const isEmpty = chartData.length === 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Repartition par equipe
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalEmployees} employe{totalEmployees > 1 ? 's' : ''} au total
        </p>
      </CardHeader>
      <CardContent>
        <PieChartWidget
          data={chartData}
          dataKey="value"
          height={220}
          isLoading={isLoading}
          emptyMessage="Aucune equipe configuree"
          innerRadius={50}
          outerRadius={80}
          showLegend
          showLabels
          colors={colors}
          title="Repartition des effectifs par equipe"
        />

        {/* Liste des equipes */}
        {!isEmpty && !isLoading && (
          <div className="mt-4 space-y-2">
            {teamStats.map((team, index) => (
              <div
                key={team.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">{team.name}</span>
                </div>
                <span className="font-medium">
                  {team.employees} ({totalEmployees > 0
                    ? Math.round((team.employees / totalEmployees) * 100)
                    : 0}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DirectorTeamsChart
