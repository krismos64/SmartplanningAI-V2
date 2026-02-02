/**
 * Tests unitaires pour la Server Action changePassword
 *
 * @ticket SP-273
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { changePassword } from '@/lib/actions/profile'

// Mock auth
const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

// Mock prisma
const mockFindUnique = vi.fn()
const mockUpdate = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: () => mockFindUnique(),
      update: (args: unknown) => mockUpdate(args),
    },
  },
}))

// Mock password functions
const mockVerifyPassword = vi.fn()
const mockHashPassword = vi.fn()
vi.mock('@/lib/password', () => ({
  verifyPassword: (password: string, hash: string) =>
    mockVerifyPassword(password, hash),
  hashPassword: (password: string) => mockHashPassword(password),
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('changePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ user: { id: 'user-123' } })
    mockFindUnique.mockResolvedValue({
      id: 'user-123',
      password: 'hashed-old-password',
    })
    mockVerifyPassword.mockResolvedValue(true)
    mockHashPassword.mockResolvedValue('hashed-new-password')
    mockUpdate.mockResolvedValue({ id: 'user-123' })
  })

  // ============================================
  // AUTHENTIFICATION
  // ============================================
  describe('Authentification', () => {
    it('should return error when not authenticated', async () => {
      mockAuth.mockResolvedValue(null)

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Non authentifié')
    })

    it('should return error when session has no user id', async () => {
      mockAuth.mockResolvedValue({ user: {} })

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Non authentifié')
    })

    it('should return error when user not found', async () => {
      mockFindUnique.mockResolvedValue(null)

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Impossible de modifier le mot de passe')
    })
  })

  // ============================================
  // VALIDATION ZOD
  // ============================================
  describe('Validation Zod', () => {
    it('should return error with field when currentPassword is empty', async () => {
      const result = await changePassword({
        currentPassword: '',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Le mot de passe actuel est requis')
      expect(result.field).toBe('currentPassword')
    })

    it('should return error with field when newPassword is too weak', async () => {
      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('8 caractères')
      expect(result.field).toBe('newPassword')
    })

    it('should return error when passwords do not match', async () => {
      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'DifferentPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Les nouveaux mots de passe ne correspondent pas')
      expect(result.field).toBe('confirmNewPassword')
    })

    it('should return error when new password equals current password', async () => {
      const result = await changePassword({
        currentPassword: 'SamePass123!',
        newPassword: 'SamePass123!',
        confirmNewPassword: 'SamePass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        "Le nouveau mot de passe doit être différent de l'ancien"
      )
      expect(result.field).toBe('newPassword')
    })
  })

  // ============================================
  // VÉRIFICATION MOT DE PASSE ACTUEL
  // ============================================
  describe('Vérification mot de passe actuel', () => {
    it('should return error when current password is incorrect', async () => {
      mockVerifyPassword.mockResolvedValue(false)

      const result = await changePassword({
        currentPassword: 'WrongPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Mot de passe actuel incorrect')
      expect(result.field).toBe('currentPassword')
    })

    it('should call verifyPassword with correct arguments', async () => {
      await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(mockVerifyPassword).toHaveBeenCalledWith(
        'OldPass123!',
        'hashed-old-password'
      )
    })
  })

  // ============================================
  // SUCCÈS
  // ============================================
  describe('Succès', () => {
    it('should hash new password with hashPassword', async () => {
      await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(mockHashPassword).toHaveBeenCalledWith('NewPass123!')
    })

    it('should update user password in database', async () => {
      await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { password: 'hashed-new-password' },
      })
    })

    it('should return success message', async () => {
      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual({ message: 'Mot de passe modifié avec succès' })
    })
  })

  // ============================================
  // ERREURS
  // ============================================
  describe('Erreurs', () => {
    it('should handle database errors gracefully', async () => {
      mockUpdate.mockRejectedValue(new Error('Database error'))

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Une erreur est survenue lors de la modification du mot de passe'
      )
    })

    it('should handle verifyPassword errors gracefully', async () => {
      mockVerifyPassword.mockRejectedValue(new Error('bcrypt error'))

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(
        'Une erreur est survenue lors de la modification du mot de passe'
      )
    })
  })

  // ============================================
  // SÉCURITÉ
  // ============================================
  describe('Sécurité', () => {
    it('should not expose user existence in error messages', async () => {
      mockFindUnique.mockResolvedValue(null)

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      // Message générique, ne révèle pas si l'utilisateur existe
      expect(result.error).toBe('Impossible de modifier le mot de passe')
      expect(result.error).not.toContain('utilisateur')
      expect(result.error).not.toContain('trouvé')
    })

    it('should handle user without password field', async () => {
      mockFindUnique.mockResolvedValue({ id: 'user-123', password: null })

      const result = await changePassword({
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
        confirmNewPassword: 'NewPass123!',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Impossible de modifier le mot de passe')
    })
  })
})
