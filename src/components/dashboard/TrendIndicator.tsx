'use client'

/**
 * Composant TrendIndicator - Indicateur de tendance
 *
 * Affiche un indicateur visuel de tendance (hausse/baisse/stable)
 * avec pourcentage et couleur contextuelle.
 *
 * @ticket SP-142
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatTrend } from '@/lib/utils/formatters'
import type { TrendIndicatorProps, TrendDirection } from '@/types/dashboard'

/**
 * Configuration des styles par direction
 */
const TREND_STYLES: Record<
  TrendDirection,
  { color: string; bgColor: string; Icon: typeof TrendingUp }
> = {
  up: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    Icon: TrendingUp,
  },
  down: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    Icon: TrendingDown,
  },
  neutral: {
    color: 'text-gray-500 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    Icon: Minus,
  },
}

/**
 * Configuration des tailles
 */
const SIZE_STYLES = {
  sm: {
    container: 'text-xs gap-0.5 px-1.5 py-0.5',
    icon: 'h-3 w-3',
  },
  md: {
    container: 'text-sm gap-1 px-2 py-1',
    icon: 'h-4 w-4',
  },
  lg: {
    container: 'text-base gap-1.5 px-2.5 py-1.5',
    icon: 'h-5 w-5',
  },
}

/**
 * Indicateur de tendance avec icone et pourcentage
 *
 * @example
 * <TrendIndicator value={12.5} direction="up" />
 * <TrendIndicator value={-5.3} direction="down" label="vs mois dernier" />
 */
export function TrendIndicator({
  value,
  direction,
  label,
  size = 'md',
  className,
}: TrendIndicatorProps) {
  const { color, bgColor, Icon } = TREND_STYLES[direction]
  const sizeStyle = SIZE_STYLES[size]

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        bgColor,
        color,
        sizeStyle.container,
        className
      )}
      role="status"
      aria-label={`Tendance: ${formatTrend(value)}${label ? ` ${label}` : ''}`}
    >
      <Icon className={sizeStyle.icon} aria-hidden="true" />
      <span>{formatTrend(value)}</span>
      {label && (
        <span className="text-gray-500 dark:text-gray-400 font-normal">
          {label}
        </span>
      )}
    </div>
  )
}

export default TrendIndicator
