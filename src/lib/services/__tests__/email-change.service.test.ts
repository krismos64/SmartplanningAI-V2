/**
 * Tests unitaires du service de changement d'adresse email
 *
 * Deux comportements distincts selon l'état du compte :
 * - jamais activé : remplacement immédiat + réinvitation
 * - activé : double confirmation par le collaborateur, l'ancienne adresse
 *   reste l'identifiant de connexion tant que le lien n'est pas cliqué
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks
// ============================================================================

const mockEmployeeFindUnique = vi.fn()
const mockEmployeeUpdateMany = vi.fn()
const mockUserFindUnique = vi.fn()
const mockUserUpdate = vi.fn()
const mockTokenFindUnique = vi.fn()
const mockTokenCreate = vi.fn()
const mockTokenDelete = vi.fn()
const mockTokenDeleteMany = vi.fn()
const mockTransaction = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    employee: {
      findUnique: (...args: any[]) => mockEmployeeFindUnique(...args),
      updateMany: (...args: any[]) => mockEmployeeUpdateMany(...args),
    },
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      update: (...args: any[]) => mockUserUpdate(...args),
    },
    verificationToken: {
      findUnique: (...args: any[]) => mockTokenFindUnique(...args),
      create: (...args: any[]) => mockTokenCreate(...args),
      delete: (...args: any[]) => mockTokenDelete(...args),
      deleteMany: (...args: any[]) => mockTokenDeleteMany(...args),
    },
    $transaction: (...args: any[]) => mockTransaction(...args),
  },
}))

const mockSendInvitation = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/email/templates/invitation', () => ({
  sendInvitationEmail: (...args: any[]) => mockSendInvitation(...args),
}))

const mockSendConfirm = vi.fn().mockResolvedValue({ success: true })
const mockSendAlert = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/email/templates/email-change', () => ({
  sendEmailChangeConfirmEmail: (...args: any[]) => mockSendConfirm(...args),
  sendEmailChangeAlertEmail: (...args: any[]) => mockSendAlert(...args),
}))

import {
  requestEmployeeEmailChange,
  confirmEmailChange,
  parseEmailChangeIdentifier,
} from '../email-change.service'

// ============================================================================
// Fixtures
// ============================================================================

const EMPLOYEE_ID = 'clemployee00000001'
const USER_ID = 'cluser0000000000001'
const OLD_EMAIL = 'ancienne@test.fr'
const NEW_EMAIL = 'nouvelle@test.fr'

/**
 * Employé avec compte de connexion.
 * `userOverrides` fusionne dans le sous-objet `user` ; passer `null` en
 * second argument simule un employé sans compte.
 */
const mockEmployee = (userOverrides: Record<string, unknown> | null = {}) => ({
  firstName: 'Jean',
  company: { name: 'Acme' },
  user:
    userOverrides === null
      ? null
      : {
          id: USER_ID,
          email: OLD_EMAIL,
          role: 'EMPLOYEE',
          isEmailVerified: true,
          ...userOverrides,
        },
})

beforeEach(() => {
  vi.clearAllMocks()
  mockTransaction.mockResolvedValue([])
  mockUserFindUnique.mockResolvedValue(null)
})

// ============================================================================
// parseEmailChangeIdentifier
// ============================================================================

describe('parseEmailChangeIdentifier', () => {
  it('décode userId et adresse cible', () => {
    expect(
      parseEmailChangeIdentifier(`email-change:${USER_ID}:${NEW_EMAIL}`)
    ).toEqual({ userId: USER_ID, newEmail: NEW_EMAIL })
  })

  it('rejette un identifier de nature différente', () => {
    expect(parseEmailChangeIdentifier(`activate:${USER_ID}`)).toBeNull()
  })

  it('rejette un identifier tronqué', () => {
    expect(parseEmailChangeIdentifier('email-change:')).toBeNull()
  })
})

// ============================================================================
// requestEmployeeEmailChange
// ============================================================================

describe('requestEmployeeEmailChange', () => {
  it("réinvite immédiatement quand le compte n'a jamais été activé", async () => {
    mockEmployeeFindUnique.mockResolvedValue(
      mockEmployee({ isEmailVerified: false })
    )

    const result = await requestEmployeeEmailChange(EMPLOYEE_ID, NEW_EMAIL)

    expect(result).toEqual({
      success: true,
      outcome: { kind: 'REINVITED', newEmail: NEW_EMAIL },
    })
    expect(mockSendInvitation).toHaveBeenCalledWith(
      expect.objectContaining({ email: NEW_EMAIL })
    )
    // L'adresse de connexion est remplacée tout de suite
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: { email: NEW_EMAIL },
    })
    // Aucun email de confirmation : le lien d'invitation en tient lieu
    expect(mockSendConfirm).not.toHaveBeenCalled()
  })

  it("n'applique pas le changement tant que le compte activé n'a pas confirmé", async () => {
    mockEmployeeFindUnique.mockResolvedValue(mockEmployee())

    const result = await requestEmployeeEmailChange(EMPLOYEE_ID, NEW_EMAIL)

    expect(result).toEqual({
      success: true,
      outcome: { kind: 'CONFIRMATION_SENT', newEmail: NEW_EMAIL },
    })
    // L'identifiant de connexion reste l'ancienne adresse
    expect(mockUserUpdate).not.toHaveBeenCalled()
    expect(mockSendConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ newEmail: NEW_EMAIL, oldEmail: OLD_EMAIL })
    )
    // L'ancienne adresse est prévenue de la tentative
    expect(mockSendAlert).toHaveBeenCalledWith(
      expect.objectContaining({ oldEmail: OLD_EMAIL, newEmail: NEW_EMAIL })
    )
  })

  it('refuse une adresse déjà utilisée par un autre compte', async () => {
    mockEmployeeFindUnique.mockResolvedValue(mockEmployee())
    mockUserFindUnique.mockResolvedValue({ id: 'cluser0000000000002' })

    const result = await requestEmployeeEmailChange(EMPLOYEE_ID, NEW_EMAIL)

    expect(result).toEqual({
      success: false,
      error: 'Cet email est déjà associé à un compte',
    })
    expect(mockSendConfirm).not.toHaveBeenCalled()
    expect(mockSendInvitation).not.toHaveBeenCalled()
  })

  it("n'envoie rien pour un employé sans compte de connexion", async () => {
    mockEmployeeFindUnique.mockResolvedValue(mockEmployee(null))

    const result = await requestEmployeeEmailChange(EMPLOYEE_ID, NEW_EMAIL)

    expect(result).toEqual({ success: true, outcome: { kind: 'NO_ACCOUNT' } })
    expect(mockSendConfirm).not.toHaveBeenCalled()
    expect(mockSendInvitation).not.toHaveBeenCalled()
  })

  it("n'envoie rien si l'adresse est inchangée", async () => {
    mockEmployeeFindUnique.mockResolvedValue(mockEmployee())

    const result = await requestEmployeeEmailChange(EMPLOYEE_ID, OLD_EMAIL)

    expect(result).toEqual({ success: true, outcome: { kind: 'NO_ACCOUNT' } })
    expect(mockSendConfirm).not.toHaveBeenCalled()
  })

  it('normalise la casse de la nouvelle adresse', async () => {
    mockEmployeeFindUnique.mockResolvedValue(mockEmployee())

    await requestEmployeeEmailChange(EMPLOYEE_ID, '  NoUvElle@Test.FR  ')

    expect(mockSendConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ newEmail: NEW_EMAIL })
    )
  })
})

// ============================================================================
// confirmEmailChange
// ============================================================================

describe('confirmEmailChange', () => {
  const TOKEN = 'token-abc'

  it('applique le changement avec un token valide', async () => {
    mockTokenFindUnique.mockResolvedValue({
      identifier: `email-change:${USER_ID}:${NEW_EMAIL}`,
      token: TOKEN,
      expires: new Date(Date.now() + 60_000),
    })
    mockUserFindUnique
      .mockResolvedValueOnce({ id: USER_ID, email: OLD_EMAIL }) // user ciblé
      .mockResolvedValueOnce(null) // adresse libre

    const result = await confirmEmailChange(TOKEN)

    expect(result).toEqual({ success: true, newEmail: NEW_EMAIL })
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: USER_ID },
      data: expect.objectContaining({
        email: NEW_EMAIL,
        isEmailVerified: true,
      }),
    })
    // L'email professionnel de la fiche RH suit
    expect(mockEmployeeUpdateMany).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      data: { email: NEW_EMAIL },
    })
  })

  it('refuse un token expiré et le supprime', async () => {
    mockTokenFindUnique.mockResolvedValue({
      identifier: `email-change:${USER_ID}:${NEW_EMAIL}`,
      token: TOKEN,
      expires: new Date(Date.now() - 60_000),
    })

    const result = await confirmEmailChange(TOKEN)

    expect(result.success).toBe(false)
    expect(mockTokenDelete).toHaveBeenCalledWith({ where: { token: TOKEN } })
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it('refuse un token inconnu', async () => {
    mockTokenFindUnique.mockResolvedValue(null)

    const result = await confirmEmailChange(TOKEN)

    expect(result.success).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it("refuse un token qui n'est pas un changement d'adresse", async () => {
    mockTokenFindUnique.mockResolvedValue({
      identifier: `activate:${USER_ID}`,
      token: TOKEN,
      expires: new Date(Date.now() + 60_000),
    })

    const result = await confirmEmailChange(TOKEN)

    expect(result.success).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
  })

  it("refuse si l'adresse a été prise entre-temps", async () => {
    mockTokenFindUnique.mockResolvedValue({
      identifier: `email-change:${USER_ID}:${NEW_EMAIL}`,
      token: TOKEN,
      expires: new Date(Date.now() + 60_000),
    })
    mockUserFindUnique
      .mockResolvedValueOnce({ id: USER_ID, email: OLD_EMAIL })
      .mockResolvedValueOnce({ id: 'cluser0000000000002' })

    const result = await confirmEmailChange(TOKEN)

    expect(result.success).toBe(false)
    expect(mockUserUpdate).not.toHaveBeenCalled()
    expect(mockTokenDelete).toHaveBeenCalledWith({ where: { token: TOKEN } })
  })
})
