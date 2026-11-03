/**
 * @ticket SP-615, SP-622
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  findWeeklyHoursWarnings,
  shiftDurationHours,
  weekStartOf,
  workedHours,
  parseLunchBreak,
  LEGAL_WEEKLY_MAX_HOURS,
  type ShiftForHours,
} from '../weekly-hours'

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

const shift = (
  employeeId: string,
  iso: string,
  startTime = '08:30',
  endTime = '18:30',
  type = 'WORK'
): ShiftForHours => ({
  employeeId,
  startDate: day(iso),
  startTime,
  endTime,
  type,
})

describe.each(['UTC', 'Europe/Paris'])('weekly-hours sous TZ=%s', (tz) => {
  const previousTz = process.env.TZ
  beforeAll(() => {
    process.env.TZ = tz
  })
  afterAll(() => {
    process.env.TZ = previousTz
  })

  it('le lundi d’un dimanche est le lundi précédent', () => {
    expect(weekStartOf(day('2026-11-01'))).toEqual(day('2026-10-26'))
    expect(weekStartOf(day('2026-10-26'))).toEqual(day('2026-10-26'))
  })

  it('Patisserie CARL : 5 jours de 08:30 à 18:30, 50 h pour 35 h, au-delà de 48 h', () => {
    // Semaine du 2 novembre 2026, vendredi à mardi comme la récurrence réelle
    const shifts = [
      '2026-11-02',
      '2026-11-03',
      '2026-11-06',
      '2026-11-07',
      '2026-11-08',
    ].map((d) => shift('charlotte', d))

    expect(
      findWeeklyHoursWarnings(shifts, new Map([['charlotte', 35]]))
    ).toEqual([
      {
        employeeId: 'charlotte',
        weekStart: day('2026-11-02'),
        totalHours: 50,
        contractHours: 35,
        exceedsLegal: true,
      },
    ])
  })
})

describe('shiftDurationHours', () => {
  it('compte une garde de nuit jusqu’au lendemain', () => {
    expect(shiftDurationHours('22:00', '06:00')).toBe(8)
  })

  it('compte un créneau ordinaire', () => {
    expect(shiftDurationHours('09:00', '17:30')).toBe(8.5)
  })
})

describe('findWeeklyHoursWarnings', () => {
  it('ne signale rien au contrat exact', () => {
    const shifts = [
      '2026-11-02',
      '2026-11-03',
      '2026-11-04',
      '2026-11-05',
      '2026-11-06',
    ].map((d) => shift('a', d, '09:00', '16:00'))
    expect(findWeeklyHoursWarnings(shifts, new Map([['a', 35]]))).toEqual([])
  })

  it('ne compte pas le repos', () => {
    const shifts = [
      shift('a', '2026-11-02', '09:00', '17:00'),
      shift('a', '2026-11-03', '00:00', '23:59', 'REST'),
    ]
    expect(findWeeklyHoursWarnings(shifts, new Map([['a', 7]]))).toEqual([
      expect.objectContaining({
        totalHours: 8,
        exceedsLegal: false,
      }) as unknown,
    ])
  })

  it('sépare les semaines', () => {
    const shifts = [
      shift('a', '2026-11-01', '08:00', '18:00'), // dimanche, semaine du 26/10
      shift('a', '2026-11-02', '08:00', '18:00'), // lundi, semaine du 02/11
    ]
    expect(findWeeklyHoursWarnings(shifts, new Map([['a', 12]]))).toEqual([])
  })

  it('sans contrat connu, ne signale qu’au-delà du plafond légal', () => {
    const shifts = ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05'].map(
      (d) => shift('x', d, '06:00', '18:00')
    )
    const warnings = findWeeklyHoursWarnings(shifts, new Map())
    expect(warnings).toHaveLength(0)
    expect(LEGAL_WEEKLY_MAX_HOURS).toBe(48)

    const plus = [...shifts, shift('x', '2026-11-06', '08:00', '09:00')]
    expect(findWeeklyHoursWarnings(plus, new Map())).toHaveLength(1)
  })
})

describe('pause déjeuner déduite (SP-622)', () => {
  const pause = { enabled: true, start: '12:00', end: '13:00' }

  it('un créneau qui couvre la pause compte sa durée moins la pause', () => {
    expect(workedHours('09:00', '19:00', pause)).toBe(9)
  })

  it('une pause désactivée ou absente ne change rien', () => {
    expect(workedHours('09:00', '19:00', { ...pause, enabled: false })).toBe(10)
    expect(workedHours('09:00', '19:00', null)).toBe(10)
    expect(workedHours('09:00', '19:00')).toBe(10)
  })

  it('un créneau du matin ou qui ne couvre la pause qu’en partie ne perd rien', () => {
    expect(workedHours('08:00', '12:00', pause)).toBe(4)
    expect(workedHours('12:30', '18:00', pause)).toBe(5.5)
    expect(workedHours('09:00', '12:30', pause)).toBe(3.5)
  })

  it('une garde de nuit ne perd pas la pause de midi', () => {
    expect(workedHours('22:00', '06:00', pause)).toBe(8)
  })

  it('QUAI DES BRUMES : 5 jours de 09:00 à 19:00 font 45 h, sous les 48 h légales', () => {
    const semaine = ['02', '03', '04', '05', '06'].map((d) =>
      shift('e1', `2026-11-${d}`, '09:00', '19:00')
    )
    const sansPause = findWeeklyHoursWarnings(semaine, new Map([['e1', 39]]))
    const avecPause = findWeeklyHoursWarnings(
      semaine,
      new Map([['e1', 39]]),
      pause
    )

    expect(sansPause[0]?.totalHours).toBe(50)
    expect(sansPause[0]?.exceedsLegal).toBe(true)
    expect(avecPause[0]?.totalHours).toBe(45)
    expect(avecPause[0]?.exceedsLegal).toBe(false)
  })
})

describe('parseLunchBreak (SP-622)', () => {
  it('lit la pause rangée dans defaultOpeningHours', () => {
    expect(
      parseLunchBreak({
        lunchBreak: { enabled: true, start: '12:00', end: '13:00' },
      })
    ).toEqual({ enabled: true, start: '12:00', end: '13:00' })
  })

  it('vaut null pour un JSON absent, vide ou mal formé', () => {
    expect(parseLunchBreak(null)).toBeNull()
    expect(parseLunchBreak({})).toBeNull()
    expect(parseLunchBreak([])).toBeNull()
    expect(
      parseLunchBreak({ lunchBreak: { enabled: 'oui', start: '12h' } })
    ).toBeNull()
  })
})
