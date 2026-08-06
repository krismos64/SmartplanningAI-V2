/**
 * Tests unitaires — email de bienvenue déclenché par la vérification d'adresse
 *
 * L'email de bienvenue partait auparavant depuis `registerAction`, en `await`
 * juste avant l'email de vérification envoyé en fire-and-forget : il arrivait
 * donc en premier dans la boîte du nouvel inscrit, qui était accueilli sur un
 * compte encore bloqué par le verrou `emailVerified` (SP-526).
 *
 * Il est maintenant envoyé par `verifyEmailAction`, une fois l'adresse validée.
 *
 * Pattern projet : mock manuel Prisma (pas mockDeep), vi.hoisted(), faux CUIDs.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks (hoistés)
// ============================================================================

const {
  mockUserFindUnique,
  mockVerificationTokenFindUnique,
  mockVerificationTokenDelete,
  mockTransaction,
  mockSendWelcomeEmail,
  mockLogAuthEmail,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockVerificationTokenFindUnique: vi.fn(),
  mockVerificationTokenDelete: vi.fn(),
  mockTransaction: vi.fn(),
  mockSendWelcomeEmail: vi.fn(),
  mockLogAuthEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      update: vi.fn(),
    },
    verificationToken: {
      findUnique: (...args: any[]) => mockVerificationTokenFindUnique(...args),
      delete: (...args: any[]) => mockVerificationTokenDelete(...args),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}))

vi.mock('@/lib/services/verification.service', () => ({
  sendVerificationEmailCore: vi.fn(),
}))

vi.mock('@/lib/password', () => ({
  verifyPassword: vi.fn(),
}))

vi.mock('@/lib/email/templates/welcome', () => ({
  sendWelcomeEmail: (...args: any[]) => mockSendWelcomeEmail(...args),
}))

vi.mock('@/lib/email/auth/log-auth-email', () => ({
  AuthEmailType: {
    WELCOME: 'WELCOME',
    EMAIL_VERIFICATION: 'EMAIL_VERIFICATION',
  },
  logAuthEmail: (...args: any[]) => mockLogAuthEmail(...args),
}))

// ============================================================================
// Imports (après les mocks)
// ============================================================================

import { verifyEmailAction } from '@/lib/actions/verification-actions'

// ============================================================================
// Fixtures (faux CUIDs valides)
// ============================================================================

const USER_ID = 'cl000000000000000000user1'
const COMPANY_ID = 'cl00000000000000000comp1'
const VALID_TOKEN = 'verify_11111111-2222-3333-4444-555555555555'
const USER_EMAIL = 'jane.director@acme.com'

/** Laisse les promesses fire-and-forget du welcome se résoudre */
async function flushPendingPromises(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('verifyEmailAction — email de bienvenue', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockVerificationTokenFindUnique.mockResolvedValue({
      token: VALID_TOKEN,
      identifier: USER_EMAIL,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    })
    mockUserFindUnique.mockResolvedValue({
      id: USER_ID,
      name: 'Jane Director',
      email: USER_EMAIL,
      companyId: COMPANY_ID,
      emailVerified: null,
    })
    mockTransaction.mockResolvedValue([])
    mockSendWelcomeEmail.mockResolvedValue({
      success: true,
      messageId: 'msg_1',
    })
    mockLogAuthEmail.mockResolvedValue(undefined)
  })

  it("envoie l'email de bienvenue après la validation de l'adresse", async () => {
    const result = await verifyEmailAction({ token: VALID_TOKEN })
    await flushPendingPromises()

    expect(result.success).toBe(true)
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
      firstName: 'Jane',
      email: USER_EMAIL,
    })
  })

  it("trace l'envoi dans EmailLog avec le type WELCOME", async () => {
    await verifyEmailAction({ token: VALID_TOKEN })
    await flushPendingPromises()

    expect(mockLogAuthEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: COMPANY_ID,
        emailType: 'WELCOME',
        recipientEmail: USER_EMAIL,
        success: true,
      })
    )
  })

  it("ne renvoie pas l'email si l'adresse était déjà vérifiée", async () => {
    mockUserFindUnique.mockResolvedValue({
      id: USER_ID,
      name: 'Jane Director',
      email: USER_EMAIL,
      companyId: COMPANY_ID,
      emailVerified: new Date('2026-01-01T00:00:00Z'),
    })

    const result = await verifyEmailAction({ token: VALID_TOKEN })
    await flushPendingPromises()

    expect(result.success).toBe(true)
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled()
  })

  it("n'échoue pas la vérification si l'envoi du welcome plante", async () => {
    mockSendWelcomeEmail.mockRejectedValue(new Error('SMTP down'))

    const result = await verifyEmailAction({ token: VALID_TOKEN })
    await flushPendingPromises()

    expect(result.success).toBe(true)
  })

  it("n'envoie rien quand le token est invalide", async () => {
    mockVerificationTokenFindUnique.mockResolvedValue(null)

    const result = await verifyEmailAction({ token: VALID_TOKEN })
    await flushPendingPromises()

    expect(result.success).toBe(false)
    expect(mockSendWelcomeEmail).not.toHaveBeenCalled()
  })
})
