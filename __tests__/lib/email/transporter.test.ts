/**
 * Tests unitaires pour le transporter Nodemailer
 *
 * @ticket SP-295
 * @description Tests du singleton transporter et de la vérification de connexion
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock nodemailer
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      verify: vi.fn(),
      sendMail: vi.fn(),
      close: vi.fn(),
    })),
  },
}))

describe('email/transporter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    // Configuration SMTP valide pour les tests
    process.env.SMTP_HOST = 'smtp.test.com'
    process.env.SMTP_PORT = '587'
    process.env.SMTP_USER = 'user@test.com'
    process.env.SMTP_PASSWORD = 'password123'
  })

  afterEach(() => {
    process.env = originalEnv
    vi.clearAllMocks()
  })

  // ==========================================================================
  // getTransporter
  // ==========================================================================

  describe('getTransporter', () => {
    it('devrait créer un transporter avec la configuration SMTP', async () => {
      const nodemailer = await import('nodemailer')
      const { getTransporter, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      getTransporter()

      expect(nodemailer.default.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'smtp.test.com',
          port: 587,
          secure: false,
          auth: {
            user: 'user@test.com',
            pass: 'password123',
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        })
      )
    })

    it('devrait retourner le même transporter (singleton)', async () => {
      const { getTransporter, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      const transporter1 = getTransporter()
      const transporter2 = getTransporter()

      expect(transporter1).toBe(transporter2)
    })

    it('devrait lever une erreur si la configuration est manquante', async () => {
      delete process.env.SMTP_HOST
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD

      const { getTransporter, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      expect(() => getTransporter()).toThrow('Service email non configuré')
    })
  })

  // ==========================================================================
  // verifyConnection
  // ==========================================================================

  describe('verifyConnection', () => {
    it('devrait retourner true si la connexion est valide', async () => {
      const nodemailer = await import('nodemailer')
      const mockVerify = vi.fn().mockResolvedValue(true)
      vi.mocked(nodemailer.default.createTransport).mockReturnValue({
        verify: mockVerify,
        sendMail: vi.fn(),
        close: vi.fn(),
      } as never)

      const { verifyConnection, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      const result = await verifyConnection()

      expect(result).toBe(true)
      expect(mockVerify).toHaveBeenCalled()
    })

    it('devrait retourner false si la connexion échoue', async () => {
      const nodemailer = await import('nodemailer')
      const mockVerify = vi
        .fn()
        .mockRejectedValue(new Error('Connection failed'))
      vi.mocked(nodemailer.default.createTransport).mockReturnValue({
        verify: mockVerify,
        sendMail: vi.fn(),
        close: vi.fn(),
      } as never)

      const { verifyConnection, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await verifyConnection()

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })

    it('devrait retourner false si la configuration est manquante', async () => {
      delete process.env.SMTP_HOST
      delete process.env.SMTP_USER
      delete process.env.SMTP_PASSWORD

      const { verifyConnection, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const result = await verifyConnection()

      expect(result).toBe(false)
      consoleSpy.mockRestore()
    })
  })

  // ==========================================================================
  // closeTransporter
  // ==========================================================================

  describe('closeTransporter', () => {
    it('devrait fermer le transporter', async () => {
      const nodemailer = await import('nodemailer')
      const mockClose = vi.fn()
      vi.mocked(nodemailer.default.createTransport).mockReturnValue({
        verify: vi.fn(),
        sendMail: vi.fn(),
        close: mockClose,
      } as never)

      const { getTransporter, closeTransporter, resetTransporter } =
        await import('@/lib/email/transporter')

      resetTransporter()
      getTransporter() // Crée le transporter
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      closeTransporter()

      expect(mockClose).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it("ne devrait rien faire si aucun transporter n'existe", async () => {
      const { closeTransporter, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      // Ne devrait pas lever d'erreur
      expect(() => closeTransporter()).not.toThrow()
    })
  })

  // ==========================================================================
  // resetTransporter
  // ==========================================================================

  describe('resetTransporter', () => {
    it('devrait permettre de créer un nouveau transporter après reset', async () => {
      const nodemailer = await import('nodemailer')
      const { getTransporter, resetTransporter } = await import(
        '@/lib/email/transporter'
      )

      resetTransporter()
      getTransporter()

      // Après reset, un nouvel appel devrait recréer le transporter
      resetTransporter()
      getTransporter()

      expect(nodemailer.default.createTransport).toHaveBeenCalledTimes(2)
    })
  })
})
