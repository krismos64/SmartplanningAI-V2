/**
 * Barrel export pour les services Dashboard
 *
 * Exporte tous les services et types pour une importation simplifiee :
 *
 * @example
 * import {
 *   getEmployeeStats,
 *   getManagerStats,
 *   getDirectorStats,
 *   getAdminStats,
 *   calculateTrend,
 *   type EmployeeStatsResult,
 * } from '@/lib/services/dashboard'
 *
 * @ticket SP-144
 */

// ============================================================================
// Types
// ============================================================================

export type {
  DateRange,
  StatsQueryParams,
  EmployeeStatsParams,
  ManagerStatsParams,
  DirectorStatsParams,
  TrendValue,
  EmployeeStatsResult,
  ManagerStatsResult,
  DirectorStatsResult,
  AdminStatsResult,
  ServiceResult,
  CacheOptions,
} from './types'

// ============================================================================
// Services de base (utilitaires)
// ============================================================================

export {
  // Calculs de dates
  calculateTrend,
  getDefaultDateRange,
  getPreviousPeriod,
  getWeekStart,
  getWeekEnd,
  getYearStart,
  getLastMonthsLabels,
  // Calculs d'heures
  calculateHoursBetween,
  roundToOneDecimal,
  // Verification des acces
  verifyCompanyAccess,
  verifyEmployeeBelongsToCompany,
  verifyManagerOfTeam,
  // Formatage
  formatDateForChart,
  WEEKDAY_LABELS,
  calculateWorkingDays,
} from './base-stats.service'

// ============================================================================
// Service Employee
// ============================================================================

export {
  getEmployeeStats,
  getEmployeeHoursOnly,
  getEmployeeLeaveBalanceOnly,
} from './employee-stats.service'

// ============================================================================
// Service Manager
// ============================================================================

export {
  getManagerStats,
  getManagerPendingRequestsOnly,
  getManagerTodayAbsencesOnly,
} from './manager-stats.service'

// ============================================================================
// Service Director
// ============================================================================

export {
  getDirectorStats,
  getDirectorEmployeeCountOnly,
  getDirectorPendingRequestsOnly,
  getDirectorTeamDetails,
} from './director-stats.service'

// ============================================================================
// Service Admin
// ============================================================================

export {
  getAdminStats,
  getAdminCompanyCountOnly,
  getAdminMRROnly,
  getAdminChurnRateOnly,
  getAdminQuickStats,
} from './admin-stats.service'
