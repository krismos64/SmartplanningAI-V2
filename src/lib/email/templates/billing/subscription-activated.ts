/**
 * Fonction d'envoi de l'email d'activation d'abonnement
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'
import { getBaseUrl } from '@/lib/email/config'

import { SubscriptionActivatedEmail } from '../../../../../emails/templates/SubscriptionActivatedEmail'

export interface SendSubscriptionActivatedEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  employeeCount: number
  monthlyAmount: string
  invoiceUrl?: string
}

export async function sendSubscriptionActivatedEmail(
  params: SendSubscriptionActivatedEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    employeeCount,
    monthlyAmount,
    invoiceUrl,
  } = params

  const baseUrl = getBaseUrl()
  const dashboardUrl = `${baseUrl}/app/dashboard`

  try {
    const html = await render(
      SubscriptionActivatedEmail({
        firstName,
        companyName,
        employeeCount,
        monthlyAmount,
        invoiceUrl,
        dashboardUrl,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.SUBSCRIPTION_ACTIVATED,
      recipientEmail,
      subject: 'Votre abonnement SmartPlanning est activé',
      html,
      metadata: { employeeCount, monthlyAmount },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
