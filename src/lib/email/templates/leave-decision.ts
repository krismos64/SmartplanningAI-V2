/**
 * Fonctions d'envoi des emails de décision de congé
 *
 * @ticket SP-300
 * @description Envoie les notifications de congé approuvé/refusé aux employés
 */

import { render } from '@react-email/components'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { sendEmail } from '@/lib/email'
import { getBaseUrl } from '@/lib/email/config'
import type { LeaveEmailData, LeaveRejectedEmailData } from '@/types'
import { leaveTypeLabels } from '@/types'

import { LeaveApprovedEmail } from '../../../../emails/templates/LeaveApprovedEmail'
import { LeaveRejectedEmail } from '../../../../emails/templates/LeaveRejectedEmail'

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Formate une date en français (ex: "15 janvier 2026")
 *
 * @param date - Date à formater
 * @returns Date formatée en français
 */
export function formatDateFr(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: fr })
}

/**
 * Traduit un type de congé en label français
 *
 * @param leaveType - Type de congé (enum)
 * @returns Label en français
 */
export function getLeaveTypeLabel(
  leaveType: keyof typeof leaveTypeLabels
): string {
  return leaveTypeLabels[leaveType]
}

// =============================================================================
// SEND FUNCTIONS
// =============================================================================

/**
 * Envoie l'email de notification de congé approuvé
 *
 * @param data - Données du congé approuvé
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendLeaveApprovedEmail({
 *   firstName: 'Marie',
 *   email: 'marie@example.com',
 *   leaveType: 'PAID_LEAVE',
 *   startDate: new Date('2026-01-15'),
 *   endDate: new Date('2026-01-20'),
 * })
 */
export async function sendLeaveApprovedEmail(
  data: LeaveEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { firstName, email, leaveType, startDate, endDate, dashboardUrl } = data

  const baseUrl = getBaseUrl()
  const finalDashboardUrl = dashboardUrl ?? `${baseUrl}/dashboard/conges`

  try {
    // Préparer les props pour le template
    const templateProps = {
      firstName,
      leaveType: getLeaveTypeLabel(leaveType),
      startDate: formatDateFr(startDate),
      endDate: formatDateFr(endDate),
      dashboardUrl: finalDashboardUrl,
    }

    // Rendre le template React Email en HTML
    const html = await render(LeaveApprovedEmail(templateProps))

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: `${firstName}, votre demande de congé a été approuvée`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendLeaveApprovedEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Envoie l'email de notification de congé refusé
 *
 * @param data - Données du congé refusé (inclut rejectionReason)
 * @returns Résultat de l'envoi (success, messageId ou error)
 *
 * @example
 * const result = await sendLeaveRejectedEmail({
 *   firstName: 'Paul',
 *   email: 'paul@example.com',
 *   leaveType: 'RTT',
 *   startDate: new Date('2026-02-10'),
 *   endDate: new Date('2026-02-12'),
 *   rejectionReason: 'Période de forte activité, équipe incomplète.',
 * })
 */
export async function sendLeaveRejectedEmail(
  data: LeaveRejectedEmailData
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const {
    firstName,
    email,
    leaveType,
    startDate,
    endDate,
    rejectionReason,
    dashboardUrl,
  } = data

  const baseUrl = getBaseUrl()
  const finalDashboardUrl = dashboardUrl ?? `${baseUrl}/dashboard/conges`

  try {
    // Préparer les props pour le template
    const templateProps = {
      firstName,
      leaveType: getLeaveTypeLabel(leaveType),
      startDate: formatDateFr(startDate),
      endDate: formatDateFr(endDate),
      rejectionReason,
      dashboardUrl: finalDashboardUrl,
    }

    // Rendre le template React Email en HTML
    const html = await render(LeaveRejectedEmail(templateProps))

    // Envoyer l'email
    const result = await sendEmail({
      to: email,
      subject: `${firstName}, votre demande de congé n'a pas été approuvée`,
      html,
    })

    return result
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[sendLeaveRejectedEmail] Error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
