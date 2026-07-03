/**
 * Tests de la logique de sélection du backfill des subscriptions manquantes
 *
 * Garantit que le script scripts/backfill-trial-subscriptions.ts :
 * - sélectionne les companies en essai avec un DIRECTOR (Bassin à Bloc,
 *   Beynost Evasion — périmètre validé le 02/07/2026)
 * - écarte les companies explicitement exclues (sofreba, suppression
 *   commerciale prévue) et celles ayant déjà une Subscription (Distri Shop)
 * - écarte les companies sans trialEndsAt ou sans email de DIRECTOR
 * - signale les essais déjà expirés (le cron enverrait TRIAL_EXPIRED)
 * - assigne toujours le statut TRIAL (le guard bloque via trialEndsAt passé)
 */

import { describe, it, expect } from 'vitest'

import {
  planTrialSubscriptionBackfill,
  type BackfillCompanyInput,
} from '../trial-backfill'

const NOW = new Date('2026-07-02T12:00:00.000Z')

// Fixtures alignées sur les données de l'incident de production (audit 02/07/2026)
const BASSIN_A_BLOC: BackfillCompanyInput = {
  id: 'cmqf5rxe10000qx01y2bjo89p',
  name: 'Bassin à Bloc',
  trialEndsAt: new Date('2026-07-06T11:57:24.551Z'),
  directorEmail: 'alexandre.brenelliere@bassinabloc.fr',
}

const BEYNOST_EVASION: BackfillCompanyInput = {
  id: 'cmr361tzt0000mt01ipc4ydbo',
  name: 'Beynost Evasion',
  trialEndsAt: new Date('2026-07-23T07:11:34.936Z'),
  directorEmail: 'be01gestion@gmail.com',
}

// sofreba : essai expiré le 12/06, exclue du backfill (suppression commerciale prévue)
const SOFREBA: BackfillCompanyInput = {
  id: 'cmpglgx420000rx01467b8jhc',
  name: 'sofreba',
  trialEndsAt: new Date('2026-06-12T07:24:48.673Z'),
  directorEmail: 'moustapha.gueye@sofreba.com',
}

// Distri Shop : compte de test, possède déjà sa ligne Subscription (ACTIVE)
const DISTRI_SHOP: BackfillCompanyInput = {
  id: 'cmnaohhe10000rx01noscbiaw',
  name: 'Distri Shop',
  trialEndsAt: new Date('2026-04-18T18:43:12.072Z'),
  directorEmail: 'c.mostefaoui@yahoo.fr',
  hasSubscription: true,
}

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

describe('planTrialSubscriptionBackfill — périmètre incident 02/07/2026', () => {
  const plan = planTrialSubscriptionBackfill(
    [DISTRI_SHOP, SOFREBA, BASSIN_A_BLOC, BEYNOST_EVASION],
    NOW,
    { excludedCompanyIds: [SOFREBA.id] }
  )

  it('inclut Bassin à Bloc (essai actif jusqu’au 06/07)', () => {
    expect(plan.items.map((i) => i.companyName)).toContain('Bassin à Bloc')
    const item = plan.items.find((i) => i.companyId === BASSIN_A_BLOC.id)
    expect(item).toMatchObject({
      status: 'TRIAL',
      trialAlreadyExpired: false,
      directorEmail: 'alexandre.brenelliere@bassinabloc.fr',
      trialEndsAt: new Date('2026-07-06T11:57:24.551Z'),
    })
  })

  it('inclut Beynost Evasion (essai actif jusqu’au 23/07)', () => {
    const item = plan.items.find((i) => i.companyId === BEYNOST_EVASION.id)
    expect(item).toMatchObject({
      status: 'TRIAL',
      trialAlreadyExpired: false,
      directorEmail: 'be01gestion@gmail.com',
    })
  })

  it('exclut sofreba (hors périmètre : suppression commerciale prévue)', () => {
    expect(plan.items.map((i) => i.companyId)).not.toContain(SOFREBA.id)
    expect(plan.skipped).toContainEqual({
      companyId: SOFREBA.id,
      companyName: 'sofreba',
      reason: 'excluded',
    })
  })

  it('exclut Distri Shop (compte de test, Subscription déjà existante)', () => {
    expect(plan.items.map((i) => i.companyId)).not.toContain(DISTRI_SHOP.id)
    expect(plan.skipped).toContainEqual({
      companyId: DISTRI_SHOP.id,
      companyName: 'Distri Shop',
      reason: 'already_has_subscription',
    })
  })

  it('ne retient au final que Bassin à Bloc et Beynost Evasion', () => {
    expect(plan.items.map((i) => i.companyName)).toEqual([
      'Bassin à Bloc',
      'Beynost Evasion',
    ])
  })
})

describe('planTrialSubscriptionBackfill — cas génériques', () => {
  it('sélectionne une company en essai actif avec statut TRIAL', () => {
    const plan = planTrialSubscriptionBackfill([company()], NOW)

    expect(plan.items).toHaveLength(1)
    expect(plan.skipped).toHaveLength(0)
    expect(plan.items[0]).toMatchObject({
      companyId: 'cl000000000000000000comp1',
      status: 'TRIAL',
      trialAlreadyExpired: false,
    })
  })

  it("sélectionne une company dont l'essai est expiré (hors exclusion), avec le flag trialAlreadyExpired", () => {
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
    expect(plan.skipped[0]?.reason).toBe('no_trial_end')
  })

  it("écarte une company sans email de DIRECTOR (no_director_email), l'email étant requis pour le customer Stripe", () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ directorEmail: null })],
      NOW
    )

    expect(plan.items).toHaveLength(0)
    expect(plan.skipped[0]?.reason).toBe('no_director_email')
  })

  it("l'exclusion opérateur prime sur les autres raisons de skip", () => {
    const plan = planTrialSubscriptionBackfill(
      [company({ trialEndsAt: null })],
      NOW,
      { excludedCompanyIds: ['cl000000000000000000comp1'] }
    )

    expect(plan.skipped[0]?.reason).toBe('excluded')
  })

  it('retourne un plan vide pour une liste vide', () => {
    const plan = planTrialSubscriptionBackfill([], NOW)

    expect(plan.items).toHaveLength(0)
    expect(plan.skipped).toHaveLength(0)
  })
})
