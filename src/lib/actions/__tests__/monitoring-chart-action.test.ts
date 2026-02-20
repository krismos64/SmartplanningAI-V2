/**
 * Tests unitaires pour la Server Action getMonitoringChartData
 *
 * Couvre :
 * - RBAC : non-connecté, rôle insuffisant, SYSTEM_ADMIN OK
 * - Structure de réponse : 4 propriétés
 * - auditActivity : toujours 7 entrées
 * - subscriptionDistribution : status + count
 * - topActions : trié par count décroissant, max 5
 * - Gestion d'erreur
 *
 * @ticket SP-465
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

const mockFindManyAuditLog = vi.fn()
const mockGroupByAuditLog = vi.fn()
const mockGroupBySubscription = vi.fn()
const mockFindManyCompany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: (...args: unknown[]) => mockFindManyAuditLog(...args),
      groupBy: (...args: unknown[]) => mockGroupByAuditLog(...args),
    },
    subscription: {
      groupBy: (...args: unknown[]) => mockGroupBySubscription(...args),
    },
    company: {
      findMany: (...args: unknown[]) => mockFindManyCompany(...args),
    },
  },
}))

// ============================================================================
// Import après mocks
// ============================================================================

import { getMonitoringChartData } from '../monitoring'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: { id: 'admin-001', role: 'SYSTEM_ADMIN', companyId: null },
}

const MANAGER_SESSION = {
  user: { id: 'mgr-001', role: 'MANAGER', companyId: 'company-001' },
}

function setupSuccessMocks() {
  mockAuth.mockResolvedValueOnce(ADMIN_SESSION)

  // auditLogs findMany — 2 logs le même jour
  const today = new Date()
  mockFindManyAuditLog.mockResolvedValueOnce([
    { createdAt: today },
    { createdAt: today },
  ])

  // subscription groupBy
  mockGroupBySubscription.mockResolvedValueOnce([
    { status: 'ACTIVE', _count: 5 },
    { status: 'TRIAL', _count: 2 },
  ])

  // auditLog groupBy (topActions)
  mockGroupByAuditLog.mockResolvedValueOnce([
    { action: 'LOGIN', _count: { action: 10 } },
    { action: 'CREATE', _count: { action: 7 } },
    { action: 'UPDATE', _count: { action: 3 } },
  ])

  // company findMany
  mockFindManyCompany.mockResolvedValueOnce([{ createdAt: today }])
}

// ============================================================================
// Tests
// ============================================================================

describe('getMonitoringChartData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // RBAC ------------------------------------------------------------------

  it('refuse les utilisateurs non connectés', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const result = await getMonitoringChartData()

    expect(result.success).toBe(false)
  })

  it('refuse un MANAGER', async () => {
    mockAuth.mockResolvedValueOnce(MANAGER_SESSION)

    const result = await getMonitoringChartData()

    expect(result.success).toBe(false)
  })

  // Structure retour ------------------------------------------------------

  it('retourne les 4 propriétés pour SYSTEM_ADMIN', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data).toHaveProperty('auditActivity')
    expect(result.data).toHaveProperty('subscriptionDistribution')
    expect(result.data).toHaveProperty('topActions')
    expect(result.data).toHaveProperty('companyGrowth')
  })

  // auditActivity ---------------------------------------------------------

  it('retourne toujours 7 entrées pour auditActivity', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.auditActivity).toHaveLength(7)
  })

  it('remplit les jours sans logs avec count=0', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    if (!result.success) return
    const zeroDays = result.data.auditActivity.filter((d) => d.count === 0)
    // Au moins 5 jours à 0 (on a 2 logs le même jour)
    expect(zeroDays.length).toBeGreaterThanOrEqual(5)
  })

  // subscriptionDistribution ----------------------------------------------

  it('retourne status et count pour chaque entrée', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    if (!result.success) return
    expect(result.data.subscriptionDistribution).toHaveLength(2)
    expect(result.data.subscriptionDistribution[0]).toEqual({
      status: 'ACTIVE',
      count: 5,
    })
    expect(result.data.subscriptionDistribution[1]).toEqual({
      status: 'TRIAL',
      count: 2,
    })
  })

  // topActions ------------------------------------------------------------

  it('retourne les actions triées par count décroissant', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    if (!result.success) return
    expect(result.data.topActions[0]?.count).toBeGreaterThanOrEqual(
      result.data.topActions[1]?.count ?? 0
    )
  })

  it('retourne max 5 actions', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    if (!result.success) return
    expect(result.data.topActions.length).toBeLessThanOrEqual(5)
  })

  // companyGrowth ---------------------------------------------------------

  it('retourne 30 entrées pour companyGrowth', async () => {
    setupSuccessMocks()

    const result = await getMonitoringChartData()

    if (!result.success) return
    expect(result.data.companyGrowth).toHaveLength(30)
  })

  // Erreurs ---------------------------------------------------------------

  it('gère les erreurs DB', async () => {
    mockAuth.mockResolvedValueOnce(ADMIN_SESSION)
    mockFindManyAuditLog.mockRejectedValueOnce(new Error('DB timeout'))

    const result = await getMonitoringChartData()

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('DB timeout')
    }
  })
})
