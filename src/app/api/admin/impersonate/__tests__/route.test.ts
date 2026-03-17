/**
 * Tests unitaires pour les API routes d'impersonation
 *
 * Verifie :
 * - POST /api/admin/impersonate : demarrage impersonation
 * - DELETE /api/admin/impersonate : arret impersonation
 * - Controle RBAC : seul SYSTEM_ADMIN peut impersonner
 * - Blocage auto-impersonation SYSTEM_ADMIN
 * - Audit log start/stop
 *
 * @ticket SP-456
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (vi.hoisted pour eviter le TDZ avec vi.mock factories)
// ============================================================================

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  cookieDelete: vi.fn(),
  auth: vi.fn(),
  logAuditAction: vi.fn(() => Promise.resolve()),
  prisma: {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      get: mocks.cookieGet,
      set: mocks.cookieSet,
      delete: mocks.cookieDelete,
    })
  ),
}))

vi.mock('@/lib/auth', () => ({
  auth: mocks.auth,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: mocks.prisma,
}))

vi.mock('@/lib/services/audit/audit.service', () => ({
  logAuditAction: mocks.logAuditAction,
}))

// ============================================================================
// Imports (apres les mocks)
// ============================================================================

import { POST, DELETE } from '@/app/api/admin/impersonate/route'

// ============================================================================
// Types pour les reponses API (evite les unsafe-any ESLint)
// ============================================================================

interface ImpersonateSuccessResponse {
  success: boolean
  redirectTo: string
  warning?: string
  impersonation: {
    isImpersonating: boolean
    impersonatedCompanyName: string
    impersonatedUserId: string
  }
}

interface ImpersonateErrorResponse {
  error: string
}

// ============================================================================
// Helpers
// ============================================================================

function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/admin/impersonate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function mockSession(role: string, userId = 'admin-001') {
  mocks.auth.mockResolvedValue({
    user: {
      id: userId,
      email: 'contact@smartplanning.fr',
      role,
      companyId: null,
    },
  })
}

const TARGET_USER = {
  id: 'user-001',
  email: 'john.doe@techcorp.com',
  name: 'John Doe',
  role: 'DIRECTOR',
  isActive: true,
  companyId: 'company-001',
  company: {
    id: 'company-001',
    name: 'TechCorp',
    isActive: true,
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('API /api/admin/impersonate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // POST - Demarrer impersonation
  // --------------------------------------------------------------------------

  describe('POST - demarrer impersonation', () => {
    it('retourne 401 si non authentifie', async () => {
      mocks.auth.mockResolvedValue(null)

      const request = createRequest({ companyId: 'company-001' })
      const response = await POST(request)

      expect(response.status).toBe(401)
    })

    it('retourne 403 si role non SYSTEM_ADMIN', async () => {
      mockSession('DIRECTOR')

      const request = createRequest({ companyId: 'company-001' })
      const response = await POST(request)

      expect(response.status).toBe(403)
    })

    it('retourne 400 si body vide (ni targetUserId ni companyId)', async () => {
      mockSession('SYSTEM_ADMIN')

      const request = createRequest({})
      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('retourne 404 si aucun utilisateur actif dans la company', async () => {
      mockSession('SYSTEM_ADMIN')
      mocks.prisma.user.findFirst.mockResolvedValue(null)

      const request = createRequest({ companyId: 'company-empty' })
      const response = await POST(request)

      expect(response.status).toBe(404)
    })

    it('retourne 400 si la cible est un SYSTEM_ADMIN', async () => {
      mockSession('SYSTEM_ADMIN')
      mocks.prisma.user.findUnique.mockResolvedValue({
        ...TARGET_USER,
        role: 'SYSTEM_ADMIN',
      })

      const request = createRequest({ targetUserId: 'admin-002' })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = (await response.json()) as ImpersonateErrorResponse
      expect(data.error).toContain('SYSTEM_ADMIN')
    })

    it('retourne 400 si la cible est desactivee', async () => {
      mockSession('SYSTEM_ADMIN')
      mocks.prisma.user.findUnique.mockResolvedValue({
        ...TARGET_USER,
        isActive: false,
      })

      const request = createRequest({ targetUserId: 'user-001' })
      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = (await response.json()) as ImpersonateErrorResponse
      expect(data.error).toContain('désactivé')
    })

    it('demarre impersonation avec companyId, pose le cookie sur la response et cree audit log', async () => {
      mockSession('SYSTEM_ADMIN')
      mocks.prisma.user.findFirst.mockResolvedValue({
        id: 'user-001',
        role: 'DIRECTOR',
      })
      mocks.prisma.user.findUnique.mockResolvedValue(TARGET_USER)

      const request = createRequest({ companyId: 'company-001' })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = (await response.json()) as ImpersonateSuccessResponse

      expect(data.success).toBe(true)
      expect(data.redirectTo).toBe('/app/dashboard')
      expect(data.impersonation.isImpersonating).toBe(true)
      expect(data.impersonation.impersonatedCompanyName).toBe('TechCorp')
      expect(data.impersonation.impersonatedUserId).toBe('user-001')

      // Cookie posé via response.cookies.set()
      const setCookie = response.headers.get('set-cookie')
      expect(setCookie).toBeTruthy()
      expect(setCookie).toContain('sp-impersonation')
      expect(setCookie).toContain('HttpOnly')
      expect(setCookie).toContain('Path=/')

      // Audit log cree (fire-and-forget)
      expect(mocks.logAuditAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'IMPERSONATE',
          entityType: 'USER',
          entityId: 'user-001',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          details: expect.objectContaining({
            event: 'start',
            targetUserId: 'user-001',
            targetCompanyName: 'TechCorp',
          }),
        })
      )
    })

    it('demarre impersonation avec targetUserId direct', async () => {
      mockSession('SYSTEM_ADMIN')
      mocks.prisma.user.findUnique.mockResolvedValue(TARGET_USER)

      const request = createRequest({ targetUserId: 'user-001' })
      const response = await POST(request)

      expect(response.status).toBe(200)
      const data = (await response.json()) as ImpersonateSuccessResponse
      expect(data.success).toBe(true)
      expect(data.impersonation.impersonatedUserId).toBe('user-001')
    })
  })

  // --------------------------------------------------------------------------
  // DELETE - Arreter impersonation
  // --------------------------------------------------------------------------

  describe('DELETE - arreter impersonation', () => {
    it('retourne 200 avec warning si aucune impersonation active (nettoyage gracieux)', async () => {
      mocks.cookieGet.mockReturnValue(null)

      const response = await DELETE()

      expect(response.status).toBe(200)
      const data = (await response.json()) as ImpersonateSuccessResponse
      expect(data.success).toBe(true)
      expect(data.warning).toContain('cookie nettoyé')
      expect(data.redirectTo).toBe('/app/admin/companies')

      // Cookie supprimé par sécurité
      const setCookie = response.headers.get('set-cookie')
      expect(setCookie).toContain('sp-impersonation')
    })

    it('arrete impersonation, supprime cookie et cree audit log stop', async () => {
      const context = {
        originalAdminId: 'admin-001',
        targetUserId: 'user-001',
        targetCompanyId: 'company-001',
        targetRole: 'DIRECTOR',
        targetEmail: 'john.doe@techcorp.com',
        targetCompanyName: 'TechCorp',
        startedAt: Date.now() - 60000,
      }
      mocks.cookieGet.mockReturnValue({
        value: JSON.stringify(context),
      })

      const response = await DELETE()

      expect(response.status).toBe(200)
      const data = (await response.json()) as ImpersonateSuccessResponse
      expect(data.success).toBe(true)
      expect(data.redirectTo).toBe('/app/admin/companies')

      // Cookie supprimé via response.cookies.delete()
      const setCookie = response.headers.get('set-cookie')
      expect(setCookie).toContain('sp-impersonation')

      // Audit log stop cree
      expect(mocks.logAuditAction).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'IMPERSONATE',
          entityType: 'USER',
          entityId: 'user-001',
          userId: 'admin-001',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          details: expect.objectContaining({
            event: 'stop',
            targetUserId: 'user-001',
          }),
        })
      )
    })
  })
})
