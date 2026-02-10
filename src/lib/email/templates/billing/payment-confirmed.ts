/**
 * Fonction d'envoi de l'email de confirmation de paiement
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'

import { PaymentConfirmedEmail } from '../../../../../emails/templates/PaymentConfirmedEmail'

export interface SendPaymentConfirmedEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  amount: string
  employeeCount: number
  invoiceUrl?: string
  nextBillingDate?: string
}

export async function sendPaymentConfirmedEmail(
  params: SendPaymentConfirmedEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    amount,
    employeeCount,
    invoiceUrl,
    nextBillingDate,
  } = params

  try {
    const html = await render(
      PaymentConfirmedEmail({
        firstName,
        companyName,
        amount,
        employeeCount,
        invoiceUrl,
        nextBillingDate,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.PAYMENT_CONFIRMED,
      recipientEmail,
      subject: 'Paiement confirmé — SmartPlanning',
      html,
      metadata: { amount, employeeCount },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
