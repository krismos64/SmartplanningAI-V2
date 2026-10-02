/**
 * Formatage des dates de créneau côté serveur (SP-603)
 *
 * Le serveur tourne en UTC. Un créneau posé d'un clic dans la grille est
 * stocké à minuit heure de Paris, soit 22:00 UTC la veille : formaté sans
 * fuseau explicite, il s'affiche au jour précédent. Tout texte envoyé à un
 * utilisateur (email, notification, message d'erreur) passe donc par ces
 * fonctions, qui fixent le fuseau au lieu d'hériter de celui du processus.
 *
 * Toutes les entreprises sont en Europe/Paris au 30 septembre 2026
 * (`companies.timezone`), d'où la valeur par défaut.
 */

export const DEFAULT_SCHEDULE_TIME_ZONE = 'Europe/Paris'

/**
 * Date longue : « 4 octobre 2026 »
 */
export function formatScheduleDateLong(
  date: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIME_ZONE
): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone,
  }).format(new Date(date))
}

/**
 * Date courte : « 04/10/2026 »
 */
export function formatScheduleDateShort(
  date: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIME_ZONE
): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone,
  }).format(new Date(date))
}

// =============================================================================
// Jour calendaire (SP-609)
// =============================================================================
//
// Convention de stockage unique des dates de créneau, de congé et
// d'indisponibilité : 00:00 UTC du jour calendaire à Paris. Le navigateur
// envoie selon les écrans minuit heure locale (22:00 ou 23:00 UTC la veille),
// l'heure courante, ou l'instant réel du créneau. Toute écriture serveur passe
// par toCalendarDay, et tout calcul de jour se fait ensuite en UTC pur, sans
// dépendre du fuseau du processus (UTC en production, Paris en développement).

const MS_PER_DAY = 24 * 60 * 60 * 1000

const calendarPartsFormatters = new Map<string, Intl.DateTimeFormat>()

function calendarPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = calendarPartsFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })
    calendarPartsFormatters.set(timeZone, formatter)
  }
  return formatter
}

/**
 * Jour calendaire d'un instant, vu depuis le fuseau de l'entreprise, rendu à
 * 00:00 UTC. « 2026-10-03T22:00Z » (minuit à Paris) donne 2026-10-04T00:00Z.
 */
export function toCalendarDay(
  date: Date | string,
  timeZone: string = DEFAULT_SCHEDULE_TIME_ZONE
): Date {
  const instant = new Date(date)
  let year = 0
  let month = 0
  let day = 0
  for (const part of calendarPartsFormatter(timeZone).formatToParts(instant)) {
    if (part.type === 'year') year = Number(part.value)
    else if (part.type === 'month') month = Number(part.value)
    else if (part.type === 'day') day = Number(part.value)
  }
  return new Date(Date.UTC(year, month - 1, day))
}

/** Décale un jour calendaire de n jours, sans effet du changement d'heure. */
export function addCalendarDays(day: Date, amount: number): Date {
  return new Date(day.getTime() + amount * MS_PER_DAY)
}

/**
 * Décale un jour calendaire de n mois. Comme addMonths de date-fns, le jour
 * est ramené au dernier du mois quand il n'existe pas (31 janvier + 1 mois
 * donne le 28 ou 29 février).
 */
export function addCalendarMonths(day: Date, amount: number): Date {
  const year = day.getUTCFullYear()
  const month = day.getUTCMonth() + amount
  const lastDayOfTarget = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return new Date(
    Date.UTC(year, month, Math.min(day.getUTCDate(), lastDayOfTarget))
  )
}

/** Dernière milliseconde d'un jour calendaire, pour borner une requête. */
export function endOfCalendarDay(day: Date): Date {
  return new Date(day.getTime() + MS_PER_DAY - 1)
}

/** Nombre de jours calendaires entre deux jours, signé. */
export function differenceInCalendarDaysUtc(later: Date, earlier: Date): number {
  return Math.round((later.getTime() - earlier.getTime()) / MS_PER_DAY)
}

/**
 * Heure courante dans le fuseau de l'entreprise, au format « HH:mm » des
 * colonnes startTime et endTime. Sert à distinguer, dans la journée en cours,
 * un créneau déjà commencé d'un créneau à venir.
 */
export function formatTimeInZone(
  date: Date,
  timeZone: string = DEFAULT_SCHEDULE_TIME_ZONE
): string {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
  }).format(date)
}
