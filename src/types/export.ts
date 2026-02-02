/**
 * Types pour l'export des données RGPD Article 20
 *
 * ✅ Source : RGPD Article 20 - Droit à la portabilité des données
 *
 * OBJECTIF (CDA) :
 * Définir les interfaces pour l'export des données personnelles
 * dans un format structuré, interopérable et lisible par machine.
 *
 * CONTENU EXPORTÉ :
 * - Données du compte utilisateur
 * - Profil employé
 * - Plannings
 * - Demandes de congés
 * - Soldes de congés
 * - Disponibilités
 * - Tâches personnelles
 * - Notifications
 * - Notes d'incident rédigées
 *
 * DONNÉES EXCLUES (sensibles) :
 * - Mot de passe (même hashé)
 * - IDs internes techniques
 * - Tokens OAuth
 * - Sessions
 * - Notes d'incident où l'utilisateur est le sujet
 */

// ============================================================================
// INFORMATIONS D'EXPORT
// ============================================================================

/**
 * Métadonnées de l'export
 */
export interface ExportInfo {
  /** Date de l'export au format ISO 8601 */
  exportDate: string
  /** Format de l'export (mention RGPD) */
  format: string
  /** Version du schéma d'export */
  version: string
}

// ============================================================================
// DONNÉES DU COMPTE
// ============================================================================

/**
 * Données du compte utilisateur exportées
 */
export interface ExportAccount {
  /** Adresse email */
  email: string
  /** Nom d'affichage */
  name: string | null
  /** URL de l'avatar */
  image: string | null
  /** Rôle dans l'application */
  role: string
  /** Date de vérification de l'email */
  emailVerified: string | null
  /** Statut actif du compte */
  isActive: boolean
  /** Date de création du compte */
  createdAt: string
  /** Date de dernière connexion */
  lastLoginAt: string | null
}

// ============================================================================
// PROFIL EMPLOYÉ
// ============================================================================

/**
 * Données du profil employé exportées
 */
export interface ExportProfile {
  /** Prénom */
  firstName: string
  /** Nom de famille */
  lastName: string
  /** Numéro de téléphone */
  phone: string | null
  /** Email professionnel */
  email: string | null
  /** Intitulé de poste */
  jobTitle: string | null
  /** Département */
  department: string | null
  /** Date d'embauche (YYYY-MM-DD) */
  hireDate: string | null
  /** Heures hebdomadaires contractuelles */
  weeklyHours: number
  /** Compétences */
  skills: string[]
  /** Préférences utilisateur */
  preferences: Record<string, unknown> | null
  /** Nom de l'équipe */
  team: string | null
  /** Statut actif */
  isActive: boolean
  /** Date de création du profil */
  createdAt: string
}

// ============================================================================
// PLANNINGS
// ============================================================================

/**
 * Planning exporté
 */
export interface ExportSchedule {
  /** Date du planning (YYYY-MM-DD) */
  date: string
  /** Heure de début (HH:mm) */
  startTime: string
  /** Heure de fin (HH:mm) */
  endTime: string
  /** Type de planning (WORK, REST, HOLIDAY, etc.) */
  type: string
  /** Statut du planning */
  status: string
  /** Titre optionnel */
  title: string | null
  /** Description */
  description: string | null
  /** Lieu */
  location: string | null
}

// ============================================================================
// CONGÉS
// ============================================================================

/**
 * Demande de congé exportée
 */
export interface ExportLeaveRequest {
  /** Date de début (YYYY-MM-DD) */
  startDate: string
  /** Date de fin (YYYY-MM-DD) */
  endDate: string
  /** Nombre de jours */
  days: number
  /** Type de congé (PAID_LEAVE, RTT, SICK_LEAVE, etc.) */
  type: string
  /** Statut de la demande */
  status: string
  /** Demi-journée */
  halfDay: boolean
  /** Période de la demi-journée (MORNING, AFTERNOON) */
  halfDayPeriod: string | null
  /** Motif de la demande */
  reason: string | null
  /** Commentaire de l'employé */
  comment: string | null
  /** Date de la décision */
  reviewedAt: string | null
  /** Commentaire du validateur */
  reviewComment: string | null
}

/**
 * Solde de congés exporté
 */
export interface ExportLeaveBalance {
  /** Année */
  year: number
  /** Congés payés */
  paidLeave: {
    /** Total acquis */
    total: number
    /** Jours utilisés */
    used: number
    /** Jours restants */
    remaining: number
  }
  /** RTT */
  rtt: {
    /** Total acquis */
    total: number
    /** Jours utilisés */
    used: number
    /** Jours restants */
    remaining: number
  }
}

// ============================================================================
// DISPONIBILITÉS
// ============================================================================

/**
 * Disponibilité exportée
 */
export interface ExportAvailability {
  /** Date de début (YYYY-MM-DD) */
  startDate: string
  /** Date de fin (YYYY-MM-DD) */
  endDate: string
  /** Heure de début optionnelle (HH:mm) */
  startTime: string | null
  /** Heure de fin optionnelle (HH:mm) */
  endTime: string | null
  /** Type de disponibilité */
  type: string
  /** Motif */
  reason: string | null
  /** Récurrence */
  isRecurring: boolean
}

// ============================================================================
// TÂCHES PERSONNELLES
// ============================================================================

/**
 * Tâche personnelle exportée
 */
export interface ExportPersonalTask {
  /** Titre de la tâche */
  title: string
  /** Description */
  description: string | null
  /** Date d'échéance (YYYY-MM-DD) */
  dueDate: string | null
  /** Statut complété */
  completed: boolean
  /** Date de création */
  createdAt: string
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notification exportée
 */
export interface ExportNotification {
  /** Titre */
  title: string
  /** Message */
  message: string
  /** Type de notification */
  type: string
  /** Statut de lecture */
  isRead: boolean
  /** Date de lecture */
  readAt: string | null
  /** Date de création */
  createdAt: string
}

// ============================================================================
// NOTES D'INCIDENT
// ============================================================================

/**
 * Note d'incident rédigée par l'utilisateur (en tant qu'auteur)
 */
export interface ExportIncidentNote {
  /** Titre de la note */
  title: string
  /** Contenu */
  content: string | null
  /** Date de l'incident (YYYY-MM-DD) */
  date: string
  /** Niveau de visibilité */
  visibility: string
  /** Date de création */
  createdAt: string
}

// ============================================================================
// EXPORT COMPLET
// ============================================================================

/**
 * Structure complète de l'export des données utilisateur
 * Conforme RGPD Article 20 - Portabilité des données
 */
export interface UserDataExport {
  /** Métadonnées de l'export */
  exportInfo: ExportInfo
  /** Données du compte */
  account: ExportAccount
  /** Profil employé (null si SYSTEM_ADMIN sans profil) */
  profile: ExportProfile | null
  /** Historique des plannings */
  schedules: ExportSchedule[]
  /** Historique des demandes de congés */
  leaveRequests: ExportLeaveRequest[]
  /** Soldes de congés par année */
  leaveBalances: ExportLeaveBalance[]
  /** Disponibilités déclarées */
  availabilities: ExportAvailability[]
  /** Tâches personnelles */
  personalTasks: ExportPersonalTask[]
  /** Notifications reçues */
  notifications: ExportNotification[]
  /** Notes d'incident rédigées (en tant qu'auteur) */
  incidentNotesAuthored: ExportIncidentNote[]
}
