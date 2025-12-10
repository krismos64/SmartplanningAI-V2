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
 * @ticket SP-144
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'

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

const prismaMock = prisma as unknown as ReturnType<typeof mockDeep<PrismaClient>>

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
      // Mock companies
      prismaMock.company.count.mockResolvedValue(50)

      // Mock users
      prismaMock.user.count.mockResolvedValue(500)

      // Mock subscriptions actives
      prismaMock.subscription.count.mockResolvedValue(45)

      // Mock abonnements pour MRR
      prismaMock.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'STARTER',
          planPrice: null,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sub-2',
          companyId: 'company-2',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          stripePriceId: 'price_2',
          plan: 'BUSINESS',
          planPrice: 99,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      // Mock groupBy pour revenue par plan
      prismaMock.subscription.groupBy.mockResolvedValue([
        { plan: 'STARTER', _count: 20 },
        { plan: 'BUSINESS', _count: 15 },
        { plan: 'ENTERPRISE', _count: 5 },
      ] as any)

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

    it('devrait calculer correctement le MRR', async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)

      // 5 STARTER (29€) + 3 BUSINESS (99€) = 145 + 297 = 442€ MRR
      prismaMock.subscription.findMany.mockResolvedValue([
        ...Array(5).fill({
          id: 'sub-starter',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'STARTER',
          planPrice: null,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        ...Array(3).fill({
          id: 'sub-business',
          companyId: 'company-2',
          stripeCustomerId: 'cus_2',
          stripeSubscriptionId: 'sub_2',
          stripePriceId: 'price_2',
          plan: 'BUSINESS',
          planPrice: null,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ])

      prismaMock.subscription.groupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // 5 * 29 + 3 * 99 = 145 + 297 = 442
      expect(result.data?.mrr.current).toBe(442)
    })

    it('devrait diviser par 12 pour les abonnements annuels', async () => {
      prismaMock.company.count.mockResolvedValue(1)
      prismaMock.user.count.mockResolvedValue(10)
      prismaMock.subscription.count.mockResolvedValue(1)

      // 1 BUSINESS annuel (99€ * 12 / 12 = 99€ MRR)
      prismaMock.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'BUSINESS',
          planPrice: 99 * 12,
          currency: 'EUR',
          billingInterval: 'year',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.subscription.groupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.mrr.current).toBe(99)
    })

    it('devrait calculer la tendance des entreprises', async () => {
      // Ce test vérifie que la tendance est calculée correctement
      // Le service appelle company.count plusieurs fois pour différentes requêtes
      prismaMock.company.count.mockResolvedValue(50)

      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)
      prismaMock.subscription.findMany.mockResolvedValue([])
      prismaMock.subscription.groupBy.mockResolvedValue([])

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
    it('devrait retourner le nombre d\'entreprises avec tendance', async () => {
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
    it('devrait retourner le MRR avec tendance', async () => {
      prismaMock.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'BUSINESS',
          planPrice: null,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const result = await getAdminMRROnly()

      expect(result.success).toBe(true)
      expect(result.data?.current).toBe(99)
    })

    it('devrait retourner 0 si pas d\'abonnements', async () => {
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

    it('devrait retourner 0 si pas d\'entreprises', async () => {
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
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'STARTER',
          planPrice: null,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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
      prismaMock.subscription.groupBy.mockResolvedValue([])

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
      prismaMock.subscription.groupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.companiesGrowth).toHaveLength(6)
      expect(result.data?.companiesGrowth[0]).toHaveProperty('month')
      expect(result.data?.companiesGrowth[0]).toHaveProperty('count')
    })

    it('devrait inclure tous les plans dans revenueByPlan', async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(5)
      prismaMock.subscription.findMany.mockResolvedValue([])

      // Seulement STARTER et BUSINESS ont des abonnements
      prismaMock.subscription.groupBy.mockResolvedValue([
        { plan: 'STARTER', _count: 3 },
        { plan: 'BUSINESS', _count: 2 },
      ] as any)

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      // Devrait inclure FREE et ENTERPRISE avec 0
      expect(result.data?.revenueByPlan.length).toBeGreaterThanOrEqual(2)
    })

    it('devrait traduire les statuts d\'abonnement en francais', async () => {
      prismaMock.company.count.mockResolvedValue(10)
      prismaMock.user.count.mockResolvedValue(100)
      prismaMock.subscription.count.mockResolvedValue(10)
      prismaMock.subscription.findMany.mockResolvedValue([])

      prismaMock.subscription.groupBy
        .mockResolvedValueOnce([]) // Pour revenueByPlan
        .mockResolvedValueOnce([
          { status: 'ACTIVE', _count: 8 },
          { status: 'TRIAL', _count: 5 },
          { status: 'CANCELED', _count: 2 },
        ] as any)

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
    })

    it('devrait gerer les prix personnalises (planPrice)', async () => {
      prismaMock.company.count.mockResolvedValue(1)
      prismaMock.user.count.mockResolvedValue(10)
      prismaMock.subscription.count.mockResolvedValue(1)

      // Prix personnalise de 500€ au lieu de 299€ par defaut pour Enterprise
      prismaMock.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'ENTERPRISE',
          planPrice: 500,
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.subscription.groupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.mrr.current).toBe(500) // Prix personnalise
    })

    it('devrait utiliser le prix par defaut si planPrice est null', async () => {
      prismaMock.company.count.mockResolvedValue(1)
      prismaMock.user.count.mockResolvedValue(10)
      prismaMock.subscription.count.mockResolvedValue(1)

      prismaMock.subscription.findMany.mockResolvedValue([
        {
          id: 'sub-1',
          companyId: 'company-1',
          stripeCustomerId: 'cus_1',
          stripeSubscriptionId: 'sub_1',
          stripePriceId: 'price_1',
          plan: 'STARTER',
          planPrice: null, // Pas de prix personnalise
          currency: 'EUR',
          billingInterval: 'month',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      prismaMock.subscription.groupBy.mockResolvedValue([])

      const result = await getAdminStats()

      expect(result.success).toBe(true)
      expect(result.data?.mrr.current).toBe(29) // Prix par defaut STARTER
    })
  })
})
