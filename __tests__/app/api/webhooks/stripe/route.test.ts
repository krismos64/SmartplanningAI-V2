/**
 * Tests unitaires pour la route webhook Stripe
 *
 * @ticket SP-351
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (vi.hoisted pour résoudre le hoisting)
// ============================================================================

const mockConstructEvent = vi.hoisted(() => vi.fn())
const mockHandleWebhookEvent = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  },
}))

vi.mock('@/lib/services/stripe', () => ({
  handleWebhookEvent: mockHandleWebhookEvent,
}))

// ============================================================================
// Import APRÈS les mocks
// ============================================================================

import { POST } from '@/app/api/webhooks/stripe/route'

// ============================================================================
// Helpers
// ============================================================================

function createMockRequest(
  body: string,
  headers: Record<string, string> = {}
): Request {
  return {
    text: vi.fn().mockResolvedValue(body),
    headers: {
      get: (name: string) => headers[name] ?? null,
    },
  } as unknown as Request
}

const VALID_BODY = JSON.stringify({ type: 'test.event' })
const VALID_SIGNATURE = 't=123,v1=abc123'
const VALID_EVENT = {
  id: 'evt_test',
  type: 'checkout.session.completed',
  data: { object: {} },
}

// ============================================================================
// Tests
// ============================================================================

describe('POST /api/webhooks/stripe', () => {
  const originalEnv = process.env.STRIPE_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret'
  })

  afterAll(() => {
    if (originalEnv !== undefined) {
      process.env.STRIPE_WEBHOOK_SECRET = originalEnv
    } else {
      delete process.env.STRIPE_WEBHOOK_SECRET
    }
  })

  it('retourne 500 si STRIPE_WEBHOOK_SECRET non configurée', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toContain('not configured')
  })

  it('retourne 400 si le header stripe-signature est manquant', async () => {
    const request = createMockRequest(VALID_BODY)

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('stripe-signature')
  })

  it('retourne 400 si la signature est invalide', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Signature verification failed')
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': 'invalid_sig',
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('Signature verification failed')
  })

  it('appelle constructEvent avec raw body, signature et secret', async () => {
    mockConstructEvent.mockReturnValue(VALID_EVENT)
    mockHandleWebhookEvent.mockResolvedValue({
      success: true,
      data: { handled: true, eventType: 'test' },
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    await POST(request)

    expect(mockConstructEvent).toHaveBeenCalledWith(
      VALID_BODY,
      VALID_SIGNATURE,
      'whsec_test_secret'
    )
  })

  it('retourne 200 avec received=true après traitement réussi', async () => {
    mockConstructEvent.mockReturnValue(VALID_EVENT)
    mockHandleWebhookEvent.mockResolvedValue({
      success: true,
      data: { handled: true, eventType: 'checkout.session.completed', action: 'subscription_activated' },
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.received).toBe(true)
  })

  it('retourne 500 si le handler lève une exception', async () => {
    mockConstructEvent.mockReturnValue(VALID_EVENT)
    mockHandleWebhookEvent.mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.error).toContain('Database connection failed')
  })

  it('lit le body via request.text() (raw body)', async () => {
    mockConstructEvent.mockReturnValue(VALID_EVENT)
    mockHandleWebhookEvent.mockResolvedValue({
      success: true,
      data: { handled: true, eventType: 'test' },
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    await POST(request)

    expect(request.text).toHaveBeenCalled()
  })

  it('propage le résultat du handler dans la réponse', async () => {
    const handlerResult = {
      success: true,
      data: {
        handled: true,
        eventType: 'invoice.paid',
        action: 'payment_recorded',
      },
    }
    mockConstructEvent.mockReturnValue(VALID_EVENT)
    mockHandleWebhookEvent.mockResolvedValue(handlerResult)

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(json.received).toBe(true)
    expect(json.success).toBe(true)
  })

  it('passe l\'événement construit au handler', async () => {
    const event = {
      id: 'evt_specific',
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub_123' } },
    }
    mockConstructEvent.mockReturnValue(event)
    mockHandleWebhookEvent.mockResolvedValue({
      success: true,
      data: { handled: true, eventType: 'customer.subscription.updated' },
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    await POST(request)

    expect(mockHandleWebhookEvent).toHaveBeenCalledWith(event)
  })

  it('gère les erreurs non-Error dans constructEvent', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw 'string error'
    })

    const request = createMockRequest(VALID_BODY, {
      'stripe-signature': VALID_SIGNATURE,
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.error).toContain('Unknown error')
  })
})
