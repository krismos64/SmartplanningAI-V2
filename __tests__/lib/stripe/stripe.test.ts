/**
 * Tests unitaires pour le client Stripe singleton
 *
 * @ticket SP-349
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// On mock le module 'stripe' AVANT les imports
vi.mock('stripe', () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    _isMockStripe: true,
  }))
  return { default: MockStripe }
})

describe('Stripe Client Singleton', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    // Réinitialiser l'état du module entre chaque test
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
    // Nettoyer le singleton global
    const g = globalThis as typeof globalThis & { stripe?: unknown }
    delete g.stripe
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  describe('createStripeClient()', () => {
    it('lance une erreur si STRIPE_SECRET_KEY est manquante', async () => {
      delete process.env.STRIPE_SECRET_KEY

      await expect(
        import('@/lib/stripe/stripe')
      ).rejects.toThrow('STRIPE_SECRET_KEY manquante')
    })

    it('lance une erreur si STRIPE_SECRET_KEY est vide', async () => {
      process.env.STRIPE_SECRET_KEY = ''

      await expect(
        import('@/lib/stripe/stripe')
      ).rejects.toThrow('STRIPE_SECRET_KEY manquante')
    })

    it('crée un client Stripe avec la clé secrète', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { default: MockStripe } = await import('stripe')
      await import('@/lib/stripe/stripe')

      expect(MockStripe).toHaveBeenCalledWith('sk_test_123', {
        apiVersion: '2026-01-28.clover',
        typescript: true,
        appInfo: {
          name: 'SmartPlanning',
          version: '2.0.0',
          url: 'https://smartplanning.fr',
        },
      })
    })

    it('utilise apiVersion fixe 2026-01-28.clover', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { default: MockStripe } = await import('stripe')
      await import('@/lib/stripe/stripe')

      const callArgs = (MockStripe as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0]
      expect(callArgs[1].apiVersion).toBe('2026-01-28.clover')
    })

    it('configure appInfo SmartPlanning', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { default: MockStripe } = await import('stripe')
      await import('@/lib/stripe/stripe')

      const callArgs = (MockStripe as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0]
      expect(callArgs[1].appInfo).toEqual({
        name: 'SmartPlanning',
        version: '2.0.0',
        url: 'https://smartplanning.fr',
      })
    })
  })

  describe('Singleton pattern', () => {
    it('exporte une instance stripe', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const mod = await import('@/lib/stripe/stripe')
      expect(mod.stripe).toBeDefined()
    })

    it('stocke sur globalThis en développement', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.NODE_ENV = 'development'

      await import('@/lib/stripe/stripe')

      const g = globalThis as typeof globalThis & { stripe?: unknown }
      expect(g.stripe).toBeDefined()
    })

    it('ne stocke pas sur globalThis en production', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.NODE_ENV = 'production'

      await import('@/lib/stripe/stripe')

      const g = globalThis as typeof globalThis & { stripe?: unknown }
      expect(g.stripe).toBeUndefined()
    })

    it('réutilise le singleton existant sur globalThis', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const fakeStripe = { _reused: true }
      const g = globalThis as typeof globalThis & { stripe?: unknown }
      g.stripe = fakeStripe

      const mod = await import('@/lib/stripe/stripe')
      expect(mod.stripe).toBe(fakeStripe)
    })
  })
})
