/**
 * Tests de la route cron de relève des bounces
 *
 * @ticket SP-579
 * @description Vérifie l'authentification CRON_SECRET, le comportement quand
 * la configuration IMAP est absente, et la propagation du résultat.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { mockSyncBounces, mockGetImapCredentials } = vi.hoisted(() => ({
  mockSyncBounces: vi.fn(),
  mockGetImapCredentials: vi.fn(),
}))

vi.mock('@/lib/email/bounce/bounce-sync.service', () => ({
  syncBounces: mockSyncBounces,
  getImapCredentials: mockGetImapCredentials,
}))

import { POST } from '@/app/api/cron/bounce-sync/route'
import { NextRequest } from 'next/server'

function makeRequest(token?: string): NextRequest {
  const headers = new Headers()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return new NextRequest('http://localhost/api/cron/bounce-sync', {
    method: 'POST',
    headers,
  })
}

const CREDENTIALS = {
  host: 'imap.test.com',
  port: 993,
  user: 'contact@test.com',
  pass: 'secret',
}

const EMPTY_RESULT = {
  examined: 0,
  bounces: 0,
  updated: 0,
  unmatched: 0,
  alreadyMarked: 0,
  errors: [],
}

describe('POST /api/cron/bounce-sync (SP-579)', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = { ...originalEnv, CRON_SECRET: 'secret-cron' }
    mockGetImapCredentials.mockReturnValue(CREDENTIALS)
    mockSyncBounces.mockResolvedValue(EMPTY_RESULT)
  })

  afterEach(() => {
    process.env = originalEnv
  })

  // ==========================================================================
  // Authentification : la route déclenche des écritures en base et lit une
  // boîte mail, elle ne doit jamais s'exécuter sans le secret.
  // ==========================================================================

  it('refuse une requête sans token', async () => {
    const response = await POST(makeRequest())

    expect(response.status).toBe(401)
    expect(mockSyncBounces).not.toHaveBeenCalled()
  })

  it('refuse un token incorrect', async () => {
    const response = await POST(makeRequest('mauvais-secret'))

    expect(response.status).toBe(401)
    expect(mockSyncBounces).not.toHaveBeenCalled()
  })

  it('refuse toute requête si CRON_SECRET n est pas configuré', async () => {
    // Sans secret côté serveur, un appelant fournissant n'importe quelle
    // valeur ne doit pas passer : la comparaison ne doit jamais être
    // satisfaite par deux valeurs vides.
    delete process.env.CRON_SECRET

    const response = await POST(makeRequest('n-importe-quoi'))

    expect(response.status).toBe(401)
    expect(mockSyncBounces).not.toHaveBeenCalled()
  })

  it('accepte le token valide et lance la relève', async () => {
    const response = await POST(makeRequest('secret-cron'))

    expect(response.status).toBe(200)
    expect(mockSyncBounces).toHaveBeenCalledWith(CREDENTIALS)
  })

  // ==========================================================================
  // Configuration absente et erreurs
  // ==========================================================================

  it('répond 200 sans relève quand la configuration IMAP est absente', async () => {
    // L'environnement de développement n'a pas de boîte : ce n'est pas une
    // erreur, et le cron ne doit pas être compté en échec.
    mockGetImapCredentials.mockReturnValue(null)

    const response = await POST(makeRequest('secret-cron'))
    const body = (await response.json()) as { skipped?: boolean }

    expect(response.status).toBe(200)
    expect(body.skipped).toBe(true)
    expect(mockSyncBounces).not.toHaveBeenCalled()
  })

  it('renvoie le détail du passage', async () => {
    mockSyncBounces.mockResolvedValue({
      examined: 5,
      bounces: 2,
      updated: 1,
      unmatched: 1,
      alreadyMarked: 0,
      errors: [],
    })

    const response = await POST(makeRequest('secret-cron'))
    const body = (await response.json()) as {
      success: boolean
      updated: number
      bounces: number
    }

    expect(body.success).toBe(true)
    expect(body.bounces).toBe(2)
    expect(body.updated).toBe(1)
  })

  it('répond 500 sans exposer le détail technique en cas d échec IMAP', async () => {
    mockSyncBounces.mockRejectedValue(
      new Error('IMAP auth failed for contact@smartplanning.fr')
    )
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await POST(makeRequest('secret-cron'))
    const body = (await response.json()) as { error: string }

    expect(response.status).toBe(500)
    // Le message d'erreur ne doit pas fuiter d'identifiant vers l'appelant
    expect(body.error).not.toContain('contact@smartplanning.fr')

    errorSpy.mockRestore()
  })
})
