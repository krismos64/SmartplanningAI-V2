/**
 * Tests unitaires pour la fonction sendWelcomeEmail
 *
 * @ticket SP-297
 * @description Tests de l'envoi de l'email de bienvenue
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('sendWelcomeEmail', () => {
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
      // Mock sendEmail
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-123',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://smartplanning.fr',
      }))

      const { sendWelcomeEmail } = await import('@/lib/email/templates/welcome')

      const result = await sendWelcomeEmail({
        firstName: 'Christophe',
        email: 'christophe@test.com',
      })

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'christophe@test.com',
          subject: 'Bienvenue sur SmartPlanning, Christophe !',
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-123')
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

      const { sendWelcomeEmail } = await import('@/lib/email/templates/welcome')

      const result = await sendWelcomeEmail({
        firstName: 'Test',
        email: 'test@test.com',
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

      const { sendWelcomeEmail } = await import('@/lib/email/templates/welcome')

      const result = await sendWelcomeEmail({
        firstName: 'Test',
        email: 'test@test.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  // ==========================================================================
  // Construction de l'URL
  // ==========================================================================

  describe('Construction de l\'URL', () => {
    it('devrait utiliser NEXT_PUBLIC_APP_URL pour le loginUrl', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-456',
      })

      vi.doMock('@/lib/email', () => ({
        sendEmail: mockSendEmail,
      }))

      vi.doMock('@/lib/email/config', () => ({
        getBaseUrl: () => 'https://custom-domain.com',
      }))

      const { sendWelcomeEmail } = await import('@/lib/email/templates/welcome')

      await sendWelcomeEmail({
        firstName: 'Test',
        email: 'test@test.com',
      })

      // Le HTML généré devrait contenir l'URL personnalisée
      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('https://custom-domain.com/connexion'),
        })
      )
    })
  })
})
