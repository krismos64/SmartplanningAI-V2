/**
 * Tests unitaires pour la fonction sendVerificationEmail
 *
 * @ticket SP-299
 * @description Tests de l'envoi de l'email de vérification d'adresse
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sendVerificationEmail', () => {
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
        messageId: 'msg-verify-123',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      const result = await sendVerificationEmail({
        firstName: 'Christophe',
        email: 'christophe@test.com',
        token: 'verify_abc123-token',
        expiresIn: '24 heures',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'christophe@test.com',
          subject: 'Confirmez votre adresse email SmartPlanning',
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-verify-123')
    })

    it('devrait fonctionner sans firstName (optionnel)', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-verify-456',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      const result = await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_def456-token',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('devrait utiliser "24 heures" par défaut pour expiresIn', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-verify-789',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_ghi789-token',
      })

      // Le HTML devrait contenir "24 heures" par défaut
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('24 heures'),
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

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      const result = await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_fail-token',
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

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      const result = await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_error-token',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  // ==========================================================================
  // Construction de l'URL
  // ==========================================================================

  describe("Construction de l'URL", () => {
    it("devrait encoder le token dans l'URL", async () => {
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

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_token-with-special=chars&more',
      })

      // Le HTML devrait contenir l'URL encodée
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://smartplanning.fr/verify-email?token=verify_token-with-special%3Dchars%26more'
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

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_custom-token',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(
            'https://custom-domain.com/verify-email?token=verify_custom-token'
          ),
        })
      )
    })
  })

  // ==========================================================================
  // Contenu de l'email
  // ==========================================================================

  describe("Contenu de l'email", () => {
    it('devrait inclure le message de bienvenue', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-welcome',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_welcome-token',
      })

      // Vérifie que le message de bienvenue est présent
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Bienvenue'),
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

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'christophe@example.com',
        token: 'verify_body-token',
      })

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('christophe@example.com'),
        })
      )
    })

    it('devrait inclure les avantages de la vérification', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-benefits',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendVerificationEmail } = await import(
        '@/lib/email/templates/verification-email'
      )

      await sendVerificationEmail({
        email: 'test@test.com',
        token: 'verify_benefits-token',
      })

      // Vérifie que les avantages sont présents
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Pourquoi vérifier'),
        })
      )
    })
  })
})
