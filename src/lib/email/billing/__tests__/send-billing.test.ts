/**
 * Tests de sendBillingEmail — focus sur la déduplication.
 *
 * Régression couverte (03/07/2026) : PAYMENT_CONFIRMED était dédupliqué sur
 * (subscriptionId, emailType) → seul le 1er paiement d'un abonnement envoyait
 * l'email, les prélèvements mensuels suivants étant ignorés comme doublons.
 * Le paramètre `dedupeSuffix` (ID de facture) rend la clé unique par facture.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { sendBillingEmail } from '../send-billing'
import { BillingEmailType } from '../types'

const { mockFindUnique, mockCreate, mockSendEmail } = vi.hoisted(() => ({
  mockFindUnique: vi.fn(),
  mockCreate: vi.fn(),
  mockSendEmail: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

vi.mock('@/lib/email/send', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}))

const BASE = {
  companyId: 'company_1',
  subscriptionId: 'sub_1',
  emailType: BillingEmailType.PAYMENT_CONFIRMED,
  recipientEmail: 'director@acme.com',
  subject: 'Paiement confirmé',
  html: '<p>ok</p>',
}

describe('sendBillingEmail — déduplication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'log_1' })
    mockSendEmail.mockResolvedValue({ success: true, messageId: 'msg_1' })
  })

  it('utilise emailType seul comme clé de dédup sans dedupeSuffix', async () => {
    await sendBillingEmail(BASE)

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        subscriptionId_emailType: {
          subscriptionId: 'sub_1',
          emailType: 'PAYMENT_CONFIRMED',
        },
      },
    })
    // Stockage avec le type nu
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ emailType: 'PAYMENT_CONFIRMED' }),
      })
    )
  })

  it('concatène dedupeSuffix à emailType pour une clé unique par facture', async () => {
    await sendBillingEmail({ ...BASE, dedupeSuffix: 'in_abc' })

    expect(mockFindUnique).toHaveBeenCalledWith({
      where: {
        subscriptionId_emailType: {
          subscriptionId: 'sub_1',
          emailType: 'PAYMENT_CONFIRMED:in_abc',
        },
      },
    })
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          emailType: 'PAYMENT_CONFIRMED:in_abc',
        }),
      })
    )
  })

  it('deux factures distinctes ne sont PAS considérées comme doublons', async () => {
    await sendBillingEmail({ ...BASE, dedupeSuffix: 'in_jan' })
    await sendBillingEmail({ ...BASE, dedupeSuffix: 'in_feb' })

    // Les deux emails partent réellement (aucun skip)
    expect(mockSendEmail).toHaveBeenCalledTimes(2)
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('rejeu de la même facture est ignoré (idempotence)', async () => {
    // Simule un log déjà existant pour cette facture
    mockFindUnique.mockResolvedValueOnce({ id: 'existing_log' })

    const result = await sendBillingEmail({ ...BASE, dedupeSuffix: 'in_abc' })

    expect(result.skipped).toBe(true)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
