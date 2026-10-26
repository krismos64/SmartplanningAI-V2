/**
 * @ticket SP-615
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  findWeeklyHoursWarnings,
  shiftDurationHours,
  weekStartOf,
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
