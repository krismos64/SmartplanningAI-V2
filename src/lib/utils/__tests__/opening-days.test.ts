/**
 * @ticket SP-617
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { findDaysOutsideOpening, mergeWorkingDays } from '../opening-days'
import type { DayOfWeek } from '@/types/company'

const LUNDI_VENDREDI: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
]

const creneau = (iso: string, type = 'WORK') => ({
  startDate: new Date(`${iso}T00:00:00.000Z`),
  type,
})

describe.each(['UTC', 'Europe/Paris'])('opening-days sous TZ=%s', (tz) => {
  const previousTz = process.env.TZ
  beforeAll(() => {
    process.env.TZ = tz
  })
  afterAll(() => {
    process.env.TZ = previousTz
  })

  it('Patisserie CARL : samedi et dimanche planifiés, ouverture lundi-vendredi', () => {
    const creneaux = [
      '2026-10-30',
      '2026-10-31',
      '2026-11-01',
      '2026-11-02',
    ].map((d) => creneau(d))
    expect(findDaysOutsideOpening(creneaux, LUNDI_VENDREDI)).toEqual([
      'SATURDAY',
      'SUNDAY',
    ])
  })

  it('lit le jour calendaire, même reçu à minuit Paris (22:00 UTC la veille)', () => {
    // Samedi 3 octobre 2026 à minuit à Paris
    const ancien = { startDate: '2026-10-02T22:00:00.000Z', type: 'WORK' }
    expect(findDaysOutsideOpening([ancien], LUNDI_VENDREDI)).toEqual([
      'SATURDAY',
    ])
  })
})

describe('findDaysOutsideOpening', () => {
  it('ignore le repos', () => {
    expect(
      findDaysOutsideOpening([creneau('2026-10-31', 'REST')], LUNDI_VENDREDI)
    ).toEqual([])
  })

  it('ne repropose pas un jour refusé', () => {
    expect(
      findDaysOutsideOpening([creneau('2026-10-31')], LUNDI_VENDREDI, [
        'SATURDAY',
      ])
    ).toEqual([])
  })

  it('ne propose rien quand le jour est déjà ouvert', () => {
    expect(
      findDaysOutsideOpening(
        [creneau('2026-10-31')],
        [...LUNDI_VENDREDI, 'SATURDAY']
      )
    ).toEqual([])
  })
})

describe('mergeWorkingDays', () => {
  it("ajoute sans doublon, dans l'ordre de la semaine", () => {
    expect(
      mergeWorkingDays(['FRIDAY', 'MONDAY'], ['SUNDAY', 'MONDAY'])
    ).toEqual(['MONDAY', 'FRIDAY', 'SUNDAY'])
  })
})
