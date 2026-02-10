/**
 * Fonction d'envoi de l'email de trial expiré
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'
import { getBaseUrl } from '@/lib/email/config'

import { TrialExpiredEmail } from '../../../../../emails/templates/TrialExpiredEmail'

export interface SendTrialExpiredEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  employeeCount: number
  estimatedMonthlyPrice: string
}

export async function sendTrialExpiredEmail(
  params: SendTrialExpiredEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    employeeCount,
    estimatedMonthlyPrice,
  } = params

  const baseUrl = getBaseUrl()
  const subscribeUrl = `${baseUrl}/app/dashboard/billing`

  try {
    const html = await render(
      TrialExpiredEmail({
        firstName,
        companyName,
        employeeCount,
        estimatedMonthlyPrice,
        subscribeUrl,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.TRIAL_EXPIRED,
      recipientEmail,
      subject: 'Votre essai gratuit est terminé',
      html,
      metadata: { employeeCount, estimatedMonthlyPrice },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
