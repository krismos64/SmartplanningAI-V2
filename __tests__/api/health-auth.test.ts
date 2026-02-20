/**
 * Tests unitaires pour la protection par clé API de GET /api/health
 *
 * Couvre :
 * - GET sans header Authorization → 401
 * - GET avec token invalide → 401
 * - GET avec token valide → 200
 * - GET sans HEALTH_API_KEY dans env → 401 (fail secure)
 * - HEAD sans auth → 200 (load balancer, public)
 * - OPTIONS → 204 avec Access-Control-Allow-Origin non wildcard
 *
 * @ticket SP-470
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// ============================================================================
// Mocks
// ============================================================================

const mockCheckDatabaseHealth = vi.fn()
const mockQuickHealthCheck = vi.fn()
const mockFormatHealthCheckResult = vi.fn()

vi.mock('@/lib/db-health', () => ({
  checkDatabaseHealth: () => mockCheckDatabaseHealth(),
  quickHealthCheck: () => mockQuickHealthCheck(),
  formatHealthCheckResult: (r: unknown) => mockFormatHealthCheckResult(r),
}))

// ============================================================================
// Import après mocks
// ============================================================================

import { GET, HEAD, OPTIONS } from '@/app/api/health/route'

// ============================================================================
// Helpers
// ============================================================================

const TEST_HEALTH_KEY = 'test-health-secret-key-2026'

function makeGetRequest(token?: string): NextRequest {
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return new NextRequest('http://localhost:3000/api/health', {
    method: 'GET',
    headers,
  })
}

/** Fixture health check complet */
const healthyResult = {
  status: 'healthy' as const,
  timestamp: new Date().toISOString(),
  checks: {
    connection: { status: 'pass', message: 'OK' },
    query: { status: 'pass', message: 'OK' },
    migrations: { status: 'pass', message: 'OK' },
  },
  metrics: { latency: 5, connectionPool: { total: 5, idle: 3, active: 2 } },
}

// ============================================================================
// Tests
// ============================================================================

describe('GET /api/health — Authentication (SP-470)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.HEALTH_API_KEY = TEST_HEALTH_KEY
    process.env.NEXTAUTH_URL = 'https://smartplanning.fr'
    mockCheckDatabaseHealth.mockResolvedValue(healthyResult)
    mockQuickHealthCheck.mockResolvedValue(true)
  })

  // 1. GET sans header Authorization → 401
  it('retourne 401 si aucun header Authorization', async () => {
    const response = await GET(makeGetRequest())

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  // 2. GET avec token invalide → 401
  it('retourne 401 si token invalide', async () => {
    const response = await GET(makeGetRequest('mauvais-token'))

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
  })

  // 3. GET avec token valide → 200
  it('retourne 200 si token valide', async () => {
    const response = await GET(makeGetRequest(TEST_HEALTH_KEY))

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('healthy')
  })

  // 4. GET sans HEALTH_API_KEY dans env → 401 (fail secure)
  it('retourne 401 si HEALTH_API_KEY absent de env (fail secure)', async () => {
    delete process.env.HEALTH_API_KEY

    const response = await GET(makeGetRequest('nimporte-quel-token'))

    expect(response.status).toBe(401)
  })
})

describe('HEAD /api/health — Public (SP-470)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockQuickHealthCheck.mockResolvedValue(true)
  })

  // 5. HEAD sans auth → 200
  it('retourne 200 sans authentification (load balancer)', async () => {
    const response = await HEAD()

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Health-Status')).toBe('healthy')
  })
})

describe('OPTIONS /api/health — CORS (SP-470)', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_URL = 'https://smartplanning.fr'
  })

  // 6. OPTIONS → 204 avec origin non wildcard
  it('retourne 204 avec Access-Control-Allow-Origin non wildcard', async () => {
    const response = await OPTIONS()

    expect(response.status).toBe(204)
    const origin = response.headers.get('Access-Control-Allow-Origin')
    expect(origin).not.toBe('*')
    expect(origin).toBe('https://smartplanning.fr')
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
      'Authorization'
    )
  })
})
