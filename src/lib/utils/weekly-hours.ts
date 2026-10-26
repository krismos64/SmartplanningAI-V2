/**
 * Total hebdomadaire planifié par employé, face au contrat et au plafond légal
 *
 * @ticket SP-615
 * @description Le 22 octobre 2026, Patisserie CARL a planifié deux vendeuses
 * de 08:30 à 18:30 cinq jours par semaine : 50 h pour un contrat de 35 h, et
 * au-delà des 48 h du Code du travail. Le formulaire n'a rien signalé.
 *
 * Les dates manipulées ici sont des jours calendaires (00:00 UTC du jour à
 * Paris, convention SP-609) : tout calcul de semaine se fait en UTC pur.
 */

import { addCalendarDays } from '@/lib/utils/schedule-date'

/** Durée maximale hebdomadaire absolue (article L3121-20 du Code du travail) */
export const LEGAL_WEEKLY_MAX_HOURS = 48

/** Tolérance d'arrondi, pour ne pas signaler 35,0001 h sur 35 h */
const EPSILON = 0.01

/**
 * Durée d'un créneau en heures. Une fin antérieure ou égale au début désigne
 * une garde de nuit, qui finit le lendemain.
 */
export function shiftDurationHours(startTime: string, endTime: string): number {
  const [sh = 0, sm = 0] = startTime.split(':').map(Number)
  const [eh = 0, em = 0] = endTime.split(':').map(Number)
  let minutes = eh * 60 + em - (sh * 60 + sm)
  if (minutes <= 0) minutes += 24 * 60
  return minutes / 60
}

/** Lundi de la semaine d'un jour calendaire */
export function weekStartOf(day: Date): Date {
  const offset = (day.getUTCDay() + 6) % 7
  return addCalendarDays(day, -offset)
}

export interface ShiftForHours {
  employeeId: string
  /** Jour calendaire du créneau */
  startDate: Date
  startTime: string
  endTime: string
  type: string
}

export interface WeeklyHoursWarning {
  employeeId: string
  weekStart: Date
  totalHours: number
  contractHours: number
  exceedsLegal: boolean
}

/**
 * Semaines où un employé dépasse son contrat. Le repos n'est pas compté.
 * Un employé sans contrat connu n'est signalé qu'au-delà du plafond légal.
 */
export function findWeeklyHoursWarnings(
  shifts: ShiftForHours[],
  contractHours: Map<string, number>
): WeeklyHoursWarning[] {
  const totals = new Map<
    string,
    { employeeId: string; weekStart: Date; hours: number }
  >()

  for (const shift of shifts) {
    if (shift.type === 'REST') continue
    const weekStart = weekStartOf(shift.startDate)
    const key = `${shift.employeeId}|${weekStart.getTime()}`
    const entry = totals.get(key) ?? {
      employeeId: shift.employeeId,
      weekStart,
      hours: 0,
    }
    entry.hours += shiftDurationHours(shift.startTime, shift.endTime)
    totals.set(key, entry)
  }

  const warnings: WeeklyHoursWarning[] = []
  for (const { employeeId, weekStart, hours } of totals.values()) {
    const contract = contractHours.get(employeeId) ?? LEGAL_WEEKLY_MAX_HOURS
    if (hours > contract + EPSILON) {
      warnings.push({
        employeeId,
        weekStart,
        totalHours: Math.round(hours * 100) / 100,
        contractHours: contract,
        exceedsLegal: hours > LEGAL_WEEKLY_MAX_HOURS + EPSILON,
      })
    }
  }

  return warnings.sort(
    (a, b) =>
      a.weekStart.getTime() - b.weekStart.getTime() ||
      a.employeeId.localeCompare(b.employeeId)
  )
}
