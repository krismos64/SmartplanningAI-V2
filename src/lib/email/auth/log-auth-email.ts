/**
 * Logging des emails transactionnels d'authentification dans EmailLog
 *
 * @description Les emails d'inscription (bienvenue, vérification) partaient en
 * fire-and-forget sans aucune trace en base : impossible de vérifier a
 * posteriori qu'ils avaient bien été envoyés (contrairement aux emails billing
 * loggés via `sendBillingEmail`). Ce helper comble cet angle mort de reporting.
 *
 * Différences avec `sendBillingEmail` :
 * - Pas de `subscriptionId` (emails hors cycle Stripe) → `subscriptionId: null`.
 * - Pas de déduplication : un renvoi de vérification DOIT créer un nouveau log
 *   (la contrainte unique `(subscriptionId, emailType)` ne s'applique pas quand
 *   `subscriptionId` est null).
 * - Non-bloquant : une erreur de logging ne doit jamais impacter l'inscription.
 */

import { prisma } from '@/lib/prisma'

/**
 * Types d'emails d'authentification loggés
 */
export const AuthEmailType = {
  /** Email de bienvenue envoyé à l'inscription */
  WELCOME: 'WELCOME',
  /** Email de vérification d'adresse (inscription + renvois) */
  EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
} as const

export type AuthEmailType = (typeof AuthEmailType)[keyof typeof AuthEmailType]

export interface LogAuthEmailParams {
  /** ID de l'entreprise (multi-tenant) — requis, colonne NOT NULL */
  companyId: string
  /** Type d'email d'authentification */
  emailType: AuthEmailType
  /** Adresse email du destinataire */
  recipientEmail: string
  /** Succès de l'envoi SMTP */
  success: boolean
  /** MessageId SMTP retourné par Nodemailer (optionnel) */
  messageId?: string
  /** Message d'erreur si l'envoi a échoué (optionnel) */
  error?: string
}

/**
 * Enregistre le résultat d'un envoi d'email d'authentification dans EmailLog.
 *
 * Ne lève jamais : toute erreur est catchée et loggée en console pour ne pas
 * perturber le flux d'inscription appelant.
 */
export async function logAuthEmail(params: LogAuthEmailParams): Promise<void> {
  const { companyId, emailType, recipientEmail, success, messageId, error } =
    params

  try {
    await prisma.emailLog.create({
      data: {
        companyId,
        subscriptionId: null,
        emailType,
        recipientEmail,
        status: success ? 'SENT' : 'FAILED',
        metadata: {
          ...(messageId ? { messageId } : {}),
          ...(error ? { error } : {}),
        },
      },
    })
  } catch (logError) {
    // Le logging ne doit jamais bloquer l'inscription.
    console.error(
      '[AuthEmail] Erreur création log:',
      logError instanceof Error ? logError.message : logError
    )
  }
}
