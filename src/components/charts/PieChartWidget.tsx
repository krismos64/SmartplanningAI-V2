'use client'

/**
 * PieChartWidget - Graphique circulaire pour repartitions
 *
 * Composant base sur Recharts pour afficher des repartitions
 * avec support pie/donut, labels et couleurs automatiques.
 *
 * @ticket SP-143
 */

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import { ChartContainer } from './ChartContainer'
import {
  CHART_COLORS,
  getChartColor,
  TOOLTIP_STYLES,
  ANIMATION_CONFIG,
  NO_ANIMATION_PROPS,
  CHART_MARGINS,
  CHART_MARGINS_WITH_LEGEND,
} from './chartTheme'
import type { PieChartProps, TooltipPayload } from '@/types/charts'

/**
 * Tooltip personnalise style Shadcn/Card
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null

  const entry = payload[0]
  if (!entry) return null

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <div className="flex items-center justify-between gap-4 text-sm">
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
    </div>
  )
}

/**
 * Rendu des labels avec pourcentage
 */
function renderLabel(props: {
  cx?: number
  cy?: number
  midAngle?: number
  innerRadius?: number
  outerRadius?: number
  percent?: number
}) {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  // Ne pas afficher si pourcentage trop petit
  if (percent < 0.05) return null

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-medium"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

/**
 * Widget graphique circulaire responsive
 *
 * @example
 * // Pie chart simple
 * <PieChartWidget
 *   data={[{ name: 'A', value: 100 }, { name: 'B', value: 200 }]}
 *   dataKey="value"
 * />
 *
 * @example
 * // Donut chart avec labels
 * <PieChartWidget
 *   data={data}
 *   dataKey="value"
 *   innerRadius={60}
 *   showLabels
 *   showLegend
 * />
 */
export function PieChartWidget({
  data,
  dataKey,
  height,
  isLoading = false,
  emptyMessage,
  className,
  title,
  showTooltip = true,
  showLegend = false,
  disableAnimation = false,
  nameKey = 'name',
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
  colors,
  startAngle = 0,
  endAngle = 360,
}: PieChartProps) {
  // Determiner les couleurs (une par segment)
  const chartColors = colors ?? data.map((_, i) => getChartColor(i))

  // Verifier si donnees vides
  const isEmpty = !data || data.length === 0

  // Props d'animation
  const animationProps = disableAnimation ? NO_ANIMATION_PROPS : {}

  // Marges selon presence legende
  const margins = showLegend ? CHART_MARGINS_WITH_LEGEND : CHART_MARGINS

  return (
    <ChartContainer
      height={height}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      className={className}
    >
      <PieChart
        margin={margins}
        accessibilityLayer
        aria-label={title ?? 'Graphique circulaire'}
      >
        {/* Tooltip */}
        {showTooltip && (
          <Tooltip content={<CustomTooltip />} contentStyle={TOOLTIP_STYLES} />
        )}

        {/* Legende */}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={8}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
        )}

        {/* Pie/Donut */}
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          paddingAngle={innerRadius > 0 ? 2 : 0}
          label={showLabels ? renderLabel : undefined}
          labelLine={false}
          animationDuration={ANIMATION_CONFIG.duration}
          animationEasing={ANIMATION_CONFIG.easing as 'ease-out'}
          {...animationProps}
        >
          {/* Couleurs par segment */}
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index] ?? CHART_COLORS.primary[0]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export default PieChartWidget
