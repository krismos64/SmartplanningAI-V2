/**
 * Tests unitaires pour le module impersonation
 *
 * Vérifie :
 * - getImpersonationContext() : lecture cookie Edge-compatible
 * - parseImpersonationCookie() : validation et expiration
 * - assertNotImpersonating() : blocage des actions sensibles
 * - startImpersonation() / stopImpersonation() : gestion cookies
 *
 * @ticket SP-447
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { ImpersonationContext } from '@/types/auth'
import { IMPERSONATION_COOKIE_NAME, IMPERSONATION_MAX_AGE } from '@/types/auth'

// ============================================================================
// Mocks
// ============================================================================

// Mock next/headers cookies()
const mockGet = vi.fn()
const mockSet = vi.fn()
const mockDelete = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    })
  ),
}))

// Import après les mocks
import {
  getImpersonationContext,
  getImpersonationContextFromHeaders,
  startImpersonation,
  stopImpersonation,
  assertNotImpersonating,
} from '../impersonation'

// ============================================================================
// Fixtures
// ============================================================================

function createValidContext(
  overrides?: Partial<ImpersonationContext>
): ImpersonationContext {
  return {
    originalAdminId: 'admin-123',
    targetUserId: 'user-456',
    targetCompanyId: 'company-789',
    targetRole: 'DIRECTOR',
    targetEmail: 'director@example.com',
    targetCompanyName: 'TechCorp',
    startedAt: Date.now(),
    ...overrides,
  }
}

function createRequestWithCookie(cookieValue: string | null): Request {
  const headers = new Headers()
  if (cookieValue !== null) {
    headers.set(
      'cookie',
      `${IMPERSONATION_COOKIE_NAME}=${encodeURIComponent(cookieValue)}`
    )
  }
  return new Request('http://localhost:3000', { headers })
}

// ============================================================================
// Tests
// ============================================================================

describe('impersonation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // getImpersonationContext (Edge-compatible, via Request)
  // --------------------------------------------------------------------------

  describe('getImpersonationContext', () => {
    it('retourne null si pas de cookie header', () => {
      const request = new Request('http://localhost:3000')
      const result = getImpersonationContext(request)
      expect(result).toBeNull()
    })

    it('retourne null si le cookie sp-impersonation est absent', () => {
      const headers = new Headers()
      headers.set('cookie', 'other-cookie=value')
      const request = new Request('http://localhost:3000', { headers })

      const result = getImpersonationContext(request)
      expect(result).toBeNull()
    })

    it('retourne null si le cookie contient du JSON invalide', () => {
      const request = createRequestWithCookie('not-json')
      const result = getImpersonationContext(request)
      expect(result).toBeNull()
    })

    it('retourne null si le cookie contient un objet incomplet', () => {
      const request = createRequestWithCookie(
        JSON.stringify({ originalAdminId: 'admin-123' })
      )
      const result = getImpersonationContext(request)
      expect(result).toBeNull()
    })

    it('retourne null si le cookie est expiré (> IMPERSONATION_MAX_AGE)', () => {
      const expiredContext = createValidContext({
        startedAt: Date.now() - (IMPERSONATION_MAX_AGE + 1) * 1000,
      })
      const request = createRequestWithCookie(JSON.stringify(expiredContext))
      const result = getImpersonationContext(request)
      expect(result).toBeNull()
    })

    it('retourne le contexte si le cookie est valide et non expiré', () => {
      const context = createValidContext()
      const request = createRequestWithCookie(JSON.stringify(context))
      const result = getImpersonationContext(request)

      expect(result).not.toBeNull()
      expect(result?.originalAdminId).toBe('admin-123')
      expect(result?.targetUserId).toBe('user-456')
      expect(result?.targetCompanyId).toBe('company-789')
      expect(result?.targetRole).toBe('DIRECTOR')
      expect(result?.targetEmail).toBe('director@example.com')
      expect(result?.targetCompanyName).toBe('TechCorp')
    })

    it('retourne le contexte avec plusieurs cookies dans le header', () => {
      const context = createValidContext()
      const headers = new Headers()
      headers.set(
        'cookie',
        `session=abc; ${IMPERSONATION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(context))}; other=xyz`
      )
      const request = new Request('http://localhost:3000', { headers })

      const result = getImpersonationContext(request)
      expect(result).not.toBeNull()
      expect(result?.targetUserId).toBe('user-456')
    })
  })

  // --------------------------------------------------------------------------
  // getImpersonationContextFromHeaders (Server-side, via next/headers)
  // --------------------------------------------------------------------------

  describe('getImpersonationContextFromHeaders', () => {
    it('retourne null si pas de cookie', async () => {
      mockGet.mockReturnValue(null)
      const result = await getImpersonationContextFromHeaders()
      expect(result).toBeNull()
    })

    it('retourne null si le cookie est vide', async () => {
      mockGet.mockReturnValue({ value: '' })
      const result = await getImpersonationContextFromHeaders()
      expect(result).toBeNull()
    })

    it('retourne le contexte si le cookie est valide', async () => {
      const context = createValidContext()
      mockGet.mockReturnValue({ value: JSON.stringify(context) })
      const result = await getImpersonationContextFromHeaders()

      expect(result).not.toBeNull()
      expect(result?.originalAdminId).toBe('admin-123')
      expect(result?.targetCompanyName).toBe('TechCorp')
    })

    it('retourne null si le cookie est expiré', async () => {
      const expiredContext = createValidContext({
        startedAt: Date.now() - (IMPERSONATION_MAX_AGE + 1) * 1000,
      })
      mockGet.mockReturnValue({ value: JSON.stringify(expiredContext) })
      const result = await getImpersonationContextFromHeaders()
      expect(result).toBeNull()
    })
  })

  // --------------------------------------------------------------------------
  // startImpersonation
  // --------------------------------------------------------------------------

  describe('startImpersonation', () => {
    it('pose le cookie avec les bonnes options', async () => {
      const context = createValidContext()
      await startImpersonation(context)

      expect(mockSet).toHaveBeenCalledOnce()
      expect(mockSet).toHaveBeenCalledWith(
        IMPERSONATION_COOKIE_NAME,
        JSON.stringify(context),
        {
          httpOnly: true,
          secure: false, // NODE_ENV=test
          sameSite: 'lax',
          path: '/',
          maxAge: IMPERSONATION_MAX_AGE,
        }
      )
    })
  })

  // --------------------------------------------------------------------------
  // stopImpersonation
  // --------------------------------------------------------------------------

  describe('stopImpersonation', () => {
    it('supprime le cookie', async () => {
      await stopImpersonation()

      expect(mockDelete).toHaveBeenCalledOnce()
      expect(mockDelete).toHaveBeenCalledWith(IMPERSONATION_COOKIE_NAME)
    })
  })

  // --------------------------------------------------------------------------
  // assertNotImpersonating
  // --------------------------------------------------------------------------

  describe('assertNotImpersonating', () => {
    it("ne lance pas d'erreur si pas d'impersonation active", async () => {
      mockGet.mockReturnValue(null)
      await expect(assertNotImpersonating()).resolves.toBeUndefined()
    })

    it('lance une erreur si une impersonation est active', async () => {
      const context = createValidContext()
      mockGet.mockReturnValue({ value: JSON.stringify(context) })

      await expect(assertNotImpersonating()).rejects.toThrow(
        'Action interdite en mode impersonation'
      )
    })

    it("ne lance pas d'erreur si le cookie est expiré", async () => {
      const expiredContext = createValidContext({
        startedAt: Date.now() - (IMPERSONATION_MAX_AGE + 1) * 1000,
      })
      mockGet.mockReturnValue({ value: JSON.stringify(expiredContext) })

      await expect(assertNotImpersonating()).resolves.toBeUndefined()
    })
  })

  // --------------------------------------------------------------------------
  // Constantes
  // --------------------------------------------------------------------------

  describe('constantes', () => {
    it('IMPERSONATION_COOKIE_NAME vaut "sp-impersonation"', () => {
      expect(IMPERSONATION_COOKIE_NAME).toBe('sp-impersonation')
    })

    it('IMPERSONATION_MAX_AGE vaut 3600 secondes', () => {
      expect(IMPERSONATION_MAX_AGE).toBe(3600)
    })
  })
})
