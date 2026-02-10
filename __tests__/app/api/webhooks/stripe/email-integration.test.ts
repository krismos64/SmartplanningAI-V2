/**
 * Tests d'intégration : emails billing dans les webhooks Stripe
 *
 * @ticket SP-370
 * @description Vérifie que les handlers webhook appellent les fonctions
 * d'envoi email en fire-and-forget après la logique DB
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks hoistés
// ============================================================================

const {
  mockSendSubscriptionActivated,
  mockSendPaymentConfirmed,
  mockSendPaymentFailed,
  mockSendSubscriptionCanceled,
} = vi.hoisted(() => ({
  mockSendSubscriptionActivated: vi.fn().mockResolvedValue({ success: true }),
  mockSendPaymentConfirmed: vi.fn().mockResolvedValue({ success: true }),
  mockSendPaymentFailed: vi.fn().mockResolvedValue({ success: true }),
  mockSendSubscriptionCanceled: vi.fn().mockResolvedValue({ success: true }),
}))

const mockStripe = vi.hoisted(() => ({
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
  },
  customers: { create: vi.fn() },
  checkout: { sessions: { create: vi.fn() } },
  billingPortal: { sessions: { create: vi.fn() } },
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

vi.mock('@/lib/email/templates/billing', () => ({
  sendSubscriptionActivatedEmail: mockSendSubscriptionActivated,
  sendPaymentConfirmedEmail: mockSendPaymentConfirmed,
  sendPaymentFailedEmail: mockSendPaymentFailed,
  sendSubscriptionCanceledEmail: mockSendSubscriptionCanceled,
}))

// ============================================================================
// Imports
// ============================================================================

import { prisma } from '@/lib/prisma'
import { handleWebhookEvent } from '@/lib/services/stripe'
import type Stripe from 'stripe'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// ============================================================================
// Helpers
// ============================================================================

const COMPANY_ID = 'company-test-1'

function makeCheckoutSession(): Stripe.Checkout.Session {
  return {
    id: 'cs_test_123',
    metadata: { smartplanning_company_id: COMPANY_ID },
    subscription: 'sub_test_123',
    customer: 'cus_test_123',
  } as unknown as Stripe.Checkout.Session
}

function makeInvoice(overrides = {}): Stripe.Invoice {
  return {
    id: 'in_test_123',
    amount_paid: 2900,
    amount_due: 2900,
    currency: 'eur',
    hosted_invoice_url: 'https://invoice.stripe.com/i/test',
    parent: {
      subscription_details: {
        subscription: 'sub_test_123',
      },
    },
    payments: {
      data: [{ payment: { payment_intent: 'pi_test_123' } }],
    },
    ...overrides,
  } as unknown as Stripe.Invoice
}

function makeSubscription(overrides = {}): Stripe.Subscription {
  return {
    id: 'sub_test_123',
    metadata: { smartplanning_company_id: COMPANY_ID },
    canceled_at: Math.floor(Date.now() / 1000),
    billing_cycle_anchor: Math.floor(Date.now() / 1000),
    items: { data: [{ id: 'si_test_1', quantity: 10, price: { id: 'price_1' } }] },
    cancel_at_period_end: false,
    status: 'canceled',
    customer: 'cus_test_123',
    ...overrides,
  } as unknown as Stripe.Subscription
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

// ============================================================================
// Tests
// ============================================================================

describe('Webhook email integration (SP-370)', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
  })

  it('checkout.session.completed → sendSubscriptionActivatedEmail appelé', async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_test_123',
      items: { data: [{ id: 'si_test_1', quantity: 10, price: { id: 'price_1' } }] },
      billing_cycle_anchor: Math.floor(Date.now() / 1000),
    })
    ;(prismaMock.subscription.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })

    await handleWebhookEvent({
      type: 'checkout.session.completed',
      data: { object: makeCheckoutSession() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendSubscriptionActivated).toHaveBeenCalledOnce()
    expect(mockSendSubscriptionActivated).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: COMPANY_ID,
        recipientEmail: 'director@acme.fr',
        employeeCount: 10,
      })
    )
  })

  it('invoice.paid → sendPaymentConfirmedEmail appelé avec bon montant', async () => {
    ;(prismaMock.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      companyId: COMPANY_ID,
    })
    ;(prismaMock.payment.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })

    await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: makeInvoice() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendPaymentConfirmed).toHaveBeenCalledOnce()
    expect(mockSendPaymentConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: '29,00 €',
        companyId: COMPANY_ID,
      })
    )
  })

  it('invoice.payment_failed → sendPaymentFailedEmail appelé', async () => {
    ;(prismaMock.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      companyId: COMPANY_ID,
    })
    ;(prismaMock.$transaction as ReturnType<typeof vi.fn>).mockImplementation(
      async (fn: (tx: unknown) => Promise<void>) => {
        await fn({
          payment: { upsert: vi.fn().mockResolvedValue({}) },
          subscription: { update: vi.fn().mockResolvedValue({}) },
        })
      }
    )
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })

    await handleWebhookEvent({
      type: 'invoice.payment_failed',
      data: { object: makeInvoice() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendPaymentFailed).toHaveBeenCalledOnce()
  })

  it('customer.subscription.deleted → sendSubscriptionCanceledEmail appelé', async () => {
    ;(prismaMock.subscription.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      stripeSubscriptionId: 'sub_test_123',
    })
    ;(prismaMock.subscription.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({
      count: 1,
    })
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })

    await handleWebhookEvent({
      type: 'customer.subscription.deleted',
      data: { object: makeSubscription() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendSubscriptionCanceled).toHaveBeenCalledOnce()
  })

  it('Échec email sur checkout → webhook retourne quand même success', async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_test_123',
      items: { data: [{ id: 'si_test_1', quantity: 10, price: { id: 'price_1' } }] },
      billing_cycle_anchor: Math.floor(Date.now() / 1000),
    })
    ;(prismaMock.subscription.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })
    mockSendSubscriptionActivated.mockRejectedValue(new Error('SMTP down'))

    const result = await handleWebhookEvent({
      type: 'checkout.session.completed',
      data: { object: makeCheckoutSession() },
    } as unknown as Stripe.Event)

    await flushPromises()

    // Le webhook doit retourner success même si l'email échoue
    expect(result.success).toBe(true)
  })

  it('Échec email sur invoice.paid → webhook retourne quand même success', async () => {
    ;(prismaMock.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      companyId: COMPANY_ID,
    })
    ;(prismaMock.payment.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    })
    mockSendPaymentConfirmed.mockRejectedValue(new Error('SMTP down'))

    const result = await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: makeInvoice() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(result.success).toBe(true)
  })

  it('Vérifie que le companyId est correct dans l\'appel email checkout', async () => {
    mockStripe.subscriptions.retrieve.mockResolvedValue({
      id: 'sub_test_123',
      items: { data: [{ id: 'si_test_1', quantity: 5, price: { id: 'price_1' } }] },
      billing_cycle_anchor: Math.floor(Date.now() / 1000),
    })
    ;(prismaMock.subscription.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'boss@acme.fr', name: 'Marie Martin' }],
    })

    await handleWebhookEvent({
      type: 'checkout.session.completed',
      data: { object: makeCheckoutSession() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendSubscriptionActivated).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: COMPANY_ID })
    )
  })

  it('Vérifie que le recipientEmail est celui du director', async () => {
    ;(prismaMock.subscription.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'sub-db-1',
      companyId: COMPANY_ID,
    })
    ;(prismaMock.payment.upsert as ReturnType<typeof vi.fn>).mockResolvedValue({})
    ;(prismaMock.company.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: 'Acme Corp',
      users: [{ email: 'specific-director@acme.fr', name: 'Pierre Durand' }],
    })

    await handleWebhookEvent({
      type: 'invoice.paid',
      data: { object: makeInvoice() },
    } as unknown as Stripe.Event)

    await flushPromises()

    expect(mockSendPaymentConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ recipientEmail: 'specific-director@acme.fr' })
    )
  })
})
