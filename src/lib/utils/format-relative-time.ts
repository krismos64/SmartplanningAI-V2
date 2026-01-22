/**
 * Format Relative Time - Utilitaire de formatage temporel
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 * @see Context7 - Intl.RelativeTimeFormat documentation
 *
 * OBJECTIF :
 * Formater un timestamp en texte relatif lisible en français.
 * Ex: "À l'instant", "Il y a 5 min", "Il y a 2h", "Il y a 3j"
 *
 * FONCTIONNALITÉS :
 * - Formatage en français
 * - Granularité adaptative (secondes → minutes → heures → jours)
 * - Gestion des cas limites (futur, valeurs invalides)
 *
 * USAGE :
 * ```ts
 * import { formatRelativeTime } from '@/lib/utils/format-relative-time';
 *
 * formatRelativeTime(Date.now() - 30000);  // "À l'instant"
 * formatRelativeTime(Date.now() - 300000); // "Il y a 5 min"
 * formatRelativeTime(Date.now() - 7200000); // "Il y a 2h"
 * ```
 */

/**
 * Constantes de temps en secondes
 */
const MINUTE = 60
const HOUR = 3600
const DAY = 86400
const WEEK = 604800

/**
 * Seuil pour "À l'instant" (30 secondes)
 */
const JUST_NOW_THRESHOLD = 30

/**
 * Formate un timestamp en texte relatif français
 *
 * @param timestamp - Timestamp en millisecondes
 * @param now - Timestamp actuel (optionnel, pour les tests)
 * @returns Texte relatif formaté en français
 *
 * @example
 * formatRelativeTime(Date.now() - 5000)   // "À l'instant"
 * formatRelativeTime(Date.now() - 120000) // "Il y a 2 min"
 * formatRelativeTime(Date.now() - 7200000) // "Il y a 2h"
 * formatRelativeTime(Date.now() - 172800000) // "Il y a 2j"
 */
export function formatRelativeTime(
  timestamp: number,
  now: number = Date.now()
): string {
  // Validation du timestamp
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 'Date inconnue'
  }

  const seconds = Math.floor((now - timestamp) / 1000)

  // Cas futur ou très récent
  if (seconds < JUST_NOW_THRESHOLD) {
    return "À l'instant"
  }

  // Minutes (< 1 heure)
  if (seconds < HOUR) {
    const minutes = Math.floor(seconds / MINUTE)
    return `Il y a ${minutes} min`
  }

  // Heures (< 1 jour)
  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR)
    return `Il y a ${hours}h`
  }

  // Jours (< 1 semaine)
  if (seconds < WEEK) {
    const days = Math.floor(seconds / DAY)
    return `Il y a ${days}j`
  }

  // Plus d'une semaine - afficher la date
  const date = new Date(timestamp)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Formate un timestamp en texte relatif avec plus de détails
 *
 * Version longue pour les tooltips ou descriptions.
 *
 * @param timestamp - Timestamp en millisecondes
 * @param now - Timestamp actuel (optionnel, pour les tests)
 * @returns Texte relatif détaillé en français
 *
 * @example
 * formatRelativeTimeLong(Date.now() - 120000) // "Il y a 2 minutes"
 * formatRelativeTimeLong(Date.now() - 7200000) // "Il y a 2 heures"
 */
export function formatRelativeTimeLong(
  timestamp: number,
  now: number = Date.now()
): string {
  // Validation du timestamp
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return 'Date inconnue'
  }

  const seconds = Math.floor((now - timestamp) / 1000)

  // Cas futur ou très récent
  if (seconds < JUST_NOW_THRESHOLD) {
    return "À l'instant"
  }

  // Minutes (< 1 heure)
  if (seconds < HOUR) {
    const minutes = Math.floor(seconds / MINUTE)
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  // Heures (< 1 jour)
  if (seconds < DAY) {
    const hours = Math.floor(seconds / HOUR)
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  }

  // Jours (< 1 semaine)
  if (seconds < WEEK) {
    const days = Math.floor(seconds / DAY)
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  }

  // Plus d'une semaine - afficher la date complète
  const date = new Date(timestamp)
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export default formatRelativeTime
