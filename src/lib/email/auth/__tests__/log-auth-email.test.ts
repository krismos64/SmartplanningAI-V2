/**
 * Tests du helper logAuthEmail
 *
 * Couvre le logging des emails d'authentification (bienvenue, vérification)
 * dans EmailLog : mapping du statut SENT/FAILED, métadonnées, et garantie
 * non-bloquante (une erreur Prisma ne doit jamais remonter).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { logAuthEmail, AuthEmailType } from '../log-auth-email'

const { mockEmailLogCreate } = vi.hoisted(() => ({
  mockEmailLogCreate: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      create: (...args: unknown[]) => mockEmailLogCreate(...args),
    },
  },
}))

describe('logAuthEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmailLogCreate.mockResolvedValue({ id: 'log_1' })
  })

  it('logge un envoi réussi avec status SENT et le messageId', async () => {
    await logAuthEmail({
      companyId: 'company_1',
      emailType: AuthEmailType.WELCOME,
      recipientEmail: 'director@acme.com',
      success: true,
      messageId: '<abc@smartplanning.fr>',
    })

    expect(mockEmailLogCreate).toHaveBeenCalledWith({
      data: {
        companyId: 'company_1',
        subscriptionId: null,
        emailType: 'WELCOME',
        recipientEmail: 'director@acme.com',
        status: 'SENT',
        metadata: { messageId: '<abc@smartplanning.fr>' },
      },
    })
  })

  it('logge un échec avec status FAILED et le message d erreur', async () => {
    await logAuthEmail({
      companyId: 'company_2',
      emailType: AuthEmailType.EMAIL_VERIFICATION,
      recipientEmail: 'user@acme.com',
      success: false,
      error: 'SMTP timeout',
    })

    expect(mockEmailLogCreate).toHaveBeenCalledWith({
      data: {
        companyId: 'company_2',
        subscriptionId: null,
        emailType: 'EMAIL_VERIFICATION',
        recipientEmail: 'user@acme.com',
        status: 'FAILED',
        metadata: { error: 'SMTP timeout' },
      },
    })
  })

  it('ne lève jamais si la création du log échoue (non-bloquant)', async () => {
    mockEmailLogCreate.mockRejectedValueOnce(new Error('DB down'))

    await expect(
      logAuthEmail({
        companyId: 'company_3',
        emailType: AuthEmailType.WELCOME,
        recipientEmail: 'director@acme.com',
        success: true,
      })
    ).resolves.toBeUndefined()
  })
})
