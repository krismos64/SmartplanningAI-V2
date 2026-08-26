/**
 * Tests unitaires pour la route cron trial-emails
 *
 * @ticket SP-370
 * @description Vérifie l'authentification CRON_SECRET, le calcul
 * daysRemaining, et l'envoi des emails trial/expiration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks hoistés
// ============================================================================

const { mockSendTrialEndingSoon, mockSendTrialExpired } = vi.hoisted(() => ({
  mockSendTrialEndingSoon: vi.fn().mockResolvedValue({ success: true }),
  mockSendTrialExpired: vi.fn().mockResolvedValue({ success: true }),
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

/**
 * Instant figé pour tous les tests, afin que `trialEndsAt` soit calculé par
 * rapport à une horloge stable. Correspond à un passage du cron de 08h00 UTC.
 */
const NOW = new Date('2026-08-26T08:00:00.000Z')

const MS_PER_DAY = 86_400_000

/**
 * Construit une date de fin d'essai située à `heures` de NOW.
 *
 * Les tests pilotent désormais le temps réel plutôt qu'un mock de date-fns :
 * le calcul de `daysRemaining` vit dans la route et doit être exercé, pas
 * court-circuité.
 */
function trialEndingIn(heures: number): Date {
  return new Date(NOW.getTime() + heures * 3_600_000)
}

/** Date de fin d'essai à N jours pleins de NOW */
function trialEndingInDays(jours: number): Date {
  return new Date(NOW.getTime() + jours * MS_PER_DAY)
}

function makeTrialCompany(overrides: Record<string, unknown> = {}) {
  return {
    id: 'company-trial-1',
    name: 'Acme Trial',
    trialEndsAt: trialEndingInDays(14),
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
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.NEXT_PUBLIC_APP_URL = 'https://smartplanning.fr'
  })

  afterEach(() => {
    vi.useRealTimers()
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
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(14) }),
    ])

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
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(7) }),
    ])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledWith(
      expect.objectContaining({ daysRemaining: 7 })
    )
  })

  it('Company trial J-3 → sendTrialEndingSoonEmail appelé', async () => {
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(3) }),
    ])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledOnce()
  })

  it('Company trial J-1 → sendTrialEndingSoonEmail appelé', async () => {
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(1) }),
    ])

    await POST(makeRequest('test-cron-secret'))

    expect(mockSendTrialEndingSoon).toHaveBeenCalledWith(
      expect.objectContaining({ daysRemaining: 1 })
    )
  })

  // ---- Trial expired test ----

  it('Company trial J0 (expiré) → sendTrialExpiredEmail appelé', async () => {
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(0) }),
    ])

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
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(20) }),
    ])

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
    mockSendTrialEndingSoon.mockResolvedValue({ success: true, skipped: true })
    ;(
      prismaMock.company.findMany as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      makeTrialCompany({ trialEndsAt: trialEndingInDays(7) }),
    ])

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
        // Essai terminé depuis une heure, conforme au nom du helper : sans
        // cette date le défaut à 14 jours produisait un essai en cours.
        trialEndsAt: trialEndingIn(-1),
        subscription: {
          id: 'sub-db-1',
          stripeSubscriptionId: null,
          pricePerEmployee: 290,
        },
        ...overrides,
      })
    }

    it('essai terminé sans abonnement Stripe → subscription passée en EXPIRED', async () => {
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeExpiredTrialCompany({ trialEndsAt: trialEndingIn(-1) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-db-1' },
        data: { status: 'EXPIRED' },
      })
      expect(body.expired).toBe(1)
    })

    it("l'email d'expiration part avant la bascule (sinon il ne partirait jamais)", async () => {
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

    it('essai à 7 heures de la fin → statut inchangé, la dernière journée est due', async () => {
      // Cas de production du 26 août 2026 : cron de 08h00 UTC, essai expirant
      // à 15h05. `differenceInDays` tronquait à 0 et le compte passait en
      // EXPIRED avec 7 heures d'essai encore devant lui. Le dirigeant se
      // retrouvait bloqué le jour même où il venait souscrire.
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeExpiredTrialCompany({ trialEndsAt: trialEndingIn(7) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(mockSendTrialExpired).not.toHaveBeenCalled()
      expect(body.expired).toBe(0)
    })

    it('essai expiré depuis une minute → bascule en EXPIRED', async () => {
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeExpiredTrialCompany({ trialEndsAt: trialEndingIn(-1 / 60) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-db-1' },
        data: { status: 'EXPIRED' },
      })
      expect(body.expired).toBe(1)
    })

    it('essai en cours → statut inchangé', async () => {
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeExpiredTrialCompany({ trialEndsAt: trialEndingInDays(7) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(body.expired).toBe(0)
    })

    it('abonnement Stripe existant → statut laissé aux webhooks', async () => {
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        // stripeSubscriptionId: 'sub_stripe_1', essai terminé
        makeTrialCompany({ trialEndsAt: trialEndingIn(-1) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).not.toHaveBeenCalled()
      expect(body.expired).toBe(0)
    })

    it('company sans directeur joignable → statut corrigé quand même', async () => {
      ;(
        prismaMock.company.findMany as ReturnType<typeof vi.fn>
      ).mockResolvedValue([
        makeExpiredTrialCompany({ users: [], trialEndsAt: trialEndingIn(-1) }),
      ])

      const response = await POST(makeRequest('test-cron-secret'))
      const body = await response.json()

      expect(prismaMock.subscription.update).toHaveBeenCalledOnce()
      expect(body.expired).toBe(1)
      expect(body.skipped).toBe(1)
    })
  })
})
