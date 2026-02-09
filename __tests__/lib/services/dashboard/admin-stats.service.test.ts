/**
 * Tests unitaires pour admin-stats.service.ts
 *
 * Teste les fonctions du service Admin (SYSTEM_ADMIN) :
 * - getAdminStats (complet)
 * - getAdminCompanyCountOnly
 * - getAdminMRROnly
 * - getAdminChurnRateOnly
 * - getAdminQuickStats
 *
 * @ticket SP-144, SP-350
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient, SubscriptionPlan, SubscriptionStatus } from '@prisma/client'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

import { prisma } from '@/lib/prisma'
import {
  getAdminStats,
  getAdminCompanyCountOnly,
  getAdminMRROnly,
  getAdminChurnRateOnly,
  getAdminQuickStats,
} from '@/lib/services/dashboard/admin-stats.service'

const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>

// Helper : groupBy a une signature trop complexe pour mockDeep
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockGroupBy = prismaMock.subscription.groupBy as any

/** Factory pour un mock Subscription complet */
function mockSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-1',
    companyId: 'company-1',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1' as string | null,
    stripePriceId: 'price_1' as string | null,
    stripeProductId: null as string | null,
    plan: 'PER_SEAT' as SubscriptionPlan,
    planPrice: 2900,
    quantity: 10,
    pricePerEmployee: 290,
    currency: 'EUR',
    billingInterval: 'month' as string | null,
    status: 'ACTIVE' as SubscriptionStatus,
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    cancelAtPeriodEnd: false,
    canceledAt: null as Date | null,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('admin-stats.service', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-06-15T10:00:00'))
  })

  // ==========================================================================
  // getAdminStats
  // ==========================================================================

  describe('getAdminStats', () => {
    it('devrait retourner les stats completes de la plateforme', async () => {
      prismaMock.company.count.mockResolvedValue(50)
      prismaMock.user.count.mockResolvedValue(500)
      prismaMock.subscription.count.mockResolvedValue(45)
      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription(),
      ])
      mockGroupBy.mockResolvedValue([
        { status: 'ACTIVE', _count: 40 },
        { status: 'TRIAL', _count: 5 },
      ])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.totalCompanies).toBeDefined()
      expect(result.data?.totalUsers).toBeDefined()
      expect(result.data?.activeSubscriptions).toBe(45)
      expect(result.data?.mrr).toBeDefined()
      expect(result.data?.churnRate).toBeDefined()
      expect(result.data?.companiesGrowth).toBeDefined()
      expect(result.data?.revenueByPlan).toBeDefined()
      expect(result.data?.subscriptionStatusDistribution).toBeDefined()
    })

    it('devrait calculer correctement le MRR per-seat', async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)

      // 2 abonnements PER_SEAT: 10×290c + 5×290c = 4350c = 43.50€
      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({ id: 'sub-1', quantity: 10 }),
        mockSubscription({
          id: 'sub-2',
          companyId: 'company-2',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          stripePriceId: 'price_2',
          planPrice: 1450,
          quantity: 5,
        }),
      ])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // (10 × 290 + 5 × 290) / 100 = 43.50€
      expect(result.data?.mrr.current).toBe(43.5)
    })

    it('devrait ignorer les abonnements FREE dans le MRR', async () => {
      prismaMock.company.count.mockResolvedValue(2)
      prismaMock.user.count.mockResolvedValue(20)
      prismaMock.subscription.count.mockResolvedValue(2)

      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({
          id: 'sub-free',
          stripeCustomerId: 'cus_free',
          plan: 'FREE',
          planPrice: 0,
          quantity: 5,
          pricePerEmployee: 0,
        }),
        mockSubscription({
          id: 'sub-paid',
          companyId: 'company-2',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          stripePriceId: 'price_2',
          quantity: 10,
        }),
      ])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // Seulement PER_SEAT: 10 × 290 / 100 = 29€
      expect(result.data?.mrr.current).toBe(29)
    })

    it('devrait diviser par 12 pour les abonnements annuels', async () => {
      prismaMock.company.count.mockResolvedValue(1)
      prismaMock.user.count.mockResolvedValue(10)
      prismaMock.subscription.count.mockResolvedValue(1)

      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({
          planPrice: 34800,
          quantity: 10,
          billingInterval: 'year',
        }),
      ])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // (10 × 290) / 12 / 100 ≈ 2.4167€
      const expectedMRR = (10 * 290) / 12 / 100
      expect(result.data?.mrr.current).toBeCloseTo(expectedMRR, 2)
    })

    it('devrait calculer la tendance des entreprises', async () => {
      prismaMock.company.count.mockResolvedValue(50)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)
      prismaMock.subscription.findMany.mockResolvedValue([])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.totalCompanies.current).toBe(50)
      // La tendance est 0% car current == previous (même mock value)
      expect(result.data?.totalCompanies.trend).toBe(0)
    })

    it('devrait gerer les erreurs Prisma', async () => {
      prismaMock.company.count.mockRejectedValue(
        new Error('Database connection error')
      )

      const result = await getAdminStats()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Database connection error')
    })
  })

  // ==========================================================================
  // getAdminCompanyCountOnly
  // ==========================================================================

  describe('getAdminCompanyCountOnly', () => {
    it("devrait retourner le nombre d'entreprises avec tendance", async () => {
      prismaMock.company.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80)

      const result = await getAdminCompanyCountOnly()

      expect(result.success).toBe(true)
      expect(result.data?.current).toBe(100)
      expect(result.data?.trend).toBe(25)
    })

    it('devrait retourner 0% de tendance si pas de changement', async () => {
      prismaMock.company.count.mockResolvedValue(50)

      const result = await getAdminCompanyCountOnly()

      expect(result.success).toBe(true)
      expect(result.data?.trend).toBe(0)
    })
  })

  // ==========================================================================
  // getAdminMRROnly
  // ==========================================================================

  describe('getAdminMRROnly', () => {
    it('devrait retourner le MRR per-seat avec tendance', async () => {
      // 10 employés × 290 centimes = 2900 centimes = 29€
      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({ quantity: 10 }),
      ])

      const result = await getAdminMRROnly()

      expect(result.success).toBe(true)
      expect(result.data?.current).toBe(29)
    })

    it("devrait retourner 0 si pas d'abonnements", async () => {
      prismaMock.subscription.findMany.mockResolvedValue([])

      const result = await getAdminMRROnly()

      expect(result.success).toBe(true)
      expect(result.data?.current).toBe(0)
    })
  })

  // ==========================================================================
  // getAdminChurnRateOnly
  // ==========================================================================

  describe('getAdminChurnRateOnly', () => {
    it('devrait calculer le taux de churn', async () => {
      // 100 entreprises au debut, 5 annulees = 5%
      prismaMock.company.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(5)

      const result = await getAdminChurnRateOnly()

      expect(result.success).toBe(true)
      expect(result.data).toBe(5)
    })

    it('devrait retourner 0 si aucune annulation', async () => {
      prismaMock.company.count.mockResolvedValue(50)
      prismaMock.subscription.count.mockResolvedValue(0)

      const result = await getAdminChurnRateOnly()

      expect(result.success).toBe(true)
      expect(result.data).toBe(0)
    })

    it("devrait retourner 0 si pas d'entreprises", async () => {
      prismaMock.company.count.mockResolvedValue(0)
      prismaMock.subscription.count.mockResolvedValue(0)

      const result = await getAdminChurnRateOnly()

      expect(result.success).toBe(true)
      expect(result.data).toBe(0)
    })
  })

  // ==========================================================================
  // getAdminQuickStats
  // ==========================================================================

  describe('getAdminQuickStats', () => {
    it('devrait retourner les 4 metriques principales', async () => {
      prismaMock.company.count.mockResolvedValue(50)
      prismaMock.user.count.mockResolvedValue(500)
      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({ quantity: 10 }),
      ])
      prismaMock.subscription.count.mockResolvedValue(0)

      const result = await getAdminQuickStats()

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('companies')
      expect(result.data).toHaveProperty('users')
      expect(result.data).toHaveProperty('mrr')
      expect(result.data).toHaveProperty('churn')
      expect(result.data?.companies).toBe(50)
      expect(result.data?.users).toBe(500)
    })
  })

  // ==========================================================================
  // Edge cases
  // ==========================================================================

  describe('Edge cases', () => {
    it('devrait gerer une plateforme vide', async () => {
      prismaMock.company.count.mockResolvedValue(0)
      prismaMock.user.count.mockResolvedValue(0)
      prismaMock.subscription.count.mockResolvedValue(0)
      prismaMock.subscription.findMany.mockResolvedValue([])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.totalCompanies.current).toBe(0)
      expect(result.data?.totalUsers.current).toBe(0)
      expect(result.data?.activeSubscriptions).toBe(0)
      expect(result.data?.mrr.current).toBe(0)
    })

    it('devrait retourner la croissance sur 6 mois', async () => {
      prismaMock.company.count.mockResolvedValue(50)
      prismaMock.user.count.mockResolvedValue(500)
      prismaMock.subscription.count.mockResolvedValue(45)
      prismaMock.subscription.findMany.mockResolvedValue([])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.companiesGrowth).toHaveLength(6)
      expect(result.data?.companiesGrowth[0]).toHaveProperty('month')
      expect(result.data?.companiesGrowth[0]).toHaveProperty('count')
    })

    it('devrait inclure FREE et PER_SEAT dans revenueByPlan (SP-350)', async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(5)
      prismaMock.subscription.findMany.mockResolvedValue([])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.revenueByPlan).toHaveLength(2)
      const planNames = result.data?.revenueByPlan.map((r: { plan: string }) => r.plan)
      expect(planNames).toContain('Gratuit')
      expect(planNames).toContain('Per-seat')
    })

    it("devrait traduire les statuts d'abonnement en francais", async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)
      prismaMock.subscription.findMany.mockResolvedValue([])

      mockGroupBy.mockResolvedValueOnce([
        { status: 'ACTIVE', _count: 8 },
        { status: 'TRIAL', _count: 5 },
        { status: 'CANCELED', _count: 2 },
        { status: 'INCOMPLETE', _count: 1 },
      ])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.subscriptionStatusDistribution).toContainEqual({
        status: 'Actif',
        count: 8,
      })
      expect(result.data?.subscriptionStatusDistribution).toContainEqual({
        status: 'Essai',
        count: 5,
      })
      expect(result.data?.subscriptionStatusDistribution).toContainEqual({
        status: 'Annulé',
        count: 2,
      })
      expect(result.data?.subscriptionStatusDistribution).toContainEqual({
        status: 'Incomplet',
        count: 1,
      })
    })

    it('devrait calculer le MRR per-seat correctement avec quantities variées', async () => {
      prismaMock.company.count.mockResolvedValue(3)
      prismaMock.user.count.mockResolvedValue(30)
      prismaMock.subscription.count.mockResolvedValue(3)

      // 3 abonnements: 10×290 + 20×290 + 50×290 = 23200c = 232€
      prismaMock.subscription.findMany.mockResolvedValue([
        mockSubscription({ id: 'sub-1', companyId: 'c1', stripeCustomerId: 'cus_1' }),
        mockSubscription({
          id: 'sub-2',
          companyId: 'c2',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          stripePriceId: 'p2',
          planPrice: 5800,
          quantity: 20,
        }),
        mockSubscription({
          id: 'sub-3',
          companyId: 'c3',
          stripeCustomerId: 'cus_3',
          stripeSubscriptionId: 'sub_3',
          stripePriceId: 'p3',
          planPrice: 14500,
          quantity: 50,
        }),
      ])
      mockGroupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // (10+20+50) × 290 / 100 = 232€
      expect(result.data?.mrr.current).toBe(232)
    })
  })
})
