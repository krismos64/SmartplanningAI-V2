/**
 * Tests du rappel de fin d'essai — focus sur le mapping daysRemaining → emailType.
 *
 * Régression couverte (07/08/2026, SP-558) : `getTrialReminderType` mappait tout
 * `daysRemaining <= 3` sur TRIAL_REMINDER_3. Le seuil J-1 n'existant pas,
 * l'idempotence de `sendBillingEmail` sur (subscriptionId, emailType) sautait
 * l'envoi de la veille puisque le rappel J-3 était déjà parti pour le même
 * abonnement. Mesuré en production : zéro TRIAL_REMINDER_1 envoyé depuis la mise
 * en service, contre 4 J-14, 4 J-7 et 5 J-3.
 *
 * Le seuil J-1 porte l'envoi le plus proche de la décision d'achat : c'est la
 * dernière relance avant l'email d'expiration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

import { sendTrialEndingSoonEmail } from '../trial-ending-soon'

/** Forme du paramètre passé à sendBillingEmail, réduite à ce qu'on vérifie */
interface BillingEmailCall {
  subscriptionId?: string
  emailType: string
  subject: string
}

const { mockSendBillingEmail } = vi.hoisted(() => ({
  mockSendBillingEmail: vi.fn<(params: BillingEmailCall) => unknown>(),
}))

vi.mock('@/lib/email/billing', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/email/billing')>()
  return {
    ...actual,
    sendBillingEmail: (params: BillingEmailCall) =>
      mockSendBillingEmail(params),
  }
})

const BASE = {
  companyId: 'cl000000000000000000comp1',
  subscriptionId: 'cl0000000000000000000sub1',
  recipientEmail: 'directeur@exemple.fr',
  firstName: 'Camille',
  companyName: 'Beynost Evasion',
  employeeCount: 10,
  estimatedMonthlyPrice: '29,00 €',
}

/** Récupère le paramètre passé à sendBillingEmail lors du dernier appel */
function lastCall(): BillingEmailCall {
  const call = mockSendBillingEmail.mock.calls.at(-1)
  if (!call) throw new Error('sendBillingEmail n’a pas été appelé')
  return call[0]
}

/** Raccourci sur le type d'email du dernier appel */
function lastEmailType(): string {
  return lastCall().emailType
}

describe('sendTrialEndingSoonEmail — mapping du seuil de rappel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSendBillingEmail.mockResolvedValue({ success: true, skipped: false })
  })

  it('envoie TRIAL_REMINDER_1 le dernier jour de l’essai', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 1 })

    expect(lastEmailType()).toBe('TRIAL_REMINDER_1')
  })

  it('conserve TRIAL_REMINDER_3 à J-3', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 3 })

    expect(lastEmailType()).toBe('TRIAL_REMINDER_3')
  })

  it('conserve TRIAL_REMINDER_7 à J-7', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 7 })

    expect(lastEmailType()).toBe('TRIAL_REMINDER_7')
  })

  it('conserve TRIAL_REMINDER_14 à J-14', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 14 })

    expect(lastEmailType()).toBe('TRIAL_REMINDER_14')
  })

  /**
   * Test négatif : c'est le défaut exact que SP-558 corrige. Avant le
   * correctif, J-3 et J-1 produisaient la même clé de déduplication, donc le
   * second envoi était sauté par `sendBillingEmail`. Deux types distincts sont
   * la condition pour que le rappel de la veille parte réellement.
   */
  it('produit une clé de dédup distincte entre J-3 et J-1 pour le même abonnement', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 3 })
    const typeJ3 = lastEmailType()

    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 1 })
    const typeJ1 = lastEmailType()

    expect(typeJ3).not.toBe(typeJ1)
    // Même subscriptionId : seul emailType sépare les deux envois
    const [callJ3, callJ1] = mockSendBillingEmail.mock.calls
    expect(callJ3?.[0].subscriptionId).toBe(callJ1?.[0].subscriptionId)
  })

  it('emploie le sujet du dernier jour à J-1 plutôt que le décompte', async () => {
    await sendTrialEndingSoonEmail({ ...BASE, daysRemaining: 1 })

    expect(lastCall().subject).toContain('Dernier jour')
  })
})
