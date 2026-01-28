/**
 * Types pour les emails de décision de congé
 *
 * @ticket SP-300
 * @description Types partagés pour les templates d'email de congé validé/refusé
 */

/**
 * Types de congés supportés par SmartPlanning
 */
export type LeaveType =
  | 'PAID_LEAVE' // Congés payés
  | 'RTT' // RTT
  | 'SICK_LEAVE' // Maladie
  | 'UNPAID_LEAVE' // Sans solde
  | 'PARENTAL_LEAVE' // Congé parental
  | 'FAMILY_EVENT' // Événement familial
  | 'OTHER' // Autre

/**
 * Labels français pour les types de congés
 */
export const leaveTypeLabels: Record<LeaveType, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK_LEAVE: 'Arrêt maladie',
  UNPAID_LEAVE: 'Congé sans solde',
  PARENTAL_LEAVE: 'Congé parental',
  FAMILY_EVENT: 'Événement familial',
  OTHER: 'Autre',
}

/**
 * Données requises pour envoyer un email de décision de congé
 */
export interface LeaveEmailData {
  /** Prénom de l'employé */
  firstName: string
  /** Adresse email de l'employé */
  email: string
  /** Type de congé demandé */
  leaveType: LeaveType
  /** Date de début du congé */
  startDate: Date
  /** Date de fin du congé */
  endDate: Date
  /** URL du tableau de bord des congés (optionnel) */
  dashboardUrl?: string
}

/**
 * Données additionnelles pour un email de refus de congé
 */
export interface LeaveRejectedEmailData extends LeaveEmailData {
  /** Motif du refus de la demande */
  rejectionReason: string
}

/**
 * Données pour notifier un manager d'une nouvelle demande de congé
 * @ticket SP-415
 */
export interface LeaveRequestedEmailData {
  /** Email du manager */
  managerEmail: string
  /** Prénom du manager */
  managerName: string
  /** Nom complet de l'employé */
  employeeName: string
  /** Type de congé demandé */
  leaveType: LeaveType
  /** Date de début du congé */
  startDate: Date
  /** Date de fin du congé */
  endDate: Date
  /** Nombre de jours */
  totalDays: number
  /** Motif de la demande (optionnel) */
  reason?: string
  /** ID de la demande pour l'URL */
  requestId: string
}
