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

import { z } from 'zod'
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

/** Pause déjeuner telle que réglée dans les paramètres entreprise */
export interface LunchBreak {
  enabled: boolean
  /** HH:mm */
  start: string
  /** HH:mm */
  end: string
}

const lunchBreakSchema = z.object({
  enabled: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
})

/**
 * Pause déjeuner lue dans `Company.defaultOpeningHours`, JSON libre en base.
 * Une valeur absente ou mal formée vaut « pas de pause » plutôt qu'une erreur.
 */
export function parseLunchBreak(openingHours: unknown): LunchBreak | null {
  if (!openingHours || typeof openingHours !== 'object') return null
  const parsed = lunchBreakSchema.safeParse(
    (openingHours as { lunchBreak?: unknown }).lunchBreak
  )
  return parsed.success ? parsed.data : null
}

function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(':').map(Number)
  return h * 60 + m
}

/**
 * Heures travaillées d'un créneau, pause déjeuner déduite (SP-622).
 *
 * Le 3 novembre 2026, QUAI DES BRUMES avait activé une pause de 12:00 à 13:00 :
 * ses créneaux de 09:00 à 19:00 restaient comptés 10 h, et l'avertissement
 * annonçait un dépassement des 48 h légales. La pause n'est déduite que si le
 * créneau la couvre entièrement : un créneau du matin ou de l'après-midi n'en
 * contient pas. Une garde de nuit, qui finit le lendemain, n'en contient pas
 * non plus.
 */
export function workedHours(
  startTime: string,
  endTime: string,
  lunchBreak?: LunchBreak | null
): number {
  const duration = shiftDurationHours(startTime, endTime)
  if (!lunchBreak?.enabled) return duration

  const start = toMinutes(startTime)
  const end = toMinutes(endTime)
  const breakStart = toMinutes(lunchBreak.start)
  const breakEnd = toMinutes(lunchBreak.end)
  if (end <= start || breakEnd <= breakStart) return duration
  if (start > breakStart || end < breakEnd) return duration

  return duration - (breakEnd - breakStart) / 60
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
  contractHours: Map<string, number>,
  lunchBreak?: LunchBreak | null
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
    entry.hours += workedHours(shift.startTime, shift.endTime, lunchBreak)
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
