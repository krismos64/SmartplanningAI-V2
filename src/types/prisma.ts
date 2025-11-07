/**
 * Types TypeScript personnalisés pour Prisma
 *
 * ✅ Source : Documentation Prisma + TypeScript best practices
 *
 * OBJECTIF (CDA) :
 * Créer des types utilitaires et des variantes des modèles Prisma
 * pour simplifier le typage dans l'application.
 *
 * AVANTAGES :
 * - Réutilisation des types générés par Prisma
 * - Types personnalisés pour les cas métier spécifiques
 * - Autocomplétion TypeScript améliorée
 *
 * RÉFÉRENCE CDA :
 * - Prisma Client generated types
 * - TypeScript utility types (Omit, Pick, Partial)
 */

import { Prisma } from '@prisma/client'

/**
 * Type pour un utilisateur complet avec ses relations
 *
 * Inclut : User + Company + Employee (si existe)
 */
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    company: true
    employee: {
      include: {
        team: true
      }
    }
  }
}>

/**
 * Type pour un utilisateur sans données sensibles
 *
 * Exclut : password, resetPasswordToken, etc.
 * Utilisé pour les réponses API et l'affichage client
 */
export type SafeUser = Omit<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Prisma.UserGetPayload<{}>,
  'password' | 'resetPasswordToken' | 'resetPasswordExpires'
>

/**
 * Type pour une organisation (Company) avec ses employés
 */
export type CompanyWithEmployees = Prisma.CompanyGetPayload<{
  include: {
    users: {
      include: {
        employee: true
      }
    }
    employees: {
      include: {
        user: true
        team: true
      }
    }
    teams: true
  }
}>

/**
 * Type pour un employé avec toutes ses relations
 */
export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    company: true
    team: true
    schedules: true
    leaveRequests: true
  }
}>

/**
 * Type pour un planning (Schedule) avec ses relations
 */
export type ScheduleWithRelations = Prisma.ScheduleGetPayload<{
  include: {
    employee: {
      include: {
        user: true
      }
    }
    team: true
    company: true
  }
}>

/**
 * Type pour une demande de congé avec relations
 */
export type LeaveRequestWithRelations = Prisma.LeaveRequestGetPayload<{
  include: {
    employee: {
      include: {
        user: true
      }
    }
    reviewer: {
      include: {
        user: true
      }
    }
  }
}>

/**
 * Type pour une équipe avec ses membres
 */
export type TeamWithMembers = Prisma.TeamGetPayload<{
  include: {
    employees: {
      include: {
        user: true
      }
    }
    manager: {
      include: {
        user: true
      }
    }
    company: true
  }
}>

/**
 * Type pour une notification avec l'utilisateur
 */
export type NotificationWithUser = Prisma.NotificationGetPayload<{
  include: {
    user: true
  }
}>

/**
 * Type pour un abonnement Stripe avec l'organisation
 */
export type SubscriptionWithCompany = Prisma.SubscriptionGetPayload<{
  include: {
    company: true
  }
}>

/**
 * Type pour les données de création d'un utilisateur
 *
 * Omit id, createdAt, updatedAt (générés automatiquement)
 */
export type CreateUserInput = Omit<
  Prisma.UserCreateInput,
  'id' | 'createdAt' | 'updatedAt' | 'emailVerified'
>

/**
 * Type pour les données de mise à jour d'un utilisateur
 */
export type UpdateUserInput = Prisma.UserUpdateInput

/**
 * Type pour les données de création d'un employé
 */
export type CreateEmployeeInput = Omit<
  Prisma.EmployeeCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * Type pour les données de création d'un planning
 */
export type CreateScheduleInput = Omit<
  Prisma.ScheduleCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * Type pour les données de création d'une demande de congé
 */
export type CreateLeaveRequestInput = Omit<
  Prisma.LeaveRequestCreateInput,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * Type pour les filtres de recherche de planning
 *
 * Utilisé dans les API de récupération de plannings
 */
export type ScheduleFilters = {
  companyId: string
  employeeId?: string
  teamId?: string
  startDate?: Date
  endDate?: Date
  type?: Prisma.EnumScheduleTypeFilter
  status?: Prisma.EnumScheduleStatusFilter
}

/**
 * Type pour les filtres de recherche de demandes de congé
 */
export type LeaveRequestFilters = {
  companyId: string
  employeeId?: string
  status?: Prisma.EnumLeaveRequestStatusFilter
  startDate?: Date
  endDate?: Date
}

/**
 * Type pour les statistiques d'une organisation
 *
 * Données agrégées pour le dashboard DIRECTOR
 */
export type CompanyStats = {
  totalEmployees: number
  activeEmployees: number
  totalTeams: number
  pendingLeaveRequests: number
  upcomingSchedules: number
  subscriptionStatus: string
  subscriptionPlan: string
}

/**
 * Type pour les statistiques d'un employé
 *
 * Données pour le dashboard EMPLOYEE
 */
export type EmployeeStats = {
  totalSchedules: number
  upcomingSchedules: number
  totalLeaveRequests: number
  approvedLeaveRequests: number
  pendingLeaveRequests: number
  rejectedLeaveRequests: number
}

// ═══════════════════════════════════════════════════════════════════════
// TYPES AVANCÉS PRISMA (SP-105 - Context7)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Type pour le client Prisma dans un contexte de transaction
 *
 * Utilisé dans les transactions interactives pour typer le paramètre tx
 *
 * UTILISATION :
 * ```typescript
 * await prisma.$transaction(async (tx: PrismaTransactionClient) => {
 *   await tx.user.create({ ... })
 *   await tx.employee.create({ ... })
 * })
 * ```
 *
 * ✅ Source Context7 : Prisma Transaction Types
 */
export type PrismaTransactionClient = Omit<
  typeof import('@prisma/client').PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

/**
 * Type pour obtenir le nom d'un modèle Prisma
 *
 * Permet de typer dynamiquement les noms de modèles
 *
 * UTILISATION :
 * ```typescript
 * function getModelData<T extends PrismaModelName>(model: T) {
 *   return prisma[model].findMany()
 * }
 * ```
 *
 * ✅ Source Context7 : Prisma TypeScript Types
 */
export type PrismaModelName = Prisma.ModelName

/**
 * Type pour les opérations Prisma disponibles sur un modèle
 *
 * Liste complète : findMany, findUnique, create, update, delete, etc.
 */
export type PrismaOperation =
  | 'findUnique'
  | 'findUniqueOrThrow'
  | 'findFirst'
  | 'findFirstOrThrow'
  | 'findMany'
  | 'create'
  | 'createMany'
  | 'update'
  | 'updateMany'
  | 'upsert'
  | 'delete'
  | 'deleteMany'
  | 'aggregate'
  | 'count'
  | 'groupBy'

/**
 * Note : Les types utilitaires génériques PrismaArgs et PrismaResult
 * nécessitent une syntaxe TypeScript trop complexe pour ce projet.
 * Utilisez plutôt les types générés directement par Prisma :
 * - Prisma.UserFindManyArgs
 * - Prisma.UserFindUniqueArgs
 * - etc.
 */

/**
 * Type pour les métriques du pool de connexions
 *
 * Retourné par prisma.$metrics.json()
 *
 * ✅ Source Context7 : Connection Pool Metrics
 */
export type ConnectionPoolMetrics = {
  timestamp: Date
  poolSize: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  totalConnectionsCreated: number
  totalQueriesExecuted: number
  averageQueryDuration: number
}

/**
 * Type pour les statistiques de base de données
 *
 * Utilisé dans les health checks et monitoring
 */
export type DatabaseStats = {
  timestamp: Date
  isConnected: boolean
  poolSize?: number
  activeConnections?: number
  idleConnections?: number
  waitingRequests?: number
}

/**
 * Type pour les résultats de health check
 *
 * Utilisé dans l'API /api/health
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy'

export type HealthCheck = {
  status: 'pass' | 'warn' | 'fail'
  message: string
  value?: number | string | boolean
}

export type HealthCheckResult = {
  status: HealthStatus
  timestamp: Date
  checks: {
    connection: HealthCheck
    latency: HealthCheck
    migrations: HealthCheck
    poolSize: HealthCheck
  }
  metrics: {
    latency: number
    activeConnections?: number
    idleConnections?: number
    uptime?: number
  }
  error?: string
}

/**
 * Type pour les réponses d'erreur standardisées
 *
 * Utilisé dans les API routes et Server Actions
 */
export type ErrorResponse = {
  success: false
  error: string
  code?: string
  meta?: Record<string, unknown>
}

/**
 * Type pour les réponses de succès standardisées
 *
 * Utilisé dans les API routes et Server Actions
 */
export type SuccessResponse<T = unknown> = {
  success: true
  data: T
  message?: string
}

/**
 * Type union pour toutes les réponses API
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

/**
 * Type pour les options de pagination
 *
 * Utilisé dans les listes paginées (employees, schedules, etc.)
 */
export type PaginationOptions = {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Type pour les résultats paginés
 *
 * Wrapper générique pour les listes paginées
 */
export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

/**
 * Note : Les types utilitaires génériques SelectOption, IncludeOption et WhereOption
 * nécessitent une syntaxe TypeScript trop complexe.
 * Utilisez plutôt les types générés directement par Prisma :
 *
 * SELECT :
 * - Prisma.UserSelect
 * - Prisma.CompanySelect
 *
 * INCLUDE :
 * - Prisma.UserInclude
 * - Prisma.CompanyInclude
 *
 * WHERE :
 * - Prisma.UserWhereInput
 * - Prisma.CompanyWhereInput
 *
 * Ces types sont automatiquement générés et type-safe.
 */

/**
 * Type pour les données JSON dans Prisma
 *
 * Prisma stocke les JSON comme JsonValue
 *
 * ✅ Source Context7 : Prisma JSON Type
 */
export type JsonValue = Prisma.JsonValue
export type JsonObject = Prisma.JsonObject
export type JsonArray = Prisma.JsonArray
