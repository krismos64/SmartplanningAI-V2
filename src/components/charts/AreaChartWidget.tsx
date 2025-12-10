'use client'

/**
 * AreaChartWidget - Graphique d'aire pour visualiser des tendances
 *
 * Composant base sur Recharts pour afficher des donnees temporelles
 * avec support multi-series, gradients et tooltips.
 *
 * @ticket SP-143
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  generateGradientId,
} from './chartTheme'
import type { AreaChartProps, TooltipPayload } from '@/types/charts'

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
 * Widget graphique d'aire responsive
 *
 * @example
 * // Serie simple
 * <AreaChartWidget
 *   data={[{ name: 'Jan', value: 100 }, { name: 'Feb', value: 200 }]}
 *   dataKey="value"
 * />
 *
 * @example
 * // Multi-series avec gradient
 * <AreaChartWidget
 *   data={data}
 *   dataKey={['revenue', 'expenses']}
 *   showGradient
 *   showLegend
 * />
 */
export function AreaChartWidget({
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
  showGradient = true,
  curveType = 'monotone',
  colors,
}: AreaChartProps) {
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

  return (
    <ChartContainer
      height={height}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      className={className}
    >
      <AreaChart
        data={data}
        margin={margins}
        accessibilityLayer
        aria-label={title ?? 'Graphique en aire'}
      >
        {/* Definitions des gradients SVG */}
        {showGradient && (
          <defs>
            {dataKeys.map((_, index) => {
              const gradientId = generateGradientId('area', index)
              const color = chartColors[index] ?? CHART_COLORS.primary[0]
              return (
                <linearGradient
                  key={gradientId}
                  id={gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              )
            })}
          </defs>
        )}

        {/* Grille de fond */}
        {showGrid && <CartesianGrid {...DEFAULT_GRID_PROPS} />}

        {/* Axe X */}
        <XAxis dataKey="name" {...DEFAULT_XAXIS_PROPS} />

        {/* Axe Y */}
        <YAxis {...DEFAULT_YAXIS_PROPS} />

        {/* Tooltip */}
        {showTooltip && (
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={TOOLTIP_STYLES}
            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
          />
        )}

        {/* Legende */}
        {showLegend && (
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={8}
          />
        )}

        {/* Aires pour chaque serie */}
        {dataKeys.map((dataKeyItem, index) => {
          const color = chartColors[index] ?? CHART_COLORS.primary[0]
          const gradientId = generateGradientId('area', index)
          const fill = showGradient ? `url(#${gradientId})` : color

          return (
            <Area
              key={dataKeyItem}
              type={curveType}
              dataKey={dataKeyItem}
              name={dataKeyItem}
              stroke={color}
              strokeWidth={2}
              fill={fill}
              fillOpacity={showGradient ? 1 : 0.3}
              animationDuration={ANIMATION_CONFIG.duration}
              animationEasing={ANIMATION_CONFIG.easing as 'ease-out'}
              {...animationProps}
            />
          )
        })}
      </AreaChart>
    </ChartContainer>
  )
}

export default AreaChartWidget
