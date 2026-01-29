/**
 * Barrel export pour les composants Dashboard
 *
 * @ticket SP-142, SP-420
 */

// Composants
export { TrendIndicator } from './TrendIndicator'
export { StatCard } from './StatCard'
export { StatsGrid } from './StatsGrid'
export {
  PersonalTasksWidget,
  PersonalTasksWidgetSkeleton,
} from './PersonalTasksWidget'

// Re-export des types pour faciliter l'import
export type {
  TrendDirection,
  TrendData,
  TrendIndicatorProps,
  StatCardProps,
  StatsGridProps,
  KPIData,
  StatCardConfig,
  AdminStats,
  DirectorStats,
  ManagerStats,
  EmployeeStats,
  RoleStats,
} from '@/types/dashboard'
