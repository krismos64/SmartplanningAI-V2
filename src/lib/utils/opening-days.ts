/**
 * Jours planifiés hors des jours d'ouverture de l'entreprise
 *
 * @ticket SP-617
 * @description Le 22 octobre 2026, Patisserie CARL a posé 16 créneaux le
 * samedi et le dimanche, alors que ses jours d'ouverture étaient restés à
 * lundi-vendredi par défaut. Ces jours servent aussi au décompte des congés :
 * la page planning propose donc de les ajouter.
 */

import { DAYS_OF_WEEK, type DayOfWeek } from '@/types/company'
import { toCalendarDay } from '@/lib/utils/schedule-date'

/** getUTCDay : 0 dimanche ... 6 samedi */
const BY_UTC_DAY: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

/**
 * Jours de la semaine portant un créneau travaillé hors des jours
 * d'ouverture, dans l'ordre de la semaine. Le repos ne compte pas, et les
 * jours déjà refusés par le dirigeant ne reviennent pas.
 */
export function findDaysOutsideOpening(
  schedules: { startDate: Date | string; type: string }[],
  workingDays: DayOfWeek[],
  ignored: DayOfWeek[] = []
): DayOfWeek[] {
  const found = new Set<DayOfWeek>()
  for (const s of schedules) {
    if (s.type === 'REST') continue
    const day = BY_UTC_DAY[toCalendarDay(s.startDate).getUTCDay()]
    if (day && !workingDays.includes(day) && !ignored.includes(day)) {
      found.add(day)
    }
  }
  return DAYS_OF_WEEK.filter((d) => found.has(d))
}

/** Jours d'ouverture complétés, sans doublon, dans l'ordre de la semaine */
export function mergeWorkingDays(
  current: DayOfWeek[],
  added: DayOfWeek[]
): DayOfWeek[] {
  const all = new Set([...current, ...added])
  return DAYS_OF_WEEK.filter((d) => all.has(d))
}
