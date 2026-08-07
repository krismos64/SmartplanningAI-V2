/**
 * Tests unitaires de la lecture d'engagement des essais.
 *
 * Couvre :
 * - deriveEngagement : never_started / disengaged / active, et la frontière
 *   exacte du seuil DISENGAGED_AFTER_DAYS
 * - deriveUrgency : croisement temps restant x engagement, et le plafond
 *   volontaire des comptes jamais démarrés
 * - daysSince : troncature et protection contre les dates futures
 *
 * @ticket SP-562
 */

import { describe, it, expect } from 'vitest'

import {
  DISENGAGED_AFTER_DAYS,
  MS_PER_DAY,
  daysSince,
  deriveEngagement,
  deriveUrgency,
} from '../trial-engagement'

// ============================================================================
// daysSince
// ============================================================================

describe('daysSince', () => {
  const now = new Date('2026-08-07T12:00:00Z')

  it('compte les jours pleins écoulés', () => {
    const from = new Date(now.getTime() - 3 * MS_PER_DAY)
    expect(daysSince(from, now)).toBe(3)
  })

  it('tronque une fraction de journée vers le bas', () => {
    const from = new Date(now.getTime() - (2 * MS_PER_DAY + 23 * 3600 * 1000))
    expect(daysSince(from, now)).toBe(2)
  })

  it('renvoie 0 pour une connexion du jour même', () => {
    expect(daysSince(now, now)).toBe(0)
  })

  it('ne renvoie jamais de valeur négative sur une date future', () => {
    const future = new Date(now.getTime() + 5 * MS_PER_DAY)
    expect(daysSince(future, now)).toBe(0)
  })
})

// ============================================================================
// deriveEngagement
// ============================================================================

describe('deriveEngagement', () => {
  it('classe never_started un compte sans employé', () => {
    expect(
      deriveEngagement({
        employeeCount: 0,
        scheduleCount: 0,
        daysSinceLastLogin: 0,
      })
    ).toBe('never_started')
  })

  it('classe never_started un compte configuré mais sans planning', () => {
    // Cas Samba en production : 1 employé, 0 planning. Se connecter sans rien
    // produire ne constitue pas un usage.
    expect(
      deriveEngagement({
        employeeCount: 1,
        scheduleCount: 0,
        daysSinceLastLogin: 0,
      })
    ).toBe('never_started')
  })

  it('classe never_started un compte qui ne s est jamais connecté', () => {
    expect(
      deriveEngagement({
        employeeCount: 3,
        scheduleCount: 10,
        daysSinceLastLogin: null,
      })
    ).toBe('never_started')
  })

  it('classe active un compte avec usage et connexion récente', () => {
    expect(
      deriveEngagement({
        employeeCount: 10,
        scheduleCount: 513,
        daysSinceLastLogin: 1,
      })
    ).toBe('active')
  })

  it('classe disengaged un compte avec usage mais sans connexion récente', () => {
    expect(
      deriveEngagement({
        employeeCount: 4,
        scheduleCount: 43,
        daysSinceLastLogin: 20,
      })
    ).toBe('disengaged')
  })

  it('bascule exactement au seuil DISENGAGED_AFTER_DAYS', () => {
    const base = { employeeCount: 2, scheduleCount: 5 }

    expect(
      deriveEngagement({
        ...base,
        daysSinceLastLogin: DISENGAGED_AFTER_DAYS - 1,
      })
    ).toBe('active')

    expect(
      deriveEngagement({ ...base, daysSinceLastLogin: DISENGAGED_AFTER_DAYS })
    ).toBe('disengaged')
  })
})

// ============================================================================
// deriveUrgency
// ============================================================================

describe('deriveUrgency', () => {
  it('classe critical un compte actif à moins de 2 jours', () => {
    expect(deriveUrgency({ daysRemaining: 2, engagement: 'active' })).toBe(
      'critical'
    )
  })

  it('ne classe jamais critical un compte jamais démarré', () => {
    // Le relancer sur la fin d'essai ne répond pas à son problème.
    expect(
      deriveUrgency({ daysRemaining: 1, engagement: 'never_started' })
    ).toBe('warning')
    expect(
      deriveUrgency({ daysRemaining: 0, engagement: 'never_started' })
    ).toBe('warning')
  })

  it('classe info un compte jamais démarré encore loin de l échéance', () => {
    expect(
      deriveUrgency({ daysRemaining: 6, engagement: 'never_started' })
    ).toBe('info')
  })

  it('remonte un compte décroché en warning même loin de l échéance', () => {
    // Sans l'engagement, ce compte serait resté en info et donc invisible.
    expect(deriveUrgency({ daysRemaining: 7, engagement: 'disengaged' })).toBe(
      'warning'
    )
  })

  it('laisse en info un compte actif loin de l échéance', () => {
    expect(deriveUrgency({ daysRemaining: 7, engagement: 'active' })).toBe(
      'info'
    )
  })

  it('distingue deux comptes expirant le même jour selon leur engagement', () => {
    // Le défaut que cette instrumentation corrige : avant, ces deux comptes
    // sortaient tous les deux en critical, indiscernables.
    const daysRemaining = 2
    expect(deriveUrgency({ daysRemaining, engagement: 'active' })).toBe(
      'critical'
    )
    expect(deriveUrgency({ daysRemaining, engagement: 'never_started' })).toBe(
      'warning'
    )
  })
})
