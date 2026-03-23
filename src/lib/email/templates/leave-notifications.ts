/**
 * Fonctions d'envoi des emails de notification de congés supplémentaires
 *
 * Complète leave-decision.ts avec :
 * - Révocation de congé par le manager
 * - Modification du solde de congés
 *
 * @ticket SP-480
 */

import { render } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'

import { LeaveRevokedEmail } from '../../../../emails/templates/LeaveRevokedEmail'
import { LeaveBalanceChangedEmail } from '../../../../emails/templates/LeaveBalanceChangedEmail'

// ============================================================================
// Types
// ============================================================================

type EmailResult = { success: boolean; messageId?: string; error?: string }

const leaveTypeLabels: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  SICK_LEAVE: 'Arrêt maladie',
  UNPAID_LEAVE: 'Congé sans solde',
  RTT: 'RTT',
  PARENTAL_LEAVE: 'Congé parental',
  FAMILY_EVENT: 'Événement familial',
  OTHER: 'Autre',
}

function formatDateFr(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

// ============================================================================
// Révocation de congé
// ============================================================================

export async function sendLeaveRevokedEmail(params: {
  firstName: string
  email: string
  leaveType: string
  startDate: Date
  endDate: Date
  revokeReason: string
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      LeaveRevokedEmail({
        firstName: params.firstName,
        leaveType: leaveTypeLabels[params.leaveType] || params.leaveType,
        startDate: formatDateFr(params.startDate),
        endDate: formatDateFr(params.endDate),
        revokeReason: params.revokeReason,
        dashboardUrl: `${baseUrl}/app/dashboard/leaves`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: `${params.firstName}, votre congé a été annulé`,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendLeaveRevokedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}

// ============================================================================
// Modification du solde de congés
// ============================================================================

export async function sendLeaveBalanceChangedEmail(params: {
  firstName: string
  email: string
  year: number
  paidLeaveTotal: number
  paidLeaveRemaining: number
  rttTotal: number
  rttRemaining: number
}): Promise<EmailResult> {
  try {
    const baseUrl = getBaseUrl()
    const html = await render(
      LeaveBalanceChangedEmail({
        firstName: params.firstName,
        year: params.year,
        paidLeaveTotal: params.paidLeaveTotal,
        paidLeaveRemaining: params.paidLeaveRemaining,
        rttTotal: params.rttTotal,
        rttRemaining: params.rttRemaining,
        dashboardUrl: `${baseUrl}/app/dashboard/leaves`,
      })
    )

    return await sendEmail({
      to: params.email,
      subject: `Vos soldes de congés ${params.year} ont été mis à jour`,
      html,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendLeaveBalanceChangedEmail] Error:', error)
    }
    return { success: false, error: errorMessage }
  }
}
