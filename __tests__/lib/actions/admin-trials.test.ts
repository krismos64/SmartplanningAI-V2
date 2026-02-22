/**
 * Tests unitaires pour les Server Actions admin-trials
 *
 * Couvre :
 * 1. getTrialsAtRisk() — non SYSTEM_ADMIN → throw Unauthorized
 * 2. getTrialsAtRisk() — retourne les trials expirant dans 7j, triés par date
 * 3. getTrialsAtRisk() — urgency "critical" si daysRemaining <= 2
 * 4. getTrialsAtRisk() — urgency "warning" si daysRemaining 3-5
 * 5. getTrialsAtRisk() — urgency "info" si daysRemaining 6-7
 * 6. extendTrial() — non SYSTEM_ADMIN → throw Unauthorized
 *
 * @ticket SP-473
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../mocks/prisma'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Import après mocks
import { getTrialsAtRisk, extendTrial } from '@/lib/actions/admin-trials'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-1', role: 'SYSTEM_ADMIN', companyId: null },
}

const DIRECTOR_SESSION = {
  user: { id: 'dir-1', role: 'DIRECTOR', companyId: 'comp-1' },
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function makeCompany(id: string, name: string, trialEndsAt: Date) {
  return {
    id,
    name,
    trialEndsAt,
    _count: { employees: 5 },
    users: [{ email: `director@${id}.com` }],
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('getTrialsAtRisk (SP-473)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue(ADMIN_SESSION)
  })

  // 1. Non SYSTEM_ADMIN → throw
  it('throw Unauthorized si non SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    await expect(getTrialsAtRisk()).rejects.toThrow('Unauthorized')
  })

  // 2. Retourne les trials triés par date
  it('retourne les trials expirant dans 7j triés par date', async () => {
    const in2Days = daysFromNow(2)
    const in5Days = daysFromNow(5)

    prismaMock.company.findMany.mockResolvedValue([
      makeCompany('c1', 'Urgent Corp', in2Days),
      makeCompany('c2', 'Soon Corp', in5Days),
    ])

    const result = await getTrialsAtRisk()

    expect(result).toHaveLength(2)
    expect(result[0].companyId).toBe('c1')
    expect(result[0].companyName).toBe('Urgent Corp')
    expect(result[0].employeeCount).toBe(5)
    expect(result[0].ownerEmail).toBe('director@c1.com')
    expect(result[1].companyId).toBe('c2')

    // Vérifie que Prisma a été appelé avec le bon filtre
    expect(prismaMock.company.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          subscription: { status: 'TRIAL' },
          isActive: true,
        }),
        orderBy: { trialEndsAt: 'asc' },
      })
    )
  })

  // 3. Urgency "critical" si daysRemaining <= 2
  it('classifie "critical" si daysRemaining <= 2', async () => {
    prismaMock.company.findMany.mockResolvedValue([
      makeCompany('c1', 'Critical Corp', daysFromNow(1)),
    ])

    const result = await getTrialsAtRisk()

    expect(result[0].urgency).toBe('critical')
    expect(result[0].daysRemaining).toBeLessThanOrEqual(2)
  })

  // 4. Urgency "warning" si daysRemaining 3-5
  it('classifie "warning" si daysRemaining 3-5', async () => {
    prismaMock.company.findMany.mockResolvedValue([
      makeCompany('c1', 'Warning Corp', daysFromNow(4)),
    ])

    const result = await getTrialsAtRisk()

    expect(result[0].urgency).toBe('warning')
    expect(result[0].daysRemaining).toBeGreaterThanOrEqual(3)
    expect(result[0].daysRemaining).toBeLessThanOrEqual(5)
  })

  // 5. Urgency "info" si daysRemaining 6-7
  it('classifie "info" si daysRemaining 6-7', async () => {
    prismaMock.company.findMany.mockResolvedValue([
      makeCompany('c1', 'Info Corp', daysFromNow(6)),
    ])

    const result = await getTrialsAtRisk()

    expect(result[0].urgency).toBe('info')
    expect(result[0].daysRemaining).toBeGreaterThanOrEqual(6)
  })
})

describe('extendTrial (SP-473)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 6. Non SYSTEM_ADMIN → throw
  it('throw Unauthorized si non SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)

    await expect(extendTrial('comp-1')).rejects.toThrow('Unauthorized')
  })
})
