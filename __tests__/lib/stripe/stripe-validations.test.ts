/**
 * Tests unitaires pour les schémas de validation Stripe
 *
 * @ticket SP-349
 */

import { describe, it, expect } from 'vitest'
import {
  stripeEnvSchema,
  checkoutSessionSchema,
  updateSubscriptionQuantitySchema,
  stripeWebhookHeaderSchema,
  customerPortalSchema,
} from '@/lib/validations/stripe'
import { PRICING } from '@/lib/config/pricing'

describe('Stripe Validations', () => {
  // ===========================================================================
  // stripeEnvSchema
  // ===========================================================================
  describe('stripeEnvSchema', () => {
    const validEnv = {
      STRIPE_SECRET_KEY: 'sk_test_123abc',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_456def',
      STRIPE_WEBHOOK_SECRET: 'whsec_789ghi',
      STRIPE_PRICE_ID: 'price_xyz',
    }

    it('accepte des variables valides', () => {
      const result = stripeEnvSchema.safeParse(validEnv)
      expect(result.success).toBe(true)
    })

    it('rejette STRIPE_SECRET_KEY manquante', () => {
      const { STRIPE_SECRET_KEY: _, ...rest } = validEnv
      const result = stripeEnvSchema.safeParse(rest)
      expect(result.success).toBe(false)
    })

    it('rejette STRIPE_SECRET_KEY ne commençant pas par sk_', () => {
      const result = stripeEnvSchema.safeParse({
        ...validEnv,
        STRIPE_SECRET_KEY: 'invalid_key',
      })
      expect(result.success).toBe(false)
    })

    it('rejette clé publique ne commençant pas par pk_', () => {
      const result = stripeEnvSchema.safeParse({
        ...validEnv,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'invalid_key',
      })
      expect(result.success).toBe(false)
    })

    it('rejette webhook secret ne commençant pas par whsec_', () => {
      const result = stripeEnvSchema.safeParse({
        ...validEnv,
        STRIPE_WEBHOOK_SECRET: 'invalid_secret',
      })
      expect(result.success).toBe(false)
    })

    it('rejette price ID ne commençant pas par price_', () => {
      const result = stripeEnvSchema.safeParse({
        ...validEnv,
        STRIPE_PRICE_ID: 'invalid_price',
      })
      expect(result.success).toBe(false)
    })

    it('rejette les chaînes vides', () => {
      const result = stripeEnvSchema.safeParse({
        STRIPE_SECRET_KEY: '',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: '',
        STRIPE_WEBHOOK_SECRET: '',
        STRIPE_PRICE_ID: '',
      })
      expect(result.success).toBe(false)
    })

    it('accepte les clés live (sk_live_, pk_live_)', () => {
      const result = stripeEnvSchema.safeParse({
        ...validEnv,
        STRIPE_SECRET_KEY: 'sk_live_production',
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_live_production',
      })
      expect(result.success).toBe(true)
    })
  })

  // ===========================================================================
  // checkoutSessionSchema
  // ===========================================================================
  describe('checkoutSessionSchema', () => {
    it('accepte une quantité valide', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: 10 })
      expect(result.success).toBe(true)
    })

    it('accepte la quantité minimum (1)', () => {
      const result = checkoutSessionSchema.safeParse({
        quantity: PRICING.MIN_EMPLOYEES,
      })
      expect(result.success).toBe(true)
    })

    it('accepte la quantité maximum (250)', () => {
      const result = checkoutSessionSchema.safeParse({
        quantity: PRICING.MAX_EMPLOYEES,
      })
      expect(result.success).toBe(true)
    })

    it('rejette une quantité inférieure au minimum', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: 0 })
      expect(result.success).toBe(false)
    })

    it('rejette une quantité supérieure au maximum', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: 251 })
      expect(result.success).toBe(false)
    })

    it('rejette un nombre décimal', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: 10.5 })
      expect(result.success).toBe(false)
    })

    it('rejette une quantité négative', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: -1 })
      expect(result.success).toBe(false)
    })

    it('accepte avec URLs optionnelles', () => {
      const result = checkoutSessionSchema.safeParse({
        quantity: 10,
        successUrl: 'https://smartplanning.fr/success',
        cancelUrl: 'https://smartplanning.fr/cancel',
      })
      expect(result.success).toBe(true)
    })

    it('rejette une URL de succès invalide', () => {
      const result = checkoutSessionSchema.safeParse({
        quantity: 10,
        successUrl: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('rejette une URL d\'annulation invalide', () => {
      const result = checkoutSessionSchema.safeParse({
        quantity: 10,
        cancelUrl: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })

    it('fonctionne sans URLs (optionnelles)', () => {
      const result = checkoutSessionSchema.safeParse({ quantity: 5 })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.successUrl).toBeUndefined()
        expect(result.data.cancelUrl).toBeUndefined()
      }
    })
  })

  // ===========================================================================
  // updateSubscriptionQuantitySchema
  // ===========================================================================
  describe('updateSubscriptionQuantitySchema', () => {
    it('accepte une quantité valide', () => {
      const result = updateSubscriptionQuantitySchema.safeParse({
        quantity: 25,
      })
      expect(result.success).toBe(true)
    })

    it('respecte les limites min/max de PRICING', () => {
      expect(
        updateSubscriptionQuantitySchema.safeParse({
          quantity: PRICING.MIN_EMPLOYEES,
        }).success
      ).toBe(true)
      expect(
        updateSubscriptionQuantitySchema.safeParse({
          quantity: PRICING.MAX_EMPLOYEES,
        }).success
      ).toBe(true)
      expect(
        updateSubscriptionQuantitySchema.safeParse({
          quantity: PRICING.MIN_EMPLOYEES - 1,
        }).success
      ).toBe(false)
      expect(
        updateSubscriptionQuantitySchema.safeParse({
          quantity: PRICING.MAX_EMPLOYEES + 1,
        }).success
      ).toBe(false)
    })

    it('rejette un nombre décimal', () => {
      const result = updateSubscriptionQuantitySchema.safeParse({
        quantity: 10.5,
      })
      expect(result.success).toBe(false)
    })
  })

  // ===========================================================================
  // stripeWebhookHeaderSchema
  // ===========================================================================
  describe('stripeWebhookHeaderSchema', () => {
    it('accepte un header stripe-signature valide', () => {
      const result = stripeWebhookHeaderSchema.safeParse({
        'stripe-signature': 't=123,v1=abc',
      })
      expect(result.success).toBe(true)
    })

    it('rejette un header vide', () => {
      const result = stripeWebhookHeaderSchema.safeParse({
        'stripe-signature': '',
      })
      expect(result.success).toBe(false)
    })

    it('rejette un header manquant', () => {
      const result = stripeWebhookHeaderSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  // ===========================================================================
  // customerPortalSchema
  // ===========================================================================
  describe('customerPortalSchema', () => {
    it('accepte une URL de retour valide', () => {
      const result = customerPortalSchema.safeParse({
        returnUrl: 'https://smartplanning.fr/settings',
      })
      expect(result.success).toBe(true)
    })

    it('accepte un objet vide (returnUrl optionnel)', () => {
      const result = customerPortalSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('rejette une URL invalide', () => {
      const result = customerPortalSchema.safeParse({
        returnUrl: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })
  })
})
