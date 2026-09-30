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
