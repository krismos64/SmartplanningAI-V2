/**
 * Exports des Page Objects pour les tests E2E
 *
 * @ticket SP-149, SP-156, SP-277
 */

// Auth Pages
export { LoginPage } from './login.page'

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

// Personal Tasks Pages (SP-421)
export { PersonalTasksPage, type CreateNoteData } from './personal-tasks.page'

// Profile Pages (SP-270, SP-271, SP-273, SP-277)
export { ProfilePage } from './profile.page'
export { EditProfilePage } from './edit-profile.page'
export { ChangePasswordPage } from './change-password.page'
export { DeleteAccountPage } from './delete-account.page'

// Billing Pages (SP-373)
export { BillingPage } from './billing.page'
export { PricingPage } from './pricing.page'
