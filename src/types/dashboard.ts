/**
 * Types TypeScript pour les composants Dashboard
 *
 * Definit les interfaces et types pour :
 * - StatCard : cartes de statistiques avec tendance
 * - KPIs : donnees metriques par role
 * - Stats specifiques par role utilisateur
 *
 * @ticket SP-142
 */

import type { LucideIcon } from 'lucide-react'

// ============================================================================
// Types de base
// ============================================================================

/**
 * Direction de la tendance pour les indicateurs
 */
export type TrendDirection = 'up' | 'down' | 'neutral'

/**
 * Donnees de tendance pour les statistiques
 */
export interface TrendData {
  /** Pourcentage de variation (positif ou negatif) */
  value: number
  /** Direction de la tendance */
  direction: TrendDirection
  /** Texte descriptif optionnel (ex: "vs mois dernier") */
  label?: string
}

/**
 * Structure generique pour un KPI
 */
export interface KPIData {
  /** Identifiant unique du KPI */
  id: string
  /** Libelle affiche */
  label: string
  /** Valeur actuelle (nombre ou string formatte) */
  value: number | string
  /** Donnees de tendance optionnelles */
  trend?: TrendData
  /** Unite de mesure optionnelle (ex: "%", "h", "j") */
  unit?: string
}

// ============================================================================
// Props des composants
// ============================================================================

/**
 * Props pour le composant TrendIndicator
 */
export interface TrendIndicatorProps {
  /** Pourcentage de variation */
  value: number
  /** Direction de la tendance */
  direction: TrendDirection
  /** Texte descriptif optionnel */
  label?: string
  /** Taille de l'indicateur */
  size?: 'sm' | 'md' | 'lg'
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Variante de couleur pour StatCard (Cyber Glass 3D)
 * @ticket SP-259
 */
export type StatCardVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'

/**
 * Props pour le composant StatCard
 */
export interface StatCardProps {
  /** Titre de la carte */
  title: string
  /** Valeur principale a afficher */
  value: number | string
  /** Icone Lucide a afficher */
  icon?: LucideIcon
  /** Donnees de tendance optionnelles */
  trend?: TrendData
  /** Unite de mesure optionnelle */
  unit?: string
  /** Description ou sous-titre */
  description?: string
  /** Etat de chargement */
  isLoading?: boolean
  /** Variante de couleur Cyber Glass 3D */
  variant?: StatCardVariant
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Props pour le composant StatsGrid
 */
export interface StatsGridProps {
  /** Liste des statistiques a afficher */
  stats: StatCardProps[]
  /** Nombre de colonnes (responsive) */
  columns?: 2 | 3 | 4
  /** Etat de chargement global */
  isLoading?: boolean
  /** Classes CSS additionnelles */
  className?: string
}

// ============================================================================
// Stats specifiques par role
// ============================================================================

/**
 * Statistiques pour SYSTEM_ADMIN
 * Vue globale de la plateforme SaaS
 */
export interface AdminStats {
  /** Nombre total d'entreprises */
  totalCompanies: number
  /** Nombre total d'utilisateurs */
  totalUsers: number
  /** Utilisateurs actifs (connectes recemment) */
  activeUsers: number
  /** Revenu mensuel recurrent */
  monthlyRevenue: number
  /** Taux de retention */
  retentionRate: number
  /** Nouveaux utilisateurs ce mois */
  newUsersThisMonth: number
  /** Tendances */
  trends?: {
    companies?: TrendData
    users?: TrendData
    revenue?: TrendData
    retention?: TrendData
  }
}

/**
 * Statistiques pour DIRECTOR
 * Vue globale de l'entreprise
 */
export interface DirectorStats {
  /** Nombre total d'employes */
  totalEmployees: number
  /** Nombre d'equipes */
  totalTeams: number
  /** Demandes de conges en attente */
  pendingLeaveRequests: number
  /** Taux de presence moyen */
  averageAttendanceRate: number
  /** Budget conges consomme */
  leavesBudgetUsed: number
  /** Employes en conge aujourd'hui */
  employeesOnLeaveToday: number
  /** Tendances */
  trends?: {
    employees?: TrendData
    attendance?: TrendData
    leaveRequests?: TrendData
  }
}

/**
 * Statistiques pour MANAGER
 * Vue de l'equipe geree
 */
export interface ManagerStats {
  /** Taille de l'equipe */
  teamSize: number
  /** Membres presents aujourd'hui */
  presentToday: number
  /** Demandes de conges a valider */
  pendingApprovals: number
  /** Taux de presence de l'equipe */
  teamAttendanceRate: number
  /** Heures travaillees cette semaine */
  hoursWorkedThisWeek: number
  /** Conges equipe ce mois */
  teamLeavesThisMonth: number
  /** Tendances */
  trends?: {
    attendance?: TrendData
    pendingApprovals?: TrendData
  }
}

/**
 * Statistiques pour EMPLOYEE
 * Vue personnelle
 */
export interface EmployeeStats {
  /** Solde de conges restants */
  remainingLeaves: number
  /** Conges pris cette annee */
  leavesTakenThisYear: number
  /** Demandes en cours */
  pendingRequests: number
  /** Prochains jours de conge */
  nextLeaveDate: string | null
  /** Heures travaillees ce mois */
  hoursWorkedThisMonth: number
  /** Tendances */
  trends?: {
    leaves?: TrendData
    hoursWorked?: TrendData
  }
}

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Union des stats par role pour le typage generique
 */
export type RoleStats =
  | AdminStats
  | DirectorStats
  | ManagerStats
  | EmployeeStats

/**
 * Configuration d'une carte de stat pour mapping KPI -> StatCard
 */
export interface StatCardConfig {
  /** Cle du KPI dans l'objet stats */
  key: string
  /** Titre affiche */
  title: string
  /** Icone a utiliser */
  icon: LucideIcon
  /** Unite optionnelle */
  unit?: string
  /** Description optionnelle */
  description?: string
  /** Formateur de valeur optionnel */
  formatter?: (value: number | string) => string
}
