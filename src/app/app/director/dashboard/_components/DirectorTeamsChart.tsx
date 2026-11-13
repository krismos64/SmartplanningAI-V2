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
  /** Nombre d'employés actifs de l'entreprise, avec ou sans équipe */
  totalEmployees: number
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
  totalEmployees,
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

  // Employés rattachés à une équipe. Un employé n'a qu'une équipe
  // (Employee.teamId), la somme ne compte donc personne deux fois.
  const assignedEmployees = teamStats.reduce(
    (sum, team) => sum + team.employees,
    0
  )
  // SP-627 : le sous-titre annonçait cette somme comme « au total », soit
  // « 0 employé » à côté d'un compteur « Employés actifs 1 » tant que
  // personne n'a d'équipe.
  const unassignedEmployees = Math.max(0, totalEmployees - assignedEmployees)

  // Verifier si donnees vides
  const isEmpty = chartData.length === 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Répartition par équipe
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalEmployees} employé{totalEmployees > 1 ? 's' : ''} au total
          {unassignedEmployees > 0 &&
            `, dont ${unassignedEmployees} sans équipe`}
        </p>
      </CardHeader>
      <CardContent>
        <PieChartWidget
          data={chartData}
          dataKey="value"
          height={250}
          isLoading={isLoading}
          emptyMessage="Aucune équipe configurée"
          innerRadius={50}
          outerRadius={100}
          showLegend={false}
          showLabels={false}
          colors={colors}
          title="Répartition des effectifs par équipe"
        />

        {/* Liste des equipes */}
        {!isEmpty && !isLoading && (
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
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
                  {team.employees} (
                  {assignedEmployees > 0
                    ? Math.round((team.employees / assignedEmployees) * 100)
                    : 0}
                  %)
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
