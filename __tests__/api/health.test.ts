/**
 * Tests API Health Check avec MSW
 *
 * Ces tests valident que MSW intercepte correctement les requêtes API
 * et retourne les réponses mockées définies dans handlers.ts.
 *
 * @see __tests__/mocks/handlers.ts
 * @ticket SP-131
 */

import { describe, it, expect } from 'vitest'

describe('API Health Check (MSW)', () => {
  /**
   * Test basique : vérifie que MSW intercepte la requête
   * et retourne le mock défini dans handlers.ts
   */
  it('should return health status from mocked API', async () => {
    const response = await fetch('/api/health')
    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.status).toBe('healthy')
    expect(data.timestamp).toBeDefined()
  })

  /**
   * Test du mode complet : vérifie les checks et metrics
   */
  it('should return full health check with metrics', async () => {
    const response = await fetch('/api/health')
    const data = await response.json()

    expect(data.checks).toBeDefined()
    expect(data.checks.connection.status).toBe('pass')
    expect(data.metrics).toBeDefined()
    expect(data.metrics.latency).toBe(5)
  })

  /**
   * Test du mode quick : vérifie le quick check simplifié
   */
  it('should return quick health check when query param is set', async () => {
    const response = await fetch('/api/health?quick=true')
    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.status).toBe('healthy')
    expect(data.quick).toBe(true)
    // Quick check ne retourne pas checks ni metrics
    expect(data.checks).toBeUndefined()
    expect(data.metrics).toBeUndefined()
  })

  /**
   * Test des headers personnalisés retournés par le mock
   */
  it('should include custom headers in response', async () => {
    const response = await fetch('/api/health')

    expect(response.headers.get('X-Health-Status')).toBe('healthy')
    expect(response.headers.get('X-Response-Time')).toBe('5ms')
  })
})
