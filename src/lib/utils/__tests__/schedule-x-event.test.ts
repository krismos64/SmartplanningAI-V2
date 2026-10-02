import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { scheduleFieldsFromEvent } from '../schedule-x-event'

/**
 * SP-609 : un repos déplacé par glisser-déposer arrive en PlainDate, sans
 * heure. Lu à 00:00 UTC, il prenait 01:00 ou 02:00 comme heure de début.
 */
describe.each(['UTC', 'Europe/Paris'])(
  'scheduleFieldsFromEvent, repos (TZ=%s)',
  (tz) => {
    const previousTz = process.env.TZ

    beforeAll(() => {
      process.env.TZ = tz
    })

    afterAll(() => {
      process.env.TZ = previousTz
    })

    it('garde la journée entière d un repos déplacé', () => {
      const fields = scheduleFieldsFromEvent('2026-01-27', '2026-01-27')

      expect(fields.startTime).toBe('00:00')
      expect(fields.endTime).toBe('23:59')
      expect(fields.startDate.toISOString()).toBe('2026-01-27T00:00:00.000Z')
    })

    it('garde la journée entière en été aussi', () => {
      const fields = scheduleFieldsFromEvent('2026-07-14', '2026-07-14')

      expect(fields.startTime).toBe('00:00')
      expect(fields.endTime).toBe('23:59')
    })
  }
)

describe('scheduleFieldsFromEvent, créneau horaire (navigateur à Paris)', () => {
  const previousTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = 'Europe/Paris'
  })

  afterAll(() => {
    process.env.TZ = previousTz
  })

  it('lit l heure de Paris d un ZonedDateTime, suffixe entre crochets compris', () => {
    const fields = scheduleFieldsFromEvent(
      '2026-01-27T09:00:00+01:00[Europe/Paris]',
      '2026-01-27T17:30:00+01:00[Europe/Paris]'
    )

    expect(fields.startTime).toBe('09:00')
    expect(fields.endTime).toBe('17:30')
    expect(fields.startDate.toISOString()).toBe('2026-01-27T08:00:00.000Z')
  })
})
