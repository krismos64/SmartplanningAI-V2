/**
 * Tests du helper logAuthEmail
 *
 * Couvre le logging des emails d'authentification (bienvenue, vérification)
 * dans EmailLog : mapping du statut SENT/FAILED, métadonnées, et garantie
 * non-bloquante (une erreur Prisma ne doit jamais remonter).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { logAuthEmail, AuthEmailType } from '../log-auth-email'

const { mockEmailLogCreate } = vi.hoisted(() => ({
  mockEmailLogCreate: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      create: (...args: any[]) => mockEmailLogCreate(...args),
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

  // ==========================================================================
  // SP-579 - Le statut BOUNCED n'était jamais écrit
  //
  // Le statut valait `success ? 'SENT' : 'FAILED'`, alors que `BOUNCED` est
  // géré partout ailleurs : schéma, validations, filtre et badge de l'écran
  // admin. Conséquence mesurée en production : 41 lignes email_logs, toutes en
  // SENT, et un taux de délivrabilité de 100 % par construction.
  // ==========================================================================

  describe('statut BOUNCED (SP-579)', () => {
    it('écrit BOUNCED quand outcome le dit, malgré success à false', async () => {
      await logAuthEmail({
        companyId: 'company_4',
        emailType: AuthEmailType.INVITATION,
        recipientEmail: 'inconnu@gmail.com',
        success: false,
        outcome: 'BOUNCED',
        rejected: ['inconnu@gmail.com'],
        smtpResponse: '550 5.1.1 No Such User',
        error: 'Adresse refusée par le serveur destinataire',
      })

      expect(mockEmailLogCreate).toHaveBeenCalledWith({
        data: {
          companyId: 'company_4',
          subscriptionId: null,
          emailType: 'INVITATION',
          recipientEmail: 'inconnu@gmail.com',
          status: 'BOUNCED',
          metadata: {
            error: 'Adresse refusée par le serveur destinataire',
            rejected: ['inconnu@gmail.com'],
            smtpResponse: '550 5.1.1 No Such User',
          },
        },
      })
    })

    it('distingue BOUNCED de FAILED, qui reste une panne technique', async () => {
      await logAuthEmail({
        companyId: 'company_5',
        emailType: AuthEmailType.INVITATION,
        recipientEmail: 'valide@acme.com',
        success: false,
        outcome: 'FAILED',
        error: 'SMTP timeout',
      })

      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        })
      )
    })

    it('retombe sur success quand outcome n est pas fourni', async () => {
      // Compatibilité : un appelant qui ne passe pas encore `outcome` doit
      // conserver exactement l'ancien comportement.
      await logAuthEmail({
        companyId: 'company_6',
        emailType: AuthEmailType.WELCOME,
        recipientEmail: 'director@acme.com',
        success: true,
      })

      expect(mockEmailLogCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'SENT' }),
        })
      )
    })
  })
})
