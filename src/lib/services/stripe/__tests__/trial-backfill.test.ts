/**
 * Tests de la logique de sélection du backfill des subscriptions manquantes
 *
 * Garantit que le script scripts/backfill-trial-subscriptions.ts :
 * - sélectionne les companies en essai (futur OU déjà expiré) avec un DIRECTOR
 * - écarte les companies sans trialEndsAt ou sans email de DIRECTOR
 * - signale les essais déjà expirés (le cron enverra TRIAL_EXPIRED)
 * - assigne toujours le statut TRIAL (le guard bloque via trialEndsAt passé)
 */

import { describe, it, expect } from 'vitest'

import {
  planTrialSubscriptionBackfill,
  type BackfillCompanyInput,
} from '../trial-backfill'

const NOW = new Date('2026-07-02T12:00:00.000Z')

function company(
  overrides: Partial<BackfillCompanyInput> = {}
): BackfillCompanyInput {
  return {
    id: 'cl000000000000000000comp1',
    name: 'Entreprise Test',
    trialEndsAt: new Date('2026-07-06T11:57:24.551Z'),
    directorEmail: 'director@test.fr',
    ...overrides,
  }
}

describe('planTrialSubscriptionBackfill', () => {
  it('sélectionne une company en essai actif avec statut TRIAL', () => {
    const plan = planTrialSubscriptionBackfill([company()], NOW)

    expect(plan.items).toHaveLength(1)
    expect(plan.skipped).toHaveLength(0)
    expect(plan.items[0]).toMatchObject({
      companyId: 'cl000000000000000000comp1',
      status: 'TRIAL',
      trialAlreadyExpired: false,
      directorEmail: 'director@test.fr',
    })
  })

  it("sélectionne aussi une company dont l'essai est déjà expiré, avec le flag trialAlreadyExpired", () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ trialEndsAt: new Date('2026-06-12T07:24:48.673Z') })],
      NOW
    )

    expect(plan.items).toHaveLength(1)
    expect(plan.items[0]?.status).toBe('TRIAL')
    expect(plan.items[0]?.trialAlreadyExpired).toBe(true)
  })

  it('considère un essai finissant exactement maintenant comme expiré', () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ trialEndsAt: new Date(NOW) })],
      NOW
    )

    expect(plan.items[0]?.trialAlreadyExpired).toBe(true)
  })

  it('écarte une company sans trialEndsAt (no_trial_end)', () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ trialEndsAt: null })],
      NOW
    )

    expect(plan.items).toHaveLength(0)
    expect(plan.skipped).toEqual([
      {
        companyId: 'cl000000000000000000comp1',
        companyName: 'Entreprise Test',
        reason: 'no_trial_end',
      },
    ])
  })

  it("écarte une company sans email de DIRECTOR (no_director_email), l'email étant requis pour le customer Stripe", () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ directorEmail: null })],
      NOW
    )

    expect(plan.items).toHaveLength(0)
    expect(plan.skipped[0]?.reason).toBe('no_director_email')
  })

  it('traite chaque company indépendamment (mélange sélection + écartées)', () => {
    const plan = planTrialSubscriptionBackfill(
      [
        company({ id: 'cl000000000000000000comp1', name: 'Bassin à Bloc' }),
        company({
          id: 'cl000000000000000000comp2',
          name: 'sofreba',
          trialEndsAt: new Date('2026-06-12T07:24:48.673Z'),
        }),
        company({
          id: 'cl000000000000000000comp3',
          name: 'Sans Director',
          directorEmail: null,
        }),
      ],
      NOW
    )

    expect(plan.items.map((i) => i.companyName)).toEqual([
      'Bassin à Bloc',
      'sofreba',
    ])
    expect(plan.skipped.map((s) => s.companyName)).toEqual(['Sans Director'])
  })

  it('retourne un plan vide pour une liste vide', () => {
    const plan = planTrialSubscriptionBackfill([], NOW)

    expect(plan.items).toHaveLength(0)
    expect(plan.skipped).toHaveLength(0)
  })
})
