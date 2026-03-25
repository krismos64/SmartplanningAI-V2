/**
 * Server Actions pour le système de notifications
 *
 * @description Factory functions pour créer des notifications typées
 * par domaine métier (planning, congés, tâches, incidents, système).
 *
 * Points d'intégration :
 * - Planning : createSchedule, updateSchedule, deleteSchedule
 * - Congés : createLeaveRequest, reviewLeaveRequest
 * - Tâches : (optionnel, notes perso privées)
 * - Incidents : createIncidentNote (selon visibility)
 * - Système : notifications bulk admin
 *
 * @ticket SP-325, SP-327
 */

'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { emitNotification } from '@/lib/notifications'
import {
  UserRole,
  NotificationType,
  NotificationPriority,
  type Notification,
} from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  validateData,
  getPaginationParams,
  formatPaginatedResult,
  handlePrismaError,
  canAccessCompanyEntity,
} from './crud-helpers'
import {
  parseUserPreferences,
  isInAppNotificationEnabled,
  isEmailNotificationEnabled,
} from '@/lib/utils/preferences'
import { getNotificationCategory } from '@/lib/helpers/notification-categories'
import {
  notificationFiltersSchema,
  planningNotificationActionSchema,
  leaveNotificationActionSchema,
  type PlanningNotificationAction,
  type LeaveNotificationAction,
} from '@/lib/validations/notification'
import type {
  CrudActionResult,
  ListQueryParams,
  PaginatedResult,
} from '@/types'
import type {
  NotificationListItem,
  NotificationFilters,
} from '@/types/notification'

// ============================================================================
// Types
// ============================================================================

interface AuthenticatedUser {
  id: string
  role: UserRole
  companyId: string | null
  employeeId: string | null
}

type AccessCheckResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string }

/** Résultat de création de notification (non-bloquant) */
type NotificationResult =
  | { success: true; notification: Notification | null; skipped?: string }
  | { success: false; error: string }

// ============================================================================
// Auth + RBAC
// ============================================================================

const ALL_ROLES: UserRole[] = [
  'SYSTEM_ADMIN',
  'DIRECTOR',
  'MANAGER',
  'EMPLOYEE',
]

/**
 * Récupère l'utilisateur authentifié avec vérification des rôles
 */
async function getAuthenticatedUser(
  allowedRoles: UserRole[] = ALL_ROLES
): Promise<AccessCheckResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Vous devez être connecté pour effectuer cette action',
      }
    }

    const role = session.user.role
    if (!allowedRoles.includes(role)) {
      return {
        success: false,
        error: "Vous n'avez pas les permissions nécessaires",
      }
    }

    const userId = session.user.id
    const companyId = session.user.companyId ?? null

    let employeeId: string | null = null

    // Récupérer le contexte employé si existant
    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (employee) {
      employeeId = employee.id
    }

    return {
      success: true,
      user: { id: userId, role, companyId, employeeId },
    }
  } catch (error) {
    console.error('[getAuthenticatedUser] Error:', error)
    return { success: false, error: 'Erreur de vérification des permissions' }
  }
}

// ============================================================================
// Factory Functions - Planning (SP-325)
// ============================================================================

/**
 * Crée une notification pour un événement de planning (single schedule)
 *
 * @param scheduleId - ID du planning concerné
 * @param employeeUserId - ID de l'utilisateur employé destinataire
 * @param action - Type d'action (created, updated, deleted)
 * @param creatorUserId - ID de l'utilisateur qui a créé/modifié le planning (pour éviter l'auto-notification)
 * @param scheduleData - Données du schedule (optionnel, utilisé pour deleteSchedule car le schedule est déjà supprimé)
 * @returns Résultat de création (non-bloquant)
 */
export async function createPlanningNotification(
  scheduleId: string,
  employeeUserId: string,
  action: PlanningNotificationAction,
  creatorUserId?: string,
  scheduleData?: {
    startTime: string | Date
    endTime: string | Date
    companyId: string
    type: string
  }
): Promise<NotificationResult> {
  try {
    // Validation de l'action
    const actionValidation = planningNotificationActionSchema.safeParse(action)
    if (!actionValidation.success) {
      return { success: false, error: 'Action de planning invalide' }
    }

    // Ne pas notifier le créateur lui-même
    if (creatorUserId && creatorUserId === employeeUserId) {
      return { success: true, notification: null, skipped: 'self-notification' }
    }

    // Récupérer les infos du planning (ou utiliser les données fournies pour delete)
    let startTime: string | Date

    if (scheduleData) {
      startTime = scheduleData.startTime
    } else {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          companyId: true,
        },
      })

      if (!schedule) {
        return { success: false, error: 'Planning non trouvé' }
      }
      startTime = schedule.startTime
    }

    // Récupérer l'utilisateur destinataire avec ses préférences
    const user = await prisma.user.findUnique({
      where: { id: employeeUserId },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        preferences: true,
      },
    })

    if (!user || !user.companyId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const userPrefs = parseUserPreferences(user.preferences)
    const category = getNotificationCategory(NotificationType.PLANNING)

    // Vérifier préférence in-app
    const inAppEnabled = isInAppNotificationEnabled(userPrefs, category)
    // Vérifier préférence email
    const emailEnabled = isEmailNotificationEnabled(userPrefs, category)

    if (!inAppEnabled && !emailEnabled) {
      return {
        success: true,
        notification: null,
        skipped: 'all channels disabled',
      }
    }

    // Construire le message selon l'action
    const actionMessages: Record<
      PlanningNotificationAction,
      { title: string; message: string }
    > = {
      created: {
        title: 'Nouveau planning assigné',
        message: `Un nouveau planning a été créé pour le ${formatDate(startTime)}.`,
      },
      updated: {
        title: 'Planning modifié',
        message: `Votre planning du ${formatDate(startTime)} a été modifié.`,
      },
      deleted: {
        title: 'Planning supprimé',
        message: `Votre planning du ${formatDate(startTime)} a été supprimé.`,
      },
    }

    const { title, message } = actionMessages[action]
    const priority: NotificationPriority =
      action === 'deleted' ? 'HIGH' : action === 'updated' ? 'MEDIUM' : 'LOW'

    let notification: Notification | null = null

    // Notification in-app + SSE
    if (inAppEnabled) {
      notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: NotificationType.PLANNING,
          priority,
          relatedType: 'Schedule',
          relatedId: scheduleId,
          actionUrl: '/app/dashboard/schedules',
          userId: employeeUserId,
          companyId: user.companyId,
        },
      })
      emitNotification(employeeUserId, notification)
    }

    // Email planning (fire-and-forget)
    if (emailEnabled && user.email) {
      const { sendScheduleNotificationEmail } = await import(
        '@/lib/email/templates/schedule-notification'
      )
      sendScheduleNotificationEmail({
        employeeEmail: user.email,
        firstName: user.name?.split(' ')[0] || 'Collaborateur',
        action,
        count: 1,
        startDate:
          typeof startTime === 'string' ? new Date(startTime) : startTime,
        scheduleType: scheduleData?.type || 'WORK',
        timeRange: scheduleData
          ? `${formatTime(scheduleData.startTime)} - ${formatTime(scheduleData.endTime)}`
          : undefined,
      }).catch(console.error)
    }

    return { success: true, notification }
  } catch (error) {
    console.error('[createPlanningNotification] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la notification',
    }
  }
}

/**
 * Crée une notification groupée pour un batch de schedules créés pour un même employé.
 * Envoie UNE seule notification in-app + UN seul email au lieu d'une par créneau.
 *
 * @param schedules - Liste des schedules créés pour cet employé
 * @param employeeUserId - ID de l'utilisateur employé destinataire
 * @param action - Type d'action (created, updated, deleted)
 * @param creatorUserId - ID du créateur (pour éviter l'auto-notification)
 */
export async function createBatchPlanningNotification(
  schedules: Array<{
    id: string
    startDate: Date
    endDate: Date
    startTime: string
    endTime: string
    type: string
    companyId: string
  }>,
  employeeUserId: string,
  action: PlanningNotificationAction,
  creatorUserId?: string
): Promise<NotificationResult> {
  try {
    if (schedules.length === 0) {
      return { success: false, error: 'Aucun schedule fourni' }
    }

    // Ne pas notifier le créateur lui-même
    if (creatorUserId && creatorUserId === employeeUserId) {
      return { success: true, notification: null, skipped: 'self-notification' }
    }

    // Si un seul schedule, déléguer à la version simple
    if (schedules.length === 1) {
      const s = schedules[0]!
      return createPlanningNotification(
        s.id,
        employeeUserId,
        action,
        creatorUserId,
        {
          startTime: s.startTime,
          endTime: s.endTime,
          companyId: s.companyId,
          type: s.type,
        }
      )
    }

    // Récupérer l'utilisateur avec préférences
    const user = await prisma.user.findUnique({
      where: { id: employeeUserId },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        preferences: true,
      },
    })

    if (!user || !user.companyId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    const userPrefs = parseUserPreferences(user.preferences)
    const category = getNotificationCategory(NotificationType.PLANNING)
    const inAppEnabled = isInAppNotificationEnabled(userPrefs, category)
    const emailEnabled = isEmailNotificationEnabled(userPrefs, category)

    if (!inAppEnabled && !emailEnabled) {
      return {
        success: true,
        notification: null,
        skipped: 'all channels disabled',
      }
    }

    // Calculer la plage de dates
    const sortedByDate = [...schedules].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    )
    const firstDate = sortedByDate[0]!.startDate
    const lastDate = sortedByDate[sortedByDate.length - 1]!.startDate
    const count = schedules.length
    const scheduleType = schedules[0]!.type

    // Messages groupés
    const actionMessages: Record<
      PlanningNotificationAction,
      { title: string; message: string }
    > = {
      created: {
        title: `${count} nouveaux créneaux assignés`,
        message: `${count} créneaux ont été ajoutés à votre planning du ${formatDate(firstDate)} au ${formatDate(lastDate)}.`,
      },
      updated: {
        title: `${count} créneaux modifiés`,
        message: `${count} créneaux de votre planning ont été modifiés (${formatDate(firstDate)} au ${formatDate(lastDate)}).`,
      },
      deleted: {
        title: `${count} créneaux supprimés`,
        message: `${count} créneaux ont été retirés de votre planning (${formatDate(firstDate)} au ${formatDate(lastDate)}).`,
      },
    }

    const { title, message } = actionMessages[action]
    const priority: NotificationPriority =
      action === 'deleted' ? 'HIGH' : action === 'updated' ? 'MEDIUM' : 'LOW'

    let notification: Notification | null = null

    // UNE seule notification in-app
    if (inAppEnabled) {
      notification = await prisma.notification.create({
        data: {
          title,
          message,
          type: NotificationType.PLANNING,
          priority,
          relatedType: 'Schedule',
          relatedId: sortedByDate[0]!.id,
          actionUrl: '/app/dashboard/schedules',
          userId: employeeUserId,
          companyId: user.companyId,
        },
      })
      emitNotification(employeeUserId, notification)
    }

    // UN seul email groupé (fire-and-forget)
    if (emailEnabled && user.email) {
      const { sendScheduleNotificationEmail } = await import(
        '@/lib/email/templates/schedule-notification'
      )
      sendScheduleNotificationEmail({
        employeeEmail: user.email,
        firstName: user.name?.split(' ')[0] || 'Collaborateur',
        action,
        count,
        startDate: firstDate,
        endDate: lastDate,
        scheduleType,
        timeRange: `${schedules[0]!.startTime} - ${schedules[0]!.endTime}`,
      }).catch(console.error)
    }

    return { success: true, notification }
  } catch (error) {
    console.error('[createBatchPlanningNotification] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la notification groupée',
    }
  }
}

// ============================================================================
// Factory Functions - Leave (SP-325)
// ============================================================================

/**
 * Crée une notification pour un événement de congé
 *
 * @param leaveRequestId - ID de la demande de congé
 * @param targetUserId - ID de l'utilisateur destinataire
 * @param action - Type d'action (requested, approved, rejected)
 * @returns Résultat de création (non-bloquant)
 *
 * @example
 * // Dans reviewLeaveRequest (approbation)
 * createLeaveNotification(leaveRequest.id, employee.userId, 'approved')
 *   .catch(console.error)
 */
export async function createLeaveNotification(
  leaveRequestId: string,
  targetUserId: string,
  action: LeaveNotificationAction
): Promise<NotificationResult> {
  try {
    // Validation de l'action
    const actionValidation = leaveNotificationActionSchema.safeParse(action)
    if (!actionValidation.success) {
      return { success: false, error: 'Action de congé invalide' }
    }

    // Récupérer les infos de la demande
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: leaveRequestId },
      select: {
        id: true,
        type: true,
        startDate: true,
        endDate: true,
        companyId: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!leaveRequest) {
      return { success: false, error: 'Demande de congé non trouvée' }
    }

    // Récupérer l'utilisateur destinataire avec ses préférences
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, companyId: true, preferences: true },
    })

    if (!user || !user.companyId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // SP-275: Vérifier les préférences de notifications
    const userPrefs = parseUserPreferences(user.preferences)
    const category = getNotificationCategory(NotificationType.LEAVE)

    if (!isInAppNotificationEnabled(userPrefs, category)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Notification] In-app désactivé pour ${category} (user: ${targetUserId})`
        )
      }
      return { success: true, notification: null, skipped: 'inApp disabled' }
    }

    // Construire le message selon l'action
    const employeeName = `${leaveRequest.employee.firstName} ${leaveRequest.employee.lastName}`
    const dateRange = `du ${formatDate(leaveRequest.startDate)} au ${formatDate(leaveRequest.endDate)}`

    const actionMessages: Record<
      LeaveNotificationAction,
      { title: string; message: string; priority: NotificationPriority }
    > = {
      requested: {
        title: 'Nouvelle demande de congé',
        message: `${employeeName} a déposé une demande de congé ${dateRange}.`,
        priority: 'MEDIUM',
      },
      approved: {
        title: 'Congé approuvé',
        message: `Votre demande de congé ${dateRange} a été approuvée.`,
        priority: 'LOW',
      },
      rejected: {
        title: 'Congé refusé',
        message: `Votre demande de congé ${dateRange} a été refusée.`,
        priority: 'HIGH',
      },
      cancelled: {
        title: 'Congé annulé',
        message: `${employeeName} a annulé sa demande de congé ${dateRange}.`,
        priority: 'MEDIUM',
      },
    }

    const { title, message, priority } = actionMessages[action]

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: NotificationType.LEAVE,
        priority,
        relatedType: 'LeaveRequest',
        relatedId: leaveRequestId,
        actionUrl: '/app/dashboard/leaves',
        userId: targetUserId,
        companyId: user.companyId,
      },
    })

    // Émettre via SSE (non-bloquant)
    emitNotification(targetUserId, notification)

    return { success: true, notification }
  } catch (error) {
    console.error('[createLeaveNotification] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la notification',
    }
  }
}

// ============================================================================
// Factory Functions - Task (SP-325)
// ============================================================================

/**
 * Crée une notification pour une tâche personnelle
 *
 * Note: Les tâches personnelles sont privées, cette fonction est optionnelle
 * et pourrait être utilisée pour des rappels de deadline.
 *
 * @param taskId - ID de la tâche
 * @param userId - ID de l'utilisateur propriétaire
 * @param action - Type d'action (reminder)
 * @returns Résultat de création (non-bloquant)
 */
export async function createTaskNotification(
  taskId: string,
  userId: string,
  action: 'reminder' | 'overdue'
): Promise<NotificationResult> {
  try {
    // Récupérer les infos de la tâche avec préférences utilisateur
    const task = await prisma.personalTask.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        dueDate: true,
        userId: true,
        user: {
          select: { companyId: true, preferences: true },
        },
      },
    })

    if (!task) {
      return { success: false, error: 'Tâche non trouvée' }
    }

    // Vérifier que c'est bien la tâche de l'utilisateur (privé)
    if (task.userId !== userId) {
      return { success: false, error: 'Accès non autorisé' }
    }

    if (!task.user.companyId) {
      return { success: false, error: 'Utilisateur sans entreprise' }
    }

    // SP-275: Vérifier les préférences de notifications
    const userPrefs = parseUserPreferences(task.user.preferences)
    const category = getNotificationCategory(NotificationType.TASK)

    if (!isInAppNotificationEnabled(userPrefs, category)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Notification] In-app désactivé pour ${category} (user: ${userId})`
        )
      }
      return { success: true, notification: null, skipped: 'inApp disabled' }
    }

    // Construire le message selon l'action
    const actionMessages: Record<
      'reminder' | 'overdue',
      { title: string; message: string; priority: NotificationPriority }
    > = {
      reminder: {
        title: 'Rappel de tâche',
        message: `La tâche "${task.title}" arrive à échéance${task.dueDate ? ` le ${formatDate(task.dueDate)}` : ''}.`,
        priority: 'MEDIUM',
      },
      overdue: {
        title: 'Tâche en retard',
        message: `La tâche "${task.title}" est en retard.`,
        priority: 'HIGH',
      },
    }

    const { title, message, priority } = actionMessages[action]

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: NotificationType.TASK,
        priority,
        relatedType: 'PersonalTask',
        relatedId: taskId,
        actionUrl: '/app/dashboard/tasks',
        userId,
        companyId: task.user.companyId,
      },
    })

    // Émettre via SSE (non-bloquant)
    emitNotification(userId, notification)

    return { success: true, notification }
  } catch (error) {
    console.error('[createTaskNotification] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la notification',
    }
  }
}

// ============================================================================
// Factory Functions - Incident (SP-325)
// ============================================================================

/**
 * Crée une notification pour une note d'incident
 *
 * @param incidentNoteId - ID de la note d'incident
 * @param targetUserId - ID de l'utilisateur destinataire
 * @param action - Type d'action (created)
 * @returns Résultat de création (non-bloquant)
 *
 * @example
 * // Dans createIncidentNote (si visibility = ALL)
 * createIncidentNotification(note.id, subject.userId, 'created')
 *   .catch(console.error)
 */
export async function createIncidentNotification(
  incidentNoteId: string,
  targetUserId: string,
  action: 'created' | 'updated'
): Promise<NotificationResult> {
  try {
    // Récupérer les infos de la note
    const incidentNote = await prisma.incidentNote.findUnique({
      where: { id: incidentNoteId },
      select: {
        id: true,
        title: true,
        date: true,
        visibility: true,
        companyId: true,
        subject: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!incidentNote) {
      return { success: false, error: "Note d'incident non trouvée" }
    }

    // Récupérer l'utilisateur destinataire avec ses préférences
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, companyId: true, preferences: true },
    })

    if (!user || !user.companyId) {
      return { success: false, error: 'Utilisateur non trouvé' }
    }

    // SP-275: Vérifier les préférences de notifications (INCIDENT → system)
    const userPrefs = parseUserPreferences(user.preferences)
    const category = getNotificationCategory(NotificationType.INCIDENT)

    if (!isInAppNotificationEnabled(userPrefs, category)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Notification] In-app désactivé pour ${category} (user: ${targetUserId})`
        )
      }
      return { success: true, notification: null, skipped: 'inApp disabled' }
    }

    // Construire le message
    const actionMessages: Record<
      'created' | 'updated',
      { title: string; message: string }
    > = {
      created: {
        title: "Nouvelle note d'incident",
        message: `Une note d'incident "${incidentNote.title}" a été créée vous concernant.`,
      },
      updated: {
        title: "Note d'incident modifiée",
        message: `La note d'incident "${incidentNote.title}" a été mise à jour.`,
      },
    }

    const { title, message } = actionMessages[action]

    // Créer la notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type: NotificationType.INCIDENT,
        priority: 'HIGH',
        relatedType: 'IncidentNote',
        relatedId: incidentNoteId,
        actionUrl: '/app/dashboard/incidents',
        userId: targetUserId,
        companyId: user.companyId,
      },
    })

    // Émettre via SSE (non-bloquant)
    emitNotification(targetUserId, notification)

    return { success: true, notification }
  } catch (error) {
    console.error('[createIncidentNotification] Error:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la notification',
    }
  }
}

// ============================================================================
// Factory Functions - System (SP-325)
// ============================================================================

/**
 * Crée une notification système pour tous les utilisateurs d'une entreprise
 *
 * @param companyId - ID de l'entreprise
 * @param title - Titre de la notification
 * @param message - Message de la notification
 * @param priority - Priorité (défaut: MEDIUM)
 * @param actionUrl - URL d'action optionnelle
 * @returns Résultat avec nombre de notifications créées
 *
 * @example
 * // Annonce admin
 * await createSystemNotification(
 *   companyId,
 *   'Maintenance planifiée',
 *   'Une maintenance est prévue le 15 février de 2h à 4h.',
 *   'HIGH'
 * )
 */
export async function createSystemNotification(
  companyId: string,
  title: string,
  message: string,
  priority: NotificationPriority = 'MEDIUM',
  actionUrl?: string
): Promise<CrudActionResult<{ count: number }>> {
  try {
    // Vérifier les permissions (DIRECTOR+ ou SYSTEM_ADMIN)
    const authResult = await getAuthenticatedUser(['SYSTEM_ADMIN', 'DIRECTOR'])
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const { user } = authResult

    // Vérifier l'accès à l'entreprise
    if (!canAccessCompanyEntity(user.companyId, companyId)) {
      return {
        success: false,
        error: "Vous n'avez pas accès à cette entreprise",
      }
    }

    // Validation des données
    if (!title || title.length > 200) {
      return { success: false, error: 'Titre invalide (max 200 caractères)' }
    }
    if (!message || message.length > 2000) {
      return { success: false, error: 'Message invalide (max 2000 caractères)' }
    }

    // Récupérer tous les utilisateurs de l'entreprise avec leurs préférences
    const users = await prisma.user.findMany({
      where: { companyId },
      select: { id: true, preferences: true },
    })

    if (users.length === 0) {
      return { success: true, data: { count: 0 } }
    }

    // SP-275: Filtrer les utilisateurs qui ont activé les notifications système
    const category = getNotificationCategory(NotificationType.SYSTEM)
    const eligibleUsers = users.filter((u) => {
      const userPrefs = parseUserPreferences(u.preferences)
      return isInAppNotificationEnabled(userPrefs, category)
    })

    if (eligibleUsers.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[Notification] Aucun utilisateur avec notifications système activées (company: ${companyId})`
        )
      }
      return { success: true, data: { count: 0 } }
    }

    // Créer les notifications en bulk pour les utilisateurs éligibles
    const notifications = await prisma.notification.createMany({
      data: eligibleUsers.map((u) => ({
        title,
        message,
        type: NotificationType.SYSTEM,
        priority,
        actionUrl: actionUrl ?? null,
        userId: u.id,
        companyId,
      })),
    })

    // Récupérer les notifications créées pour émettre via SSE
    const createdNotifications = await prisma.notification.findMany({
      where: {
        companyId,
        type: NotificationType.SYSTEM,
        title,
        message,
        createdAt: { gte: new Date(Date.now() - 5000) }, // Dernières 5 secondes
      },
    })

    // Émettre via SSE à tous les utilisateurs (non-bloquant)
    for (const notif of createdNotifications) {
      emitNotification(notif.userId, notif)
    }

    revalidatePath('/app/dashboard')

    return { success: true, data: { count: notifications.count } }
  } catch (error) {
    console.error('[createSystemNotification] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Admin Notification Factory (SP-476)
// ============================================================================

interface AdminNotificationParams {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  actionUrl?: string
}

/**
 * Cree une notification pour tous les SYSTEM_ADMIN actifs.
 * Utilise en fire-and-forget depuis les triggers (inscription,
 * paiement echoue, trial expire, impersonation).
 *
 * @ticket SP-476
 */
export async function createAdminNotification(
  params: AdminNotificationParams
): Promise<void> {
  const { getSystemAdminUserIds } = await import(
    '@/lib/services/admin-notification.service'
  )
  const adminIds = await getSystemAdminUserIds()
  if (adminIds.length === 0) return

  const now = new Date()

  await prisma.notification.createMany({
    data: adminIds.map((userId) => ({
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority ?? 'MEDIUM',
      actionUrl: params.actionUrl ?? null,
      userId,
      companyId: null,
    })),
  })

  // Recuperer les notifications creees pour emettre via SSE
  const created = await prisma.notification.findMany({
    where: {
      userId: { in: adminIds },
      title: params.title,
      type: params.type,
      createdAt: { gte: now },
    },
  })

  // Emettre via SSE a chaque admin connecte
  for (const notif of created) {
    emitNotification(notif.userId, notif)
  }
}

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Récupère les notifications de l'utilisateur connecté
 *
 * @param filters - Filtres optionnels (type, priority, isRead, dates)
 * @param params - Paramètres de pagination
 * @returns Liste paginée des notifications
 */
export async function getNotifications(
  filters?: NotificationFilters,
  params?: ListQueryParams
): Promise<CrudActionResult<PaginatedResult<NotificationListItem>>> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const { user } = authResult

    // Validation des filtres
    if (filters) {
      const validation = validateData(notificationFiltersSchema, filters)
      if (!validation.success) {
        return { success: false, error: validation.error }
      }
    }

    // Construction du WHERE
    const where: Record<string, unknown> = {
      userId: user.id,
    }

    if (filters?.type) {
      where.type = filters.type
    }
    if (filters?.priority) {
      where.priority = filters.priority
    }
    if (typeof filters?.isRead === 'boolean') {
      where.isRead = filters.isRead
    }
    if (filters?.relatedType) {
      where.relatedType = filters.relatedType
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {}
      if (filters.startDate) {
        ;(where.createdAt as Record<string, Date>).gte = filters.startDate
      }
      if (filters.endDate) {
        ;(where.createdAt as Record<string, Date>).lte = filters.endDate
      }
    }

    // Pagination
    const queryParams = params ?? { page: 1, pageSize: 20 }
    const paginationParams = getPaginationParams(queryParams)

    // Requêtes parallèles
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          priority: true,
          actionUrl: true,
          relatedType: true,
          relatedId: true,
          isRead: true,
          readAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        ...paginationParams,
      }),
      prisma.notification.count({ where }),
    ])

    return {
      success: true,
      data: formatPaginatedResult(notifications, total, queryParams),
    }
  } catch (error) {
    console.error('[getNotifications] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Récupère le nombre de notifications non lues
 *
 * @returns Nombre de notifications non lues
 */
export async function getUnreadCount(): Promise<CrudActionResult<number>> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const count = await prisma.notification.count({
      where: {
        userId: authResult.user.id,
        isRead: false,
      },
    })

    return { success: true, data: count }
  } catch (error) {
    console.error('[getUnreadCount] Error:', error)
    return {
      success: false,
      error: 'Erreur lors du comptage des notifications',
    }
  }
}

/**
 * Marque une notification comme lue
 *
 * @param notificationId - ID de la notification
 * @returns Notification mise à jour
 */
export async function markAsRead(
  notificationId: string
): Promise<CrudActionResult<Notification>> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification) {
      return { success: false, error: 'Notification non trouvée' }
    }

    if (notification.userId !== authResult.user.id) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Mettre à jour
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/app/dashboard')

    return { success: true, data: updated }
  } catch (error) {
    console.error('[markAsRead] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Marque toutes les notifications comme lues
 *
 * @returns Nombre de notifications mises à jour
 */
export async function markAllAsRead(): Promise<
  CrudActionResult<{ count: number }>
> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: authResult.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    revalidatePath('/app/dashboard')

    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('[markAllAsRead] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Supprime une notification
 *
 * @param notificationId - ID de la notification
 * @returns Succès ou erreur
 */
export async function deleteNotification(
  notificationId: string
): Promise<CrudActionResult<{ deleted: true }>> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      select: { userId: true },
    })

    if (!notification) {
      return { success: false, error: 'Notification non trouvée' }
    }

    if (notification.userId !== authResult.user.id) {
      return { success: false, error: 'Accès non autorisé' }
    }

    // Supprimer
    await prisma.notification.delete({
      where: { id: notificationId },
    })

    revalidatePath('/app/dashboard')

    return { success: true, data: { deleted: true } }
  } catch (error) {
    console.error('[deleteNotification] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Supprime toutes les notifications lues de l'utilisateur
 *
 * @ticket SP-326
 * @returns Nombre de notifications supprimées
 */
export async function deleteAllRead(): Promise<
  CrudActionResult<{ count: number }>
> {
  try {
    const authResult = await getAuthenticatedUser()
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const result = await prisma.notification.deleteMany({
      where: {
        userId: authResult.user.id,
        isRead: true,
      },
    })

    revalidatePath('/app/dashboard')

    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('[deleteAllRead] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Supprime les notifications lues plus anciennes que X jours
 *
 * @param daysOld - Âge minimum en jours (défaut: 30)
 * @returns Nombre de notifications supprimées
 */
export async function cleanupOldNotifications(
  daysOld: number = 30
): Promise<CrudActionResult<{ count: number }>> {
  try {
    // Réservé aux admins
    const authResult = await getAuthenticatedUser(['SYSTEM_ADMIN'])
    if (!authResult.success) {
      return { success: false, error: authResult.error }
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: cutoffDate },
      },
    })

    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('[cleanupOldNotifications] Error:', error)
    const { error: errorMessage } = handlePrismaError(error)
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Formate une date en français (DD/MM/YYYY)
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Formate une heure (extrait HH:MM si c'est une Date, sinon retourne tel quel)
 */
function formatTime(time: Date | string): string {
  if (typeof time === 'string') return time
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(time)
}
