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
  AuthError,
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
  NotificationWithUser,
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
// TYPES GÉNÉRIQUES UTILITAIRES
// ============================================================================

/**
 * Type pour les réponses API standardisées
 *
 * Format uniforme pour toutes les réponses API :
 * - success : Opération réussie
 * - error : Erreur serveur
 */
export type ApiResponse<T = any> =
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
