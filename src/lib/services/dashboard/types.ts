/**
 * Types pour les services de donnees Dashboard
 *
 * Definit les interfaces pour :
 * - Parametres de requete (DateRange, StatsQueryParams)
 * - Resultats des services par role (Employee, Manager, Director, Admin)
 *
 * Ces types sont compatibles avec src/types/dashboard.ts pour
 * alimenter les composants StatCard, StatsGrid et Charts.
 *
 * @ticket SP-144
 */

// ============================================================================
// Types de base pour les requetes
// ============================================================================

/**
 * Periode de date pour les requetes statistiques
 */
export interface DateRange {
  /** Date de debut de la periode */
  from: Date
  /** Date de fin de la periode */
  to: Date
}

/**
 * Parametres communs pour les requetes de statistiques
 */
export interface StatsQueryParams {
  /** ID de l'entreprise (isolation multi-tenant) */
  companyId: string
  /** Periode optionnelle (defaut: mois courant) */
  dateRange?: DateRange
}

/**
 * Parametres pour les stats employee
 */
export interface EmployeeStatsParams extends StatsQueryParams {
  /** ID de l'employe */
  employeeId: string
}

/**
 * Parametres pour les stats manager
 */
export interface ManagerStatsParams extends StatsQueryParams {
  /** ID de l'equipe geree par le manager */
  teamId: string
  /** ID du manager (employe) */
  managerId: string
}

/**
 * Parametres pour les stats director
 */
export interface DirectorStatsParams extends StatsQueryParams {
  /** ID de l'utilisateur director */
  userId: string
}

// ============================================================================
// Types de resultats par role
// ============================================================================

/**
 * Donnees de tendance pour comparaison entre periodes
 */
export interface TrendValue {
  /** Valeur de la periode courante */
  current: number
  /** Valeur de la periode precedente */
  previous: number
  /** Pourcentage de variation (-100 a +100+) */
  trend: number
}

/**
 * Statistiques pour le role EMPLOYEE
 * Vue personnelle de l'employe
 */
export interface EmployeeStatsResult {
  /** Heures travaillees avec comparaison */
  hoursWorked: TrendValue
  /** Nombre de shifts a venir */
  upcomingShifts: number
  /** Solde de conges */
  leaveBalance: {
    /** Jours restants */
    remaining: number
    /** Jours utilises cette annee */
    used: number
    /** Total annuel */
    total: number
  }
  /** Demandes de conges en attente */
  pendingRequests: number
  /** Prochain shift programme */
  nextShift: {
    date: Date
    startTime: string
    endTime: string
  } | null
  /** Planning de la semaine courante */
  weeklySchedule: Array<{
    day: string
    hours: number
  }>
}

/**
 * Statistiques pour le role MANAGER
 * Vue de l'equipe geree
 */
export interface ManagerStatsResult {
  /** Taille de l'equipe */
  teamSize: number
  /** Demandes de conges en attente de validation */
  pendingLeaveRequests: number
  /** Absences du jour (conges approuves) */
  todayAbsences: number
  /** Taux de couverture planning (%) */
  coverageRate: number
  /** Heures travaillees par l'equipe ce mois */
  teamHoursWorked: TrendValue
  /** Performance par membre (pour chart) */
  teamPerformance: Array<{
    name: string
    hoursWorked: number
    scheduledHours: number
  }>
  /** Tendance des demandes de conges (pour chart) */
  leaveRequestsTrend: Array<{
    date: string
    pending: number
    approved: number
    rejected: number
  }>
}

/**
 * Statistiques pour le role DIRECTOR
 * Vue globale de l'entreprise
 */
export interface DirectorStatsResult {
  /** Nombre total d'employes actifs */
  totalEmployees: number
  /** Nombre d'equipes */
  totalTeams: number
  /** Demandes de conges en attente (toute l'entreprise) */
  pendingLeaveRequests: number
  /** Taux de presence moyen (%) */
  averageAttendanceRate: number
  /** Heures planifiees ce mois (SP-317) */
  plannedHoursThisMonth: number
  /** Absences sur les 7 derniers jours (SP-317) */
  absencesLast7Days: number
  /** Statistiques par equipe (pour chart) */
  teamStats: Array<{
    name: string
    employees: number
    hoursWorked: number
    leaveRate: number
  }>
  /** Repartition des types de conges (pour pie chart) */
  leaveTypeDistribution: Array<{
    type: string
    count: number
  }>
  /** Evolution des effectifs (pour area chart) */
  employeeGrowth: Array<{
    month: string
    count: number
  }>
}

/**
 * Statistiques pour le role SYSTEM_ADMIN
 * Vue globale de la plateforme SaaS
 */
export interface AdminStatsResult {
  /** Nombre total d'entreprises clientes */
  totalCompanies: TrendValue
  /** Nombre total d'utilisateurs */
  totalUsers: TrendValue
  /** Abonnements actifs (ACTIVE + TRIAL) */
  activeSubscriptions: number
  /** MRR - Monthly Recurring Revenue (EUR) */
  mrr: TrendValue
  /** Taux de churn mensuel (%) */
  churnRate: number
  /** Croissance des entreprises par mois (pour area chart) */
  companiesGrowth: Array<{
    month: string
    count: number
  }>
  /** Revenue par plan d'abonnement (pour pie/bar chart) */
  revenueByPlan: Array<{
    plan: string
    revenue: number
    count: number
  }>
  /** Repartition des statuts d'abonnement (pour pie chart) */
  subscriptionStatusDistribution: Array<{
    status: string
    count: number
  }>
}

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Resultat generique avec success/error
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Options pour le cache des resultats
 */
export interface CacheOptions {
  /** Duree de cache en secondes */
  ttl?: number
  /** Cle de cache personnalisee */
  key?: string
}
