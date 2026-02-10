/**
 * Fonction d'envoi de l'email de rappel de fin de trial
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'
import { getBaseUrl } from '@/lib/email/config'

import {
  TrialEndingSoonEmail,
  getTrialSubject,
} from '../../../../../emails/templates/TrialEndingSoonEmail'

/**
 * Mappe daysRemaining vers le BillingEmailType correspondant
 */
function getTrialReminderType(
  daysRemaining: number
): (typeof BillingEmailType)[keyof typeof BillingEmailType] {
  if (daysRemaining <= 3) return BillingEmailType.TRIAL_REMINDER_3
  if (daysRemaining <= 7) return BillingEmailType.TRIAL_REMINDER_7
  return BillingEmailType.TRIAL_REMINDER_14
}

export interface SendTrialEndingSoonEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  daysRemaining: number
  employeeCount: number
  estimatedMonthlyPrice: string
}

export async function sendTrialEndingSoonEmail(
  params: SendTrialEndingSoonEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    daysRemaining,
    employeeCount,
    estimatedMonthlyPrice,
  } = params

  const baseUrl = getBaseUrl()
  const subscribeUrl = `${baseUrl}/app/dashboard/billing`

  try {
    const html = await render(
      TrialEndingSoonEmail({
        firstName,
        companyName,
        daysRemaining,
        employeeCount,
        estimatedMonthlyPrice,
        subscribeUrl,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: getTrialReminderType(daysRemaining),
      recipientEmail,
      subject: getTrialSubject(daysRemaining),
      html,
      metadata: { daysRemaining, employeeCount, estimatedMonthlyPrice },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
