/**
 * Exports des Page Objects CRUD pour les tests E2E
 *
 * @ticket SP-156
 */

// Companies
export { CompanyListPage } from './company-list.page'
export { CompanyFormPage, type CompanyFormData } from './company-form.page'

// Employees
export { EmployeeListPage } from './employee-list.page'
export { EmployeeFormPage, type EmployeeFormData } from './employee-form.page'

// Teams
export { TeamListPage } from './team-list.page'
export { TeamFormPage, type TeamFormData } from './team-form.page'
export { TeamMembersPage } from './team-members.page'
