/**
 * Tests unitaires pour le service Stripe
 *
 * @ticket SP-351
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks (vi.hoisted pour éviter le problème de hoisting vi.mock)
// ============================================================================

const mockStripe = vi.hoisted(() => ({
  customers: {
    create: vi.fn(),
  },
  checkout: {
    sessions: {
      create: vi.fn(),
    },
  },
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  billingPortal: {
    sessions: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  STRIPE_PRICING: {
    UNIT_AMOUNT_CENTS: 290,
    CURRENCY: 'eur',
    BILLING_INTERVAL: 'month' as const,
    TRIAL_PERIOD_DAYS: 21,
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 250,
  },
  STRIPE_STATUS_MAP: {
    trialing: 'TRIAL',
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    unpaid: 'PAST_DUE',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'EXPIRED',
    paused: 'CANCELED',
  },
  STRIPE_METADATA_KEYS: {
    COMPANY_ID: 'smartplanning_company_id',
    USER_ID: 'smartplanning_user_id',
  },
}))

vi.mock('@/lib/email/billing/format', () => ({
  formatAmountEuros: (cents: number) =>
    `${(cents / 100).toFixed(2).replace('.', ',')} €`,
}))

const mockSendTrialEndingSoonEmail = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true })
)

vi.mock('@/lib/email/templates/billing', () => ({
  sendSubscriptionActivatedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentConfirmedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendPaymentFailedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendSubscriptionCanceledEmail: vi.fn().mockResolvedValue({ success: true }),
  sendTrialEndingSoonEmail: mockSendTrialEndingSoonEmail,
}))

// ============================================================================
// Imports (APRÈS les mocks)
// ============================================================================

import { prisma } from '@/lib/prisma'
import {
  createCheckoutSession,
  updateSubscriptionQuantity,
  cancelSubscription,
  createBillingPortalSession,
  handleWebhookEvent,
} from '@/lib/services/stripe'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

// ============================================================================
// Helpers pour construire des données de test
// ============================================================================

function makeCheckoutInput(overrides = {}) {
  return {
    companyId: 'company-1',
    email: 'test@example.com',
    companyName: 'Test Corp',
    quantity: 5,
    ...overrides,
  }
}

function makeStripeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub_test123',
    status: 'active',
    customer: 'cus_test123',
    cancel_at_period_end: false,
    billing_cycle_anchor: Math.floor(Date.now() / 1000),
    metadata: {
      smartplanning_company_id: 'company-1',
    },
    items: {
      data: [
        {
          id: 'si_test123',
          quantity: 5,
          price: { id: 'price_test123' },
        },
      ],
    },
    ...overrides,
  }
}

function makeStripeEvent(type: string, data: unknown) {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: { object: data },
  }
}

function makeCheckoutSession(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cs_test123',
    subscription: 'sub_test123',
    customer: 'cus_test123',
    metadata: {
      smartplanning_company_id: 'company-1',
    },
    ...overrides,
  }
}

function makeStripeInvoice(overrides: Record<string, unknown> = {}) {
  return {
    id: 'in_test123',
    amount_paid: 1450,
    amount_due: 1450,
    currency: 'eur',
    parent: {
      subscription_details: {
        subscription: 'sub_test123',
      },
    },
    payments: {
      data: [
        {
          payment: {
            payment_intent: 'pi_test123',
          },
        },
      ],
    },
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('Stripe Service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    // Mock par défaut pour le fire-and-forget email (SP-370)
    prismaMock.company.findUnique.mockResolvedValue(null)
  })

  // ==========================================================================
  // createCheckoutSession
  // ==========================================================================
  describe('createCheckoutSession', () => {
    it('retourne une erreur si la quantité est inférieure au minimum', async () => {
      const result = await createCheckoutSession(
        makeCheckoutInput({ quantity: 0 })
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('entre')
    })

    it('retourne une erreur si la quantité dépasse le maximum', async () => {
      const result = await createCheckoutSession(
        makeCheckoutInput({ quantity: 999 })
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('entre')
    })

    it('retourne une erreur si la quantité est un décimal', async () => {
      const result = await createCheckoutSession(
        makeCheckoutInput({ quantity: 3.5 })
      )
      expect(result.success).toBe(false)
      expect(result.error).toContain('entier')
    })

    it('crée un customer Stripe si aucun customerId existant', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(null)
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_new123' })
      prismaMock.subscription.upsert.mockResolvedValue({} as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test',
        url: 'https://checkout.stripe.com/test',
      })

      const result = await createCheckoutSession(makeCheckoutInput())

      expect(result.success).toBe(true)
      expect(mockStripe.customers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test Corp',
        })
      )
    })

    it('réutilise le customerId existant', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test',
        url: 'https://checkout.stripe.com/test',
      })

      const result = await createCheckoutSession(makeCheckoutInput())

      expect(result.success).toBe(true)
      expect(mockStripe.customers.create).not.toHaveBeenCalled()
    })

    it('retourne sessionId et url en cas de succès', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_session_123',
        url: 'https://checkout.stripe.com/pay/cs_session_123',
      })

      const result = await createCheckoutSession(makeCheckoutInput())

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        sessionId: 'cs_session_123',
        url: 'https://checkout.stripe.com/pay/cs_session_123',
      })
    })

    it("retourne une erreur si Stripe ne retourne pas d'URL", async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test',
        url: null,
      })

      const result = await createCheckoutSession(makeCheckoutInput())

      expect(result.success).toBe(false)
      expect(result.error).toContain('URL')
    })

    it('gère les erreurs Stripe avec le message approprié', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)

      const stripeError = new Error('Card declined')
      stripeError.name = 'StripeCardError'
      // Simuler une erreur Stripe classique
      Object.setPrototypeOf(stripeError, Error.prototype)
      mockStripe.checkout.sessions.create.mockRejectedValue(stripeError)

      const result = await createCheckoutSession(makeCheckoutInput())

      expect(result.success).toBe(false)
      expect(result.error).toContain('Card declined')
    })

    it('configure les metadata avec le companyId', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test',
        url: 'https://checkout.stripe.com/test',
      })

      await createCheckoutSession(makeCheckoutInput())

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            smartplanning_company_id: 'company-1',
          }),
        })
      )
    })

    it('utilise successUrl et cancelUrl si fournis', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue({
        stripeCustomerId: 'cus_existing',
      } as never)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test',
        url: 'https://checkout.stripe.com/test',
      })

      await createCheckoutSession(
        makeCheckoutInput({
          successUrl: 'https://app.test/success',
          cancelUrl: 'https://app.test/cancel',
        })
      )

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'https://app.test/success',
          cancel_url: 'https://app.test/cancel',
        })
      )
    })
  })

  // ==========================================================================
  // updateSubscriptionQuantity
  // ==========================================================================
  describe('updateSubscriptionQuantity', () => {
    it('retourne une erreur si la quantité est hors limites', async () => {
      const result = await updateSubscriptionQuantity({
        subscriptionId: 'sub_test',
        newQuantity: 0,
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('entre')
    })

    it('retourne une erreur si la quantité est un décimal', async () => {
      const result = await updateSubscriptionQuantity({
        subscriptionId: 'sub_test',
        newQuantity: 2.5,
      })
      expect(result.success).toBe(false)
      expect(result.error).toContain('entier')
    })

    it('retourne une erreur si la subscription est introuvable en DB', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null)

      const result = await updateSubscriptionQuantity({
        subscriptionId: 'sub_unknown',
        newQuantity: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('introuvable')
    })

    it("retourne une erreur si aucun item n'existe sur l'abonnement", async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({
        id: 'db-sub-1',
        pricePerEmployee: 290,
      } as never)
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: { data: [] },
      })

      const result = await updateSubscriptionQuantity({
        subscriptionId: 'sub_test',
        newQuantity: 10,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('item')
    })

    it('met à jour chez Stripe avec prorata et synchronise en DB', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({
        id: 'db-sub-1',
        pricePerEmployee: 290,
      } as never)
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: { data: [{ id: 'si_item1' }] },
      })
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await updateSubscriptionQuantity({
        subscriptionId: 'sub_test',
        newQuantity: 15,
      })

      expect(result.success).toBe(true)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_test', {
        items: [{ id: 'si_item1', quantity: 15 }],
        proration_behavior: 'create_prorations',
      })
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quantity: 15,
            planPrice: 15 * 290,
          }),
        })
      )
    })
  })

  // ==========================================================================
  // cancelSubscription
  // ==========================================================================
  describe('cancelSubscription', () => {
    it('retourne une erreur si la subscription est introuvable en DB', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue(null)

      const result = await cancelSubscription({
        subscriptionId: 'sub_unknown',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('introuvable')
    })

    it('annule immédiatement si cancelImmediately=true', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({
        id: 'db-sub-1',
        companyId: 'company-1',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date('2026-03-01'),
      } as never)
      mockStripe.subscriptions.cancel.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await cancelSubscription({
        subscriptionId: 'sub_test',
        cancelImmediately: true,
      })

      expect(result.success).toBe(true)
      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_test')
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CANCELED',
            cancelAtPeriodEnd: false,
          }),
        })
      )
    })

    it('schedule annulation en fin de période par défaut', async () => {
      prismaMock.subscription.findFirst.mockResolvedValue({
        id: 'db-sub-1',
        companyId: 'company-1',
        stripeSubscriptionId: 'sub_test',
        currentPeriodEnd: new Date('2026-03-01'),
      } as never)
      mockStripe.subscriptions.update.mockResolvedValue({})
      prismaMock.subscription.update.mockResolvedValue({} as never)

      const result = await cancelSubscription({
        subscriptionId: 'sub_test',
      })

      expect(result.success).toBe(true)
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_test', {
        cancel_at_period_end: true,
      })
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            cancelAtPeriodEnd: true,
          }),
        })
      )
    })
  })

  // ==========================================================================
  // createBillingPortalSession
  // ==========================================================================
  describe('createBillingPortalSession', () => {
    it('retourne une URL de portail en cas de succès', async () => {
      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test',
      })

      const result = await createBillingPortalSession({
        customerId: 'cus_test',
        returnUrl: 'https://app.test/billing',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        url: 'https://billing.stripe.com/session/test',
      })
    })

    it('passe les bons paramètres à Stripe', async () => {
      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/session/test',
      })

      await createBillingPortalSession({
        customerId: 'cus_123',
        returnUrl: 'https://app.test/return',
      })

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://app.test/return',
      })
    })

    it('gère les erreurs Stripe', async () => {
      mockStripe.billingPortal.sessions.create.mockRejectedValue(
        new Error('Customer not found')
      )

      const result = await createBillingPortalSession({
        customerId: 'cus_invalid',
        returnUrl: 'https://app.test/billing',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Customer not found')
    })
  })

  // ==========================================================================
  // handleWebhookEvent
  // ==========================================================================
  describe('handleWebhookEvent', () => {
    // ========================================================================
    // checkout.session.completed
    // ========================================================================
    describe('checkout.session.completed', () => {
      it('active la subscription après checkout réussi', async () => {
        const session = makeCheckoutSession()
        const event = makeStripeEvent('checkout.session.completed', session)

        mockStripe.subscriptions.retrieve.mockResolvedValue(
          makeStripeSubscription()
        )
        prismaMock.subscription.upsert.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('subscription_activated')
      })

      it('retourne une erreur si companyId manquant dans metadata', async () => {
        const session = makeCheckoutSession({ metadata: {} })
        const event = makeStripeEvent('checkout.session.completed', session)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(false)
        expect(result.error).toContain('companyId')
      })

      it('retourne une erreur si subscription manquante dans session', async () => {
        const session = makeCheckoutSession({ subscription: null })
        const event = makeStripeEvent('checkout.session.completed', session)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(false)
        expect(result.error).toContain('subscription')
      })

      it('upsert la subscription avec les bonnes données', async () => {
        const session = makeCheckoutSession()
        const event = makeStripeEvent('checkout.session.completed', session)

        const sub = makeStripeSubscription({ billing_cycle_anchor: 1700000000 })
        mockStripe.subscriptions.retrieve.mockResolvedValue(sub)
        prismaMock.subscription.upsert.mockResolvedValue({} as never)

        await handleWebhookEvent(event as never)

        expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { companyId: 'company-1' },
            create: expect.objectContaining({
              plan: 'PER_SEAT',
              status: 'ACTIVE',
              quantity: 5,
              stripeSubscriptionId: 'sub_test123',
            }),
          })
        )
      })
    })

    // ========================================================================
    // customer.subscription.updated
    // ========================================================================
    describe('customer.subscription.updated', () => {
      it('synchronise le statut et la quantité', async () => {
        const sub = makeStripeSubscription({ status: 'active' })
        const event = makeStripeEvent('customer.subscription.updated', sub)

        prismaMock.subscription.findUnique.mockResolvedValue({
          id: 'db-sub-1',
          status: 'TRIAL',
          quantity: 3,
          pricePerEmployee: 290,
        } as never)
        prismaMock.subscription.upsert.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('subscription_synced')
      })

      it('ne modifie rien si le statut et la quantité sont identiques (idempotence)', async () => {
        const sub = makeStripeSubscription({ status: 'active' })
        const event = makeStripeEvent('customer.subscription.updated', sub)

        prismaMock.subscription.findUnique.mockResolvedValue({
          id: 'db-sub-1',
          status: 'ACTIVE',
          quantity: 5,
          pricePerEmployee: 290,
        } as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('no_change')
        expect(prismaMock.subscription.upsert).not.toHaveBeenCalled()
      })

      it('retourne une erreur si companyId manquant', async () => {
        const sub = makeStripeSubscription({
          metadata: {},
        })
        const event = makeStripeEvent('customer.subscription.updated', sub)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(false)
        expect(result.error).toContain('companyId')
      })

      it('mappe correctement trialing → TRIAL', async () => {
        const sub = makeStripeSubscription({ status: 'trialing' })
        const event = makeStripeEvent('customer.subscription.created', sub)

        prismaMock.subscription.findUnique.mockResolvedValue(null)
        prismaMock.subscription.upsert.mockResolvedValue({} as never)

        await handleWebhookEvent(event as never)

        expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({
              status: 'TRIAL',
            }),
          })
        )
      })
    })

    // ========================================================================
    // customer.subscription.deleted
    // ========================================================================
    describe('customer.subscription.deleted', () => {
      it('marque la subscription comme CANCELED', async () => {
        const sub = makeStripeSubscription()
        const event = makeStripeEvent('customer.subscription.deleted', sub)

        prismaMock.subscription.updateMany.mockResolvedValue({
          count: 1,
        })

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('subscription_canceled')
        expect(prismaMock.subscription.updateMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { companyId: 'company-1' },
            data: expect.objectContaining({
              status: 'CANCELED',
            }),
          })
        )
      })

      it('retourne une erreur si companyId manquant', async () => {
        const sub = makeStripeSubscription({ metadata: {} })
        const event = makeStripeEvent('customer.subscription.deleted', sub)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(false)
        expect(result.error).toContain('companyId')
      })
    })

    // ========================================================================
    // customer.subscription.trial_will_end
    // ========================================================================
    describe('customer.subscription.trial_will_end', () => {
      // Flush les microtasks pour laisser le fire-and-forget email s'exécuter
      const flushMicrotasks = () =>
        new Promise<void>((resolve) => setImmediate(resolve))

      function makeTrialSubscription(overrides: Record<string, unknown> = {}) {
        return makeStripeSubscription({
          status: 'trialing',
          trial_end: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60,
          ...overrides,
        })
      }

      it('envoie le rappel de fin d essai et retourne action trial_ending_reminder_sent', async () => {
        const sub = makeTrialSubscription()
        const event = makeStripeEvent(
          'customer.subscription.trial_will_end',
          sub
        )

        prismaMock.subscription.findUnique.mockResolvedValue({
          id: 'db-sub-1',
          stripeSubscriptionId: 'sub_test123',
          quantity: 5,
          pricePerEmployee: 290,
        } as never)
        // getCompanyDirector : company avec un DIRECTOR
        prismaMock.company.findUnique.mockResolvedValue({
          name: 'Test Corp',
          users: [{ email: 'director@test.fr', name: 'Jean Dupont' }],
        } as never)

        const result = await handleWebhookEvent(event as never)
        await flushMicrotasks()

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('trial_ending_reminder_sent')
        expect(mockSendTrialEndingSoonEmail).toHaveBeenCalledOnce()
        expect(mockSendTrialEndingSoonEmail).toHaveBeenCalledWith(
          expect.objectContaining({
            companyId: 'company-1',
            subscriptionId: 'sub_test123',
            recipientEmail: 'director@test.fr',
            daysRemaining: 3,
            employeeCount: 5,
          })
        )
      })

      it('ne fait rien (skipped) si la subscription n est plus en trialing', async () => {
        const sub = makeTrialSubscription({ status: 'active' })
        const event = makeStripeEvent(
          'customer.subscription.trial_will_end',
          sub
        )

        const result = await handleWebhookEvent(event as never)
        await flushMicrotasks()

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('skipped_not_trialing')
        expect(mockSendTrialEndingSoonEmail).not.toHaveBeenCalled()
        // Aucune lecture DB inutile
        expect(prismaMock.subscription.findUnique).not.toHaveBeenCalled()
      })

      it('retourne une erreur si companyId manquant', async () => {
        const sub = makeTrialSubscription({ metadata: {} })
        const event = makeStripeEvent(
          'customer.subscription.trial_will_end',
          sub
        )

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(false)
        expect(result.error).toContain('companyId')
        expect(mockSendTrialEndingSoonEmail).not.toHaveBeenCalled()
      })

      it('n envoie pas d email si aucun DIRECTOR n est trouve (fire-and-forget)', async () => {
        const sub = makeTrialSubscription()
        const event = makeStripeEvent(
          'customer.subscription.trial_will_end',
          sub
        )

        prismaMock.subscription.findUnique.mockResolvedValue({
          id: 'db-sub-1',
          stripeSubscriptionId: 'sub_test123',
          quantity: 5,
          pricePerEmployee: 290,
        } as never)
        // getCompanyDirector retourne null (pas de director)
        prismaMock.company.findUnique.mockResolvedValue(null)

        const result = await handleWebhookEvent(event as never)
        await flushMicrotasks()

        // Le webhook réussit quand même (non bloquant), mais aucun email envoyé
        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('trial_ending_reminder_sent')
        expect(mockSendTrialEndingSoonEmail).not.toHaveBeenCalled()
      })

      it('reste ignoré si trial_end absent : fallback daysRemaining = 3', async () => {
        const sub = makeTrialSubscription({ trial_end: null })
        const event = makeStripeEvent(
          'customer.subscription.trial_will_end',
          sub
        )

        prismaMock.subscription.findUnique.mockResolvedValue({
          id: 'db-sub-1',
          stripeSubscriptionId: 'sub_test123',
          quantity: 2,
          pricePerEmployee: 290,
        } as never)
        prismaMock.company.findUnique.mockResolvedValue({
          name: 'Test Corp',
          users: [{ email: 'director@test.fr', name: 'Jean Dupont' }],
        } as never)

        const result = await handleWebhookEvent(event as never)
        await flushMicrotasks()

        expect(result.success).toBe(true)
        expect(mockSendTrialEndingSoonEmail).toHaveBeenCalledWith(
          expect.objectContaining({ daysRemaining: 3 })
        )
      })
    })

    // ========================================================================
    // invoice.paid
    // ========================================================================
    describe('invoice.paid', () => {
      it('enregistre le paiement en base', async () => {
        const invoice = makeStripeInvoice()
        const event = makeStripeEvent('invoice.paid', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)
        prismaMock.payment.upsert.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('payment_recorded')
        expect(prismaMock.payment.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { stripePaymentId: 'pi_test123' },
            create: expect.objectContaining({
              status: 'SUCCEEDED',
              amount: 1450,
            }),
          })
        )
      })

      it('retourne handled=false si subscription introuvable', async () => {
        const invoice = makeStripeInvoice()
        const event = makeStripeEvent('invoice.paid', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue(null)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.handled).toBe(false)
        expect(result.data?.action).toBe('subscription_not_found')
      })

      it('retombe sur l ID de facture quand le payment intent est absent du webhook', async () => {
        // Le payload webhook brut ne contient pas invoice.payments (non
        // expandé) : le payment_intent est introuvable. On doit quand même
        // enregistrer le paiement en utilisant l'ID de facture comme clé.
        const invoice = makeStripeInvoice({
          payments: { data: [] },
        })
        const event = makeStripeEvent('invoice.paid', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)
        prismaMock.payment.upsert.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        // Le Payment est créé avec l'ID de facture comme stripePaymentId
        expect(prismaMock.payment.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { stripePaymentId: 'in_test123' },
            create: expect.objectContaining({
              status: 'SUCCEEDED',
              amount: 1450,
              stripeInvoiceId: 'in_test123',
            }),
          })
        )
      })

      it('ignore une facture à 0 € (essai en cours)', async () => {
        const invoice = makeStripeInvoice({
          amount_paid: 0,
          payments: { data: [] },
        })
        const event = makeStripeEvent('invoice.paid', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.handled).toBe(false)
        expect(result.data?.action).toBe('zero_amount_trial')
        expect(prismaMock.payment.upsert).not.toHaveBeenCalled()
      })

      it('gère un subscription ID de type objet (expanded)', async () => {
        const invoice = makeStripeInvoice({
          parent: {
            subscription_details: {
              subscription: { id: 'sub_expanded' },
            },
          },
        })
        const event = makeStripeEvent('invoice.paid', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)
        prismaMock.payment.upsert.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { stripeSubscriptionId: 'sub_expanded' },
          })
        )
      })
    })

    // ========================================================================
    // invoice.payment_failed
    // ========================================================================
    describe('invoice.payment_failed', () => {
      it('enregistre le paiement échoué et passe en PAST_DUE', async () => {
        const invoice = makeStripeInvoice()
        const event = makeStripeEvent('invoice.payment_failed', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)

        // Mock $transaction
        prismaMock.$transaction.mockImplementation(async (fn) => {
          return fn(prismaMock)
        })
        prismaMock.payment.upsert.mockResolvedValue({} as never)
        prismaMock.subscription.update.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.action).toBe('payment_failed_recorded')
      })

      it('retourne handled=false si subscription introuvable', async () => {
        const invoice = makeStripeInvoice()
        const event = makeStripeEvent('invoice.payment_failed', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue(null)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.handled).toBe(false)
      })

      it('gère un invoice sans payment intent dans la transaction', async () => {
        const invoice = makeStripeInvoice({
          payments: { data: [] },
        })
        const event = makeStripeEvent('invoice.payment_failed', invoice)

        prismaMock.subscription.findFirst.mockResolvedValue({
          id: 'db-sub-1',
          companyId: 'company-1',
        } as never)

        prismaMock.$transaction.mockImplementation(async (fn) => {
          return fn(prismaMock)
        })
        prismaMock.subscription.update.mockResolvedValue({} as never)

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(prismaMock.payment.upsert).not.toHaveBeenCalled()
        expect(prismaMock.subscription.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { status: 'PAST_DUE' },
          })
        )
      })
    })

    // ========================================================================
    // Événements inconnus
    // ========================================================================
    describe('événements non gérés', () => {
      it('retourne handled=false pour un événement inconnu', async () => {
        const event = makeStripeEvent('unknown.event.type', {})

        const result = await handleWebhookEvent(event as never)

        expect(result.success).toBe(true)
        expect(result.data?.handled).toBe(false)
        expect(result.data?.action).toBe('ignored')
      })

      it("retourne le type d'événement dans le résultat", async () => {
        const event = makeStripeEvent('customer.created', {})

        const result = await handleWebhookEvent(event as never)

        expect(result.data?.eventType).toBe('customer.created')
      })
    })
  })
})
