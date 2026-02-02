/**
 * Tests unitaires pour la Server Action deleteAccount
 *
 * @ticket SP-277
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
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: () => mockFindUnique(),
    },
    $transaction: (fn: (tx: unknown) => Promise<void>) => mockTransaction(fn),
  },
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
      expect(result.error).toBe('Vous devez confirmer la suppression définitive')
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
