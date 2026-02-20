/**
 * Tests unitaires pour le service MRR (Monthly Recurring Revenue)
 *
 * Couvre :
 * - Liste vide → 0
 * - Plan FREE → 0
 * - PER_SEAT mensuel → calcul correct
 * - PER_SEAT annuel → division par 12
 * - Mix FREE + PER_SEAT
 * - billingInterval null → traite comme mensuel
 * - Sommation de plusieurs PER_SEAT
 * - getCurrentMrr() avec mock Prisma
 *
 * @ticket SP-469
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma
const mockFindMany = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

import { calculateMrrFromSubscriptions, getCurrentMrr } from '../mrr.service'
import type { MrrSubscription } from '../mrr.service'

// ============================================================================
// Tests — calculateMrrFromSubscriptions
// ============================================================================

describe('calculateMrrFromSubscriptions', () => {
  // 1. Liste vide
  it('retourne 0 pour une liste vide', () => {
    expect(calculateMrrFromSubscriptions([])).toBe(0)
  })

  // 2. Plan FREE
  it('retourne 0 pour un plan FREE', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'FREE',
        quantity: 10,
        pricePerEmployee: 290,
        billingInterval: null,
      },
    ]
    expect(calculateMrrFromSubscriptions(subs)).toBe(0)
  })

  // 3. PER_SEAT mensuel — 5 employes a 290 centimes → 14.5€
  it('calcule correctement un PER_SEAT mensuel', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'PER_SEAT',
        quantity: 5,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
    ]
    expect(calculateMrrFromSubscriptions(subs)).toBe(14.5)
  })

  // 4. PER_SEAT annuel — 5 employes a 3480 centimes/an → 14.5€/mois
  it('divise par 12 pour un PER_SEAT annuel', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'PER_SEAT',
        quantity: 5,
        pricePerEmployee: 3480,
        billingInterval: 'year',
      },
    ]
    // (5 * 3480) / 12 / 100 = 17400 / 12 / 100 = 1450 / 100 = 14.5
    expect(calculateMrrFromSubscriptions(subs)).toBe(14.5)
  })

  // 5. Mix FREE + PER_SEAT → seul PER_SEAT compte
  it('ignore les plans FREE dans un mix', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'FREE',
        quantity: 3,
        pricePerEmployee: 290,
        billingInterval: null,
      },
      {
        plan: 'PER_SEAT',
        quantity: 10,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
    ]
    // Seul PER_SEAT : (10 * 290) / 100 = 29€
    expect(calculateMrrFromSubscriptions(subs)).toBe(29)
  })

  // 6. billingInterval null → traite comme mensuel
  it('traite billingInterval null comme mensuel', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'PER_SEAT',
        quantity: 5,
        pricePerEmployee: 290,
        billingInterval: null,
      },
    ]
    // (5 * 290) / 100 = 14.5€
    expect(calculateMrrFromSubscriptions(subs)).toBe(14.5)
  })

  // 7. Sommation de plusieurs PER_SEAT
  it('additionne correctement plusieurs abonnements PER_SEAT', () => {
    const subs: MrrSubscription[] = [
      {
        plan: 'PER_SEAT',
        quantity: 5,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
      {
        plan: 'PER_SEAT',
        quantity: 10,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
      {
        plan: 'PER_SEAT',
        quantity: 3,
        pricePerEmployee: 290,
        billingInterval: 'year',
      },
    ]
    // Sub 1 : (5 * 290) / 100 = 14.5
    // Sub 2 : (10 * 290) / 100 = 29
    // Sub 3 : (3 * 290) / 12 / 100 = 870 / 12 / 100 = 72.5 / 100 = 0.725
    expect(calculateMrrFromSubscriptions(subs)).toBeCloseTo(44.225, 3)
  })
})

// ============================================================================
// Tests — getCurrentMrr
// ============================================================================

describe('getCurrentMrr', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 8. getCurrentMrr retourne le total via Prisma
  it('retourne le MRR total depuis les abonnements ACTIVE', async () => {
    mockFindMany.mockResolvedValue([
      {
        plan: 'PER_SEAT',
        quantity: 5,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
      {
        plan: 'PER_SEAT',
        quantity: 10,
        pricePerEmployee: 290,
        billingInterval: 'month',
      },
    ])

    const mrr = await getCurrentMrr()

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { status: 'ACTIVE' },
      select: {
        plan: true,
        quantity: true,
        pricePerEmployee: true,
        billingInterval: true,
      },
    })
    // (5*290 + 10*290) / 100 = (1450 + 2900) / 100 = 43.5
    expect(mrr).toBe(43.5)
  })

  it('retourne 0 quand aucun abonnement actif', async () => {
    mockFindMany.mockResolvedValue([])

    const mrr = await getCurrentMrr()

    expect(mrr).toBe(0)
  })
})
