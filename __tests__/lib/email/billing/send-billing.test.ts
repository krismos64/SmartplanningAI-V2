/**
 * Tests unitaires pour le wrapper sendBillingEmail
 *
 * @ticket SP-368
 * @description Tests de l'envoi d'emails billing avec logging automatique,
 * détection de doublons et gestion d'erreurs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDeep, mockReset, type DeepMockProxy } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

// ============================================================================
// Mocks
// ============================================================================

const mockSendEmail = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    success: true,
    messageId: 'msg-billing-001',
  })
)

vi.mock('@/lib/prisma', () => ({
  prisma: mockDeep<PrismaClient>(),
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: mockSendEmail,
}))

// Imports après mocks
import { prisma } from '@/lib/prisma'
import { sendBillingEmail } from '@/lib/email/billing/send-billing'
import { BillingEmailType } from '@/lib/email/billing/types'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// ============================================================================
// Fixtures
// ============================================================================

const COMPANY_ID = 'cltest00000000000company1'
const SUBSCRIPTION_ID = 'sub_test_stripe_123'

function makeParams(overrides = {}) {
  return {
    companyId: COMPANY_ID,
    subscriptionId: SUBSCRIPTION_ID,
    emailType: BillingEmailType.PAYMENT_CONFIRMED,
    recipientEmail: 'director@acme.com',
    subject: 'Paiement confirmé — SmartPlanning',
    html: '<h1>Paiement confirmé</h1>',
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('sendBillingEmail', () => {
  beforeEach(() => {
    mockReset(prismaMock)
    vi.clearAllMocks()
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Défauts : pas de doublon, création log réussie
    prismaMock.emailLog.findUnique.mockResolvedValue(null)
    prismaMock.emailLog.create.mockResolvedValue({
      id: 'log-001',
      companyId: COMPANY_ID,
      subscriptionId: SUBSCRIPTION_ID,
      emailType: BillingEmailType.PAYMENT_CONFIRMED,
      recipientEmail: 'director@acme.com',
      sentAt: new Date(),
      status: 'SENT',
      metadata: null,
    } as never)

    mockSendEmail.mockResolvedValue({
      success: true,
      messageId: 'msg-billing-001',
    })
  })

  // --------------------------------------------------------------------------
  // Envoi réussi
  // --------------------------------------------------------------------------

  describe('Envoi réussi', () => {
    it('crée un EmailLog avec status SENT après envoi réussi', async () => {
      const result = await sendBillingEmail(makeParams())

      expect(result.success).toBe(true)
      expect(result.emailLogId).toBe('log-001')
      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: COMPANY_ID,
          subscriptionId: SUBSCRIPTION_ID,
          emailType: BillingEmailType.PAYMENT_CONFIRMED,
          recipientEmail: 'director@acme.com',
          status: 'SENT',
        }),
      })
    })

    it('retourne success true avec messageId et emailLogId', async () => {
      const result = await sendBillingEmail(makeParams())

      expect(result).toEqual({
        success: true,
        messageId: 'msg-billing-001',
        emailLogId: 'log-001',
        skipped: false,
        error: undefined,
      })
    })

    it('appelle sendEmail avec les bons paramètres', async () => {
      await sendBillingEmail(makeParams())

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'director@acme.com',
        subject: 'Paiement confirmé — SmartPlanning',
        html: '<h1>Paiement confirmé</h1>',
      })
    })

    it('inclut les metadata et messageId dans le log', async () => {
      await sendBillingEmail(
        makeParams({ metadata: { amount: 2900, currency: 'EUR' } })
      )

      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            amount: 2900,
            currency: 'EUR',
            messageId: 'msg-billing-001',
          }),
        }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Envoi échoué
  // --------------------------------------------------------------------------

  describe('Envoi échoué', () => {
    it('crée un EmailLog avec status FAILED si sendEmail échoue', async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'SMTP connection refused',
      })

      const result = await sendBillingEmail(makeParams())

      expect(result.success).toBe(false)
      expect(result.error).toBe('SMTP connection refused')
      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'FAILED',
        }),
      })
    })

    it('inclut le message d\'erreur dans metadata du log', async () => {
      mockSendEmail.mockResolvedValue({
        success: false,
        error: 'Invalid recipient',
      })

      await sendBillingEmail(makeParams({ metadata: { attempt: 1 } }))

      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            attempt: 1,
            error: 'Invalid recipient',
          }),
        }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Détection de doublons
  // --------------------------------------------------------------------------

  describe('Détection de doublons', () => {
    it('skip sans appeler sendEmail si un doublon existe', async () => {
      prismaMock.emailLog.findUnique.mockResolvedValue({
        id: 'existing-log-001',
        companyId: COMPANY_ID,
        subscriptionId: SUBSCRIPTION_ID,
        emailType: BillingEmailType.PAYMENT_CONFIRMED,
        recipientEmail: 'director@acme.com',
        sentAt: new Date(),
        status: 'SENT',
        metadata: null,
      } as never)

      const result = await sendBillingEmail(makeParams())

      expect(mockSendEmail).not.toHaveBeenCalled()
      expect(prismaMock.emailLog.create).not.toHaveBeenCalled()
    })

    it('retourne skipped true avec reason DUPLICATE si doublon', async () => {
      prismaMock.emailLog.findUnique.mockResolvedValue({
        id: 'existing-log-001',
        companyId: COMPANY_ID,
        subscriptionId: SUBSCRIPTION_ID,
        emailType: BillingEmailType.PAYMENT_CONFIRMED,
        recipientEmail: 'director@acme.com',
        sentAt: new Date(),
        status: 'SENT',
        metadata: null,
      } as never)

      const result = await sendBillingEmail(makeParams())

      expect(result).toEqual({
        success: true,
        skipped: true,
        reason: 'DUPLICATE',
        emailLogId: 'existing-log-001',
      })
    })
  })

  // --------------------------------------------------------------------------
  // subscriptionId null
  // --------------------------------------------------------------------------

  describe('subscriptionId null', () => {
    it('ne vérifie pas les doublons si subscriptionId est absent', async () => {
      const result = await sendBillingEmail(
        makeParams({ subscriptionId: undefined })
      )

      expect(prismaMock.emailLog.findUnique).not.toHaveBeenCalled()
      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
    })

    it('crée le log avec subscriptionId null', async () => {
      await sendBillingEmail(makeParams({ subscriptionId: undefined }))

      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          subscriptionId: null,
        }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Erreurs Prisma
  // --------------------------------------------------------------------------

  describe('Erreurs Prisma', () => {
    it('ne bloque pas l\'envoi si la vérification de doublon échoue', async () => {
      prismaMock.emailLog.findUnique.mockRejectedValue(
        new Error('DB connection lost')
      )

      const result = await sendBillingEmail(makeParams())

      expect(mockSendEmail).toHaveBeenCalledTimes(1)
      expect(result.success).toBe(true)
      expect(console.warn).toHaveBeenCalledWith(
        '[BillingEmail] Erreur vérification doublon, envoi quand même:',
        'DB connection lost'
      )
    })

    it('ne bloque pas le résultat si la création du log échoue', async () => {
      prismaMock.emailLog.create.mockRejectedValue(
        new Error('unique constraint violation')
      )

      const result = await sendBillingEmail(makeParams())

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg-billing-001')
      expect(result.emailLogId).toBeUndefined()
      expect(console.error).toHaveBeenCalledWith(
        '[BillingEmail] Erreur création log:',
        'unique constraint violation'
      )
    })
  })

  // --------------------------------------------------------------------------
  // Modèle EmailLog
  // --------------------------------------------------------------------------

  describe('Modèle EmailLog', () => {
    it('crée un log avec tous les champs obligatoires', async () => {
      await sendBillingEmail(makeParams())

      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: {
          companyId: COMPANY_ID,
          subscriptionId: SUBSCRIPTION_ID,
          emailType: BillingEmailType.PAYMENT_CONFIRMED,
          recipientEmail: 'director@acme.com',
          status: 'SENT',
          metadata: { messageId: 'msg-billing-001' },
        },
      })
    })

    it('accepte un objet metadata JSON', async () => {
      const metadata = {
        amount: 14500,
        currency: 'EUR',
        quantity: 50,
        invoiceId: 'inv_stripe_789',
      }

      await sendBillingEmail(makeParams({ metadata }))

      expect(prismaMock.emailLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            amount: 14500,
            currency: 'EUR',
            quantity: 50,
            invoiceId: 'inv_stripe_789',
            messageId: 'msg-billing-001',
          }),
        }),
      })
    })
  })

  // --------------------------------------------------------------------------
  // Logging console
  // --------------------------------------------------------------------------

  describe('Logging', () => {
    it('log info après création réussie du EmailLog', async () => {
      await sendBillingEmail(makeParams())

      expect(console.info).toHaveBeenCalledWith(
        '[BillingEmail] Log créé:',
        expect.objectContaining({
          emailLogId: 'log-001',
          emailType: BillingEmailType.PAYMENT_CONFIRMED,
          status: 'SENT',
          companyId: COMPANY_ID,
        })
      )
    })

    it('log info pour les doublons détectés', async () => {
      prismaMock.emailLog.findUnique.mockResolvedValue({
        id: 'existing-log-001',
        companyId: COMPANY_ID,
        subscriptionId: SUBSCRIPTION_ID,
        emailType: BillingEmailType.PAYMENT_CONFIRMED,
        recipientEmail: 'director@acme.com',
        sentAt: new Date(),
        status: 'SENT',
        metadata: null,
      } as never)

      await sendBillingEmail(makeParams())

      expect(console.info).toHaveBeenCalledWith(
        '[BillingEmail] Doublon détecté, email ignoré:',
        expect.objectContaining({
          emailType: BillingEmailType.PAYMENT_CONFIRMED,
          subscriptionId: SUBSCRIPTION_ID,
        })
      )
    })
  })
})
