/**
 * Barrel export pour les composants Charts Recharts
 *
 * @ticket SP-143
 */

// Composants
export { ChartContainer } from './ChartContainer'
export { AreaChartWidget } from './AreaChartWidget'
export { BarChartWidget } from './BarChartWidget'
export { PieChartWidget } from './PieChartWidget'

// Theme et utilitaires
export {
  CHART_COLORS,
  getChartColor,
  getChartColors,
  TOOLTIP_STYLES,
  TOOLTIP_WRAPPER_STYLES,
  TOOLTIP_CLASSES,
  DEFAULT_XAXIS_PROPS,
  DEFAULT_YAXIS_PROPS,
  DEFAULT_GRID_PROPS,
  createGradientDef,
  generateGradientId,
  ANIMATION_CONFIG,
  NO_ANIMATION_PROPS,
  CHART_HEIGHTS,
  CHART_MARGINS,
  CHART_MARGINS_WITH_LEGEND,
} from './chartTheme'

// Re-export des types pour faciliter l'import
export type {
  ChartDataPoint,
  ChartSeries,
  BaseChartProps,
  AreaChartProps,
  BarChartProps,
  PieChartProps,
  ChartContainerProps,
  TooltipPayload,
  CustomTooltipProps,
  ChartProps,
  ChartColorKey,
  ChartColorConfig,
} from '@/types/charts'
