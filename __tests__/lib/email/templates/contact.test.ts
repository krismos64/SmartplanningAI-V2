/**
 * Tests unitaires pour les fonctions d'envoi d'email de contact
 *
 * @ticket SP-288
 * @description Tests de sendContactConfirmation, sendContactNotification, sendContactEmails
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock des templates email React
vi.mock('../../../../emails/templates/ContactConfirmationEmail', () => ({
  ContactConfirmationEmail: vi.fn(() => 'MockedConfirmationEmail'),
}))

vi.mock('../../../../emails/templates/ContactNotificationEmail', () => ({
  ContactNotificationEmail: vi.fn(() => 'MockedNotificationEmail'),
}))

// Mock de sendEmail
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}))

// Mock de la config
vi.mock('@/lib/email/config', () => ({
  getContactEmail: vi.fn(() => 'contact@smartplanning.fr'),
}))

// Mock de render pour React Email
vi.mock('@react-email/components', () => ({
  render: vi.fn().mockResolvedValue('<html>Email HTML</html>'),
}))

describe('Contact Email Functions', () => {
  let sendEmail: ReturnType<typeof vi.fn>
  let sendContactConfirmation: typeof import('@/lib/email/templates/contact').sendContactConfirmation
  let sendContactNotification: typeof import('@/lib/email/templates/contact').sendContactNotification
  let sendContactEmails: typeof import('@/lib/email/templates/contact').sendContactEmails

  const mockContactData = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    subject: 'Demande d\'information',
    message: 'Bonjour, je souhaite en savoir plus sur vos services.',
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()

    // Récupérer le mock de sendEmail
    const emailModule = await import('@/lib/email')
    sendEmail = emailModule.sendEmail as ReturnType<typeof vi.fn>
    sendEmail.mockResolvedValue({ success: true, messageId: 'msg-123' })

    // Importer les fonctions à tester
    const contactModule = await import('@/lib/email/templates/contact')
    sendContactConfirmation = contactModule.sendContactConfirmation
    sendContactNotification = contactModule.sendContactNotification
    sendContactEmails = contactModule.sendContactEmails
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // sendContactConfirmation
  // ==========================================================================

  describe('sendContactConfirmation', () => {
    it('devrait envoyer un email de confirmation à l\'expéditeur', async () => {
      const result = await sendContactConfirmation(mockContactData)

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockContactData.email,
        })
      )
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-123')
    })

    it('devrait inclure le sujet dans le titre de l\'email', async () => {
      await sendContactConfirmation(mockContactData)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining(mockContactData.subject),
        })
      )
    })

    it('devrait inclure un replyTo vers l\'admin', async () => {
      await sendContactConfirmation(mockContactData)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'contact@smartplanning.fr',
        })
      )
    })

    it('devrait retourner une erreur si sendEmail échoue', async () => {
      sendEmail.mockResolvedValue({ success: false, error: 'SMTP error' })

      const result = await sendContactConfirmation(mockContactData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP error')
    })

    it('devrait gérer les exceptions de render', async () => {
      const { render } = await import('@react-email/components')
      ;(render as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Render failed')
      )

      const result = await sendContactConfirmation(mockContactData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Render failed')
    })
  })

  // ==========================================================================
  // sendContactNotification
  // ==========================================================================

  describe('sendContactNotification', () => {
    const notificationData = {
      ...mockContactData,
      submittedAt: new Date('2026-01-19T10:30:00Z'),
    }

    it('devrait envoyer un email de notification à l\'admin', async () => {
      const result = await sendContactNotification(notificationData)

      expect(sendEmail).toHaveBeenCalledTimes(1)
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'contact@smartplanning.fr',
        })
      )
      expect(result.success).toBe(true)
    })

    it('devrait inclure le nom et sujet dans le titre', async () => {
      await sendContactNotification(notificationData)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('[Contact]'),
        })
      )
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining(mockContactData.name),
        })
      )
    })

    it('devrait permettre de répondre directement à l\'expéditeur', async () => {
      await sendContactNotification(notificationData)

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: mockContactData.email,
        })
      )
    })

    it('devrait retourner une erreur si sendEmail échoue', async () => {
      sendEmail.mockResolvedValue({ success: false, error: 'Connection refused' })

      const result = await sendContactNotification(notificationData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Connection refused')
    })
  })

  // ==========================================================================
  // sendContactEmails
  // ==========================================================================

  describe('sendContactEmails', () => {
    it('devrait envoyer les deux emails en parallèle', async () => {
      const result = await sendContactEmails(mockContactData)

      expect(sendEmail).toHaveBeenCalledTimes(2)
      expect(result.confirmation.success).toBe(true)
      expect(result.notification.success).toBe(true)
    })

    it('devrait retourner le résultat des deux envois', async () => {
      sendEmail
        .mockResolvedValueOnce({ success: true, messageId: 'conf-123' })
        .mockResolvedValueOnce({ success: true, messageId: 'notif-456' })

      const result = await sendContactEmails(mockContactData)

      expect(result.confirmation.messageId).toBe('conf-123')
      expect(result.notification.messageId).toBe('notif-456')
    })

    it('devrait retourner les erreurs individuelles', async () => {
      sendEmail
        .mockResolvedValueOnce({ success: false, error: 'Confirmation failed' })
        .mockResolvedValueOnce({ success: true, messageId: 'notif-789' })

      const result = await sendContactEmails(mockContactData)

      expect(result.confirmation.success).toBe(false)
      expect(result.confirmation.error).toBe('Confirmation failed')
      expect(result.notification.success).toBe(true)
    })

    it('devrait gérer l\'échec des deux emails', async () => {
      sendEmail
        .mockResolvedValueOnce({ success: false, error: 'Error 1' })
        .mockResolvedValueOnce({ success: false, error: 'Error 2' })

      const result = await sendContactEmails(mockContactData)

      expect(result.confirmation.success).toBe(false)
      expect(result.notification.success).toBe(false)
    })
  })
})
