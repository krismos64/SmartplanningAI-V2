/**
 * Tests unitaires pour le client Stripe singleton (lazy init)
 *
 * Le client Stripe est initialisé de façon lazy (au premier appel
 * de getStripe() ou au premier accès via le Proxy) pour éviter
 * les crashs dans les environnements sans STRIPE_SECRET_KEY (CI, tests).
 *
 * @ticket SP-349
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// On mock le module 'stripe' AVANT les imports
vi.mock('stripe', () => {
  const MockStripe = vi.fn().mockImplementation(() => ({
    _isMockStripe: true,
    customers: { create: vi.fn() },
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

  describe('Lazy initialization', () => {
    it("l'import ne crash pas sans STRIPE_SECRET_KEY", async () => {
      delete process.env.STRIPE_SECRET_KEY

      const mod = await import('@/lib/stripe/stripe')
      expect(mod.stripe).toBeDefined()
      expect(mod.getStripe).toBeDefined()
    })

    it('getStripe() lance une erreur si STRIPE_SECRET_KEY est manquante', async () => {
      delete process.env.STRIPE_SECRET_KEY

      const { getStripe } = await import('@/lib/stripe/stripe')
      expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY manquante')
    })

    it('getStripe() lance une erreur si STRIPE_SECRET_KEY est vide', async () => {
      process.env.STRIPE_SECRET_KEY = ''

      const { getStripe } = await import('@/lib/stripe/stripe')
      expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY manquante')
    })

    it('le Proxy stripe lance une erreur au premier accès sans clé', async () => {
      delete process.env.STRIPE_SECRET_KEY

      const { stripe } = await import('@/lib/stripe/stripe')
      expect(() => stripe.customers).toThrow('STRIPE_SECRET_KEY manquante')
    })
  })

  describe('createStripeClient()', () => {
    it('crée un client Stripe avec la clé secrète', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { default: MockStripe } = await import('stripe')
      const { getStripe } = await import('@/lib/stripe/stripe')
      getStripe()

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
      const { getStripe } = await import('@/lib/stripe/stripe')
      getStripe()

      const callArgs = (MockStripe as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0]
      expect(callArgs[1].apiVersion).toBe('2026-01-28.clover')
    })

    it('configure appInfo SmartPlanning', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { default: MockStripe } = await import('stripe')
      const { getStripe } = await import('@/lib/stripe/stripe')
      getStripe()

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
    it('exporte une instance stripe (Proxy)', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const mod = await import('@/lib/stripe/stripe')
      expect(mod.stripe).toBeDefined()
    })

    it('getStripe() retourne toujours la même instance', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('@/lib/stripe/stripe')
      const first = getStripe()
      const second = getStripe()
      expect(first).toBe(second)
    })

    it('stocke sur globalThis après le premier appel', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const { getStripe } = await import('@/lib/stripe/stripe')
      getStripe()

      const g = globalThis as typeof globalThis & { stripe?: unknown }
      expect(g.stripe).toBeDefined()
    })

    it('réutilise le singleton existant sur globalThis', async () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const fakeStripe = { _reused: true, customers: { create: vi.fn() } }
      const g = globalThis as typeof globalThis & { stripe?: unknown }
      g.stripe = fakeStripe

      const { getStripe } = await import('@/lib/stripe/stripe')
      expect(getStripe()).toBe(fakeStripe)
    })
  })
})
