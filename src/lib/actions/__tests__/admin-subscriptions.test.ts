/**
 * Tests unitaires pour les Server Actions admin-subscriptions
 *
 * Couvre :
 * - RBAC : non-connecté, rôle insuffisant, SYSTEM_ADMIN OK (les 3 actions)
 * - getSubscriptionsSummaryAdmin : agrégation MRR + compteurs statuts + échecs 30j
 * - getSubscriptionsAdmin : filtres whitelist, pagination, calcul MRR par ligne
 * - getPaymentsAdmin : filtre statut, mapping, clamp pagination
 *
 * @ticket SP-542
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

const mockGetCurrentMrr = vi.fn()
vi.mock('@/lib/services/mrr.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/services/mrr.service')>()
  return {
    ...actual,
    getCurrentMrr: () => mockGetCurrentMrr(),
  }
})

const mockSubscriptionFindMany = vi.fn()
const mockSubscriptionCount = vi.fn()
const mockSubscriptionGroupBy = vi.fn()
const mockPaymentFindMany = vi.fn()
const mockPaymentCount = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findMany: (...args: unknown[]) => mockSubscriptionFindMany(...args),
      count: (...args: unknown[]) => mockSubscriptionCount(...args),
      groupBy: (...args: unknown[]) => mockSubscriptionGroupBy(...args),
    },
    payment: {
      findMany: (...args: unknown[]) => mockPaymentFindMany(...args),
      count: (...args: unknown[]) => mockPaymentCount(...args),
    },
  },
}))

// ============================================================================
// Import après mocks
// ============================================================================

import {
  getSubscriptionsSummaryAdmin,
  getSubscriptionsAdmin,
  getPaymentsAdmin,
} from '../admin-subscriptions'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-001', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'director-001', role: 'DIRECTOR', companyId: 'company-001' },
}

const SUBSCRIPTION_FIXTURE = {
  id: 'sub-001',
  companyId: 'company-001',
  company: { id: 'company-001', name: 'Acme Corp' },
  plan: 'PER_SEAT',
  status: 'ACTIVE',
  quantity: 10,
  pricePerEmployee: 290,
  planPrice: 2900,
  billingInterval: 'month',
  currentPeriodEnd: new Date('2026-08-01'),
  cancelAtPeriodEnd: false,
  createdAt: new Date('2026-01-15'),
}

const PAYMENT_FIXTURE = {
  id: 'pay-001',
  companyId: 'company-001',
  company: { id: 'company-001', name: 'Acme Corp' },
  amount: 2900,
  currency: 'EUR',
  status: 'SUCCEEDED',
  paidAt: new Date('2026-07-01'),
  createdAt: new Date('2026-07-01'),
  stripeInvoiceId: 'in_123',
  failureMessage: null,
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
})

describe('RBAC — les 3 actions rejettent les non-SYSTEM_ADMIN', () => {
  it.each([
    ['getSubscriptionsSummaryAdmin', () => getSubscriptionsSummaryAdmin()],
    ['getSubscriptionsAdmin', () => getSubscriptionsAdmin()],
    ['getPaymentsAdmin', () => getPaymentsAdmin()],
  ])('%s rejette sans session', async (_name, action) => {
    mockAuth.mockResolvedValue(null)
    await expect(action()).rejects.toThrow('Unauthorized')
  })

  it.each([
    ['getSubscriptionsSummaryAdmin', () => getSubscriptionsSummaryAdmin()],
    ['getSubscriptionsAdmin', () => getSubscriptionsAdmin()],
    ['getPaymentsAdmin', () => getPaymentsAdmin()],
  ])('%s rejette un DIRECTOR', async (_name, action) => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)
    await expect(action()).rejects.toThrow('Unauthorized')
  })
})

describe('getSubscriptionsSummaryAdmin', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockGetCurrentMrr.mockResolvedValue(145.0)
    mockSubscriptionGroupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: 5 },
      { status: 'TRIAL', _count: 3 },
      { status: 'PAST_DUE', _count: 2 },
    ])
    mockPaymentCount.mockResolvedValue(4)
  })

  it('agrège MRR, compteurs par statut et échecs 30 jours', async () => {
    const result = await getSubscriptionsSummaryAdmin()

    expect(result).toEqual({
      mrr: 145.0,
      activeCount: 5,
      trialCount: 3,
      pastDueCount: 2,
      failedPayments30d: 4,
    })
  })

  it('retourne 0 pour les statuts absents du groupBy', async () => {
    mockSubscriptionGroupBy.mockResolvedValue([])
    mockPaymentCount.mockResolvedValue(0)

    const result = await getSubscriptionsSummaryAdmin()

    expect(result.activeCount).toBe(0)
    expect(result.trialCount).toBe(0)
    expect(result.pastDueCount).toBe(0)
  })

  it('compte uniquement les paiements FAILED des 30 derniers jours', async () => {
    await getSubscriptionsSummaryAdmin()

    const countArgs = mockPaymentCount.mock.calls[0]?.[0]
    expect(countArgs.where.status).toBe('FAILED')
    expect(countArgs.where.createdAt.gte).toBeInstanceOf(Date)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const gte = countArgs.where.createdAt.gte as Date
    // Tolérance 1 minute sur le calcul de la borne
    expect(Math.abs(gte.getTime() - thirtyDaysAgo.getTime())).toBeLessThan(
      60_000
    )
  })
})

describe('getSubscriptionsAdmin', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockSubscriptionFindMany.mockResolvedValue([SUBSCRIPTION_FIXTURE])
    mockSubscriptionCount.mockResolvedValue(1)
  })

  it('retourne les lignes mappées avec le total', async () => {
    const result = await getSubscriptionsAdmin()

    expect(result.total).toBe(1)
    expect(result.subscriptions[0]).toMatchObject({
      id: 'sub-001',
      companyId: 'company-001',
      companyName: 'Acme Corp',
      plan: 'PER_SEAT',
      status: 'ACTIVE',
      quantity: 10,
    })
  })

  it('calcule le MRR par ligne pour un abonnement ACTIVE mensuel', async () => {
    const result = await getSubscriptionsAdmin()

    // 10 employés × 2,90€ = 29€/mois
    expect(result.subscriptions[0]?.mrr).toBe(29)
  })

  it('divise par 12 le MRR pour un abonnement annuel', async () => {
    mockSubscriptionFindMany.mockResolvedValue([
      { ...SUBSCRIPTION_FIXTURE, billingInterval: 'year' },
    ])

    const result = await getSubscriptionsAdmin()

    // (10 × 290) / 12 / 100 = 2,4166...
    expect(result.subscriptions[0]?.mrr).toBeCloseTo(29 / 12, 4)
  })

  it('force le MRR à 0 pour un abonnement non-ACTIVE', async () => {
    mockSubscriptionFindMany.mockResolvedValue([
      { ...SUBSCRIPTION_FIXTURE, status: 'PAST_DUE' },
    ])

    const result = await getSubscriptionsAdmin()

    expect(result.subscriptions[0]?.mrr).toBe(0)
  })

  it('applique le filtre statut valide au WHERE', async () => {
    await getSubscriptionsAdmin({ status: 'PAST_DUE' })

    const findArgs = mockSubscriptionFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).toEqual({ status: 'PAST_DUE' })
  })

  it('applique le filtre plan valide au WHERE', async () => {
    await getSubscriptionsAdmin({ plan: 'PER_SEAT' })

    const findArgs = mockSubscriptionFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).toEqual({ plan: 'PER_SEAT' })
  })

  it("ignore 'ALL' et les valeurs hors whitelist", async () => {
    await getSubscriptionsAdmin({
      status: 'ALL',
      plan: 'INJECTION' as never,
    })

    const findArgs = mockSubscriptionFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).toEqual({})
  })

  it('trie par planPrice desc puis createdAt desc', async () => {
    await getSubscriptionsAdmin()

    const findArgs = mockSubscriptionFindMany.mock.calls[0]?.[0]
    expect(findArgs.orderBy).toEqual([
      { planPrice: 'desc' },
      { createdAt: 'desc' },
    ])
  })

  it('applique la pagination (page 2, taille 10)', async () => {
    await getSubscriptionsAdmin({ page: 2, pageSize: 10 })

    const findArgs = mockSubscriptionFindMany.mock.calls[0]?.[0]
    expect(findArgs.skip).toBe(10)
    expect(findArgs.take).toBe(10)
  })
})

describe('getPaymentsAdmin', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockPaymentFindMany.mockResolvedValue([PAYMENT_FIXTURE])
    mockPaymentCount.mockResolvedValue(1)
  })

  it('retourne les paiements mappés avec le total', async () => {
    const result = await getPaymentsAdmin()

    expect(result.total).toBe(1)
    expect(result.payments[0]).toMatchObject({
      id: 'pay-001',
      companyName: 'Acme Corp',
      amount: 2900,
      currency: 'EUR',
      status: 'SUCCEEDED',
      stripeInvoiceId: 'in_123',
      failureMessage: null,
    })
  })

  it('applique le filtre statut FAILED au WHERE', async () => {
    await getPaymentsAdmin({ status: 'FAILED' })

    const findArgs = mockPaymentFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).toEqual({ status: 'FAILED' })
  })

  it('ignore les statuts hors whitelist', async () => {
    await getPaymentsAdmin({ status: 'HACK' as never })

    const findArgs = mockPaymentFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).toEqual({})
  })

  it('trie du plus récent au plus ancien', async () => {
    await getPaymentsAdmin()

    const findArgs = mockPaymentFindMany.mock.calls[0]?.[0]
    expect(findArgs.orderBy).toEqual({ createdAt: 'desc' })
  })

  it('clamp la pagination : pageSize max 100, page min 1', async () => {
    await getPaymentsAdmin({ page: 0, pageSize: 500 })

    const findArgs = mockPaymentFindMany.mock.calls[0]?.[0]
    expect(findArgs.skip).toBe(0)
    expect(findArgs.take).toBe(100)
  })
})
