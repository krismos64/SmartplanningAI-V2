/**
 * Tests unitaires pour les Server Actions admin-email-logs
 *
 * Couvre :
 * - RBAC : non-connecté, rôle insuffisant, SYSTEM_ADMIN OK
 * - getEmailLogsAdmin : validation Zod, filtres (type startsWith, statut,
 *   dates, entreprise), pagination, mapping
 * - getEmailLogsKpisAdmin : volume/échecs 7j, taux d'échec, top types
 *
 * @ticket SP-545
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

const mockEmailLogFindMany = vi.fn()
const mockEmailLogCount = vi.fn()
const mockEmailLogGroupBy = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      findMany: (...args: unknown[]) => mockEmailLogFindMany(...args),
      count: (...args: unknown[]) => mockEmailLogCount(...args),
      groupBy: (...args: unknown[]) => mockEmailLogGroupBy(...args),
    },
  },
}))

// ============================================================================
// Import après mocks
// ============================================================================

import { getEmailLogsAdmin, getEmailLogsKpisAdmin } from '../admin-email-logs'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-001', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'director-001', role: 'DIRECTOR', companyId: 'company-001' },
}

const EMAIL_LOG_FIXTURE = {
  id: 'log-001',
  emailType: 'PAYMENT_CONFIRMED',
  recipientEmail: 'director@acme.fr',
  status: 'SENT',
  sentAt: new Date('2026-07-07T10:00:00Z'),
  companyId: 'cl0000000000000000company',
  subscriptionId: 'sub-001',
  metadata: { messageId: 'smtp-123' },
  company: { name: 'Acme Corp' },
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(ADMIN_SESSION)
  mockEmailLogFindMany.mockResolvedValue([EMAIL_LOG_FIXTURE])
  mockEmailLogCount.mockResolvedValue(1)
  mockEmailLogGroupBy.mockResolvedValue([])
})

describe('RBAC', () => {
  it.each([
    ['getEmailLogsAdmin', () => getEmailLogsAdmin()],
    ['getEmailLogsKpisAdmin', () => getEmailLogsKpisAdmin()],
  ])('%s refuse un utilisateur non connecté', async (_name, action) => {
    mockAuth.mockResolvedValue(null)

    const result = await action()

    expect(result.success).toBe(false)
  })

  it.each([
    ['getEmailLogsAdmin', () => getEmailLogsAdmin()],
    ['getEmailLogsKpisAdmin', () => getEmailLogsKpisAdmin()],
  ])('%s refuse un DIRECTOR', async (_name, action) => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    const result = await action()

    expect(result.success).toBe(false)
  })
})

describe('getEmailLogsAdmin', () => {
  it('retourne les logs mappés avec le nom entreprise', async () => {
    const result = await getEmailLogsAdmin()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.total).toBe(1)
    expect(result.data.logs[0]).toMatchObject({
      id: 'log-001',
      emailType: 'PAYMENT_CONFIRMED',
      recipientEmail: 'director@acme.fr',
      status: 'SENT',
      companyName: 'Acme Corp',
    })
  })

  it('rejette des filtres invalides (Zod)', async () => {
    const result = await getEmailLogsAdmin({
      status: 'INJECTION' as never,
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error).toMatch(/invalides/i)
    expect(mockEmailLogFindMany).not.toHaveBeenCalled()
  })

  it('filtre par type avec startsWith (matche les suffixes de dédup)', async () => {
    await getEmailLogsAdmin({ emailType: 'PAYMENT_CONFIRMED' })

    const findArgs = mockEmailLogFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.emailType).toEqual({
      startsWith: 'PAYMENT_CONFIRMED',
    })
  })

  it('filtre par statut et entreprise', async () => {
    await getEmailLogsAdmin({
      status: 'FAILED',
      companyId: 'cl0000000000000000company',
    })

    const findArgs = mockEmailLogFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.status).toBe('FAILED')
    expect(findArgs.where.companyId).toBe('cl0000000000000000company')
  })

  it('filtre par plage de dates (bornes inclusives)', async () => {
    await getEmailLogsAdmin({ dateFrom: '2026-07-01', dateTo: '2026-07-07' })

    const findArgs = mockEmailLogFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.sentAt.gte).toEqual(new Date('2026-07-01T00:00:00'))
    expect(findArgs.where.sentAt.lte).toEqual(
      new Date('2026-07-07T23:59:59.999')
    )
  })

  it('pagine côté serveur (page 3, taille 10)', async () => {
    await getEmailLogsAdmin({ page: 3, pageSize: 10 })

    const findArgs = mockEmailLogFindMany.mock.calls[0]?.[0]
    expect(findArgs.skip).toBe(20)
    expect(findArgs.take).toBe(10)
  })

  it('clamp pageSize à 100 via Zod', async () => {
    const result = await getEmailLogsAdmin({ pageSize: 500 })

    // Zod rejette (max 100) plutôt que de clamp silencieusement
    expect(result.success).toBe(false)
  })

  it('trie du plus récent au plus ancien', async () => {
    await getEmailLogsAdmin()

    const findArgs = mockEmailLogFindMany.mock.calls[0]?.[0]
    expect(findArgs.orderBy).toEqual({ sentAt: 'desc' })
  })
})

describe('getEmailLogsKpisAdmin', () => {
  it('calcule le taux d’échec sur 7 jours', async () => {
    mockEmailLogCount
      .mockResolvedValueOnce(200) // total 7j
      .mockResolvedValueOnce(5) // échecs 7j
    mockEmailLogGroupBy.mockResolvedValue([
      { emailType: 'PAYMENT_CONFIRMED', _count: 120 },
      { emailType: 'WELCOME', _count: 50 },
    ])

    const result = await getEmailLogsKpisAdmin()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.total7d).toBe(200)
    expect(result.data.failed7d).toBe(5)
    expect(result.data.failureRate7d).toBe(2.5)
    expect(result.data.topTypes).toEqual([
      { emailType: 'PAYMENT_CONFIRMED', count: 120 },
      { emailType: 'WELCOME', count: 50 },
    ])
  })

  it('taux d’échec à 0 quand aucun envoi (pas de division par zéro)', async () => {
    mockEmailLogCount.mockResolvedValue(0)

    const result = await getEmailLogsKpisAdmin()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.failureRate7d).toBe(0)
  })

  it('compte FAILED et BOUNCED comme échecs', async () => {
    await getEmailLogsKpisAdmin()

    const failedCountArgs = mockEmailLogCount.mock.calls[1]?.[0]
    expect(failedCountArgs.where.status).toEqual({
      in: ['FAILED', 'BOUNCED'],
    })
  })
})
