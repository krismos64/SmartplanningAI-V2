/**
 * Tests pour API route /api/admin/stats/export/pdf
 *
 * Verifie :
 * - RBAC : seul SYSTEM_ADMIN peut acceder
 * - Retour PDF 200 avec Content-Type correct
 * - Gestion des erreurs du service
 *
 * @ticket SP-475
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  getAdminStats: vi.fn(),
  renderToBuffer: vi.fn(),
}))

vi.mock('@/lib/api-auth', () => ({
  requireRole: mocks.requireRole,
}))

vi.mock('@/lib/services/dashboard/admin-stats.service', () => ({
  getAdminStats: mocks.getAdminStats,
}))

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: mocks.renderToBuffer,
  Document: 'Document',
  Page: 'Page',
  Text: 'Text',
  View: 'View',
  StyleSheet: { create: (s: unknown) => s },
}))

// Mock du composant PDF
vi.mock('@/lib/pdf/AdminStatsPdfDocument', () => ({
  AdminStatsPdfDocument: () => null,
}))

// ============================================================================
// Imports (apres mocks)
// ============================================================================

import { GET } from '@/app/api/admin/stats/export/pdf/route'
import { NextResponse } from 'next/server'

// ============================================================================
// Fixtures
// ============================================================================

const MOCK_STATS = {
  totalCompanies: { current: 42, previous: 38, trend: 10.5 },
  totalUsers: { current: 256, previous: 230, trend: 11.3 },
  activeSubscriptions: 35,
  mrr: { current: 1015, previous: 950, trend: 6.8 },
  churnRate: 2.1,
  companiesGrowth: [{ month: 'Feb', count: 42 }],
  revenueByPlan: [{ plan: 'Per-seat', revenue: 1015, count: 35 }],
  subscriptionStatusDistribution: [{ status: 'Actif', count: 30 }],
}

// ============================================================================
// Tests
// ============================================================================

describe('GET /api/admin/stats/export/pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retourne 401 si non authentifie', async () => {
    const errorResponse = NextResponse.json(
      { error: 'Non authentifie' },
      { status: 401 }
    )
    mocks.requireRole.mockResolvedValue({ error: errorResponse, session: null })

    const response = await GET()
    expect(response.status).toBe(401)
  })

  it('retourne 403 si role non SYSTEM_ADMIN', async () => {
    const errorResponse = NextResponse.json(
      { error: 'Acces refuse' },
      { status: 403 }
    )
    mocks.requireRole.mockResolvedValue({ error: errorResponse, session: null })

    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('retourne 500 si getAdminStats echoue', async () => {
    mocks.requireRole.mockResolvedValue({
      error: null,
      session: { user: { id: 'admin-1', role: 'SYSTEM_ADMIN' } },
    })
    mocks.getAdminStats.mockResolvedValue({
      success: false,
      error: 'DB connection failed',
    })

    const response = await GET()
    expect(response.status).toBe(500)

    const data = (await response.json()) as { error: string }
    expect(data.error).toContain('DB connection failed')
  })

  it('retourne PDF 200 avec les bons headers', async () => {
    mocks.requireRole.mockResolvedValue({
      error: null,
      session: { user: { id: 'admin-1', role: 'SYSTEM_ADMIN' } },
    })
    mocks.getAdminStats.mockResolvedValue({
      success: true,
      data: MOCK_STATS,
    })

    const pdfBuffer = Buffer.from('fake-pdf-content')
    mocks.renderToBuffer.mockResolvedValue(pdfBuffer)

    const response = await GET()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain(
      'smartplanning-stats-'
    )
    expect(response.headers.get('Content-Disposition')).toContain('.pdf')
  })

  it('appelle requireRole avec SYSTEM_ADMIN', async () => {
    mocks.requireRole.mockResolvedValue({
      error: NextResponse.json({ error: 'test' }, { status: 401 }),
      session: null,
    })

    await GET()

    expect(mocks.requireRole).toHaveBeenCalledWith('SYSTEM_ADMIN')
  })
})
