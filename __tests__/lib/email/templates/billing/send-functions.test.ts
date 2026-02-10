/**
 * Tests des fonctions d'envoi billing
 *
 * @ticket SP-369
 * @description Vérifie que chaque fonction appelle sendBillingEmail()
 * avec le bon BillingEmailType et les bons paramètres
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================================
// Mocks hoistés (nécessaire car vi.mock est hoisted)
// ============================================================================

const { mockSendBillingEmail, mockRender } = vi.hoisted(() => ({
  mockSendBillingEmail: vi.fn().mockResolvedValue({
    success: true,
    emailLogId: 'log-123',
  }),
  mockRender: vi.fn().mockResolvedValue('<html>mock</html>'),
}))

vi.mock('@/lib/email/billing', () => ({
  sendBillingEmail: mockSendBillingEmail,
  BillingEmailType: {
    PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    SUBSCRIPTION_ACTIVATED: 'SUBSCRIPTION_ACTIVATED',
    SUBSCRIPTION_CANCELED: 'SUBSCRIPTION_CANCELED',
    TRIAL_REMINDER_14: 'TRIAL_REMINDER_14',
    TRIAL_REMINDER_7: 'TRIAL_REMINDER_7',
    TRIAL_REMINDER_3: 'TRIAL_REMINDER_3',
    TRIAL_EXPIRED: 'TRIAL_EXPIRED',
    QUANTITY_UPDATED: 'QUANTITY_UPDATED',
  },
}))

vi.mock('@/lib/email/config', () => ({
  getBaseUrl: () => 'https://smartplanning.fr',
}))

vi.mock('@react-email/components', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    render: mockRender,
  }
})

// ============================================================================
// Imports (après les mocks)
// ============================================================================

import { sendSubscriptionActivatedEmail } from '@/lib/email/templates/billing/subscription-activated'
import { sendPaymentConfirmedEmail } from '@/lib/email/templates/billing/payment-confirmed'
import { sendPaymentFailedEmail } from '@/lib/email/templates/billing/payment-failed'
import { sendTrialEndingSoonEmail } from '@/lib/email/templates/billing/trial-ending-soon'
import { sendTrialExpiredEmail } from '@/lib/email/templates/billing/trial-expired'
import { sendSubscriptionCanceledEmail } from '@/lib/email/templates/billing/subscription-canceled'
import { sendQuantityUpdatedEmail } from '@/lib/email/templates/billing/quantity-updated'

// ============================================================================
// Fixtures
// ============================================================================

const baseParams = {
  companyId: 'company-123',
  subscriptionId: 'sub-456',
  recipientEmail: 'christophe@acme.fr',
  firstName: 'Christophe',
  companyName: 'Acme Corp',
}

// ============================================================================
// Tests
// ============================================================================

describe('Send billing functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendBillingEmail.mockResolvedValue({
      success: true,
      emailLogId: 'log-123',
    })
    mockRender.mockResolvedValue('<html>mock</html>')
  })

  it('sendSubscriptionActivatedEmail appelle sendBillingEmail avec SUBSCRIPTION_ACTIVATED', async () => {
    await sendSubscriptionActivatedEmail({
      ...baseParams,
      employeeCount: 10,
      monthlyAmount: '29,00 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-123',
        subscriptionId: 'sub-456',
        emailType: 'SUBSCRIPTION_ACTIVATED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('sendPaymentConfirmedEmail appelle sendBillingEmail avec PAYMENT_CONFIRMED', async () => {
    await sendPaymentConfirmedEmail({
      ...baseParams,
      amount: '29,00 €',
      employeeCount: 10,
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'PAYMENT_CONFIRMED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('sendPaymentFailedEmail appelle sendBillingEmail avec PAYMENT_FAILED', async () => {
    await sendPaymentFailedEmail({
      ...baseParams,
      amount: '29,00 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'PAYMENT_FAILED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('sendTrialEndingSoonEmail avec 14 jours utilise TRIAL_REMINDER_14', async () => {
    await sendTrialEndingSoonEmail({
      ...baseParams,
      daysRemaining: 14,
      employeeCount: 5,
      estimatedMonthlyPrice: '14,50 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'TRIAL_REMINDER_14',
      })
    )
  })

  it('sendTrialEndingSoonEmail avec 3 jours utilise TRIAL_REMINDER_3', async () => {
    await sendTrialEndingSoonEmail({
      ...baseParams,
      daysRemaining: 3,
      employeeCount: 5,
      estimatedMonthlyPrice: '14,50 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'TRIAL_REMINDER_3',
      })
    )
  })

  it('sendTrialExpiredEmail appelle sendBillingEmail avec TRIAL_EXPIRED', async () => {
    await sendTrialExpiredEmail({
      ...baseParams,
      employeeCount: 8,
      estimatedMonthlyPrice: '23,20 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'TRIAL_EXPIRED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('sendSubscriptionCanceledEmail appelle sendBillingEmail avec SUBSCRIPTION_CANCELED', async () => {
    await sendSubscriptionCanceledEmail({
      ...baseParams,
      endDate: '15 mars 2026',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'SUBSCRIPTION_CANCELED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('sendQuantityUpdatedEmail appelle sendBillingEmail avec QUANTITY_UPDATED', async () => {
    await sendQuantityUpdatedEmail({
      ...baseParams,
      oldQuantity: 5,
      newQuantity: 10,
      newMonthlyAmount: '29,00 €',
    })

    expect(mockSendBillingEmail).toHaveBeenCalledOnce()
    expect(mockSendBillingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        emailType: 'QUANTITY_UPDATED',
        recipientEmail: 'christophe@acme.fr',
      })
    )
  })

  it('retourne { success: false } si render() échoue', async () => {
    mockRender.mockRejectedValueOnce(new Error('Render failed'))

    const result = await sendSubscriptionActivatedEmail({
      ...baseParams,
      employeeCount: 10,
      monthlyAmount: '29,00 €',
    })

    expect(result).toEqual({ success: false, error: 'Render failed' })
    expect(mockSendBillingEmail).not.toHaveBeenCalled()
  })
})
