/**
 * Logique pure de dérivation du paiement depuis une facture Stripe.
 *
 * Extraite de `handleInvoicePaid` pour être testable sans mocker tout le SDK
 * Stripe ni Prisma (même approche que `trial-backfill.ts`).
 *
 * Contexte du bug (03/07/2026) : le payload brut d'un webhook `invoice.paid`
 * ne contient PAS `invoice.payments` (non expandé par défaut). Le code lisait
 * `invoice.payments.data[0].payment.payment_intent` → toujours `undefined` en
 * webhook → early return `no_payment_intent` → aucun Payment créé, aucun email
 * PaymentConfirmed envoyé. Ce module retombe sur l'ID de facture (toujours
 * présent et unique) et distingue les factures de trial à 0 €.
 */

import type Stripe from 'stripe'

/**
 * Décision de traitement d'une facture payée.
 */
export type InvoicePaymentDecision =
  | {
      /** Facture à 0 € (essai en cours) : ne rien enregistrer. */
      kind: 'zero_amount_trial'
    }
  | {
      /** Impossible de dériver un identifiant de paiement (ne devrait jamais arriver). */
      kind: 'no_payment_identifier'
    }
  | {
      /** Paiement réel à enregistrer. */
      kind: 'record_payment'
      /** Clé d'idempotence du Payment (payment_intent si présent, sinon ID de facture). */
      paymentKey: string
      /** Montant payé en centimes. */
      amountPaid: number
    }

/**
 * Extrait l'ID de payment_intent depuis une facture (chemin SDK v20 :
 * `payments.data[0].payment.payment_intent`). Renvoie `null` si absent —
 * notamment dans le payload webhook non expandé.
 */
export function extractPaymentIntentId(invoice: Stripe.Invoice): string | null {
  const invoicePayment = invoice.payments?.data?.[0]
  const pi = invoicePayment?.payment?.payment_intent
  if (!pi) return null
  return typeof pi === 'string' ? pi : pi.id
}

/**
 * Décide comment traiter une facture `invoice.paid`.
 *
 * @param invoice - L'objet Invoice reçu dans le webhook
 * @returns La décision : facture de trial ignorée, paiement à enregistrer, ou
 *   absence d'identifiant exploitable.
 */
export function decideInvoicePayment(
  invoice: Stripe.Invoice
): InvoicePaymentDecision {
  const amountPaid = invoice.amount_paid ?? 0

  // Facture à 0 € : essai en cours, aucun prélèvement réel.
  if (amountPaid === 0) {
    return { kind: 'zero_amount_trial' }
  }

  // payment_intent absent en webhook → fallback sur l'ID de facture,
  // toujours présent et unique, utilisé comme clé d'idempotence.
  const paymentKey = extractPaymentIntentId(invoice) ?? invoice.id

  if (!paymentKey) {
    return { kind: 'no_payment_identifier' }
  }

  return { kind: 'record_payment', paymentKey, amountPaid }
}
