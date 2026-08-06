/**
 * Tests unitaires pour la route cron trial-emails
 *
 * @ticket SP-370
 * @description Vérifie l'authentification CRON_SECRET, le calcul
 * daysRemaining, et l'envoi des emails trial/expiration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks hoistés
// ============================================================================

const { mockSendTrialEndingSoon, mockSendTrialExpired, mockDifferenceInDays } =
  vi.hoisted(() => ({
    mockSendTrialEndingSoon: vi.fn().mockResolvedValue({ success: true }),
    mockSendTrialExpired: vi.fn().mockResolvedValue({ success: true }),
    mockDifferenceInDays: vi.fn().mockReturnValue(14),
  }))

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('@/lib/email/billing/format', () => ({
  formatAmountEuros: (cents: number) =>
    `${(cents / 100).toFixed(2).replace('.', ',')} €`,
}))

vi.mock('@/lib/email/templates/billing', () => ({
  sendTrialEndingSoonEmail: mockSendTrialEndingSoon,
  sendTrialExpiredEmail: mockSendTrialExpired,
}))

vi.mock('date-fns', () => ({
  differenceInDays: mockDifferenceInDays,
}))

// ============================================================================
// Imports (après mocks)
// ============================================================================

import { POST } from '@/app/api/cron/trial-emails/route'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// ============================================================================
// Helpers
// ============================================================================

function makeRequest(token?: string): NextRequest {
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return new NextRequest('http://localhost/api/cron/trial-emails', {
    method: 'POST',
    headers,
  })
}

function makeTrialCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: 'company-trial-1',
    name: 'Acme Trial',
    trialEndsAt: new Date('2026-03-01'),
    subscription: {
      id: 'sub-db-1',
      stripeSubscriptionId: 'sub_stripe_1',
      pricePerEmployee: 290,
    },
    users: [{ email: 'director@acme.fr', name: 'Jean Dupont' }],
    _count: { employees: 5 },
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('POST /api/cron/trial-emails', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.NEXT_PUBLIC_APP_URL = 'https://smartplanning.fr'
  })

  // ---- Auth tests ----

  it('retourne 401 si CRON_SECRET manquant dans env', async () => {
    delete process.env.CRON_SECRET
    const response = await POST(makeRequest('some-token'))
    expect(response.status).toBe(401)
  })

  it('retourne 401 si token invalide', async () => {
    const response = await POST(makeRequest('wrong-secret'))
    expect(response.status).toBe(401)
  })

  it('retourne 200 si CRON_SECRET valide', async () => {
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([])
    const response = await POST(makeRequest('test-cron-secret'))
    expect(response.status).toBe(200)
  })

  // ---- Trial reminder tests ----

  it('Company trial J-14 → sendTrialEndingSoonEmail appelé avec daysRemaining=14', async () => {
    mockDifferenceInDays.mockReturnValue(14)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledOnce()
    expect(mockSendTrialEndingSoon).toHaveBeenCalledWith(
      expect.objectContaining({
        daysRemaining: 14,
        companyId: 'company-trial-1',
      })
    )
  })

  it('Company trial J-7 → sendTrialEndingSoonEmail appelé', async () => {
    mockDifferenceInDays.mockReturnValue(7)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledWith(
      expect.objectContaining({ daysRemaining: 7 })
    )
  })

  it('Company trial J-3 → sendTrialEndingSoonEmail appelé', async () => {
    mockDifferenceInDays.mockReturnValue(3)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledOnce()
  })

  it('Company trial J-1 → sendTrialEndingSoonEmail appelé', async () => {
    mockDifferenceInDays.mockReturnValue(1)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledWith(
      expect.objectContaining({ daysRemaining: 1 })
    )
  })

  // ---- Trial expired test ----

  it('Company trial J0 (expiré) → sendTrialExpiredEmail appelé', async () => {
    mockDifferenceInDays.mockReturnValue(0)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialExpired).toHaveBeenCalledOnce()
    expect(mockSendTrialExpired).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-trial-1',
        recipientEmail: 'director@acme.fr',
      })
    )
  })

  // ---- Skip tests ----

  it('Company trial J-20 (pas de rappel) → aucun email envoyé, skipped++', async () => {
    mockDifferenceInDays.mockReturnValue(20)
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    const response = await POST(makeRequest('test-cron-secret'))
    const body = await response.json()

    expect(mockSendTrialEndingSoon).not.toHaveBeenCalled()
    expect(mockSendTrialExpired).not.toHaveBeenCalled()
    expect(body.skipped).toBe(1)
  })

  it('Company ACTIVE → ignorée (pas dans les résultats)', async () => {
    // Le filtre Prisma ne retourne que les TRIAL, donc on simule 0 companies
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([])

    const response = await POST(makeRequest('test-cron-secret'))
    const body = await response.json()

    expect(body.companiesProcessed).toBe(0)
    expect(mockSendTrialEndingSoon).not.toHaveBeenCalled()
  })

  it('Doublon → sendBillingEmail retourne skipped, compteur skipped++', async () => {
    mockDifferenceInDays.mockReturnValue(7)
    mockSendTrialEndingSoon.mockResolvedValue({ success: true, skipped: true })
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany()])

    const response = await POST(makeRequest('test-cron-secret'))
    const body = await response.json()

    expect(body.skipped).toBe(1)
    expect(body.sent).toBe(0)
  })

  it('Company sans director email → skipped avec detail', async () => {
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([makeTrialCompany({ users: [] })])

    const response = await POST(makeRequest('test-cron-secret'))
    const body = await response.json()

    expect(body.skipped).toBe(1)
    expect(body.details).toContain('Acme Trial: no director email')
  })

  // ---- Transition TRIAL → EXPIRED ----
  //
  // Rien ne faisait passer `Subscription.status` de TRIAL à EXPIRED une fois
  // `trialEndsAt` dépassée : l'espace admin listait comme « essais en cours »
  // des entreprises dont la période était terminée depuis des semaines.

  describe('bascule du statut en EXPIRED', () => {
    /** Essai fini, aucune souscription Stripe : le cas à corriger */
    function makeExpiredTrialCompany(overrides: Record<string, unknown> = {}) {
      return makeTrialCompany({
        subscription: {
          id: 'sub-db-1',
          stripeSubscriptionId: null,
          pricePerEmployee: 290,
        },
        ...overrides,
      })
    }

    it('essai terminé sans abonnement Stripe → subscription passée en EXPIRED', async () => {
      mockDifferenceInDays.mockReturnValue(0)
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([makeExpiredTrialCompany()])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-db-1' },
        data: { status: 'EXPIRED' },
      })
      expect(body.expired).toBe(1)
    })

    it("l'email d'expiration part avant la bascule (sinon il ne partirait jamais)", async () => {
      mockDifferenceInDays.mockReturnValue(0)
      const callOrder: string[] = []
      mockSendTrialExpired.mockImplementation(() => {
        callOrder.push('email')
        return Promise.resolve({ success: true })
      })
      ;(
        prismaMock.subscription.update as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callOrder.push('update')
        return Promise.resolve({})
      })
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([makeExpiredTrialCompany()])

      await POST(makeRequest('test-cron-secret'))

      expect(callOrder).toEqual(['email', 'update'])
    })

    it('essai en cours → statut inchangé', async () => {
      mockDifferenceInDays.mockReturnValue(7)
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([makeExpiredTrialCompany()])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(body.expired).toBe(0)
    })

    it('abonnement Stripe existant → statut laissé aux webhooks', async () => {
      mockDifferenceInDays.mockReturnValue(0)
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeTrialCompany(), // stripeSubscriptionId: 'sub_stripe_1'
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(body.expired).toBe(0)
    })

    it('company sans directeur joignable → statut corrigé quand même', async () => {
      mockDifferenceInDays.mockReturnValue(0)
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([makeExpiredTrialCompany({ users: [] })])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).toHaveBeenCalledOnce()
      expect(body.expired).toBe(1)
      expect(body.skipped).toBe(1)
    })
  })
})
