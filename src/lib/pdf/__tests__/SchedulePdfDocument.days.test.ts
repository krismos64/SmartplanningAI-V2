import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  getDaysInPeriod,
  getSchedulesForDay,
  type ScheduleForPdf,
} from '../SchedulePdfDocument'

/**
 * SP-609 : colonnes du PDF de planning. La semaine arrive du navigateur en
 * heure de Paris : lundi minuit vaut 22:00 UTC le dimanche. eachDayOfInterval
 * faisait alors commencer le PDF un dimanche sur un serveur en UTC.
 */
describe.each(['UTC', 'Europe/Paris'])('colonnes du PDF (TZ=%s)', (tz) => {
  const previousTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = tz
  })

  afterAll(() => {
    process.env.TZ = previousTz
  })

  const schedule = (
    startDate: string,
    endDate = startDate
  ): ScheduleForPdf => ({
    id: startDate,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    title: null,
    employee: {
      id: 'e1',
      firstName: 'Jean',
      lastName: 'Dupont',
      weeklyHours: 35,
    },
  })

  it('couvre du lundi au dimanche pour une semaine envoyée en heure de Paris', () => {
    // Lundi 5 octobre minuit Paris au dimanche 11 octobre 23:59:59.999 Paris
    const days = getDaysInPeriod(
      new Date('2026-10-04T22:00:00.000Z'),
      new Date('2026-10-11T21:59:59.999Z')
    )

    expect(days.map((d) => d.toISOString().slice(0, 10))).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ])
  })

  it('range un créneau dans la colonne de son jour', () => {
    const lundi = new Date('2026-10-05T00:00:00.000Z')
    const mardi = new Date('2026-10-06T00:00:00.000Z')
    const creneau = schedule('2026-10-05T00:00:00.000Z')

    expect(getSchedulesForDay([creneau], lundi)).toHaveLength(1)
    expect(getSchedulesForDay([creneau], mardi)).toHaveLength(0)
  })

  it('place une garde de nuit sur ses deux jours', () => {
    const garde = schedule(
      '2026-03-27T00:00:00.000Z',
      '2026-03-28T00:00:00.000Z'
    )

    expect(
      getSchedulesForDay([garde], new Date('2026-03-27T00:00:00.000Z'))
    ).toHaveLength(1)
    expect(
      getSchedulesForDay([garde], new Date('2026-03-28T00:00:00.000Z'))
    ).toHaveLength(1)
    expect(
      getSchedulesForDay([garde], new Date('2026-03-29T00:00:00.000Z'))
    ).toHaveLength(0)
  })
})
