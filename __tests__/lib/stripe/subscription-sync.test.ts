/**
 * Tests unitaires pour le service de synchronisation employés → Stripe
 *
 * Couvre : skip conditions, synchronisation réussie, quantité identique,
 * erreurs Stripe, erreurs Prisma, cas limites.
 *
 * @ticket SP-439
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

// ============================================================================
// Mocks
// ============================================================================

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
}))

vi.mock('@/lib/email/billing/format', () => ({
  formatAmountEuros: (cents: number) =>
    `${(cents / 100).toFixed(2).replace('.', ',')} €`,
}))

vi.mock('@/lib/email/templates/billing', () => ({
  sendQuantityUpdatedEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Imports après mocks
import { prisma } from '@/lib/prisma'
import { syncEmployeeCountToStripe } from '@/lib/services/stripe/subscription-sync.service'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// ============================================================================
// Fixtures
// ============================================================================

const COMPANY_ID = 'cltest00000000000company1'
const SUBSCRIPTION_ID = 'sub_test123'
const ITEM_ID = 'si_test456'

function makeSubscription(overrides = {}) {
  return {
    id: 'cltest0000000000000sub001',
    stripeSubscriptionId: SUBSCRIPTION_ID,
    status: 'ACTIVE',
    quantity: 5,
    pricePerEmployee: 290,
    ...overrides,
  }
}

function makeStripeSub(itemId = ITEM_ID) {
  return {
    id: SUBSCRIPTION_ID,
    items: {
      data: [{ id: itemId, quantity: 5 }],
    },
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('syncEmployeeCountToStripe', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // Mock par défaut pour le fire-and-forget email (SP-370)
    prismaMock.company.findUnique.mockResolvedValue(null)
  })

  // --------------------------------------------------------------------------
  // Skip conditions
  // --------------------------------------------------------------------------

  describe('Skip conditions', () => {
    it('skip si la company n\'a pas de subscription', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null)
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result).toEqual({
        synced: false,
        previousQuantity: 0,
        newQuantity: 3,
        reason: 'no_subscription',
      })
      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled()
    })

    it('skip si pas de stripeSubscriptionId', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ stripeSubscriptionId: null }) as never
      )
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('no_stripe_subscription_id')
    })

    it('skip si statut TRIAL', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'TRIAL' }) as never
      )
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('status_trial')
    })

    it('skip si statut CANCELED', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'CANCELED' }) as never
      )
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('status_canceled')
    })

    it('skip si statut EXPIRED', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'EXPIRED' }) as never
      )
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('status_expired')
    })

    it('skip si statut INCOMPLETE', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'INCOMPLETE' }) as never
      )
      prismaMock.employee.count.mockResolvedValue(3)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('status_incomplete')
    })

    it('skip si pas de Stripe item ID', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        id: SUBSCRIPTION_ID,
        items: { data: [] },
      })

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('no_stripe_item_id')
    })

    it('skip si la quantité est identique (optimisation réseau)', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(5)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result).toEqual({
        synced: false,
        previousQuantity: 5,
        newQuantity: 5,
        reason: 'quantity_unchanged',
      })
      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Synchronisation réussie
  // --------------------------------------------------------------------------

  describe('Synchronisation réussie', () => {
    it('met à jour Stripe et la DB quand la quantité change', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(8)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result).toEqual({
        synced: true,
        previousQuantity: 5,
        newQuantity: 8,
      })
    })

    it('appelle Stripe avec les bons paramètres', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        SUBSCRIPTION_ID,
        {
          items: [{ id: ITEM_ID, quantity: 10 }],
          proration_behavior: 'create_prorations',
        }
      )
    })

    it('met à jour quantity et planPrice en DB', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({
          id: 'sub-db-id',
          quantity: 5,
          pricePerEmployee: 290,
        }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(prismaMock.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-db-id' },
        data: {
          quantity: 10,
          planPrice: 10 * 290,
        },
      })
    })

    it('active le prorata', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 3 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(7)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      await syncEmployeeCountToStripe(COMPANY_ID)

      const call = mockStripe.subscriptions.update.mock.calls[0]
      expect(call[1].proration_behavior).toBe('create_prorations')
    })

    it('log info après synchronisation réussie', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(8)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(console.info).toHaveBeenCalledWith(
        '[StripeSync]',
        expect.objectContaining({
          action: 'quantity_updated',
          companyId: COMPANY_ID,
          previousQuantity: 5,
          newQuantity: 8,
        })
      )
    })
  })

  // --------------------------------------------------------------------------
  // Quantité identique
  // --------------------------------------------------------------------------

  describe('Quantité identique', () => {
    it('ne fait pas d\'appel Stripe si la quantité n\'a pas changé', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 10 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(mockStripe.subscriptions.retrieve).not.toHaveBeenCalled()
      expect(mockStripe.subscriptions.update).not.toHaveBeenCalled()
    })

    it('ne met pas à jour la DB si la quantité n\'a pas changé', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 7 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(7)

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Erreurs Stripe
  // --------------------------------------------------------------------------

  describe('Erreurs Stripe', () => {
    it('ne throw pas en cas d\'erreur Stripe', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockRejectedValue(
        new Stripe.errors.StripeError({
          type: 'StripeAPIError',
          message: 'rate limit exceeded',
        })
      )

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toContain('Stripe: rate limit exceeded')
    })

    it('retourne synced false avec le message d\'erreur', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockRejectedValue(
        new Stripe.errors.StripeError({
          type: 'StripeAPIError',
          message: 'subscription not found',
        })
      )

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result).toEqual({
        synced: false,
        previousQuantity: 0,
        newQuantity: 0,
        reason: 'Stripe: subscription not found',
      })
    })

    it('log l\'erreur Stripe', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockRejectedValue(
        new Stripe.errors.StripeError({
          type: 'StripeAPIError',
          message: 'api error',
        })
      )

      await syncEmployeeCountToStripe(COMPANY_ID)

      expect(console.error).toHaveBeenCalledWith(
        '[StripeSync]',
        expect.objectContaining({
          action: 'sync_failed',
          companyId: COMPANY_ID,
        })
      )
    })

    it('ne rollback pas l\'employé si Stripe échoue', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockRejectedValue(new Error('network'))

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(prismaMock.employee.delete).not.toHaveBeenCalled()
      expect(prismaMock.employee.update).not.toHaveBeenCalled()
    })

    it('gère les erreurs Stripe retrieve', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 3 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(7)
      mockStripe.subscriptions.retrieve.mockRejectedValue(
        new Error('connection refused')
      )

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('connection refused')
    })
  })

  // --------------------------------------------------------------------------
  // Erreurs Prisma
  // --------------------------------------------------------------------------

  describe('Erreurs Prisma', () => {
    it('gère l\'erreur Prisma findUnique', async () => {
      prismaMock.subscription.findUnique.mockRejectedValue(
        new Error('DB connection lost')
      )
      prismaMock.employee.count.mockResolvedValue(5)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('DB connection lost')
    })

    it('gère l\'erreur Prisma employee.count', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription() as never
      )
      prismaMock.employee.count.mockRejectedValue(
        new Error('timeout')
      )

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('timeout')
    })

    it('gère l\'erreur Prisma subscription.update', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(10)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockRejectedValue(
        new Error('unique constraint violation')
      )

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(false)
      expect(result.reason).toBe('unique constraint violation')
      expect(console.error).toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // Cas limites
  // --------------------------------------------------------------------------

  describe('Cas limites', () => {
    it('utilise minimum 1 quand 0 employés actifs', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(0)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(true)
      expect(result.newQuantity).toBe(1)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        SUBSCRIPTION_ID,
        expect.objectContaining({
          items: [{ id: ITEM_ID, quantity: 1 }],
        })
      )
    })

    it('gère un grand nombre d\'employés', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(200)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(true)
      expect(result.newQuantity).toBe(200)
    })

    it('synchronise PAST_DUE (statut non-skip)', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ status: 'PAST_DUE', quantity: 5 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(8)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(true)
      expect(result.newQuantity).toBe(8)
    })

    it('synchronise pour diminution d\'employés', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeSubscription({ quantity: 10 }) as never
      )
      prismaMock.employee.count.mockResolvedValue(7)
      mockStripe.subscriptions.retrieve.mockResolvedValue(makeStripeSub())
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await syncEmployeeCountToStripe(COMPANY_ID)

      expect(result.synced).toBe(true)
      expect(result.previousQuantity).toBe(10)
      expect(result.newQuantity).toBe(7)
    })
  })
})
