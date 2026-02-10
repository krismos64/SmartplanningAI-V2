/**
 * Wrapper d'envoi d'emails billing avec logging automatique
 *
 * @ticket SP-368
 * @description Encapsule sendEmail() existant avec :
 * - Détection de doublons via contrainte unique (subscriptionId + emailType)
 * - Logging automatique dans la table EmailLog
 * - Gestion d'erreurs non-bloquante pour le logging
 *
 * Via Context7 : Pattern wrapper Nodemailer avec audit logging
 */

import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/send'
import type { SendBillingEmailParams, BillingEmailResult } from './types'

/**
 * Envoie un email billing avec logging automatique et détection de doublons
 *
 * @param params - Paramètres de l'email billing
 * @returns Résultat de l'envoi avec ID du log et indicateur de skip
 *
 * @example
 * ```typescript
 * const result = await sendBillingEmail({
 *   companyId: 'company-123',
 *   subscriptionId: 'sub_stripe_456',
 *   emailType: BillingEmailType.PAYMENT_CONFIRMED,
 *   recipientEmail: 'director@acme.com',
 *   subject: 'Paiement confirmé — SmartPlanning',
 *   html: renderedHtml,
 *   metadata: { amount: 2900, currency: 'EUR' },
 * })
 *
 * if (result.skipped) {
 *   console.log('Email déjà envoyé pour cette subscription')
 * }
 * ```
 */
export async function sendBillingEmail(
  params: SendBillingEmailParams
): Promise<BillingEmailResult> {
  const {
    companyId,
    subscriptionId,
    emailType,
    recipientEmail,
    subject,
    html,
    metadata,
  } = params

  // 1. Vérifier les doublons si subscriptionId est fourni
  if (subscriptionId) {
    try {
      const existing = await prisma.emailLog.findUnique({
        where: {
          subscriptionId_emailType: {
            subscriptionId,
            emailType,
          },
        },
      })

      if (existing) {
        console.info('[BillingEmail] Doublon détecté, email ignoré:', {
          emailType,
          subscriptionId,
          existingLogId: existing.id,
        })

        return {
          success: true,
          skipped: true,
          reason: 'DUPLICATE',
          emailLogId: existing.id,
        }
      }
    } catch (error) {
      // Ne pas bloquer l'envoi si la vérification échoue
      console.warn(
        '[BillingEmail] Erreur vérification doublon, envoi quand même:',
        error instanceof Error ? error.message : error
      )
    }
  }

  // 2. Envoyer l'email via le service existant
  const emailResult = await sendEmail({
    to: recipientEmail,
    subject,
    html,
  })

  // 3. Logger le résultat dans EmailLog
  let emailLogId: string | undefined

  try {
    const log = await prisma.emailLog.create({
      data: {
        companyId,
        subscriptionId: subscriptionId ?? null,
        emailType,
        recipientEmail,
        status: emailResult.success ? 'SENT' : 'FAILED',
        metadata: metadata
          ? {
              ...metadata,
              ...(emailResult.error ? { error: emailResult.error } : {}),
              ...(emailResult.messageId
                ? { messageId: emailResult.messageId }
                : {}),
            }
          : emailResult.error
            ? { error: emailResult.error }
            : emailResult.messageId
              ? { messageId: emailResult.messageId }
              : undefined,
      },
    })

    emailLogId = log.id

    console.info('[BillingEmail] Log créé:', {
      emailLogId: log.id,
      emailType,
      status: emailResult.success ? 'SENT' : 'FAILED',
      companyId,
    })
  } catch (logError) {
    // Le logging ne doit jamais bloquer le résultat de l'envoi
    console.error(
      '[BillingEmail] Erreur création log:',
      logError instanceof Error ? logError.message : logError
    )
  }

  return {
    success: emailResult.success,
    messageId: emailResult.messageId,
    error: emailResult.error,
    emailLogId,
    skipped: false,
  }
}
