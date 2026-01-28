/**
 * Exports des Page Objects pour les tests E2E
 *
 * @ticket SP-149, SP-156
 */

// Dashboard Pages
export { DashboardEmployeePage } from './dashboard-employee.page'
export { DashboardManagerPage } from './dashboard-manager.page'
export { DashboardDirectorPage } from './dashboard-director.page'
export { DashboardAdminPage } from './dashboard-admin.page'

// CRUD Pages
export {
  CompanyListPage,
  CompanyFormPage,
  EmployeeListPage,
  EmployeeFormPage,
  TeamListPage,
  TeamFormPage,
  TeamMembersPage,
  type CompanyFormData,
  type EmployeeFormData,
  type TeamFormData,
} from './crud'

// Schedules Pages
export { SchedulesPage } from './schedules.page'

// Leaves Pages (SP-416)
export { LeavesPage, type CreateLeaveData } from './leaves.page'
