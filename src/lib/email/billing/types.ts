/**
 * Types pour le service d'emails billing Stripe
 *
 * @ticket SP-368
 * @description Types TypeScript pour l'envoi et le logging des emails liés
 * aux abonnements et paiements Stripe
 */

import type { EmailResult } from '@/lib/email/types'

/**
 * Types d'emails billing envoyés par le système
 *
 * Chaque type correspond à un événement du cycle de vie de l'abonnement Stripe.
 * Utilisé comme clé de déduplication avec subscriptionId dans la table EmailLog.
 */
export const BillingEmailType = {
  /** Paiement mensuel réussi (webhook invoice.paid) */
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  /** Paiement échoué (webhook invoice.payment_failed) */
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  /** Abonnement activé après checkout (webhook checkout.session.completed) */
  SUBSCRIPTION_ACTIVATED: 'SUBSCRIPTION_ACTIVATED',
  /** Abonnement annulé (webhook customer.subscription.deleted) */
  SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
  /** Rappel trial J-14 (cron daily) */
  TRIAL_REMINDER_14: 'TRIAL_REMINDER_14',
  /** Rappel trial J-7 (cron daily) */
  TRIAL_REMINDER_7: 'TRIAL_REMINDER_7',
  /** Rappel trial J-3 (cron daily) */
  TRIAL_REMINDER_3: 'TRIAL_REMINDER_3',
  /** Trial expiré J0 (cron daily) */
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',
  /** Changement de quantité de sièges (sync employés) */
  QUANTITY_UPDATED: 'QUANTITY_UPDATED',
} as const

export type BillingEmailType =
  (typeof BillingEmailType)[keyof typeof BillingEmailType]

/**
 * Paramètres pour l'envoi d'un email billing
 */
export interface SendBillingEmailParams {
  /** ID de l'entreprise (multi-tenant) */
  companyId: string
  /** ID de la subscription Stripe (clé de déduplication avec emailType) */
  subscriptionId?: string
  /** Type d'email billing */
  emailType: BillingEmailType
  /**
   * Discriminant de déduplication pour les emails récurrents (ex: ID de
   * facture Stripe). Sans lui, la dédup est faite sur (subscriptionId,
   * emailType) → un seul envoi par abonnement, ce qui est correct pour les
   * événements uniques (activation, annulation) mais bloquerait les envois
   * mensuels de PAYMENT_CONFIRMED. Quand fourni, il est concaténé à emailType
   * pour rendre la clé unique par facture tout en gardant l'idempotence
   * (rejeu du même webhook = même clé, donc pas de doublon).
   */
  dedupeSuffix?: string
  /** Adresse email du destinataire */
  recipientEmail: string
  /** Sujet de l'email */
  subject: string
  /** Contenu HTML de l'email (généré par React Email) */
  html: string
  /** Métadonnées additionnelles pour le log (montant, quantité, etc.) */
  metadata?: Record<string, unknown>
}

/**
 * Résultat de l'envoi d'un email billing avec ID du log
 */
export interface BillingEmailResult extends EmailResult {
  /** ID du log créé en base de données */
  emailLogId?: string
  /** Indique si l'email a été ignoré (doublon détecté) */
  skipped?: boolean
  /** Raison du skip (ex: 'DUPLICATE') */
  reason?: string
}
