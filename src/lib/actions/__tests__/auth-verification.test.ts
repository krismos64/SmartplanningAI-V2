/**
 * Tests unitaires — verrou de vérification email (SP-526)
 *
 * Couvre les deux points de contrôle introduits par SP-526 :
 *
 * 1. authorizeCredentials() (src/lib/auth.ts) — LA barrière de sécurité :
 *    - email non vérifié → throw Error('EmailNotVerified')
 *    - email vérifié → connexion autorisée
 *    - user inexistant / mauvais mot de passe → null (comportement inchangé)
 *    - isActive false → throw Error('AccountDisabled') (non-régression)
 *
 * 2. checkEmailVerificationStatus() (verification-actions.ts) — le pré-check UX :
 *    - credentials valides + non vérifié → NOT_VERIFIED
 *    - credentials valides + vérifié → VERIFIED
 *    - user inexistant / mauvais mot de passe → INVALID_CREDENTIALS
 *
 * Pattern projet : mock manuel Prisma (pas mockDeep), vi.hoisted() pour les
 * mocks hoistés, faux CUIDs valides.
 *
 * @ticket SP-526
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (hoistés via vi.hoisted)
// ============================================================================

const {
  mockUserFindUnique,
  mockUserUpdate,
  mockVerifyPassword,
  mockLogAuditAction,
  mockRegisterSession,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockUserUpdate: vi.fn(),
  mockVerifyPassword: vi.fn(),
  mockLogAuditAction: vi.fn(),
  mockRegisterSession: vi.fn(),
}))

// next-auth importe next/server au module-load, ce qui casse la résolution
// ESM en environnement de test (jsdom). On neutralise NextAuth : authorizeCredentials
// est notre propre fonction, indépendante de l'objet NextAuth retourné.
vi.mock('next-auth', () => ({
  default: () => ({
    handlers: {},
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}))

vi.mock('next-auth/providers/credentials', () => ({
  default: (config: any) => config,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      update: (...args: any[]) => mockUserUpdate(...args),
    },
  },
}))

vi.mock('@/lib/password', () => ({
  verifyPassword: (...args: any[]) => mockVerifyPassword(...args),
}))

vi.mock('@/lib/services/audit', () => ({
  logAuditAction: (...args: any[]) => mockLogAuditAction(...args),
}))

vi.mock('@/lib/session-store', () => ({
  registerSession: (...args: any[]) => mockRegisterSession(...args),
  removeSession: vi.fn(),
}))

// auth.config importe subscription-guard / permissions au module-load via
// authConfig ; on neutralise pour éviter d'exécuter cette config dans le test.
vi.mock('@/lib/auth.config', () => ({
  authConfig: { providers: [], callbacks: {} },
}))

// ============================================================================
// Imports (après les mocks)
// ============================================================================

import { authorizeCredentials } from '@/lib/auth'
import { checkEmailVerificationStatus } from '@/lib/actions/verification-actions'

// ============================================================================
// Fixtures (faux CUIDs valides)
// ============================================================================

const USER_ID = 'cl000000000000000000user1'
const COMPANY_ID = 'cl00000000000000000comp1'

/** Construit un user Prisma complet renvoyé par findUnique dans authorize() */
function buildAuthUser(overrides: Record<string, any> = {}) {
  return {
    id: USER_ID,
    email: 'director@acme.com',
    name: 'Jane Director',
    password: '$2a$10$hashedpassword',
    role: 'DIRECTOR',
    companyId: COMPANY_ID,
    emailVerified: new Date('2026-01-01T00:00:00Z'),
    image: null,
    isActive: true,
    company: {
      id: COMPANY_ID,
      isActive: true,
      trialEndsAt: null,
      subscription: { status: 'ACTIVE', currentPeriodEnd: null },
    },
    ...overrides,
  }
}

const VALID_CREDENTIALS = {
  email: 'director@acme.com',
  password: 'Password123!',
}

beforeEach(() => {
  vi.clearAllMocks()
  // Par défaut : mot de passe valide, update/audit/session no-op résolus
  mockVerifyPassword.mockResolvedValue(true)
  mockUserUpdate.mockResolvedValue({})
  mockLogAuditAction.mockResolvedValue(undefined)
  mockRegisterSession.mockResolvedValue(undefined)
})

// ============================================================================
// 1. authorizeCredentials() — la barrière de sécurité
// ============================================================================

describe('authorizeCredentials() — verrou emailVerified (SP-526)', () => {
  it('lève EmailNotVerified quand emailVerified est null', async () => {
    mockUserFindUnique.mockResolvedValue(buildAuthUser({ emailVerified: null }))

    await expect(authorizeCredentials(VALID_CREDENTIALS)).rejects.toThrow(
      'EmailNotVerified'
    )

    // On ne doit PAS être allé jusqu'à la mise à jour de lastLoginAt
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('autorise la connexion quand emailVerified est renseigné', async () => {
    mockUserFindUnique.mockResolvedValue(buildAuthUser())

    const result = await authorizeCredentials(VALID_CREDENTIALS)

    expect(result).not.toBeNull()
    expect(result?.id).toBe(USER_ID)
    expect(result?.email).toBe('director@acme.com')
    expect(result?.role).toBe('DIRECTOR')
    // lastLoginAt mis à jour → on a bien franchi tous les contrôles
    expect(mockUserUpdate).toHaveBeenCalledOnce()
  })

  it('retourne null si user inexistant (comportement inchangé)', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const result = await authorizeCredentials(VALID_CREDENTIALS)

    expect(result).toBeNull()
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  it('retourne null si mauvais mot de passe (comportement inchangé)', async () => {
    mockUserFindUnique.mockResolvedValue(buildAuthUser())
    mockVerifyPassword.mockResolvedValue(false)

    const result = await authorizeCredentials(VALID_CREDENTIALS)

    expect(result).toBeNull()
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('lève AccountDisabled si isActive false (non-régression)', async () => {
    // emailVerified renseigné pour franchir le verrou SP-526 et atteindre
    // la vérification isActive (qui vient juste après)
    mockUserFindUnique.mockResolvedValue(
      buildAuthUser({ isActive: false, emailVerified: new Date() })
    )

    await expect(authorizeCredentials(VALID_CREDENTIALS)).rejects.toThrow(
      'AccountDisabled'
    )
  })
})

// ============================================================================
// 2. checkEmailVerificationStatus() — le pré-check UX
// ============================================================================

describe('checkEmailVerificationStatus() — pré-check UX (SP-526)', () => {
  it('NOT_VERIFIED quand credentials valides mais email non vérifié', async () => {
    mockUserFindUnique.mockResolvedValue({
      password: '$2a$10$hashedpassword',
      emailVerified: null,
    })
    mockVerifyPassword.mockResolvedValue(true)

    const result = await checkEmailVerificationStatus(VALID_CREDENTIALS)

    expect(result.status).toBe('NOT_VERIFIED')
  })

  it('VERIFIED quand credentials valides et email vérifié', async () => {
    mockUserFindUnique.mockResolvedValue({
      password: '$2a$10$hashedpassword',
      emailVerified: new Date('2026-01-01T00:00:00Z'),
    })
    mockVerifyPassword.mockResolvedValue(true)

    const result = await checkEmailVerificationStatus(VALID_CREDENTIALS)

    expect(result.status).toBe('VERIFIED')
  })

  it('INVALID_CREDENTIALS quand user inexistant', async () => {
    mockUserFindUnique.mockResolvedValue(null)

    const result = await checkEmailVerificationStatus(VALID_CREDENTIALS)

    expect(result.status).toBe('INVALID_CREDENTIALS')
    // On ne révèle rien : pas de vérification de mot de passe inutile
    expect(mockVerifyPassword).not.toHaveBeenCalled()
  })

  it('INVALID_CREDENTIALS quand mauvais mot de passe (anti-énumération)', async () => {
    mockUserFindUnique.mockResolvedValue({
      password: '$2a$10$hashedpassword',
      emailVerified: null, // même un compte non vérifié ne doit pas leaker
    })
    mockVerifyPassword.mockResolvedValue(false)

    const result = await checkEmailVerificationStatus(VALID_CREDENTIALS)

    // Mauvais mot de passe → indifférencié, on ne révèle PAS NOT_VERIFIED
    expect(result.status).toBe('INVALID_CREDENTIALS')
  })
})
