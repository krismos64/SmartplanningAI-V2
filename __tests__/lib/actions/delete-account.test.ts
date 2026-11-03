/**
 * Tests unitaires pour la Server Action deleteAccount
 *
 * @ticket SP-277, SP-624
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { deleteAccount } from '@/lib/actions/profile'

// Mock auth
const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

// Mock prisma
const mockFindUnique = vi.fn()
const mockTransaction = vi.fn()
const mockUserCount = vi.fn<(args: { where: Record<string, unknown> }) => Promise<number>>()
const mockEmployeeCount = vi.fn<(args: { where: Record<string, unknown> }) => Promise<number>>()
const mockSubscriptionFindFirst = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: () => mockFindUnique(),
      count: (args: { where: Record<string, unknown> }) => mockUserCount(args),
    },
    employee: {
      count: (args: { where: Record<string, unknown> }) =>
        mockEmployeeCount(args),
    },
    subscription: {
      findFirst: () => mockSubscriptionFindFirst(),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
}))

// SP-624 : l'audit et les emails sont observés, pas exécutés
const { mockLogAuditAction, mockAdminEmail } = vi.hoisted(() => ({
  mockLogAuditAction: vi.fn<(params: Record<string, unknown>) => Promise<void>>(),
  mockAdminEmail: vi.fn<(params: Record<string, unknown>) => Promise<unknown>>(),
}))
vi.mock('@/lib/services/audit', () => ({
  logAuditAction: mockLogAuditAction,
}))
vi.mock('@/lib/email/templates/account-notifications', () => ({
  sendAccountDeletedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendAccountDeletionAdminEmail: mockAdminEmail,
  sendPasswordChangedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendDataExportEmail: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock password functions
const mockVerifyPassword = vi.fn()
vi.mock('@/lib/password', () => ({
  verifyPassword: (password: string, hash: string) =>
    mockVerifyPassword(password, hash),
  hashPassword: vi.fn(),
}))

// Mock console pour ne pas polluer les tests
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('deleteAccount', () => {
  const validInput = {
    confirmEmail: 'user@example.com',
    password: 'ValidP@ss123',
    confirmDeletion: true,
  }

  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    password: 'hashed-password',
    name: 'Test User',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindUnique.mockResolvedValue(mockUser)
    mockVerifyPassword.mockResolvedValue(true)
    mockLogAuditAction.mockResolvedValue(undefined)
    mockAdminEmail.mockResolvedValue({ success: true })
    // Mock transaction qui exécute la fonction passée
    mockTransaction.mockImplementation(async (fn) => {
      const mockTx = {
        leaveBalance: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
        user: {
          delete: vi.fn().mockResolvedValue(mockUser),
        },
      }
      await fn(mockTx)
    })
  })

  // ============================================
  // AUTHENTIFICATION
  // ============================================
  describe('Authentification', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour supprimer votre compte'
      )
    })

    it('should return error when session has no user id', async () => {
      mockAuth.mockResolvedValue({ user: {} })

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez être connecté pour supprimer votre compte'
      )
    })
  })

  // ============================================
  // VALIDATION ZOD
  // ============================================
  describe('Validation Zod', () => {
    it('should return error when confirmEmail is empty', async () => {
      const result = await deleteAccount({
        ...validInput,
        confirmEmail: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Veuillez saisir votre email')
      expect(result.field).toBe('confirmEmail')
    })

    it('should return error when confirmEmail format is invalid', async () => {
      const result = await deleteAccount({
        ...validInput,
        confirmEmail: 'invalid-email',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Format email invalide')
      expect(result.field).toBe('confirmEmail')
    })

    it('should return error when password is empty', async () => {
      const result = await deleteAccount({
        ...validInput,
        password: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Veuillez saisir votre mot de passe')
      expect(result.field).toBe('password')
    })

    it('should return error when confirmDeletion is false', async () => {
      const result = await deleteAccount({
        ...validInput,
        confirmDeletion: false,
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Vous devez confirmer la suppression définitive'
      )
      expect(result.field).toBe('confirmDeletion')
    })
  })

  // ============================================
  // VÉRIFICATION UTILISATEUR
  // ============================================
  describe('Vérification utilisateur', () => {
    it('should return error when user not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Compte introuvable')
    })

    it('should return error when email does not match', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        email: 'other@example.com',
      })

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        "L'email saisi ne correspond pas à votre compte"
      )
      expect(result.field).toBe('confirmEmail')
    })

    it('should ignore case when comparing emails', async () => {
      const result = await deleteAccount({
        ...validInput,
        confirmEmail: 'USER@EXAMPLE.COM',
      })

      expect(result.success).toBe(true)
    })

    it('should return error when user has no password (OAuth only)', async () => {
      mockFindUnique.mockResolvedValue({
        ...mockUser,
        password: null,
      })

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Impossible de supprimer ce compte (authentification externe)'
      )
    })
  })

  // ============================================
  // VÉRIFICATION MOT DE PASSE
  // ============================================
  describe('Vérification mot de passe', () => {
    it('should return error when password is incorrect', async () => {
      mockVerifyPassword.mockResolvedValue(false)

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Mot de passe incorrect')
      expect(result.field).toBe('password')
    })

    it('should call verifyPassword with correct arguments', async () => {
      await deleteAccount(validInput)

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        validInput.password,
        mockUser.password
      )
    })
  })

  // ============================================
  // SUPPRESSION RÉUSSIE
  // ============================================
  describe('Suppression réussie', () => {
    it('should execute deletion in a transaction', async () => {
      await deleteAccount(validInput)

      expect(mockTransaction).toHaveBeenCalled()
    })

    it('should set LeaveBalance.updatedById to null before deletion', async () => {
      let leaveBalanceUpdateCalled = false
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          leaveBalance: {
            updateMany: vi.fn().mockImplementation(({ where, data }) => {
              expect(where.updatedById).toBe(mockUser.id)
              expect(data.updatedById).toBeNull()
              leaveBalanceUpdateCalled = true
              return Promise.resolve({ count: 0 })
            }),
          },
          user: {
            delete: vi.fn().mockResolvedValue(mockUser),
          },
        }
        await fn(mockTx)
      })

      await deleteAccount(validInput)

      expect(leaveBalanceUpdateCalled).toBe(true)
    })

    it('should delete user with correct id', async () => {
      let userDeleteCalled = false
      mockTransaction.mockImplementation(async (fn) => {
        const mockTx = {
          leaveBalance: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
          user: {
            delete: vi.fn().mockImplementation(({ where }) => {
              expect(where.id).toBe(mockUser.id)
              userDeleteCalled = true
              return Promise.resolve(mockUser)
            }),
          },
        }
        await fn(mockTx)
      })

      await deleteAccount(validInput)

      expect(userDeleteCalled).toBe(true)
    })

    it('should return success message', async () => {
      const result = await deleteAccount(validInput)

      expect(result.success).toBe(true)
      expect(result.data).toEqual({
        message: 'Votre compte a été supprimé définitivement',
      })
    })

    it('should log deletion for RGPD traceability', async () => {
      await deleteAccount(validInput)

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[deleteAccount] User user-123')
      )
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('requested account deletion')
      )
    })
  })

  // ============================================
  // GESTION DES ERREURS
  // ============================================
  describe('Gestion des erreurs', () => {
    it('should handle database errors gracefully', async () => {
      mockTransaction.mockRejectedValue(new Error('Database error'))

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Une erreur est survenue lors de la suppression'
      )
    })

    it('should handle verifyPassword errors gracefully', async () => {
      mockVerifyPassword.mockRejectedValue(new Error('bcrypt error'))

      const result = await deleteAccount(validInput)

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Une erreur est survenue lors de la suppression'
      )
    })

    it('should log errors to console', async () => {
      mockTransaction.mockRejectedValue(new Error('Test error'))

      await deleteAccount(validInput)

      expect(console.error).toHaveBeenCalledWith(
        '[deleteAccount] Error:',
        expect.any(Error)
      )
    })
  })

  // ============================================
  // SÉCURITÉ
  // ============================================
  describe('Sécurité', () => {
    it('should not expose sensitive information in error messages', async () => {
      mockFindUnique.mockResolvedValue(null)

      const result = await deleteAccount(validInput)

      expect(result.error).toBe('Compte introuvable')
      expect(result.error).not.toContain('database')
      expect(result.error).not.toContain('sql')
    })

    it('should require all three verification steps', async () => {
      // Test que chaque étape est obligatoire
      // 1. Email requis
      const result1 = await deleteAccount({
        ...validInput,
        confirmEmail: '',
      })
      expect(result1.success).toBe(false)

      // 2. Password requis
      const result2 = await deleteAccount({
        ...validInput,
        password: '',
      })
      expect(result2.success).toBe(false)

      // 3. Checkbox requise
      const result3 = await deleteAccount({
        ...validInput,
        confirmDeletion: false,
      })
      expect(result3.success).toBe(false)

      // Tout ensemble = succès
      const result4 = await deleteAccount(validInput)
      expect(result4.success).toBe(true)
    })
  })
})

// ============================================
// SP-624 : l'entreprise suit son dernier utilisateur
// ============================================
describe('deleteAccount : entreprise du compte supprimé (SP-624)', () => {
  const input = {
    confirmEmail: 'dir@quai.fr',
    password: 'ValidP@ss123',
    confirmDeletion: true,
    reason: 'WRONG_HOURS' as const,
    reasonDetail: 'Les heures comptaient la pause',
  }
  const director = {
    id: 'user-dir',
    email: 'dir@quai.fr',
    password: 'hash',
    name: 'Dir Quai',
    role: 'DIRECTOR',
    companyId: 'company-a',
    company: { name: 'QUAI DES BRUMES' },
  }
  let txCompanyDelete: ReturnType<typeof vi.fn>
  let txUserCount: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-dir' } })
    mockFindUnique.mockResolvedValue(director)
    mockVerifyPassword.mockResolvedValue(true)
    mockLogAuditAction.mockResolvedValue(undefined)
    mockAdminEmail.mockResolvedValue({ success: true })
    mockEmployeeCount.mockResolvedValue(3)
    mockSubscriptionFindFirst.mockResolvedValue({
      status: 'TRIAL',
      stripeSubscriptionId: null,
    })
    txCompanyDelete = vi.fn().mockResolvedValue({})
    txUserCount = vi.fn().mockResolvedValue(0)
    mockTransaction.mockImplementation(async (fn) => {
      await fn({
        leaveBalance: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
        user: {
          delete: vi.fn().mockResolvedValue(director),
          count: txUserCount,
        },
        company: { delete: txCompanyDelete },
      })
    })
  })

  it("supprime l'entreprise quand le compte est son dernier utilisateur", async () => {
    mockUserCount.mockResolvedValue(0)

    const result = await deleteAccount(input)

    expect(result.success).toBe(true)
    expect(txCompanyDelete).toHaveBeenCalledTimes(1)
    expect(txCompanyDelete).toHaveBeenCalledWith({ where: { id: 'company-a' } })
    // Les comptages restent bornés à l'entreprise du compte
    for (const [args] of mockUserCount.mock.calls) {
      expect(args.where.companyId).toBe('company-a')
    }
  })

  it("conserve l'entreprise quand d'autres utilisateurs y restent", async () => {
    mockUserCount.mockResolvedValue(2)

    const result = await deleteAccount(input)

    expect(result.success).toBe(true)
    expect(txCompanyDelete).not.toHaveBeenCalled()
  })

  it('refuse sans rien supprimer si un abonnement payant est en cours', async () => {
    mockUserCount.mockResolvedValue(0)
    mockSubscriptionFindFirst.mockResolvedValue({
      status: 'ACTIVE',
      stripeSubscriptionId: 'sub_123',
    })

    const result = await deleteAccount(input)

    expect(result.success).toBe(false)
    expect(result.error).toContain('abonnement')
    expect(mockTransaction).not.toHaveBeenCalled()
    expect(mockLogAuditAction).not.toHaveBeenCalled()
  })

  it("trace le motif et la suppression de l'entreprise hors de sa cascade", async () => {
    mockUserCount.mockResolvedValue(0)

    await deleteAccount(input)

    const audits = mockLogAuditAction.mock.calls.map(([p]) => p)
    const userAudit = audits.find((a) => a.entityType === 'USER')
    expect(userAudit?.details).toMatchObject({
      reason: 'WRONG_HOURS',
      reasonDetail: 'Les heures comptaient la pause',
      companyDeleted: true,
    })
    const companyAudit = audits.find((a) => a.entityType === 'COMPANY')
    expect(companyAudit?.entityId).toBe('company-a')
    // Sans companyId, la ligne survit à la cascade de l'entreprise
    expect(companyAudit?.companyId).toBeUndefined()
  })

  it("transmet le motif en toutes lettres à l'email admin", async () => {
    mockUserCount.mockResolvedValue(0)

    await deleteAccount(input)

    expect(mockAdminEmail).toHaveBeenCalledTimes(1)
    const [params] = mockAdminEmail.mock.calls[0] ?? []
    expect(params?.reason).toBe(
      'Les heures ou les plannings calculés ne correspondent pas'
    )
    expect(params?.companyDeleted).toBe(true)
  })

  it("conserve l'entreprise si un compte l'a rejointe depuis le calcul de l'impact", async () => {
    mockUserCount.mockResolvedValue(0)
    txUserCount.mockResolvedValue(1)

    const result = await deleteAccount(input)

    expect(result.success).toBe(true)
    expect(txCompanyDelete).not.toHaveBeenCalled()
    expect(txUserCount).toHaveBeenCalledWith({
      where: { companyId: 'company-a' },
    })
  })

  it('accepte une suppression sans motif', async () => {
    mockUserCount.mockResolvedValue(1)
    const { reason: _r, reasonDetail: _d, ...sansMotif } = input

    const result = await deleteAccount(sansMotif)

    expect(result.success).toBe(true)
  })
})
