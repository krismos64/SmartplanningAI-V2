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
 *
 * L'ordre des seuils va du plus proche au plus lointain : le premier seuil
 * franchi l'emporte, donc J-1 doit etre teste avant J-3.
 *
 * Le seuil J-1 a manque jusqu'au 7 aout 2026 (SP-558). Tout `daysRemaining <= 3`
 * retournait TRIAL_REMINDER_3, et l'idempotence de `sendBillingEmail` sur
 * (subscriptionId, emailType) sautait alors l'envoi de la veille puisque le
 * rappel J-3 etait deja parti. Resultat mesure en production : zero email J-1
 * envoye depuis la mise en service, alors que le template gerait deja ce cas
 * (`isLastDay`) et que le cron selectionnait bien J-1.
 */
function getTrialReminderType(
  daysRemaining: number
): (typeof BillingEmailType)[keyof typeof BillingEmailType] {
  if (daysRemaining <= 1) return BillingEmailType.TRIAL_REMINDER_1
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
