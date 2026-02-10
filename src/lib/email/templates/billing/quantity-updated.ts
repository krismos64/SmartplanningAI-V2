/**
 * Fonction d'envoi de l'email de mise à jour de quantité
 *
 * @ticket SP-369
 */

import { render } from '@react-email/components'

import { sendBillingEmail, BillingEmailType } from '@/lib/email/billing'
import type { BillingEmailResult } from '@/lib/email/billing'

import { QuantityUpdatedEmail } from '../../../../../emails/templates/QuantityUpdatedEmail'

export interface SendQuantityUpdatedEmailParams {
  companyId: string
  subscriptionId: string
  recipientEmail: string
  firstName: string
  companyName: string
  oldQuantity: number
  newQuantity: number
  newMonthlyAmount: string
}

export async function sendQuantityUpdatedEmail(
  params: SendQuantityUpdatedEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    recipientEmail,
    firstName,
    companyName,
    oldQuantity,
    newQuantity,
    newMonthlyAmount,
  } = params

  try {
    const html = await render(
      QuantityUpdatedEmail({
        firstName,
        companyName,
        oldQuantity,
        newQuantity,
        newMonthlyAmount,
      })
    )

    return sendBillingEmail({
      companyId,
      subscriptionId,
      emailType: BillingEmailType.QUANTITY_UPDATED,
      recipientEmail,
      subject: 'Mise à jour de votre abonnement',
      html,
      metadata: { oldQuantity, newQuantity, newMonthlyAmount },
    })
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Erreur inconnue'
    return { success: false, error: errorMessage }
  }
}
