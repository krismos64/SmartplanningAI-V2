/**
 * Fonction d'envoi de l'email d'échec de paiement
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'
import { getBaseUrl } from '@/lib/email/config'

import { PaymentFailedEmail } from '../../../../../emails/templates/PaymentFailedEmail'

export interface SendPaymentFailedEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  amount: string
  retryDate?: string
}

export async function sendPaymentFailedEmail(
  params: SendPaymentFailedEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    amount,
    retryDate,
  } = params

  const baseUrl = getBaseUrl()
  const updatePaymentUrl = `${baseUrl}/app/dashboard/billing`

  try {
    const html = await render(
      PaymentFailedEmail({
        firstName,
        companyName,
        amount,
        retryDate,
        updatePaymentUrl,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.PAYMENT_FAILED,
      recipientEmail,
      subject: 'Échec de paiement — Action requise',
      html,
      metadata: { amount, retryDate },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
