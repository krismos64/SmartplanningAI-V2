/**
 * Tests unitaires pour la fonction sendResetPasswordEmail
 *
 * @ticket SP-298
 * @description Tests de l'envoi de l'email de réinitialisation de mot de passe
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sendResetPasswordEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_APP_URL = 'https://smartplanning.fr'
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Envoi réussi
  // ==========================================================================

  describe('Envoi réussi', () => {
    it('devrait appeler sendEmail avec le bon destinataire et sujet', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-reset-123',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      const result = await sendResetPasswordEmail({
        firstName: 'Christophe',
        email: 'christophe@test.com',
        token: 'abc123-token',
        expiresIn: '1 heure',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'christophe@test.com',
          subject: 'Réinitialisation de votre mot de passe SmartPlanning',
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-reset-123')
    })

    it('devrait fonctionner sans firstName (optionnel)', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-reset-456',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      const result = await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'def456-token',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('devrait utiliser "1 heure" par défaut pour expiresIn', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-reset-789',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'ghi789-token',
      })

      // Le HTML devrait contenir "1 heure" par défaut
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('1 heure'),
        })
      )
    })
  })

  // ==========================================================================
  // Gestion des erreurs
  // ==========================================================================

  describe('Gestion des erreurs', () => {
    it('devrait retourner une erreur si sendEmail échoue', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: false,
        error: 'SMTP connection failed',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      const result = await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'fail-token',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP connection failed')
    })

    it('devrait gérer les exceptions de sendEmail', async () => {
      const mockSendEmail = vi.fn().mockRejectedValue(new Error('Network error'))

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      const result = await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'error-token',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  // ==========================================================================
  // Construction de l'URL
  // ==========================================================================

  describe("Construction de l'URL", () => {
    it('devrait encoder le token dans l\'URL', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-url-123',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'token-with-special=chars&more',
      })

      // Le HTML devrait contenir l'URL encodée
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://smartplanning.fr/reset-password?token=token-with-special%3Dchars%26more'
          ),
        })
      )
    })

    it('devrait utiliser le baseUrl personnalisé', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-custom-url',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://custom-domain.com',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'custom-token',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://custom-domain.com/reset-password?token=custom-token'
          ),
        })
      )
    })
  })

  // ==========================================================================
  // Contenu de l'email
  // ==========================================================================

  describe("Contenu de l'email", () => {
    it('devrait inclure le message de sécurité', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-security',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      await sendResetPasswordEmail({
        email: 'test@test.com',
        token: 'security-token',
      })

      // Vérifie que le message de sécurité est présent
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('ignorer cet email'),
        })
      )
    })

    it("devrait inclure l'email du destinataire dans le corps", async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-email-body',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendResetPasswordEmail } = await import(
        '@/lib/email/templates/reset-password'
      )

      await sendResetPasswordEmail({
        email: 'christophe@example.com',
        token: 'body-token',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('christophe@example.com'),
        })
      )
    })
  })
})
