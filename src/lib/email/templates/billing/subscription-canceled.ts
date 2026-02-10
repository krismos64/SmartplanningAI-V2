/**
 * Fonction d'envoi de l'email de confirmation d'annulation
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'

import { SubscriptionCanceledEmail } from '../../../../../emails/templates/SubscriptionCanceledEmail'

export interface SendSubscriptionCanceledEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  endDate: string
}

export async function sendSubscriptionCanceledEmail(
  params: SendSubscriptionCanceledEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    endDate,
  } = params

  try {
    const html = await render(
      SubscriptionCanceledEmail({
        firstName,
        companyName,
        endDate,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.SUBSCRIPTION_CANCELED,
      recipientEmail,
      subject: 'Confirmation de résiliation — SmartPlanning',
      html,
      metadata: { endDate },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
