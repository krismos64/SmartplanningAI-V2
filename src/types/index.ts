/**
 * Export central de tous les types TypeScript
 *
 * ✅ Source : Best practices TypeScript + Next.js architecture
 *
 * OBJECTIF (CDA) :
 * Centraliser tous les exports de types pour simplifier les imports
 * dans l'application et éviter les chemins relatifs complexes.
 *
 * AVANTAGES :
 * - Import unique : import { UserWithRelations, LoginCredentials } from '@/types'
 * - Maintenance facilitée
 * - Cohérence du code
 *
 * RÉFÉRENCE CDA :
 * - Pattern "barrel exports" (index.ts)
 * - Recommandé par TypeScript + Next.js
 */

// ============================================================================
// TYPES AUTHENTIFICATION
// ============================================================================
export type {
  LoginCredentials,
  RegisterData,
  ResetPasswordData,
  EmailVerificationData,
  AuthErrorCode,
  AuthContext,
} from './auth'

// ============================================================================
// TYPES PRISMA PERSONNALISÉS
// ============================================================================
export type {
  UserWithRelations,
  SafeUser,
  CompanyWithEmployees,
  EmployeeWithRelations,
  ScheduleWithRelations,
  LeaveRequestWithRelations,
  TeamWithMembers,
  // NotificationWithUser exporté depuis './notification' (SP-321)
  SubscriptionWithCompany,
  CreateUserInput,
  UpdateUserInput,
  CreateEmployeeInput,
  CreateScheduleInput,
  CreateLeaveRequestInput,
  ScheduleFilters,
  LeaveRequestFilters,
  CompanyStats,
  EmployeeStats,
} from './prisma'

// ============================================================================
// TYPES CRUD GENERIQUES
// ============================================================================
export type {
  CrudActionResult,
  DeleteActionResult,
  ListActionResult,
  PaginatedResult,
  ListQueryParams,
  FilterParams,
  CompanyFormData,
  TeamFormData,
  UserFormData,
  WithId,
  WithTimestamps,
  WithCompany,
  CrudOptions,
} from './crud'

// ============================================================================
// TYPES CONTACT API
// ============================================================================
export type {
  ContactFormData,
  ContactApiResponse,
  ContactEmailResult,
  ContactConfirmationParams,
  ContactNotificationParams,
  RateLimitConfig,
  RateLimitResult,
} from './contact'

// ============================================================================
// TYPES CONGÉS (LEAVE)
// ============================================================================
export type {
  LeaveType,
  LeaveEmailData,
  LeaveRejectedEmailData,
  LeaveRequestedEmailData,
} from './leave'
export { leaveTypeLabels } from './leave'

// ============================================================================
// TYPES NOTES D'INCIDENT (SP-424)
// ============================================================================
export type {
  IncidentNoteVisibility,
  IncidentNoteWithSubject,
  IncidentNoteWithAuthor,
  IncidentNoteWithRelations,
  IncidentNoteListItem,
} from './incident-note'
export {
  INCIDENT_NOTE_VISIBILITY_LABELS,
  INCIDENT_NOTE_VISIBILITY_DESCRIPTIONS,
  INCIDENT_NOTE_VISIBILITY_ICONS,
  INCIDENT_NOTE_VISIBILITY_COLORS,
} from './incident-note'

// ============================================================================
// TYPES NOTIFICATIONS (SP-321)
// ============================================================================
export type {
  NotificationType,
  NotificationPriority,
  NotificationWithUser,
  NotificationWithRelations,
  NotificationListItem,
  CreateNotificationInput,
  UpdateNotificationInput,
  NotificationFilters,
  PlanningNotificationData,
  LeaveNotificationData,
  TaskNotificationData,
  IncidentNotificationData,
} from './notification'
export {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_PRIORITY_COLORS,
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_PRIORITY_ICONS,
  NOTIFICATION_TYPE_TO_RELATED_TYPE,
  notificationTypeOptions,
  notificationPriorityOptions,
} from './notification'

// ============================================================================
// TYPES EXPORT RGPD (SP-278)
// ============================================================================
export type {
  ExportInfo,
  ExportAccount,
  ExportProfile,
  ExportSchedule,
  ExportLeaveRequest,
  ExportLeaveBalance,
  ExportAvailability,
  ExportPersonalTask,
  ExportNotification,
  ExportIncidentNote,
  UserDataExport,
} from './export'

// ============================================================================
// TYPES EXPORT CSV (SP-333)
// ============================================================================
export type {
  CsvExportResult,
  CsvExportActionResult,
  ScheduleExportFilters,
  LeaveExportFilters,
  EmployeeExportFilters,
} from './csv-export'

// ============================================================================
// TYPES GÉNÉRIQUES UTILITAIRES
// ============================================================================

/**
 * Type pour les réponses API standardisées
 *
 * Format uniforme pour toutes les réponses API :
 * - success : Opération réussie
 * - error : Erreur serveur
 */
export type ApiResponse<T = unknown> =
  | {
      success: true
      data: T
      message?: string
    }
  | {
      success: false
      error: string
      code?: string
    }

/**
 * Type pour la pagination
 *
 * Utilisé dans les listes (employés, plannings, etc.)
 */
export type PaginationParams = {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Type pour les résultats paginés
 */
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Type pour les options de select/dropdown
 *
 * Utilisé dans les formulaires
 */
export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

/**
 * Type pour les statistiques de dashboard
 *
 * Format générique pour les cartes de stats
 */
export type DashboardStat = {
  title: string
  value: number | string
  change?: number // Pourcentage de changement
  trend?: 'up' | 'down' | 'neutral'
  icon?: string
}

/**
 * Type pour les filtres de date
 *
 * Utilisé dans les recherches et rapports
 */
export type DateRangeFilter = {
  startDate: Date | null
  endDate: Date | null
}

/**
 * Type pour les notifications UI (toast, alert)
 */
export type UINotification = {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number // ms
}

/**
 * Type pour les actions de menu contextuel
 */
export type ContextMenuAction = {
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger' | 'success'
}

/**
 * Type pour les métadonnées de page SEO
 *
 * Utilisé dans les metadata exports Next.js
 */
export type PageMetadata = {
  title: string
  description: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
}
