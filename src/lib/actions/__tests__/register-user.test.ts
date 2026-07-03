/**
 * Tests de non-régression — registerAction (fix SP audit 02/07/2026)
 *
 * Garantit que :
 * 1. registerAction crée une ligne Subscription (plan FREE, status TRIAL) dans
 *    la même transaction que Company + User + Employee + LeaveBalance.
 *    Sans cette ligne, le cron trial-emails est aveugle à la company.
 *
 * 2. Aucun appel Stripe n'est fait lors de l'inscription (stripeCustomerId
 *    reste null — créé au premier checkout volontaire).
 *
 * 3. Le comportement existant n'est pas régressé : erreur email déjà utilisé,
 *    retour { success, userId, companyId } sur le chemin nominal.
 *
 * Pattern projet : mock manuel vi.hoisted() + import statique (vitest ignore
 * la directive 'use server').
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerAction } from '../auth-actions'

// ============================================================================
// Mocks hoistés
// ============================================================================

const {
  mockUserFindUnique,
  mockCompanyFindUnique,
  mockTransaction,
  mockLogAuditAction,
  mockSendWelcomeEmail,
  mockSendVerificationEmailAction,
  mockSendNewRegistrationEmail,
} = vi.hoisted(() => ({
  mockUserFindUnique: vi.fn(),
  mockCompanyFindUnique: vi.fn(),
  mockTransaction: vi.fn(),
  mockLogAuditAction: vi.fn(),
  mockSendWelcomeEmail: vi.fn(),
  mockSendVerificationEmailAction: vi.fn(),
  mockSendNewRegistrationEmail: vi.fn(),
}))

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

// Prisma : expose user (email-check + generateUniqueSlug) + $transaction
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
    },
    company: {
      findUnique: (...args: any[]) => mockCompanyFindUnique(...args),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}))

// Réexporte le vrai module @prisma/client (enums, etc.) en surchargeant
// uniquement PrismaClientKnownRequestError pour le test d'unicité email.
vi.mock('@prisma/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@prisma/client')>()
  return {
    ...actual,
    Prisma: {
      ...actual.Prisma,
      PrismaClientKnownRequestError: class extends Error {
        code: string
        meta: unknown
        constructor(
          message: string,
          { code, meta }: { code: string; meta?: unknown }
        ) {
          super(message)
          this.code = code
          this.meta = meta
        }
      },
    },
  }
})

vi.mock('@/lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}))

vi.mock('@/lib/services/audit', () => ({
  logAuditAction: (...args: any[]) => mockLogAuditAction(...args),
}))

vi.mock('@/lib/email/templates/welcome', () => ({
  sendWelcomeEmail: (...args: any[]) => mockSendWelcomeEmail(...args),
}))

vi.mock('@/lib/actions/verification-actions', () => ({
  sendVerificationEmailAction: (...args: any[]) =>
    mockSendVerificationEmailAction(...args),
}))

vi.mock('@/lib/email/templates/new-registration', () => ({
  sendNewRegistrationEmail: (...args: any[]) =>
    mockSendNewRegistrationEmail(...args),
}))

vi.mock('@/lib/services/admin-notification.service', () => ({
  createAdminNotification: vi.fn().mockResolvedValue(undefined),
}))

// ============================================================================
// Fixtures
// ============================================================================

const VALID_INPUT = {
  name: 'Alexandre Brenelliere',
  email: 'alexandre.brenelliere@bassinabloc.fr',
  companyName: 'Bassin a Bloc',
  password: 'MotDeP4sse!',
  confirmPassword: 'MotDeP4sse!',
  phone: '0600000000',
  acceptTerms: true as const,
}

const FAKE_COMPANY_ID = 'cmqf5rxe10000qx01y2bjo89p'
const FAKE_USER_ID = 'cl000000000000000000user1'

const FAKE_COMPANY = {
  id: FAKE_COMPANY_ID,
  name: 'Bassin a Bloc',
  trialEndsAt: new Date('2026-07-06T11:57:24.551Z'),
}
const FAKE_USER = { id: FAKE_USER_ID }
const FAKE_EMPLOYEE = { id: 'cl000000000000000000empl1' }

// ============================================================================
// Helper — transaction qui execute le callback avec un tx complet
// ============================================================================

/** Forme minimale de l'argument passe a tx.subscription.create() qu'on inspecte */
interface SubscriptionCreateArg {
  data: {
    plan: string
    status: string
    stripeCustomerId: string | null
    company: { connect: { id: string } }
  }
}

type TxCallback = (tx: Record<string, unknown>) => unknown

function setupSuccessfulTransaction() {
  const txSubscriptionCreate = vi.fn().mockResolvedValue({ id: 'sub_fake' })

  mockTransaction.mockImplementation((cb: TxCallback) =>
    cb({
      company: { create: vi.fn().mockResolvedValue(FAKE_COMPANY) },
      user: { create: vi.fn().mockResolvedValue(FAKE_USER) },
      employee: { create: vi.fn().mockResolvedValue(FAKE_EMPLOYEE) },
      leaveBalance: { create: vi.fn().mockResolvedValue({}) },
      subscription: { create: txSubscriptionCreate },
    })
  )

  return { txSubscriptionCreate }
}

// ============================================================================
// Tests
// ============================================================================

describe("registerAction — creation de Subscription a l'inscription", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Defaults : aucun email existant, slug libre
    mockUserFindUnique.mockResolvedValue(null)
    mockCompanyFindUnique.mockResolvedValue(null) // slug unique disponible
    mockLogAuditAction.mockResolvedValue(undefined)
    mockSendWelcomeEmail.mockResolvedValue(undefined)
    mockSendVerificationEmailAction.mockResolvedValue(undefined)
    mockSendNewRegistrationEmail.mockResolvedValue(undefined)
  })

  it('cree une ligne Subscription (FREE / TRIAL) dans la meme transaction', async () => {
    const { txSubscriptionCreate } = setupSuccessfulTransaction()

    const result = await registerAction(VALID_INPUT)

    expect(result.success).toBe(true)
    expect(txSubscriptionCreate).toHaveBeenCalledOnce()

    const arg = txSubscriptionCreate.mock.calls[0]?.[0] as SubscriptionCreateArg
    expect(arg.data.plan).toBe('FREE')
    expect(arg.data.status).toBe('TRIAL')
  })

  it('cree la Subscription avec stripeCustomerId null (aucun appel Stripe)', async () => {
    const { txSubscriptionCreate } = setupSuccessfulTransaction()

    await registerAction(VALID_INPUT)

    const arg = txSubscriptionCreate.mock.calls[0]?.[0] as SubscriptionCreateArg
    expect(arg.data.stripeCustomerId).toBeNull()
  })

  it('rattache la Subscription a la Company via company.connect.id', async () => {
    const { txSubscriptionCreate } = setupSuccessfulTransaction()

    await registerAction(VALID_INPUT)

    const arg = txSubscriptionCreate.mock.calls[0]?.[0] as SubscriptionCreateArg
    expect(arg.data.company.connect.id).toBe(FAKE_COMPANY_ID)
  })

  it('la Subscription est creee dans la transaction (pas en dehors)', async () => {
    const { txSubscriptionCreate } = setupSuccessfulTransaction()

    await registerAction(VALID_INPUT)

    expect(mockTransaction).toHaveBeenCalledOnce()
    expect(txSubscriptionCreate).toHaveBeenCalledOnce()
  })

  it('rollback atomique : si subscription.create echoue, retourne une erreur', async () => {
    mockTransaction.mockImplementation((cb: TxCallback) =>
      cb({
        company: { create: vi.fn().mockResolvedValue(FAKE_COMPANY) },
        user: { create: vi.fn().mockResolvedValue(FAKE_USER) },
        employee: { create: vi.fn().mockResolvedValue(FAKE_EMPLOYEE) },
        leaveBalance: { create: vi.fn().mockResolvedValue({}) },
        subscription: {
          create: vi.fn().mockRejectedValue(new Error('DB constraint')),
        },
      })
    )

    const result = await registerAction(VALID_INPUT)

    expect(result.success).toBe(false)
  })

  it('retourne { success, userId, companyId } sur le chemin nominal (non-regression)', async () => {
    setupSuccessfulTransaction()

    const result = await registerAction(VALID_INPUT)

    expect(result).toMatchObject({
      success: true,
      userId: FAKE_USER_ID,
      companyId: FAKE_COMPANY_ID,
    })
  })

  it("rejette si l'email est deja utilise sans appeler la transaction (non-regression)", async () => {
    mockUserFindUnique.mockResolvedValue({ id: 'existing_user' })
    setupSuccessfulTransaction()

    const result = await registerAction(VALID_INPUT)

    expect(result.success).toBe(false)
    expect(result).toMatchObject({ field: 'email' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })
})
