/**
 * Tests unitaires pour la Server Action getMonitoringSnapshot
 *
 * Couvre :
 * - RBAC : non-connecté, rôle insuffisant, SYSTEM_ADMIN OK
 * - Structure de réponse : health, quickStats, subscriptionBreakdown, timestamp
 * - subscriptionBreakdown : groupBy par status
 * - Gestion d'erreur DB
 *
 * @ticket SP-464
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

const mockCheckDatabaseHealth = vi.fn()
vi.mock('@/lib/db-health', () => ({
  checkDatabaseHealth: () => mockCheckDatabaseHealth(),
}))

const mockGetAdminQuickStats = vi.fn()
vi.mock('@/lib/services/dashboard/admin-stats.service', () => ({
  getAdminQuickStats: () => mockGetAdminQuickStats(),
}))

const mockGroupBy = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      groupBy: (...args: unknown[]) => mockGroupBy(...args),
    },
  },
}))

// ============================================================================
// Import après mocks
// ============================================================================

import { getMonitoringSnapshot } from '../monitoring'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: {
    id: 'admin-001',
    role: 'SYSTEM_ADMIN',
    companyId: null,
  },
}

const DIRECTOR_SESSION = {
  user: {
    id: 'director-001',
    role: 'DIRECTOR',
    companyId: 'company-001',
  },
}

const HEALTHY_RESULT = {
  status: 'healthy' as const,
  timestamp: new Date(),
  checks: {
    connection: { status: 'pass' as const, message: 'Connexion établie' },
    latency: {
      status: 'pass' as const,
      message: 'Latence OK (12ms)',
      value: 12,
    },
    migrations: { status: 'pass' as const, message: 'Schéma DB accessible' },
    poolSize: {
      status: 'pass' as const,
      message: 'Pool disponible (20%)',
      value: '2/10',
    },
  },
  metrics: { latency: 12, activeConnections: 2, idleConnections: 8 },
}

const QUICK_STATS = {
  success: true,
  data: { companies: 5, users: 42, mrr: 145.0, churn: 2.5 },
}

const BREAKDOWN_RAW = [
  { status: 'ACTIVE', _count: 3 },
  { status: 'TRIAL', _count: 2 },
]

// ============================================================================
// Tests
// ============================================================================

describe('getMonitoringSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // RBAC ------------------------------------------------------------------

  it('refuse les utilisateurs non connectés', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('connecté')
    }
  })

  it('refuse un DIRECTOR', async () => {
    mockAuth.mockResolvedValueOnce(DIRECTOR_SESSION)

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('permissions')
    }
  })

  it('refuse un EMPLOYEE', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'emp-001', role: 'EMPLOYEE', companyId: 'c1' },
    })

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(false)
  })

  // Succès ----------------------------------------------------------------

  it('retourne un snapshot complet pour SYSTEM_ADMIN', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockCheckDatabaseHealth.mockResolvedValueOnce(HEALTHY_RESULT)
    mockGetAdminQuickStats.mockResolvedValueOnce(QUICK_STATS)
    mockGroupBy.mockResolvedValueOnce(BREAKDOWN_RAW)

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(true)
    if (!result.success) return

    // health
    expect(result.data.health.status).toBe('healthy')
    expect(result.data.health.metrics.latency).toBe(12)

    // quickStats
    expect(result.data.quickStats.companies).toBe(5)
    expect(result.data.quickStats.users).toBe(42)
    expect(result.data.quickStats.mrr).toBe(145.0)
    expect(result.data.quickStats.churn).toBe(2.5)

    // subscriptionBreakdown
    expect(result.data.subscriptionBreakdown).toHaveLength(2)
    expect(result.data.subscriptionBreakdown[0]).toEqual({
      status: 'ACTIVE',
      count: 3,
    })
    expect(result.data.subscriptionBreakdown[1]).toEqual({
      status: 'TRIAL',
      count: 2,
    })

    // timestamp
    expect(typeof result.data.timestamp).toBe('number')
    expect(result.data.timestamp).toBeGreaterThan(0)
  })

  it('retourne des quickStats à zéro si le service échoue', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockCheckDatabaseHealth.mockResolvedValueOnce(HEALTHY_RESULT)
    mockGetAdminQuickStats.mockResolvedValueOnce({
      success: false,
      error: 'DB error',
    })
    mockGroupBy.mockResolvedValueOnce([])

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.quickStats).toEqual({
      companies: 0,
      users: 0,
      mrr: 0,
      churn: 0,
    })
  })

  it('gère un breakdown vide', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockCheckDatabaseHealth.mockResolvedValueOnce(HEALTHY_RESULT)
    mockGetAdminQuickStats.mockResolvedValueOnce(QUICK_STATS)
    mockGroupBy.mockResolvedValueOnce([])

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.subscriptionBreakdown).toEqual([])
  })

  // Erreurs ---------------------------------------------------------------

  it('attrape les erreurs DB et retourne success: false', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockCheckDatabaseHealth.mockRejectedValueOnce(
      new Error('Connection refused')
    )

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Connection refused')
    }
  })

  it('attrape les erreurs non-Error', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockCheckDatabaseHealth.mockRejectedValueOnce('unknown error')

    const result = await getMonitoringSnapshot()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('snapshot monitoring')
    }
  })
})
