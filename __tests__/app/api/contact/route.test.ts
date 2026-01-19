/**
 * Tests unitaires pour l'API route /api/contact
 *
 * @ticket SP-288
 * @description Tests du endpoint POST /api/contact
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock des dépendances
vi.mock('@/lib/email/templates/contact', () => ({
  sendContactEmails: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
  getClientIp: vi.fn(),
  getRateLimitHeaders: vi.fn(),
}))

// Helper pour créer une requête mock
function createMockRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return {
    json: vi.fn().mockResolvedValue(body),
    headers: {
      get: (name: string) => headers[name] || null,
    },
  } as unknown as Request
}

// Helper pour créer une requête avec JSON invalide
function createInvalidJsonRequest(): Request {
  return {
    json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    headers: {
      get: () => null,
    },
  } as unknown as Request
}

describe('POST /api/contact', () => {
  let POST: (request: Request) => Promise<NextResponse>
  let sendContactEmails: ReturnType<typeof vi.fn>
  let checkRateLimit: ReturnType<typeof vi.fn>
  let getClientIp: ReturnType<typeof vi.fn>
  let getRateLimitHeaders: ReturnType<typeof vi.fn>

  const validFormData = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    subject: 'Demande d\'information sur SmartPlanning',
    message: 'Bonjour, je souhaite en savoir plus sur vos services de planification.',
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Récupérer les mocks
    const emailModule = await import('@/lib/email/templates/contact')
    const rateLimitModule = await import('@/lib/rate-limit')

    sendContactEmails = emailModule.sendContactEmails as ReturnType<typeof vi.fn>
    checkRateLimit = rateLimitModule.checkRateLimit as ReturnType<typeof vi.fn>
    getClientIp = rateLimitModule.getClientIp as ReturnType<typeof vi.fn>
    getRateLimitHeaders = rateLimitModule.getRateLimitHeaders as ReturnType<typeof vi.fn>

    // Configurer les mocks par défaut
    getClientIp.mockReturnValue('127.0.0.1')
    getRateLimitHeaders.mockReturnValue({
      'X-RateLimit-Remaining': '4',
      'X-RateLimit-Reset': '1234567890',
    })
    checkRateLimit.mockReturnValue({
      allowed: true,
      remaining: 4,
      resetAt: Date.now() + 60000,
    })
    sendContactEmails.mockResolvedValue({
      confirmation: { success: true, messageId: 'conf-123' },
      notification: { success: true, messageId: 'notif-456' },
    })

    // Importer la route
    const routeModule = await import('@/app/api/contact/route')
    POST = routeModule.POST
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Soumission réussie
  // ==========================================================================

  describe('Soumission réussie', () => {
    it('devrait retourner 200 avec un message de succès', async () => {
      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('message a été envoyé avec succès')
    })

    it('devrait appeler sendContactEmails avec les bonnes données', async () => {
      const request = createMockRequest(validFormData)
      await POST(request)

      expect(sendContactEmails).toHaveBeenCalledTimes(1)
      expect(sendContactEmails).toHaveBeenCalledWith({
        name: validFormData.name,
        email: validFormData.email,
        subject: validFormData.subject,
        message: validFormData.message,
      })
    })

    it('devrait inclure les headers de rate limit', async () => {
      const request = createMockRequest(validFormData)
      const response = await POST(request)

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('4')
    })

    it('devrait réussir même si la confirmation email échoue', async () => {
      sendContactEmails.mockResolvedValue({
        confirmation: { success: false, error: 'SMTP error' },
        notification: { success: true, messageId: 'notif-789' },
      })

      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  // ==========================================================================
  // Validation des données
  // ==========================================================================

  describe('Validation des données', () => {
    it('devrait retourner 400 pour un nom trop court', async () => {
      const request = createMockRequest({
        ...validFormData,
        name: 'A',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors?.name).toBeDefined()
    })

    it('devrait retourner 400 pour un email invalide', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: 'invalid-email',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors?.email).toBeDefined()
    })

    it('devrait retourner 400 pour un sujet trop court', async () => {
      const request = createMockRequest({
        ...validFormData,
        subject: 'Hi',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors?.subject).toBeDefined()
    })

    it('devrait retourner 400 pour un message trop court', async () => {
      const request = createMockRequest({
        ...validFormData,
        message: 'Court',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors?.message).toBeDefined()
    })

    it('devrait retourner 400 pour des champs manquants', async () => {
      const request = createMockRequest({
        name: 'Jean',
        // email manquant
        subject: 'Test sujet valide',
        message: 'Message assez long pour être valide.',
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('devrait retourner 400 pour un JSON invalide', async () => {
      const request = createInvalidJsonRequest()
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Format de requête invalide')
    })

    it('devrait retourner 400 pour un nom trop long', async () => {
      const request = createMockRequest({
        ...validFormData,
        name: 'A'.repeat(101),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.errors?.name).toBeDefined()
    })

    it('devrait retourner 400 pour un sujet trop long', async () => {
      const request = createMockRequest({
        ...validFormData,
        subject: 'A'.repeat(201),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.errors?.subject).toBeDefined()
    })

    it('devrait retourner 400 pour un message trop long', async () => {
      const request = createMockRequest({
        ...validFormData,
        message: 'A'.repeat(2001),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.errors?.message).toBeDefined()
    })
  })

  // ==========================================================================
  // Rate Limiting
  // ==========================================================================

  describe('Rate Limiting', () => {
    it('devrait retourner 429 quand la limite est dépassée', async () => {
      checkRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      })

      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Trop de requêtes')
    })

    it('devrait appeler checkRateLimit avec l\'IP du client', async () => {
      getClientIp.mockReturnValue('192.168.1.100')

      const request = createMockRequest(validFormData)
      await POST(request)

      expect(checkRateLimit).toHaveBeenCalledWith('192.168.1.100', expect.any(Object))
    })

    it('ne devrait pas appeler sendContactEmails si rate limited', async () => {
      checkRateLimit.mockReturnValue({
        allowed: false,
        remaining: 0,
        resetAt: Date.now() + 60000,
      })

      const request = createMockRequest(validFormData)
      await POST(request)

      expect(sendContactEmails).not.toHaveBeenCalled()
    })
  })

  // ==========================================================================
  // Erreurs SMTP
  // ==========================================================================

  describe('Erreurs SMTP', () => {
    it('devrait retourner 500 si la notification admin échoue', async () => {
      sendContactEmails.mockResolvedValue({
        confirmation: { success: true, messageId: 'conf-123' },
        notification: { success: false, error: 'SMTP connection refused' },
      })

      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('erreur')
    })

    it('devrait inclure un message générique sans détails techniques', async () => {
      sendContactEmails.mockResolvedValue({
        confirmation: { success: false, error: 'ECONNREFUSED' },
        notification: { success: false, error: 'EAUTH: Invalid credentials' },
      })

      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.message).not.toContain('ECONNREFUSED')
      expect(data.message).not.toContain('EAUTH')
    })
  })

  // ==========================================================================
  // Erreurs inattendues
  // ==========================================================================

  describe('Erreurs inattendues', () => {
    it('devrait retourner 500 pour une exception non gérée', async () => {
      sendContactEmails.mockRejectedValue(new Error('Unexpected error'))

      const request = createMockRequest(validFormData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toContain('erreur inattendue')
    })
  })
})

// ==========================================================================
// OPTIONS /api/contact
// ==========================================================================

describe('OPTIONS /api/contact', () => {
  let OPTIONS: () => Response

  beforeEach(async () => {
    vi.resetModules()
    const routeModule = await import('@/app/api/contact/route')
    OPTIONS = routeModule.OPTIONS
  })

  it('devrait retourner 204 avec les headers CORS', () => {
    const response = OPTIONS()

    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type')
  })
})
