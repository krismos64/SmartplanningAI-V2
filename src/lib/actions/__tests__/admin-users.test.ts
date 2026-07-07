/**
 * Tests unitaires pour les Server Actions admin-users
 *
 * Couvre :
 * - RBAC : non-connecté, rôle insuffisant, SYSTEM_ADMIN OK
 * - getAllUsersAdmin : filtres verified/companyId, mapping emailVerified
 * - getCompanyOptionsAdmin : RBAC + liste triée
 * - resendVerificationEmailAdmin : validation Zod, garde-fous métier,
 *   rate limit, envoi + audit trail
 *
 * @ticket SP-472, SP-543
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

const mockUserFindMany = vi.fn()
const mockUserCount = vi.fn()
const mockUserFindUnique = vi.fn()
const mockUserUpdate = vi.fn()
const mockCompanyFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockUserFindMany(...args),
      count: (...args: unknown[]) => mockUserCount(...args),
      findUnique: (...args: unknown[]) => mockUserFindUnique(...args),
      update: (...args: unknown[]) => mockUserUpdate(...args),
    },
    company: {
      findMany: (...args: unknown[]) => mockCompanyFindMany(...args),
    },
  },
}))

const mockCheckRateLimit = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}))

const mockSendVerificationEmailAction = vi.fn()
vi.mock('@/lib/actions/verification-actions', () => ({
  sendVerificationEmailAction: (...args: unknown[]) =>
    mockSendVerificationEmailAction(...args),
}))

const mockLogAuditAction = vi.fn()
vi.mock('@/lib/services/audit/audit.service', () => ({
  logAuditAction: (...args: unknown[]) => mockLogAuditAction(...args),
}))

// ============================================================================
// Import après mocks
// ============================================================================

import {
  getAllUsersAdmin,
  getCompanyOptionsAdmin,
  resendVerificationEmailAdmin,
} from '../admin-users'

// ============================================================================
// Fixtures
// ============================================================================

const ADMIN_SESSION = {
  user: {
    id: 'cl000000000000000000admin',
    role: 'SYSTEM_ADMIN',
    companyId: null,
  },
}

const DIRECTOR_SESSION = {
  user: {
    id: 'cl00000000000000000direct',
    role: 'DIRECTOR',
    companyId: 'cl0000000000000000company',
  },
}

/** CUID valide pour la validation Zod (pattern tests messagerie) */
const TARGET_USER_ID = 'cl000000000000000000user1'

const UNVERIFIED_USER = {
  id: TARGET_USER_ID,
  email: 'jean@acme.fr',
  emailVerified: null,
  isActive: true,
  companyId: 'cl0000000000000000company',
}

const USER_ROW_DB = {
  id: TARGET_USER_ID,
  email: 'jean@acme.fr',
  name: 'Jean Dupont',
  role: 'EMPLOYEE',
  isActive: true,
  emailVerified: new Date('2026-06-01'),
  companyId: 'cl0000000000000000company',
  company: { id: 'cl0000000000000000company', name: 'Acme Corp' },
  createdAt: new Date('2026-05-01'),
  lastLoginAt: null,
}

// ============================================================================
// Tests
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks()
  mockCheckRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 2,
    resetAt: Date.now() + 3600_000,
  })
  mockSendVerificationEmailAction.mockResolvedValue({ success: true })
  mockLogAuditAction.mockResolvedValue(undefined)
})

describe('RBAC — les actions rejettent les non-SYSTEM_ADMIN', () => {
  it.each([
    ['getAllUsersAdmin', () => getAllUsersAdmin()],
    ['getCompanyOptionsAdmin', () => getCompanyOptionsAdmin()],
    [
      'resendVerificationEmailAdmin',
      () => resendVerificationEmailAdmin(TARGET_USER_ID),
    ],
  ])('%s rejette sans session', async (_name, action) => {
    mockAuth.mockResolvedValue(null)
    await expect(action()).rejects.toThrow('Unauthorized')
  })

  it.each([
    ['getAllUsersAdmin', () => getAllUsersAdmin()],
    ['getCompanyOptionsAdmin', () => getCompanyOptionsAdmin()],
    [
      'resendVerificationEmailAdmin',
      () => resendVerificationEmailAdmin(TARGET_USER_ID),
    ],
  ])('%s rejette un DIRECTOR', async (_name, action) => {
    mockAuth.mockResolvedValue(DIRECTOR_SESSION)
    await expect(action()).rejects.toThrow('Unauthorized')
  })
})

describe('getAllUsersAdmin — filtres SP-543', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockUserFindMany.mockResolvedValue([USER_ROW_DB])
    mockUserCount.mockResolvedValue(1)
  })

  it('mappe emailVerified dans les lignes retournées', async () => {
    const result = await getAllUsersAdmin()

    expect(result.users[0]?.emailVerified).toEqual(new Date('2026-06-01'))
  })

  it('filtre VERIFIED → where emailVerified not null', async () => {
    await getAllUsersAdmin({ verified: 'VERIFIED' })

    const findArgs = mockUserFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.emailVerified).toEqual({ not: null })
  })

  it('filtre UNVERIFIED → where emailVerified null', async () => {
    await getAllUsersAdmin({ verified: 'UNVERIFIED' })

    const findArgs = mockUserFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.emailVerified).toBeNull()
  })

  it('filtre ALL → pas de clause emailVerified', async () => {
    await getAllUsersAdmin({ verified: 'ALL' })

    const findArgs = mockUserFindMany.mock.calls[0]?.[0]
    expect(findArgs.where).not.toHaveProperty('emailVerified')
  })

  it('filtre par companyId', async () => {
    await getAllUsersAdmin({ companyId: 'cl0000000000000000company' })

    const findArgs = mockUserFindMany.mock.calls[0]?.[0]
    expect(findArgs.where.companyId).toBe('cl0000000000000000company')
  })
})

describe('getCompanyOptionsAdmin', () => {
  it('retourne id + nom triés par nom', async () => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockCompanyFindMany.mockResolvedValue([
      { id: 'c1', name: 'Acme' },
      { id: 'c2', name: 'Zebra' },
    ])

    const result = await getCompanyOptionsAdmin()

    expect(result).toHaveLength(2)
    const findArgs = mockCompanyFindMany.mock.calls[0]?.[0]
    expect(findArgs.select).toEqual({ id: true, name: true })
    expect(findArgs.orderBy).toEqual({ name: 'asc' })
  })
})

describe('resendVerificationEmailAdmin', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(ADMIN_SESSION)
    mockUserFindUnique.mockResolvedValue(UNVERIFIED_USER)
  })

  it('rejette un userId non-cuid sans toucher la base', async () => {
    const result = await resendVerificationEmailAdmin('not-a-cuid')

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/invalide/i)
    expect(mockUserFindUnique).not.toHaveBeenCalled()
  })

  it("refuse si l'utilisateur est introuvable", async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/introuvable/i)
    expect(mockSendVerificationEmailAction).not.toHaveBeenCalled()
  })

  it("refuse si l'email est déjà vérifié", async () => {
    mockUserFindUnique.mockResolvedValue({
      ...UNVERIFIED_USER,
      emailVerified: new Date(),
    })

    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/déjà vérifié/i)
    expect(mockSendVerificationEmailAction).not.toHaveBeenCalled()
  })

  it('refuse si le compte est désactivé', async () => {
    mockUserFindUnique.mockResolvedValue({
      ...UNVERIFIED_USER,
      isActive: false,
    })

    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/désactivé/i)
    expect(mockSendVerificationEmailAction).not.toHaveBeenCalled()
  })

  it('refuse au-delà du rate limit (3/h par cible)', async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 1800_000,
    })

    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/limite/i)
    expect(mockSendVerificationEmailAction).not.toHaveBeenCalled()

    // La clé du rate limit isole par utilisateur cible
    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      `admin-resend-verification:${TARGET_USER_ID}`,
      { maxRequests: 3, windowMs: 3600_000 }
    )
  })

  it("envoie l'email et retourne success", async () => {
    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(true)
    expect(mockSendVerificationEmailAction).toHaveBeenCalledWith({
      email: 'jean@acme.fr',
    })
  })

  it("trace l'action dans l'audit trail avec l'admin comme acteur", async () => {
    await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(mockLogAuditAction).toHaveBeenCalledWith({
      action: 'UPDATE',
      entityType: 'USER',
      entityId: TARGET_USER_ID,
      userId: ADMIN_SESSION.user.id,
      companyId: 'cl0000000000000000company',
      details: {
        operation: 'admin_resend_verification_email',
        targetEmail: 'jean@acme.fr',
      },
    })
  })

  it("un échec de l'audit ne bloque pas le succès (fire-and-forget)", async () => {
    mockLogAuditAction.mockRejectedValue(new Error('DB down'))

    const result = await resendVerificationEmailAdmin(TARGET_USER_ID)

    expect(result.success).toBe(true)
  })
})
