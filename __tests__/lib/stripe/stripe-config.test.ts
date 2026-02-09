/**
 * Tests unitaires pour la configuration Stripe centralisée
 *
 * @ticket SP-349
 */

import { describe, it, expect } from 'vitest'
import {
  STRIPE_PRICING,
  STRIPE_STATUS_MAP,
  STRIPE_WEBHOOK_EVENTS,
  ALL_WEBHOOK_EVENTS,
  STRIPE_METADATA_KEYS,
} from '@/lib/stripe/stripe-config'
import { PRICING } from '@/lib/config/pricing'

describe('Stripe Config', () => {
  // ===========================================================================
  // STRIPE_PRICING
  // ===========================================================================
  describe('STRIPE_PRICING', () => {
    it('a un montant unitaire en centimes (290)', () => {
      expect(STRIPE_PRICING.UNIT_AMOUNT_CENTS).toBe(290)
    })

    it('est cohérent avec PRICING.PRICE_PER_EMPLOYEE', () => {
      expect(STRIPE_PRICING.UNIT_AMOUNT_CENTS).toBe(
        Math.round(PRICING.PRICE_PER_EMPLOYEE * 100)
      )
    })

    it('a la devise eur (lowercase ISO 4217)', () => {
      expect(STRIPE_PRICING.CURRENCY).toBe('eur')
    })

    it('est cohérent avec PRICING.CURRENCY', () => {
      expect(STRIPE_PRICING.CURRENCY).toBe(PRICING.CURRENCY.toLowerCase())
    })

    it('a un intervalle de facturation mensuel', () => {
      expect(STRIPE_PRICING.BILLING_INTERVAL).toBe('month')
    })

    it('a une période d\'essai de 21 jours', () => {
      expect(STRIPE_PRICING.TRIAL_PERIOD_DAYS).toBe(21)
    })

    it('est cohérent avec PRICING.TRIAL_DAYS', () => {
      expect(STRIPE_PRICING.TRIAL_PERIOD_DAYS).toBe(PRICING.TRIAL_DAYS)
    })

    it('a une quantité minimum de 1', () => {
      expect(STRIPE_PRICING.MIN_QUANTITY).toBe(1)
    })

    it('a une quantité maximum de 250', () => {
      expect(STRIPE_PRICING.MAX_QUANTITY).toBe(250)
    })

    it('est cohérent avec PRICING min/max employees', () => {
      expect(STRIPE_PRICING.MIN_QUANTITY).toBe(PRICING.MIN_EMPLOYEES)
      expect(STRIPE_PRICING.MAX_QUANTITY).toBe(PRICING.MAX_EMPLOYEES)
    })
  })

  // ===========================================================================
  // STRIPE_STATUS_MAP
  // ===========================================================================
  describe('STRIPE_STATUS_MAP', () => {
    it('mappe trialing → TRIAL', () => {
      expect(STRIPE_STATUS_MAP.trialing).toBe('TRIAL')
    })

    it('mappe active → ACTIVE', () => {
      expect(STRIPE_STATUS_MAP.active).toBe('ACTIVE')
    })

    it('mappe past_due → PAST_DUE', () => {
      expect(STRIPE_STATUS_MAP.past_due).toBe('PAST_DUE')
    })

    it('mappe canceled → CANCELED', () => {
      expect(STRIPE_STATUS_MAP.canceled).toBe('CANCELED')
    })

    it('mappe unpaid → PAST_DUE', () => {
      expect(STRIPE_STATUS_MAP.unpaid).toBe('PAST_DUE')
    })

    it('mappe incomplete → INCOMPLETE', () => {
      expect(STRIPE_STATUS_MAP.incomplete).toBe('INCOMPLETE')
    })

    it('mappe incomplete_expired → EXPIRED', () => {
      expect(STRIPE_STATUS_MAP.incomplete_expired).toBe('EXPIRED')
    })

    it('mappe paused → CANCELED', () => {
      expect(STRIPE_STATUS_MAP.paused).toBe('CANCELED')
    })

    it('couvre tous les statuts Stripe principaux', () => {
      const expectedStatuses = [
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'incomplete',
        'incomplete_expired',
        'paused',
      ]
      expectedStatuses.forEach((status) => {
        expect(STRIPE_STATUS_MAP).toHaveProperty(status)
      })
    })

    it('ne mappe que vers des statuts internes valides', () => {
      const validInternal = ['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'INCOMPLETE']
      Object.values(STRIPE_STATUS_MAP).forEach((internal) => {
        expect(validInternal).toContain(internal)
      })
    })
  })

  // ===========================================================================
  // STRIPE_WEBHOOK_EVENTS
  // ===========================================================================
  describe('STRIPE_WEBHOOK_EVENTS', () => {
    it('contient les événements subscription', () => {
      expect(STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION).toContain(
        'customer.subscription.created'
      )
      expect(STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION).toContain(
        'customer.subscription.updated'
      )
      expect(STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION).toContain(
        'customer.subscription.deleted'
      )
      expect(STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION).toContain(
        'customer.subscription.trial_will_end'
      )
    })

    it('contient les événements invoice', () => {
      expect(STRIPE_WEBHOOK_EVENTS.INVOICE).toContain('invoice.paid')
      expect(STRIPE_WEBHOOK_EVENTS.INVOICE).toContain(
        'invoice.payment_failed'
      )
      expect(STRIPE_WEBHOOK_EVENTS.INVOICE).toContain('invoice.finalized')
    })

    it('contient les événements checkout', () => {
      expect(STRIPE_WEBHOOK_EVENTS.CHECKOUT).toContain(
        'checkout.session.completed'
      )
    })
  })

  describe('ALL_WEBHOOK_EVENTS', () => {
    it('contient tous les événements des groupes', () => {
      const allFromGroups = [
        ...STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION,
        ...STRIPE_WEBHOOK_EVENTS.INVOICE,
        ...STRIPE_WEBHOOK_EVENTS.CHECKOUT,
      ]
      expect(ALL_WEBHOOK_EVENTS).toEqual(allFromGroups)
    })

    it('a au moins 8 événements', () => {
      expect(ALL_WEBHOOK_EVENTS.length).toBeGreaterThanOrEqual(8)
    })

    it('ne contient pas de doublons', () => {
      const unique = new Set(ALL_WEBHOOK_EVENTS)
      expect(unique.size).toBe(ALL_WEBHOOK_EVENTS.length)
    })
  })

  // ===========================================================================
  // STRIPE_METADATA_KEYS
  // ===========================================================================
  describe('STRIPE_METADATA_KEYS', () => {
    it('a une clé pour company_id', () => {
      expect(STRIPE_METADATA_KEYS.COMPANY_ID).toBe(
        'smartplanning_company_id'
      )
    })

    it('a une clé pour user_id', () => {
      expect(STRIPE_METADATA_KEYS.USER_ID).toBe('smartplanning_user_id')
    })

    it('a des clés préfixées smartplanning_', () => {
      Object.values(STRIPE_METADATA_KEYS).forEach((key) => {
        expect(key).toMatch(/^smartplanning_/)
      })
    })
  })
})
