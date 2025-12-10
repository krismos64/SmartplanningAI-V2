/**
 * Theme et configuration pour les composants Charts
 *
 * Palette de couleurs, styles tooltip, gradients SVG.
 * Compatible dark mode via CSS variables Tailwind.
 *
 * @ticket SP-143
 */

import type { CSSProperties } from 'react'

// ============================================================================
// Palette de couleurs
// ============================================================================

/**
 * Couleurs principales pour les charts
 *
 * Basees sur la palette Tailwind CSS pour coherence avec le design system.
 * Ordre optimise pour contraste et lisibilite.
 */
export const CHART_COLORS = {
  /** Couleurs primaires pour series multiples */
  primary: [
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#f59e0b', // amber-500
    '#ec4899', // pink-500
    '#10b981', // emerald-500
  ],

  /** Couleur de succes */
  success: '#10b981', // emerald-500

  /** Couleur d'avertissement */
  warning: '#f59e0b', // amber-500

  /** Couleur de danger */
  danger: '#ef4444', // red-500

  /** Couleur neutre */
  neutral: '#6b7280', // gray-500

  /** Couleur de la grille */
  grid: '#e5e7eb', // gray-200

  /** Couleur de la grille en dark mode */
  gridDark: '#374151', // gray-700

  /** Couleur du texte des axes */
  axisText: '#6b7280', // gray-500

  /** Couleur du texte des axes en dark mode */
  axisTextDark: '#9ca3af', // gray-400
} as const

/**
 * Retourne une couleur de la palette par index
 * Boucle automatiquement si l'index depasse la taille
 */
export function getChartColor(index: number): string {
  const colors = CHART_COLORS.primary
  return colors[index % colors.length] ?? colors[0]
}

/**
 * Retourne un tableau de couleurs pour N series
 */
export function getChartColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => getChartColor(i))
}

// ============================================================================
// Styles Tooltip
// ============================================================================

/**
 * Styles CSS pour le tooltip custom
 * Compatible avec le design Shadcn/ui Card
 */
export const TOOLTIP_STYLES: CSSProperties = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  padding: '12px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
}

/**
 * Style pour le wrapper du tooltip
 */
export const TOOLTIP_WRAPPER_STYLES: CSSProperties = {
  outline: 'none',
  zIndex: 50,
}

/**
 * Classes CSS pour le contenu du tooltip
 */
export const TOOLTIP_CLASSES = {
  container: 'rounded-lg border bg-background p-3 shadow-md',
  label: 'mb-2 text-sm font-medium text-foreground',
  item: 'flex items-center justify-between gap-4 text-sm',
  itemName: 'flex items-center gap-2 text-muted-foreground',
  itemValue: 'font-medium text-foreground',
  dot: 'h-2 w-2 rounded-full',
} as const

// ============================================================================
// Configuration des axes
// ============================================================================

/**
 * Props par defaut pour l'axe X
 */
export const DEFAULT_XAXIS_PROPS = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const

/**
 * Props par defaut pour l'axe Y
 */
export const DEFAULT_YAXIS_PROPS = {
  stroke: 'hsl(var(--muted-foreground))',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  width: 60,
} as const

/**
 * Props par defaut pour la grille
 */
export const DEFAULT_GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: 'hsl(var(--border))',
  strokeOpacity: 0.5,
} as const

// ============================================================================
// Gradients SVG
// ============================================================================

/**
 * Cree une definition de gradient SVG pour les charts
 *
 * @param id - Identifiant unique du gradient
 * @param color - Couleur de base
 * @param direction - Direction du gradient (vertical par defaut)
 * @returns Element JSX pour les defs SVG
 *
 * @example
 * // Dans le composant chart :
 * <defs>
 *   {createGradient('gradient-blue', '#3b82f6')}
 * </defs>
 * <Area fill="url(#gradient-blue)" />
 */
export function createGradientDef(
  id: string,
  color: string,
  direction: 'vertical' | 'horizontal' = 'vertical'
): {
  id: string
  x1: string
  y1: string
  x2: string
  y2: string
  stops: Array<{ offset: string; stopColor: string; stopOpacity: number }>
} {
  const isVertical = direction === 'vertical'

  return {
    id,
    x1: '0',
    y1: '0',
    x2: isVertical ? '0' : '1',
    y2: isVertical ? '1' : '0',
    stops: [
      { offset: '5%', stopColor: color, stopOpacity: 0.8 },
      { offset: '95%', stopColor: color, stopOpacity: 0.1 },
    ],
  }
}

/**
 * Genere un ID unique pour un gradient
 */
export function generateGradientId(prefix: string, index: number): string {
  return `${prefix}-gradient-${index}`
}

// ============================================================================
// Configuration animations
// ============================================================================

/**
 * Configuration des animations par defaut
 */
export const ANIMATION_CONFIG = {
  /** Duree de l'animation en ms */
  duration: 300,
  /** Type d'easing */
  easing: 'ease-out',
  /** Delai entre les elements */
  delay: 50,
} as const

/**
 * Props pour desactiver les animations (tests)
 */
export const NO_ANIMATION_PROPS = {
  isAnimationActive: false,
} as const

// ============================================================================
// Dimensions par defaut
// ============================================================================

/**
 * Hauteurs par defaut pour les charts
 */
export const CHART_HEIGHTS = {
  sm: 200,
  md: 300,
  lg: 400,
  xl: 500,
} as const

/**
 * Marges par defaut pour les charts
 */
export const CHART_MARGINS = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10,
} as const

/**
 * Marges avec legende
 */
export const CHART_MARGINS_WITH_LEGEND = {
  top: 10,
  right: 10,
  bottom: 30,
  left: 10,
} as const
