/**
 * Types TypeScript pour les composants Charts Recharts
 *
 * Definit les interfaces pour :
 * - Donnees de graphiques
 * - Props des composants chart
 * - Configuration et theming
 *
 * @ticket SP-143
 */

// ============================================================================
// Types de donnees
// ============================================================================

/**
 * Point de donnee generique pour les charts
 *
 * @example
 * { name: 'Jan', value: 1200, revenue: 5000, expenses: 3000 }
 */
export interface ChartDataPoint {
  /** Label pour l'axe X (categorie, date, etc.) */
  name: string
  /** Valeur principale */
  value?: number
  /** Proprietes additionnelles pour multi-series */
  [key: string]: string | number | undefined
}

/**
 * Serie de donnees pour les charts multi-series
 */
export interface ChartSeries {
  /** Cle de la donnee dans ChartDataPoint */
  dataKey: string
  /** Nom affiche dans la legende */
  name: string
  /** Couleur de la serie */
  color?: string
}

// ============================================================================
// Props de base
// ============================================================================

/**
 * Props communes a tous les composants chart
 */
export interface BaseChartProps {
  /** Donnees a afficher */
  data: ChartDataPoint[]
  /** Hauteur du chart en pixels (defaut: 300) */
  height?: number
  /** Etat de chargement */
  isLoading?: boolean
  /** Message quand pas de donnees */
  emptyMessage?: string
  /** Classes CSS additionnelles */
  className?: string
  /** Titre du chart pour l'accessibilite */
  title?: string
  /** Afficher la grille de fond */
  showGrid?: boolean
  /** Afficher le tooltip au survol */
  showTooltip?: boolean
  /** Afficher la legende */
  showLegend?: boolean
  /** Desactiver les animations (utile pour les tests) */
  disableAnimation?: boolean
}

// ============================================================================
// Props specifiques par type de chart
// ============================================================================

/**
 * Props pour AreaChartWidget
 *
 * Graphique d'aire pour visualiser l'evolution temporelle
 */
export interface AreaChartProps extends BaseChartProps {
  /** Cle(s) des donnees a afficher */
  dataKey: string | string[]
  /** Afficher un gradient de remplissage */
  showGradient?: boolean
  /** Type de courbe */
  curveType?: 'monotone' | 'linear' | 'step'
  /** Couleurs des series (optionnel, utilise theme par defaut) */
  colors?: string[]
}

/**
 * Props pour BarChartWidget
 *
 * Graphique en barres pour comparaisons
 */
export interface BarChartProps extends BaseChartProps {
  /** Cle(s) des donnees a afficher */
  dataKey: string | string[]
  /** Empiler les barres */
  stacked?: boolean
  /** Orientation horizontale */
  horizontal?: boolean
  /** Largeur des barres */
  barSize?: number
  /** Couleurs des series (optionnel) */
  colors?: string[]
  /** Rayon des coins des barres */
  radius?: number
}

/**
 * Props pour PieChartWidget
 *
 * Graphique circulaire pour repartitions
 */
export interface PieChartProps extends BaseChartProps {
  /** Cle de la valeur */
  dataKey: string
  /** Cle du label (defaut: 'name') */
  nameKey?: string
  /** Rayon interieur (0 = pie, >0 = donut) */
  innerRadius?: number
  /** Rayon exterieur */
  outerRadius?: number
  /** Afficher les labels avec pourcentages */
  showLabels?: boolean
  /** Couleurs des segments (optionnel) */
  colors?: string[]
  /** Angle de depart en degres */
  startAngle?: number
  /** Angle de fin en degres */
  endAngle?: number
}

// ============================================================================
// Props du container
// ============================================================================

/**
 * Props pour ChartContainer
 *
 * Wrapper responsive avec gestion loading/empty
 */
export interface ChartContainerProps {
  /** Hauteur du container */
  height?: number
  /** Etat de chargement */
  isLoading?: boolean
  /** Donnees vides */
  isEmpty?: boolean
  /** Message pour l'etat vide */
  emptyMessage?: string
  /** Classes CSS additionnelles */
  className?: string
  /** Contenu du chart */
  children: React.ReactNode
}

// ============================================================================
// Configuration Tooltip
// ============================================================================

/**
 * Payload d'un tooltip Recharts
 */
export interface TooltipPayload {
  /** Nom de la serie */
  name: string
  /** Valeur */
  value: number
  /** Couleur */
  color: string
  /** Donnee source complete */
  payload: ChartDataPoint
  /** Cle de la donnee */
  dataKey: string
}

/**
 * Props du tooltip custom
 */
export interface CustomTooltipProps {
  /** Tooltip actif */
  active?: boolean
  /** Donnees du point survole */
  payload?: TooltipPayload[]
  /** Label du point (axe X) */
  label?: string
  /** Formateur de valeur optionnel */
  valueFormatter?: (value: number) => string
  /** Formateur de label optionnel */
  labelFormatter?: (label: string) => string
}

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Type union pour les props de tous les charts
 */
export type ChartProps = AreaChartProps | BarChartProps | PieChartProps

/**
 * Type pour les couleurs du theme
 */
export type ChartColorKey =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'

/**
 * Configuration d'une couleur avec variantes
 */
export interface ChartColorConfig {
  /** Couleur principale */
  main: string
  /** Couleur claire */
  light: string
  /** Couleur foncee */
  dark: string
}
