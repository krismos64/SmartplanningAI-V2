/**
 * Fonction d'envoi de l'email de notification de planning
 *
 * @description Notifie l'employé quand son planning est créé/modifié/supprimé
 */

import { render } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { ScheduleNotificationEmail } from '../../../../emails/templates/ScheduleNotificationEmail'

// =============================================================================
// TYPES
// =============================================================================

const scheduleTypeLabels: Record<string, string> = {
  WORK: 'Travail',
  MEETING: 'Réunion',
  BREAK: 'Pause',
  TRAINING: 'Formation',
  REMOTE: 'Télétravail',
  ON_CALL: 'Astreinte',
  OVERTIME: 'Heures supplémentaires',
  REST: 'Repos',
}

export interface ScheduleNotificationEmailData {
  /** Email de l'employé */
  employeeEmail: string
  /** Prénom de l'employé */
  firstName: string
  /** Action effectuée */
  action: 'created' | 'updated' | 'deleted'
  /** Nombre de créneaux */
  count: number
  /** Date de début (premier créneau) */
  startDate: Date
  /** Date de fin (dernier créneau) — optionnel si un seul jour */
  endDate?: Date
  /** Type de planning (enum ScheduleType) */
  scheduleType: string
  /** Horaires (ex: "09:00 - 17:00") */
  timeRange?: string
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDateFr(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

function getScheduleTypeLabel(type: string): string {
  return scheduleTypeLabels[type] || type
}

// =============================================================================
// SEND FUNCTION
// =============================================================================

export async function sendScheduleNotificationEmail(
  data: ScheduleNotificationEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    employeeEmail,
    firstName,
    action,
    count,
    startDate,
    endDate,
    scheduleType,
    timeRange,
  } = data

  const baseUrl = getBaseUrl()
  const dashboardUrl = `${baseUrl}/app/dashboard/schedules`

  const actionLabels = {
    created: 'Nouveau planning',
    updated: 'Planning modifié',
    deleted: 'Planning supprimé',
  }

  try {
    const templateProps = {
      firstName,
      action,
      count,
      startDate: formatDateFr(startDate),
      endDate: endDate ? formatDateFr(endDate) : undefined,
      scheduleType: getScheduleTypeLabel(scheduleType),
      timeRange,
      dashboardUrl,
    }

    const html = await render(ScheduleNotificationEmail(templateProps))

    const subject =
      count > 1
        ? `${actionLabels[action]} — ${count} créneaux`
        : `${actionLabels[action]} — ${formatDateFr(startDate)}`

    const result = await sendEmail({
      to: employeeEmail,
      subject,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    if (process.env.NODE_ENV === 'development') {
      console.error('[sendScheduleNotificationEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
