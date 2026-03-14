/**
 * Types pour les exports CSV SP-333
 */

import type { CrudActionResult } from './crud'

/** Résultat d'un export CSV */
export interface CsvExportResult {
  filename: string
  data: string
  mimeType: string
}

/** Type de retour des Server Actions d'export */
export type CsvExportActionResult = CrudActionResult<CsvExportResult>

/** Options de filtre pour l'export des plannings */
export interface ScheduleExportFilters {
  startDate?: string // ISO date
  endDate?: string // ISO date
  teamId?: string
  employeeId?: string
}

/** Options de filtre pour l'export des congés */
export interface LeaveExportFilters {
  startDate?: string
  endDate?: string
  status?: string
  type?: string
  teamId?: string
  employeeId?: string
}

/** Options de filtre pour l'export des employés */
export interface EmployeeExportFilters {
  teamId?: string
  isActive?: boolean
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
