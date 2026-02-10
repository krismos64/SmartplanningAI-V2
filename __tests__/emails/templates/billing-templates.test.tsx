/**
 * Tests de rendu et conformité des templates email billing
 *
 * @ticket SP-369
 * @description Tests de rendu React Email, variables dynamiques, et conformité prix
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@react-email/components'

import { SubscriptionActivatedEmail } from '../../../emails/templates/SubscriptionActivatedEmail'
import { PaymentConfirmedEmail } from '../../../emails/templates/PaymentConfirmedEmail'
import { PaymentFailedEmail } from '../../../emails/templates/PaymentFailedEmail'
import {
  TrialEndingSoonEmail,
  getTrialSubject,
} from '../../../emails/templates/TrialEndingSoonEmail'
import { TrialExpiredEmail } from '../../../emails/templates/TrialExpiredEmail'
import { SubscriptionCanceledEmail } from '../../../emails/templates/SubscriptionCanceledEmail'
import { QuantityUpdatedEmail } from '../../../emails/templates/QuantityUpdatedEmail'

// ============================================================================
// Fixtures
// ============================================================================

const baseProps = {
  firstName: 'Christophe',
  companyName: 'Acme Corp',
}

// ============================================================================
// A. Tests de rendu (7 tests)
// ============================================================================

describe('Billing Templates - Rendu', () => {
  it('SubscriptionActivatedEmail se rend sans crash', async () => {
    const html = await render(
      SubscriptionActivatedEmail({
        ...baseProps,
        employeeCount: 10,
        monthlyAmount: '29,00 €',
        dashboardUrl: 'https://smartplanning.fr/app/dashboard',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('PaymentConfirmedEmail se rend sans crash', async () => {
    const html = await render(
      PaymentConfirmedEmail({
        ...baseProps,
        amount: '29,00 €',
        employeeCount: 10,
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('PaymentFailedEmail se rend sans crash', async () => {
    const html = await render(
      PaymentFailedEmail({
        ...baseProps,
        amount: '29,00 €',
        updatePaymentUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('TrialEndingSoonEmail se rend sans crash', async () => {
    const html = await render(
      TrialEndingSoonEmail({
        ...baseProps,
        daysRemaining: 7,
        employeeCount: 5,
        estimatedMonthlyPrice: '14,50 €',
        subscribeUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('TrialExpiredEmail se rend sans crash', async () => {
    const html = await render(
      TrialExpiredEmail({
        ...baseProps,
        employeeCount: 5,
        estimatedMonthlyPrice: '14,50 €',
        subscribeUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('SubscriptionCanceledEmail se rend sans crash', async () => {
    const html = await render(
      SubscriptionCanceledEmail({
        ...baseProps,
        endDate: '15 mars 2026',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })

  it('QuantityUpdatedEmail se rend sans crash', async () => {
    const html = await render(
      QuantityUpdatedEmail({
        ...baseProps,
        oldQuantity: 5,
        newQuantity: 10,
        newMonthlyAmount: '29,00 €',
      })
    )
    expect(html).toContain('Christophe')
    expect(html).toContain('Acme Corp')
  })
})

// ============================================================================
// B. Tests des variables dynamiques (7 tests)
// ============================================================================

describe('Billing Templates - Variables dynamiques', () => {
  it('SubscriptionActivated contient le montant et le nombre d\'employés', async () => {
    const html = await render(
      SubscriptionActivatedEmail({
        ...baseProps,
        employeeCount: 15,
        monthlyAmount: '43,50 €',
        dashboardUrl: 'https://smartplanning.fr/app/dashboard',
      })
    )
    expect(html).toContain('15')
    expect(html).toContain('43,50')
  })

  it('PaymentConfirmed contient le montant, nb employés et prochaine échéance', async () => {
    const html = await render(
      PaymentConfirmedEmail({
        ...baseProps,
        amount: '29,00 €',
        employeeCount: 10,
        nextBillingDate: '10 mars 2026',
      })
    )
    expect(html).toContain('29,00')
    expect(html).toContain('10')
    expect(html).toContain('10 mars 2026')
  })

  it('PaymentFailed contient le montant et le lien de mise à jour', async () => {
    const html = await render(
      PaymentFailedEmail({
        ...baseProps,
        amount: '29,00 €',
        updatePaymentUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('29,00')
    expect(html).toContain('https://smartplanning.fr/app/dashboard/billing')
  })

  it('TrialEndingSoon avec daysRemaining=14 contient "14 jours"', async () => {
    const html = await render(
      TrialEndingSoonEmail({
        ...baseProps,
        daysRemaining: 14,
        employeeCount: 5,
        estimatedMonthlyPrice: '14,50 €',
        subscribeUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('14 jours')
  })

  it('TrialEndingSoon avec daysRemaining=1 contient "Dernier jour"', async () => {
    const html = await render(
      TrialEndingSoonEmail({
        ...baseProps,
        daysRemaining: 1,
        employeeCount: 5,
        estimatedMonthlyPrice: '14,50 €',
        subscribeUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('Dernier jour')
  })

  it('TrialExpired contient le prix estimé et le lien d\'abonnement', async () => {
    const html = await render(
      TrialExpiredEmail({
        ...baseProps,
        employeeCount: 8,
        estimatedMonthlyPrice: '23,20 €',
        subscribeUrl: 'https://smartplanning.fr/app/dashboard/billing',
      })
    )
    expect(html).toContain('23,20')
    expect(html).toContain('https://smartplanning.fr/app/dashboard/billing')
  })

  it('QuantityUpdated contient ancien et nouveau nombre', async () => {
    const html = await render(
      QuantityUpdatedEmail({
        ...baseProps,
        oldQuantity: 5,
        newQuantity: 12,
        newMonthlyAmount: '34,80 €',
      })
    )
    expect(html).toContain('5')
    expect(html).toContain('12')
    expect(html).toContain('34,80')
  })
})

// ============================================================================
// C. Tests de conformité prix (4+ tests)
// ============================================================================

describe('Billing Templates - Conformité prix', () => {
  const allTemplatesHtml: string[] = []

  beforeEach(async () => {
    if (allTemplatesHtml.length > 0) return

    allTemplatesHtml.push(
      await render(
        SubscriptionActivatedEmail({
          ...baseProps,
          employeeCount: 10,
          monthlyAmount: '29,00 €',
          dashboardUrl: 'https://smartplanning.fr',
        })
      ),
      await render(
        PaymentConfirmedEmail({
          ...baseProps,
          amount: '29,00 €',
          employeeCount: 10,
        })
      ),
      await render(
        TrialEndingSoonEmail({
          ...baseProps,
          daysRemaining: 7,
          employeeCount: 10,
          estimatedMonthlyPrice: '29,00 €',
          subscribeUrl: 'https://smartplanning.fr',
        })
      ),
      await render(
        TrialExpiredEmail({
          ...baseProps,
          employeeCount: 10,
          estimatedMonthlyPrice: '29,00 €',
          subscribeUrl: 'https://smartplanning.fr',
        })
      ),
      await render(
        QuantityUpdatedEmail({
          ...baseProps,
          oldQuantity: 5,
          newQuantity: 10,
          newMonthlyAmount: '29,00 €',
        })
      )
    )
  })

  it('aucun template ne contient de noms de plans tarifaires', async () => {
    const allHtml = [
      await render(SubscriptionActivatedEmail({ ...baseProps, employeeCount: 10, monthlyAmount: '29,00 €', dashboardUrl: 'https://smartplanning.fr' })),
      await render(PaymentConfirmedEmail({ ...baseProps, amount: '29,00 €', employeeCount: 10 })),
      await render(PaymentFailedEmail({ ...baseProps, amount: '29,00 €', updatePaymentUrl: 'https://smartplanning.fr' })),
      await render(TrialEndingSoonEmail({ ...baseProps, daysRemaining: 7, employeeCount: 10, estimatedMonthlyPrice: '29,00 €', subscribeUrl: 'https://smartplanning.fr' })),
      await render(TrialExpiredEmail({ ...baseProps, employeeCount: 10, estimatedMonthlyPrice: '29,00 €', subscribeUrl: 'https://smartplanning.fr' })),
      await render(SubscriptionCanceledEmail({ ...baseProps, endDate: '15 mars 2026' })),
      await render(QuantityUpdatedEmail({ ...baseProps, oldQuantity: 5, newQuantity: 10, newMonthlyAmount: '29,00 €' })),
    ]

    const forbiddenPlanNames = [/\bSolo\b/, /\bStarter\b/, /\bPlan Pro\b/, /\bBusiness\b/, /\bEnterprise\b/]
    for (const html of allHtml) {
      for (const pattern of forbiddenPlanNames) {
        expect(html).not.toMatch(pattern)
      }
    }
  })

  it('les templates avec montant contiennent "2,90"', async () => {
    const templatesWithPrice = [
      await render(SubscriptionActivatedEmail({ ...baseProps, employeeCount: 10, monthlyAmount: '29,00 €', dashboardUrl: 'https://smartplanning.fr' })),
      await render(PaymentConfirmedEmail({ ...baseProps, amount: '29,00 €', employeeCount: 10 })),
      await render(TrialEndingSoonEmail({ ...baseProps, daysRemaining: 7, employeeCount: 10, estimatedMonthlyPrice: '29,00 €', subscribeUrl: 'https://smartplanning.fr' })),
      await render(TrialExpiredEmail({ ...baseProps, employeeCount: 10, estimatedMonthlyPrice: '29,00 €', subscribeUrl: 'https://smartplanning.fr' })),
      await render(QuantityUpdatedEmail({ ...baseProps, oldQuantity: 5, newQuantity: 10, newMonthlyAmount: '29,00 €' })),
    ]

    for (const html of templatesWithPrice) {
      expect(html).toContain('2,90')
    }
  })

  it('getTrialSubject génère le bon objet selon daysRemaining', () => {
    expect(getTrialSubject(14)).toContain('14 jours')
    expect(getTrialSubject(7)).toContain('7 jours')
    expect(getTrialSubject(3)).toContain('3 jours')
    expect(getTrialSubject(1)).toContain('Dernier jour')
  })

  it('SubscriptionCanceled contient la date de fin d\'accès', async () => {
    const html = await render(
      SubscriptionCanceledEmail({
        ...baseProps,
        endDate: '28 février 2026',
      })
    )
    expect(html).toContain('28 f')
  })
})
