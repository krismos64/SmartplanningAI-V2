'use client'

/**
 * BarChartWidget - Graphique en barres pour comparaisons
 *
 * Composant base sur Recharts pour afficher des comparaisons
 * avec support vertical/horizontal, stacked et couleurs personnalisees.
 *
 * @ticket SP-143
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import { ChartContainer } from './ChartContainer'
import {
  CHART_COLORS,
  getChartColor,
  TOOLTIP_STYLES,
  DEFAULT_XAXIS_PROPS,
  DEFAULT_YAXIS_PROPS,
  DEFAULT_GRID_PROPS,
  ANIMATION_CONFIG,
  NO_ANIMATION_PROPS,
  CHART_MARGINS,
  CHART_MARGINS_WITH_LEGEND,
} from './chartTheme'
import type { BarChartProps, TooltipPayload } from '@/types/charts'

/**
 * Tooltip personnalise style Shadcn/Card
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="mb-2 text-sm font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div
          key={`tooltip-${index}`}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium">
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('fr-FR')
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Widget graphique en barres responsive
 *
 * @example
 * // Barres verticales simples
 * <BarChartWidget
 *   data={[{ name: 'A', value: 100 }, { name: 'B', value: 200 }]}
 *   dataKey="value"
 * />
 *
 * @example
 * // Barres horizontales empilees
 * <BarChartWidget
 *   data={data}
 *   dataKey={['revenue', 'expenses']}
 *   horizontal
 *   stacked
 * />
 */
export function BarChartWidget({
  data,
  dataKey,
  height,
  isLoading = false,
  emptyMessage,
  className,
  title,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  disableAnimation = false,
  stacked = false,
  horizontal = false,
  barSize,
  colors,
  radius = 4,
}: BarChartProps) {
  // Normaliser dataKey en tableau
  const dataKeys = Array.isArray(dataKey) ? dataKey : [dataKey]

  // Determiner les couleurs
  const chartColors = colors ?? dataKeys.map((_, i) => getChartColor(i))

  // Verifier si donnees vides
  const isEmpty = !data || data.length === 0

  // Props d'animation
  const animationProps = disableAnimation ? NO_ANIMATION_PROPS : {}

  // Marges selon presence legende
  const margins = showLegend ? CHART_MARGINS_WITH_LEGEND : CHART_MARGINS

  // Props des axes selon orientation
  const xAxisProps = horizontal
    ? { ...DEFAULT_YAXIS_PROPS, type: 'number' as const }
    : { ...DEFAULT_XAXIS_PROPS, dataKey: 'name' }

  const yAxisProps = horizontal
    ? { ...DEFAULT_XAXIS_PROPS, dataKey: 'name', type: 'category' as const }
    : { ...DEFAULT_YAXIS_PROPS }

  // Determiner si on utilise des Cell pour les couleurs (serie unique)
  const useCellColors = dataKeys.length === 1

  return (
    <ChartContainer
      height={height}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      className={className}
    >
      <BarChart
        data={data}
        margin={margins}
        layout={horizontal ? 'vertical' : 'horizontal'}
        accessibilityLayer
        aria-label={title ?? 'Graphique en barres'}
      >
        {/* Grille de fond */}
        {showGrid && <CartesianGrid {...DEFAULT_GRID_PROPS} />}

        {/* Axes */}
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />

        {/* Tooltip */}
        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={TOOLTIP_STYLES}
            cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.3 }}
          />
        )}

        {/* Legende */}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            iconSize={12}
          />
        )}

        {/* Barres pour chaque serie */}
        {dataKeys.map((dataKeyItem, index) => {
          const color = chartColors[index] ?? CHART_COLORS.primary[0]

          return (
            <Bar
              key={dataKeyItem}
              dataKey={dataKeyItem}
              name={dataKeyItem}
              fill={color}
              radius={radius}
              barSize={barSize}
              stackId={stacked ? 'stack' : undefined}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing as 'ease-out'}
              {...animationProps}
            >
              {/* Couleurs individuelles par barre (serie unique seulement) */}
              {useCellColors &&
                data.map((_, cellIndex) => (
                  <Cell
                    key={`cell-${cellIndex}`}
                    fill={chartColors[cellIndex % chartColors.length] ?? color}
                  />
                ))}
            </Bar>
          )
        })}
      </BarChart>
    </ChartContainer>
  )
}

export default BarChartWidget
