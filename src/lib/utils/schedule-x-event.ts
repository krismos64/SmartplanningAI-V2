/**
 * Conversion d'un événement déplacé dans Schedule-X en champs de créneau
 * (SP-609).
 *
 * Schedule-X rend deux formes selon le type de créneau :
 * - un créneau horaire est un ZonedDateTime, « 2026-01-27T09:00:00+01:00[Europe/Paris] »
 * - un repos est un PlainDate, « 2026-01-27 », sans heure
 *
 * new Date() ne lit pas le suffixe entre crochets, d'où son retrait. Et une
 * date sans heure se lit à 00:00 UTC : format(..., 'HH:mm') en tirait 01:00 ou
 * 02:00 selon la saison, et un repos déplacé perdait sa journée entière.
 */

import { format } from 'date-fns'

export interface MovedScheduleFields {
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
}

/** Horaires d'un repos, identiques à ceux que pose la modale de saisie */
const REST_START_TIME = '00:00'
const REST_END_TIME = '23:59'

function isPlainDate(value: string): boolean {
  return !value.includes('T')
}

export function scheduleFieldsFromEvent(
  start: { toString(): string },
  end: { toString(): string }
): MovedScheduleFields {
  const startStr = String(start.toString()).replace(/\[.*\]$/, '')
  const endStr = String(end.toString()).replace(/\[.*\]$/, '')

  const startDate = new Date(startStr)
  const endDate = new Date(endStr)

  if (isPlainDate(startStr)) {
    return {
      startDate,
      endDate,
      startTime: REST_START_TIME,
      endTime: REST_END_TIME,
    }
  }

  return {
    startDate,
    endDate,
    startTime: format(startDate, 'HH:mm'),
    endTime: format(endDate, 'HH:mm'),
  }
}
