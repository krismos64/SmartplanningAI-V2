/**
 * Tests unitaires pour les Server Actions admin-trials.
 *
 * Couvre :
 * - RBAC : non-connecté, rôles insuffisants (DIRECTOR, MANAGER, EMPLOYEE),
 *   SYSTEM_ADMIN autorisé
 * - getTrialsAtRisk : périmètre de la requête, signaux d'engagement remontés,
 *   cas du directeur absent
 * - extendTrial : RBAC et prolongation de 7 jours
 *
 * @ticket SP-473, SP-562
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

const mockCompanyFindMany = vi.fn()
const mockCompanyFindUnique = vi.fn()
const mockCompanyUpdate = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    company: {
      findMany: (...args: unknown[]) => mockCompanyFindMany(...args),
      findUnique: (...args: unknown[]) => mockCompanyFindUnique(...args),
      update: (...args: unknown[]) => mockCompanyUpdate(...args),
    },
  },
}))

import { getTrialsAtRisk, extendTrial } from '../admin-trials'
import { MS_PER_DAY } from '@/lib/billing/trial-engagement'

// ============================================================================
// Helpers
// ============================================================================

const adminSession = { user: { id: 'admin1', role: 'SYSTEM_ADMIN' } }

/** Company telle que la retourne le select de getTrialsAtRisk */
function buildCompany(
  overrides: {
    id?: string
    name?: string
    daysUntilEnd?: number
    employees?: number
    schedules?: number
    daysSinceLogin?: number | null
    withDirector?: boolean
  } = {}
) {
  const {
    id = 'cmp1',
    name = 'Entreprise Test',
    daysUntilEnd = 3,
    employees = 5,
    schedules = 20,
    daysSinceLogin = 1,
    withDirector = true,
  } = overrides

  return {
    id,
    name,
    trialEndsAt: new Date(Date.now() + daysUntilEnd * MS_PER_DAY),
    _count: { employees, schedules },
    users: withDirector
      ? [
          {
            email: 'direction@test.fr',
            lastLoginAt:
              daysSinceLogin === null
                ? null
                : new Date(Date.now() - daysSinceLogin * MS_PER_DAY),
          },
        ]
      : [],
  }
}

/**
 * Récupère l'unique essai attendu. Échoue explicitement si la liste est vide,
 * plutôt que de laisser un `undefined` produire une erreur obscure plus loin.
 */
async function getSingleTrial() {
  const trials = await getTrialsAtRisk()
  expect(trials).toHaveLength(1)
  const trial = trials[0]
  if (!trial) throw new Error('aucun essai retourné')
  return trial
}

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
  mockCompanyFindMany.mockResolvedValue([])
})

// ============================================================================
// RBAC — tests négatifs obligatoires
// ============================================================================

describe('getTrialsAtRisk — RBAC', () => {
  it('rejette un utilisateur non connecté', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(getTrialsAtRisk()).rejects.toThrow('Unauthorized')
    expect(mockCompanyFindMany).not.toHaveBeenCalled()
  })

  it.each(['DIRECTOR', 'MANAGER', 'EMPLOYEE'])(
    'rejette le rôle %s et ne lit aucune donnée',
    async (role) => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', role } })
      await expect(getTrialsAtRisk()).rejects.toThrow('Unauthorized')
      expect(mockCompanyFindMany).not.toHaveBeenCalled()
    }
  )

  it('autorise SYSTEM_ADMIN', async () => {
    await expect(getTrialsAtRisk()).resolves.toEqual([])
    expect(mockCompanyFindMany).toHaveBeenCalledTimes(1)
  })
})

describe('extendTrial — RBAC', () => {
  it('rejette un utilisateur non connecté sans écrire', async () => {
    mockAuth.mockResolvedValue(null)
    await expect(extendTrial('cmp1')).rejects.toThrow('Unauthorized')
    expect(mockCompanyUpdate).not.toHaveBeenCalled()
  })

  it.each(['DIRECTOR', 'MANAGER', 'EMPLOYEE'])(
    'rejette le rôle %s sans écrire',
    async (role) => {
      mockAuth.mockResolvedValue({ user: { id: 'u1', role } })
      await expect(extendTrial('cmp1')).rejects.toThrow('Unauthorized')
      expect(mockCompanyUpdate).not.toHaveBeenCalled()
    }
  )
})

// ============================================================================
// Périmètre de la requête
// ============================================================================

describe('getTrialsAtRisk — périmètre', () => {
  it('ne sélectionne que les essais actifs expirant sous 7 jours', async () => {
    await getTrialsAtRisk()

    const where = mockCompanyFindMany.mock.calls[0]?.[0]?.where
    expect(where.subscription).toEqual({ status: 'TRIAL' })
    expect(where.isActive).toBe(true)
    expect(where.trialEndsAt.gte).toBeInstanceOf(Date)
    expect(where.trialEndsAt.lte).toBeInstanceOf(Date)

    // La borne haute vaut bien 7 jours après la borne basse.
    const spanMs =
      where.trialEndsAt.lte.getTime() - where.trialEndsAt.gte.getTime()
    expect(Math.round(spanMs / MS_PER_DAY)).toBe(7)
  })

  it('compte les plannings et lit lastLoginAt du directeur', async () => {
    await getTrialsAtRisk()

    const select = mockCompanyFindMany.mock.calls[0]?.[0]?.select
    expect(select._count.select.schedules).toBe(true)
    expect(select.users.select.lastLoginAt).toBe(true)
    expect(select.users.where).toEqual({ role: 'DIRECTOR' })
  })
})

// ============================================================================
// Signaux d'engagement
// ============================================================================

describe('getTrialsAtRisk — signaux d engagement', () => {
  it('remonte un compte actif avec son usage réel', async () => {
    mockCompanyFindMany.mockResolvedValue([
      buildCompany({
        name: 'Beynost Evasion',
        employees: 10,
        schedules: 513,
        daysSinceLogin: 1,
        daysUntilEnd: 2,
      }),
    ])

    const trial = await getSingleTrial()

    expect(trial.scheduleCount).toBe(513)
    expect(trial.daysSinceLastLogin).toBe(1)
    expect(trial.engagement).toBe('active')
    expect(trial.urgency).toBe('critical')
  })

  it('distingue un compte vide expirant le même jour', async () => {
    mockCompanyFindMany.mockResolvedValue([
      buildCompany({
        name: 'Samba',
        employees: 1,
        schedules: 0,
        daysSinceLogin: 12,
        daysUntilEnd: 2,
      }),
    ])

    const trial = await getSingleTrial()

    expect(trial.scheduleCount).toBe(0)
    expect(trial.engagement).toBe('never_started')
    // Même échéance que le compte actif ci-dessus, urgence différente.
    expect(trial.urgency).toBe('warning')
  })

  it('signale un décrochage sur un compte qui avait démarré', async () => {
    mockCompanyFindMany.mockResolvedValue([
      buildCompany({
        employees: 4,
        schedules: 43,
        daysSinceLogin: 20,
        daysUntilEnd: 7,
      }),
    ])

    const trial = await getSingleTrial()

    expect(trial.engagement).toBe('disengaged')
    // Sans le signal d'engagement, ce compte serait resté en info.
    expect(trial.urgency).toBe('warning')
  })

  it('gère un directeur jamais connecté', async () => {
    mockCompanyFindMany.mockResolvedValue([
      buildCompany({ daysSinceLogin: null, employees: 3, schedules: 10 }),
    ])

    const trial = await getSingleTrial()

    expect(trial.lastLoginAt).toBeNull()
    expect(trial.daysSinceLastLogin).toBeNull()
    expect(trial.engagement).toBe('never_started')
  })

  it('gère une entreprise sans directeur sans lever', async () => {
    mockCompanyFindMany.mockResolvedValue([
      buildCompany({ withDirector: false }),
    ])

    const trial = await getSingleTrial()

    expect(trial.ownerEmail).toBeNull()
    expect(trial.daysSinceLastLogin).toBeNull()
    expect(trial.engagement).toBe('never_started')
  })
})

// ============================================================================
// extendTrial
// ============================================================================

describe('extendTrial', () => {
  it('prolonge de 7 jours à partir de la fin d essai existante', async () => {
    const trialEndsAt = new Date('2026-08-20T10:00:00Z')
    mockCompanyFindUnique.mockResolvedValue({ trialEndsAt })
    mockCompanyUpdate.mockResolvedValue({})

    await extendTrial('cmp1')

    const data = mockCompanyUpdate.mock.calls[0]?.[0]?.data
    expect(data.trialEndsAt.getTime()).toBe(
      trialEndsAt.getTime() + 7 * MS_PER_DAY
    )
  })

  it('refuse une entreprise sans essai', async () => {
    mockCompanyFindUnique.mockResolvedValue({ trialEndsAt: null })
    await expect(extendTrial('cmp1')).rejects.toThrow()
    expect(mockCompanyUpdate).not.toHaveBeenCalled()
  })
})
