/**
 * Tests unitaires pour la fonction sendEmail
 *
 * @ticket SP-295
 * @description Tests de l'envoi d'emails avec retry logic et gestion d'erreurs
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('email/send', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    // Configuration SMTP valide pour les tests
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user@test.com'
    process.env.SMTP_PASSWORD = 'password123'
    process.env.SMTP_FROM = 'SmartPlanning <contact@smartplanning.fr>'
    vi.useFakeTimers()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  // ==========================================================================
  // sendEmail - Cas de succès
  // ==========================================================================

  describe('sendEmail - succès', () => {
    it('devrait envoyer un email avec succès', async () => {
      const mockSendMail = vi
        .fn()
        .mockResolvedValue({ messageId: 'test-message-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      })

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('test-message-id')
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'SmartPlanning <contact@smartplanning.fr>',
          to: 'recipient@test.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>',
        })
      )
      consoleSpy.mockRestore()
    })

    it('devrait inclure le replyTo si fourni', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      await sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
        replyTo: 'reply@test.com',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          replyTo: 'reply@test.com',
        })
      )
      consoleSpy.mockRestore()
    })

    it('devrait générer un texte brut à partir du HTML', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      await sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>Hello</p><p>World</p>',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Hello'),
        })
      )
      consoleSpy.mockRestore()
    })

    it('devrait utiliser le texte fourni si présent', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      await sendEmail({
        to: 'recipient@test.com',
        subject: 'Test',
        html: '<p>HTML content</p>',
        text: 'Plain text content',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'Plain text content',
        })
      )
      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // sendEmail - Validation
  // ==========================================================================

  describe('sendEmail - validation', () => {
    it('devrait retourner une erreur si to est manquant', async () => {
      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: vi.fn(),
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')

      const result = await sendEmail({
        to: '',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Options email invalides')
    })

    it('devrait retourner une erreur si subject est manquant', async () => {
      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: vi.fn(),
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')

      const result = await sendEmail({
        to: 'test@test.com',
        subject: '',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Options email invalides')
    })

    it('devrait retourner une erreur si html est manquant', async () => {
      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: vi.fn(),
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')

      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Options email invalides')
    })
  })

  // ==========================================================================
  // sendEmail - Configuration manquante
  // ==========================================================================

  describe('sendEmail - configuration manquante', () => {
    it("devrait retourner une erreur si le service n'est pas configuré", async () => {
      delete process.env.SMTP_HOST
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: vi.fn(),
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Service email non configuré')
      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // sendEmail - Retry logic
  // ==========================================================================

  describe('sendEmail - retry logic', () => {
    it("devrait réessayer en cas d'erreur temporaire", async () => {
      const mockSendMail = vi
        .fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ messageId: 'success-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})

      const resultPromise = sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Avancer le temps pour les retries
      await vi.advanceTimersByTimeAsync(1000) // Premier retry
      await vi.advanceTimersByTimeAsync(2000) // Deuxième retry

      const result = await resultPromise

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('success-id')
      expect(mockSendMail).toHaveBeenCalledTimes(3)

      consoleWarnSpy.mockRestore()
      consoleInfoSpy.mockRestore()
    })

    it('devrait échouer après 3 tentatives', async () => {
      const mockSendMail = vi
        .fn()
        .mockRejectedValue(new Error('Persistent error'))

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const resultPromise = sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      // Avancer le temps pour tous les retries
      await vi.advanceTimersByTimeAsync(1000)
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(4000)

      const result = await resultPromise

      expect(result.success).toBe(false)
      expect(result.error).toContain('Persistent error')
      expect(mockSendMail).toHaveBeenCalledTimes(3)

      consoleWarnSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it("ne devrait pas réessayer en cas d'erreur d'authentification", async () => {
      const mockSendMail = vi
        .fn()
        .mockRejectedValue(new Error('EAUTH: Invalid login'))

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const result = await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid login')
      // Pas de retry pour les erreurs d'auth
      expect(mockSendMail).toHaveBeenCalledTimes(1)

      consoleWarnSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // sendEmails - Envoi multiple
  // ==========================================================================

  describe('sendEmails', () => {
    it('devrait envoyer plusieurs emails en parallèle', async () => {
      const mockSendMail = vi
        .fn()
        .mockResolvedValueOnce({ messageId: 'id-1' })
        .mockResolvedValueOnce({ messageId: 'id-2' })
        .mockResolvedValueOnce({ messageId: 'id-3' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmails } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const results = await sendEmails([
        { to: 'user1@test.com', subject: 'Test 1', html: '<p>1</p>' },
        { to: 'user2@test.com', subject: 'Test 2', html: '<p>2</p>' },
        { to: 'user3@test.com', subject: 'Test 3', html: '<p>3</p>' },
      ])

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(results[2].success).toBe(true)
      expect(mockSendMail).toHaveBeenCalledTimes(3)

      consoleSpy.mockRestore()
    })

    it('devrait gérer les échecs partiels', async () => {
      const mockSendMail = vi
        .fn()
        .mockResolvedValueOnce({ messageId: 'id-1' })
        .mockRejectedValueOnce(new Error('EAUTH: Failed'))
        .mockResolvedValueOnce({ messageId: 'id-3' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmails } = await import('@/lib/email/send')
      const consoleInfoSpy = vi
        .spyOn(console, 'info')
        .mockImplementation(() => {})
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {})
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const results = await sendEmails([
        { to: 'user1@test.com', subject: 'Test 1', html: '<p>1</p>' },
        { to: 'user2@test.com', subject: 'Test 2', html: '<p>2</p>' },
        { to: 'user3@test.com', subject: 'Test 3', html: '<p>3</p>' },
      ])

      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[2].success).toBe(true)

      consoleInfoSpy.mockRestore()
      consoleWarnSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  // ==========================================================================
  // stripHtml - Fonction utilitaire
  // ==========================================================================

  describe('stripHtml (via sendEmail)', () => {
    it('devrait supprimer les balises HTML', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<h1>Title</h1><p>Paragraph</p><script>alert("x")</script>',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.not.stringContaining('<'),
        })
      )
      consoleSpy.mockRestore()
    })

    it('devrait supprimer les styles et scripts', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' })

      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail: mockSendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))

      const { sendEmail } = await import('@/lib/email/send')
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      await sendEmail({
        to: 'test@test.com',
        subject: 'Test',
        html: '<style>.red{color:red}</style><p>Content</p>',
      })

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.not.stringContaining('red'),
        })
      )
      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // SP-579 - Destinataire refusé par le serveur SMTP
  //
  // Le cast `as { messageId: string }` jetait `rejected` et `response`, donc
  // une adresse invalide ressortait comme un envoi réussi. C'est ce qui s'est
  // produit chez Sunlight : Gmail a refusé l'adresse, le log a dit « Envoi
  // réussi », et personne n'a pu voir la typo.
  // ==========================================================================

  describe('sendEmail - destinataire refusé (SP-579)', () => {
    const mockTransport = (sendMail: ReturnType<typeof vi.fn>) => {
      vi.doMock('nodemailer', () => ({
        default: {
          createTransport: vi.fn(() => ({
            sendMail,
            verify: vi.fn(),
            close: vi.fn(),
          })),
        },
      }))
    }

    it('marque BOUNCED quand le retour SMTP contient un rejected', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({
        messageId: 'msg-1',
        accepted: [],
        rejected: ['inconnu@gmail.com'],
        response: '550 5.1.1 No Such User',
      })
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'inconnu@gmail.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.outcome).toBe('BOUNCED')
      expect(result.rejected).toEqual(['inconnu@gmail.com'])
      expect(result.smtpResponse).toContain('550')
      // Une adresse invalide ne se retente pas : trois essais seraient inutiles
      expect(mockSendMail).toHaveBeenCalledTimes(1)

      warnSpy.mockRestore()
    })

    it('marque BOUNCED sur une erreur EENVELOPE, le cas mono-destinataire', async () => {
      // Quand TOUS les destinataires sont refusés, Nodemailer lève au lieu de
      // renseigner `rejected`. Nos envois étant mono-destinataire, c'est le
      // chemin réellement emprunté en production.
      const envelopeError = Object.assign(
        new Error(
          '550 5.1.1 The email account that you tried to reach does not exist'
        ),
        { code: 'EENVELOPE', rejected: ['inconnu@gmail.com'] }
      )
      const mockSendMail = vi.fn().mockRejectedValue(envelopeError)
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'inconnu@gmail.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(false)
      expect(result.outcome).toBe('BOUNCED')
      expect(result.rejected).toEqual(['inconnu@gmail.com'])
      expect(mockSendMail).toHaveBeenCalledTimes(1)

      warnSpy.mockRestore()
    })

    it('normalise les adresses fournies sous forme d objet', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({
        messageId: 'msg-2',
        rejected: [{ address: 'inconnu@gmail.com', name: 'Inconnu' }],
        response: '550 5.1.1',
      })
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'inconnu@gmail.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.outcome).toBe('BOUNCED')
      expect(result.rejected).toEqual(['inconnu@gmail.com'])

      warnSpy.mockRestore()
    })

    it('marque SENT quand rejected est vide', async () => {
      const mockSendMail = vi.fn().mockResolvedValue({
        messageId: 'msg-3',
        accepted: ['ok@test.com'],
        rejected: [],
        response: '250 OK',
      })
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const result = await sendEmail({
        to: 'ok@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })

      expect(result.success).toBe(true)
      expect(result.outcome).toBe('SENT')
      expect(result.rejected).toBeUndefined()

      infoSpy.mockRestore()
    })

    it('distingue une panne technique d une adresse invalide', async () => {
      // ECONNREFUSED n'est pas un refus de destinataire : il doit rester
      // FAILED et passer par le retry, sinon une panne réseau passagère
      // marquerait à tort des adresses valides comme invalides.
      const networkError = Object.assign(new Error('connect ECONNREFUSED'), {
        code: 'ECONNECTION',
      })
      const mockSendMail = vi.fn().mockRejectedValue(networkError)
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const promise = sendEmail({
        to: 'ok@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result.success).toBe(false)
      expect(result.outcome).toBe('FAILED')
      expect(result.rejected).toBeUndefined()

      warnSpy.mockRestore()
      errorSpy.mockRestore()
    })

    it('ne confond pas un expediteur refuse avec un destinataire invalide', async () => {
      // EENVELOPE couvre aussi l'expéditeur refusé, qui est une erreur de
      // configuration. Sans `rejected`, on ne doit pas conclure au bounce.
      const senderError = Object.assign(new Error('550 sender rejected'), {
        code: 'EENVELOPE',
      })
      const mockSendMail = vi.fn().mockRejectedValue(senderError)
      mockTransport(mockSendMail)

      const { sendEmail } = await import('@/lib/email/send')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const promise = sendEmail({
        to: 'ok@test.com',
        subject: 'Test',
        html: '<p>Test</p>',
      })
      await vi.runAllTimersAsync()
      const result = await promise

      expect(result.outcome).toBe('FAILED')

      warnSpy.mockRestore()
      errorSpy.mockRestore()
    })
  })
})
