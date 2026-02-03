/**
 * Types TypeScript pour les notifications
 *
 * SP-321 : Enrichissement du modèle Notification
 *
 * ✅ Source : Schema Prisma + Best practices TypeScript
 *
 * OBJECTIF (CDA) :
 * Centraliser les types, labels et couleurs pour les notifications
 * afin d'assurer la cohérence UI et la maintenabilité du code.
 */

import { Prisma } from '@prisma/client'

// ============================================================================
// TYPES IMPORTÉS DE PRISMA
// ============================================================================

/**
 * Type de notification (enum Prisma)
 *
 * Types génériques :
 * - INFO : Information générale
 * - SUCCESS : Succès d'une opération
 * - WARNING : Avertissement
 * - ERROR : Erreur
 * - SYSTEM : Notification système
 *
 * Types métier (SP-321) :
 * - PLANNING : Notifications liées aux plannings
 * - LEAVE : Notifications liées aux congés
 * - TASK : Notifications liées aux tâches personnelles
 * - INCIDENT : Notifications liées aux notes d'incident
 */
export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'SYSTEM'
  | 'PLANNING'
  | 'LEAVE'
  | 'TASK'
  | 'INCIDENT'

/**
 * Priorité de notification (enum Prisma - SP-321)
 *
 * - LOW : Priorité basse (informative)
 * - MEDIUM : Priorité moyenne (action recommandée)
 * - HIGH : Priorité haute (action requise)
 * - URGENT : Urgente (action immédiate requise)
 */
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

// ============================================================================
// LABELS FRANÇAIS
// ============================================================================

/**
 * Labels français pour les types de notification
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  INFO: 'Information',
  SUCCESS: 'Succès',
  WARNING: 'Avertissement',
  ERROR: 'Erreur',
  SYSTEM: 'Système',
  PLANNING: 'Planning',
  LEAVE: 'Congés',
  TASK: 'Tâche',
  INCIDENT: 'Incident',
}

/**
 * Labels français pour les priorités de notification
 */
export const NOTIFICATION_PRIORITY_LABELS: Record<
  NotificationPriority,
  string
> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
}

// ============================================================================
// COULEURS UI
// ============================================================================

/**
 * Couleurs Tailwind pour les types de notification
 *
 * Format : { bg, text, border, icon }
 */
export const NOTIFICATION_TYPE_COLORS: Record<
  NotificationType,
  {
    bg: string
    text: string
    border: string
    icon: string
  }
> = {
  INFO: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
  },
  SUCCESS: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500',
  },
  WARNING: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
  },
  ERROR: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500',
  },
  SYSTEM: {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    icon: 'text-slate-500',
  },
  PLANNING: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-500',
  },
  LEAVE: {
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    icon: 'text-teal-500',
  },
  TASK: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-800',
    icon: 'text-violet-500',
  },
  INCIDENT: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-500',
  },
}

/**
 * Couleurs Tailwind pour les priorités de notification
 */
export const NOTIFICATION_PRIORITY_COLORS: Record<
  NotificationPriority,
  {
    bg: string
    text: string
    border: string
    badge: string
  }
> = {
  LOW: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  },
  MEDIUM: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-300',
  },
  HIGH: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-200 text-amber-700 dark:bg-amber-800 dark:text-amber-300',
  },
  URGENT: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-300',
  },
}

// ============================================================================
// ICÔNES (Lucide React)
// ============================================================================

/**
 * Noms d'icônes Lucide pour les types de notification
 */
export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  INFO: 'Info',
  SUCCESS: 'CheckCircle',
  WARNING: 'AlertTriangle',
  ERROR: 'XCircle',
  SYSTEM: 'Settings',
  PLANNING: 'Calendar',
  LEAVE: 'Palmtree',
  TASK: 'ListTodo',
  INCIDENT: 'AlertOctagon',
}

/**
 * Noms d'icônes Lucide pour les priorités de notification
 */
export const NOTIFICATION_PRIORITY_ICONS: Record<NotificationPriority, string> =
  {
    LOW: 'ArrowDown',
    MEDIUM: 'Minus',
    HIGH: 'ArrowUp',
    URGENT: 'AlertCircle',
  }

// ============================================================================
// TYPES AVEC RELATIONS (PRISMA)
// ============================================================================

/**
 * Notification avec l'utilisateur destinataire
 */
export type NotificationWithUser = Prisma.NotificationGetPayload<{
  include: {
    user: true
  }
}>

/**
 * Notification avec toutes les relations (utilisateur et entreprise)
 */
export type NotificationWithRelations = Prisma.NotificationGetPayload<{
  include: {
    user: true
    company: true
  }
}>

/**
 * Notification pour les listes (sélection minimale)
 */
export type NotificationListItem = Prisma.NotificationGetPayload<{
  select: {
    id: true
    title: true
    message: true
    type: true
    priority: true
    actionUrl: true
    relatedType: true
    relatedId: true
    isRead: true
    readAt: true
    createdAt: true
  }
}>

// ============================================================================
// TYPES POUR CRÉATION/MISE À JOUR
// ============================================================================

/**
 * Données pour créer une notification
 */
export type CreateNotificationInput = {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  relatedType?: string
  relatedId?: string
  actionUrl?: string
  userId: string
  companyId: string
}

/**
 * Données pour mettre à jour une notification
 */
export type UpdateNotificationInput = {
  title?: string
  message?: string
  type?: NotificationType
  priority?: NotificationPriority
  isRead?: boolean
  readAt?: Date | null
}

// ============================================================================
// TYPES POUR FILTRES
// ============================================================================

/**
 * Filtres pour la recherche de notifications
 */
export type NotificationFilters = {
  userId?: string
  companyId?: string
  type?: NotificationType
  priority?: NotificationPriority
  isRead?: boolean
  relatedType?: string
  startDate?: Date
  endDate?: Date
}

// ============================================================================
// OPTIONS POUR SELECT/DROPDOWN
// ============================================================================

/**
 * Options pour le select de type de notification
 */
export const notificationTypeOptions = Object.entries(
  NOTIFICATION_TYPE_LABELS
).map(([value, label]) => ({
  value: value as NotificationType,
  label,
}))

/**
 * Options pour le select de priorité de notification
 */
export const notificationPriorityOptions = Object.entries(
  NOTIFICATION_PRIORITY_LABELS
).map(([value, label]) => ({
  value: value as NotificationPriority,
  label,
}))

// ============================================================================
// TYPES MÉTIER (SP-321)
// ============================================================================

/**
 * Mapping des types de notification vers les relatedType
 *
 * Permet de déterminer automatiquement le relatedType
 * en fonction du type de notification
 */
export const NOTIFICATION_TYPE_TO_RELATED_TYPE: Partial<
  Record<NotificationType, string>
> = {
  PLANNING: 'Schedule',
  LEAVE: 'LeaveRequest',
  TASK: 'PersonalTask',
  INCIDENT: 'IncidentNote',
}

/**
 * Type pour les données d'une notification de planning
 */
export type PlanningNotificationData = {
  scheduleId: string
  scheduleTitle: string
  startDate: Date
  endDate: Date
  employeeName: string
}

/**
 * Type pour les données d'une notification de congé
 */
export type LeaveNotificationData = {
  leaveRequestId: string
  leaveType: string
  startDate: Date
  endDate: Date
  employeeName: string
  status: string
}

/**
 * Type pour les données d'une notification de tâche
 */
export type TaskNotificationData = {
  taskId: string
  taskTitle: string
  dueDate?: Date
}

/**
 * Type pour les données d'une notification d'incident
 */
export type IncidentNotificationData = {
  incidentNoteId: string
  incidentTitle: string
  subjectName: string
  incidentDate: Date
}
