/**
 * Fonction d'envoi de l'email de nouvelle demande de congé
 *
 * @ticket SP-415
 * @description Notifie le manager quand un employé crée une demande de congé
 */

import { render } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'
import type { LeaveRequestedEmailData, LeaveType } from '@/types'
import { leaveTypeLabels } from '@/types'

import { LeaveRequestedEmail } from '../../../../emails/templates/LeaveRequestedEmail'

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Formate une date en français (ex: "15 janvier 2026")
 */
function formatDateFr(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

/**
 * Traduit un type de congé en label français
 */
function getLeaveTypeLabel(leaveType: LeaveType): string {
  return leaveTypeLabels[leaveType]
}

// =============================================================================
// SEND FUNCTION
// =============================================================================

/**
 * Envoie l'email de notification de nouvelle demande de congé au manager
 *
 * @param data - Données de la demande et du manager
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendLeaveRequestedEmail({
 *   managerEmail: 'manager@example.com',
 *   managerName: 'Pierre',
 *   employeeName: 'Marie Dupont',
 *   leaveType: 'PAID_LEAVE',
 *   startDate: new Date('2026-01-15'),
 *   endDate: new Date('2026-01-20'),
 *   totalDays: 5,
 *   reason: 'Vacances familiales',
 *   requestId: 'leave-123',
 * })
 */
export async function sendLeaveRequestedEmail(
  data: LeaveRequestedEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    managerEmail,
    managerName,
    employeeName,
    leaveType,
    startDate,
    endDate,
    totalDays,
    reason,
    requestId,
  } = data

  const baseUrl = getBaseUrl()
  const requestUrl = `${baseUrl}/app/dashboard/leaves/${requestId}`

  try {
    // Préparer les props pour le template
    const templateProps = {
      managerName,
      employeeName,
      leaveType: getLeaveTypeLabel(leaveType),
      startDate: formatDateFr(startDate),
      endDate: formatDateFr(endDate),
      totalDays,
      reason,
      requestUrl,
    }

    // Rendre le template React Email en HTML
    const html = await render(LeaveRequestedEmail(templateProps))

    // Envoyer l'email
    const result = await sendEmail({
      to: managerEmail,
      subject: `Nouvelle demande de congé - ${employeeName}`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendLeaveRequestedEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
