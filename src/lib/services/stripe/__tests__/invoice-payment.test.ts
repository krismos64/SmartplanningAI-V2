/**
 * Tests de la logique de dérivation du paiement depuis une facture Stripe.
 *
 * Régression couverte (bug 03/07/2026) : le webhook `invoice.paid` ne contient
 * pas `invoice.payments` (non expandé), donc le payment_intent est introuvable.
 * Sans fallback sur l'ID de facture, aucun Payment n'était créé et l'email
 * PaymentConfirmed n'était jamais envoyé.
 */

import { describe, it, expect } from 'vitest'
import type Stripe from 'stripe'

import {
  decideInvoicePayment,
  extractPaymentIntentId,
} from '../invoice-payment'

/** Construit une facture minimale pour les tests (cast partiel assumé). */
function makeInvoice(partial: Partial<Stripe.Invoice>): Stripe.Invoice {
  return partial as Stripe.Invoice
}

describe('extractPaymentIntentId', () => {
  it('lit le payment_intent quand payments est expandé (string)', () => {
    const invoice = makeInvoice({
      payments: {
        data: [{ payment: { payment_intent: 'pi_123' } }],
      } as unknown as Stripe.ApiList<Stripe.InvoicePayment>,
    })
    expect(extractPaymentIntentId(invoice)).toBe('pi_123')
  })

  it('lit le payment_intent quand il est un objet expandé', () => {
    const invoice = makeInvoice({
      payments: {
        data: [{ payment: { payment_intent: { id: 'pi_456' } } }],
      } as unknown as Stripe.ApiList<Stripe.InvoicePayment>,
    })
    expect(extractPaymentIntentId(invoice)).toBe('pi_456')
  })

  it('renvoie null quand payments est absent (payload webhook brut)', () => {
    const invoice = makeInvoice({ id: 'in_789' })
    expect(extractPaymentIntentId(invoice)).toBeNull()
  })
})

describe('decideInvoicePayment', () => {
  it('ignore une facture à 0 € (essai en cours)', () => {
    const invoice = makeInvoice({ id: 'in_trial', amount_paid: 0 })
    expect(decideInvoicePayment(invoice)).toEqual({ kind: 'zero_amount_trial' })
  })

  it('enregistre le paiement avec le payment_intent quand présent', () => {
    const invoice = makeInvoice({
      id: 'in_abc',
      amount_paid: 1160,
      payments: {
        data: [{ payment: { payment_intent: 'pi_real' } }],
      } as unknown as Stripe.ApiList<Stripe.InvoicePayment>,
    })
    expect(decideInvoicePayment(invoice)).toEqual({
      kind: 'record_payment',
      paymentKey: 'pi_real',
      amountPaid: 1160,
    })
  })

  it('retombe sur l ID de facture quand le payment_intent est absent (bug webhook)', () => {
    const invoice = makeInvoice({ id: 'in_fallback', amount_paid: 1160 })
    expect(decideInvoicePayment(invoice)).toEqual({
      kind: 'record_payment',
      paymentKey: 'in_fallback',
      amountPaid: 1160,
    })
  })
})
