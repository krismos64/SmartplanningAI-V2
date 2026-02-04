/**
 * Helpers pour le formatage des dates et heures
 *
 * @ticket SP-276 - Préférences Affichage (Thème, Date, Heure)
 *
 * Utilise date-fns pour le formatage avec support des préférences utilisateur.
 *
 * ✅ Via Context7 (date-fns v4 best practices)
 */

import {
  format,
  formatRelative,
  parseISO,
  isValid,
  type Locale,
} from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

import type {
  DateFormatPreference,
  TimeFormatPreference,
  LanguagePreference,
} from '@/types/preferences'

// ============================================================================
// TYPES
// ============================================================================

export interface FormatOptions {
  /** Format de date préféré */
  dateFormat?: DateFormatPreference
  /** Format d'heure préféré */
  timeFormat?: TimeFormatPreference
  /** Langue pour les dates relatives */
  language?: LanguagePreference
}

// ============================================================================
// CONSTANTES
// ============================================================================

/**
 * Mapping des formats de date vers les patterns date-fns
 */
const DATE_FORMAT_PATTERNS: Record<DateFormatPreference, string> = {
  'DD/MM/YYYY': 'dd/MM/yyyy',
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
}

/**
 * Mapping des formats d'heure vers les patterns date-fns
 */
const TIME_FORMAT_PATTERNS: Record<TimeFormatPreference, string> = {
  '24h': 'HH:mm',
  '12h': 'h:mm a',
}

/**
 * Mapping des langues vers les locales date-fns
 */
const LOCALE_MAP: Record<LanguagePreference, Locale> = {
  fr: fr,
  en: enUS,
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Convertit une valeur en objet Date valide
 *
 * @param date - Date, string ISO, ou timestamp
 * @returns Date valide ou null si invalide
 */
function toDate(date: Date | string | number): Date | null {
  if (!date) return null

  let parsed: Date

  if (date instanceof Date) {
    parsed = date
  } else if (typeof date === 'string') {
    parsed = parseISO(date)
  } else if (typeof date === 'number') {
    parsed = new Date(date)
  } else {
    return null
  }

  return isValid(parsed) ? parsed : null
}

// ============================================================================
// FONCTIONS DE FORMATAGE
// ============================================================================

/**
 * Formate une date selon les préférences utilisateur
 *
 * @param date - Date à formater
 * @param options - Options de formatage
 * @returns Date formatée ou chaîne vide si invalide
 *
 * @example
 * formatDate(new Date(), { dateFormat: 'DD/MM/YYYY' }) // "31/12/2026"
 * formatDate(new Date(), { dateFormat: 'YYYY-MM-DD' }) // "2026-12-31"
 */
export function formatDate(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { dateFormat = 'DD/MM/YYYY', language = 'fr' } = options
  const pattern = DATE_FORMAT_PATTERNS[dateFormat]
  const locale = LOCALE_MAP[language]

  return format(parsed, pattern, { locale })
}

/**
 * Formate une heure selon les préférences utilisateur
 *
 * @param date - Date/heure à formater
 * @param options - Options de formatage
 * @returns Heure formatée ou chaîne vide si invalide
 *
 * @example
 * formatTime(new Date(), { timeFormat: '24h' }) // "14:30"
 * formatTime(new Date(), { timeFormat: '12h' }) // "2:30 PM"
 */
export function formatTime(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { timeFormat = '24h', language = 'fr' } = options
  const pattern = TIME_FORMAT_PATTERNS[timeFormat]
  const locale = LOCALE_MAP[language]

  return format(parsed, pattern, { locale })
}

/**
 * Formate une date et heure selon les préférences utilisateur
 *
 * @param date - Date/heure à formater
 * @param options - Options de formatage
 * @returns Date et heure formatées ou chaîne vide si invalide
 *
 * @example
 * formatDateTime(new Date(), { dateFormat: 'DD/MM/YYYY', timeFormat: '24h' })
 * // "31/12/2026 14:30"
 */
export function formatDateTime(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const dateStr = formatDate(date, options)
  const timeStr = formatTime(date, options)

  if (!dateStr) return ''
  if (!timeStr) return dateStr

  return `${dateStr} ${timeStr}`
}

/**
 * Formate une date de façon relative (ex: "il y a 2 heures")
 *
 * @param date - Date à formater
 * @param options - Options de formatage (utilise uniquement language)
 * @returns Date relative ou chaîne vide si invalide
 *
 * @example
 * formatRelativeDate(new Date(Date.now() - 3600000), { language: 'fr' })
 * // "aujourd'hui à 13:30"
 */
export function formatRelativeDate(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { language = 'fr' } = options
  const locale = LOCALE_MAP[language]

  return formatRelative(parsed, new Date(), { locale })
}

/**
 * Formate une date courte (jour et mois uniquement)
 *
 * @param date - Date à formater
 * @param options - Options de formatage
 * @returns Date courte ou chaîne vide si invalide
 *
 * @example
 * formatShortDate(new Date(), { language: 'fr' }) // "31 déc."
 * formatShortDate(new Date(), { language: 'en' }) // "Dec 31"
 */
export function formatShortDate(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { language = 'fr' } = options
  const locale = LOCALE_MAP[language]

  // Pattern différent selon la langue
  const pattern = language === 'fr' ? 'd MMM' : 'MMM d'

  return format(parsed, pattern, { locale })
}

/**
 * Formate une date longue (jour, mois et année en toutes lettres)
 *
 * @param date - Date à formater
 * @param options - Options de formatage
 * @returns Date longue ou chaîne vide si invalide
 *
 * @example
 * formatLongDate(new Date(), { language: 'fr' }) // "31 décembre 2026"
 * formatLongDate(new Date(), { language: 'en' }) // "December 31, 2026"
 */
export function formatLongDate(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { language = 'fr' } = options
  const locale = LOCALE_MAP[language]

  // Pattern différent selon la langue
  const pattern = language === 'fr' ? 'd MMMM yyyy' : 'MMMM d, yyyy'

  return format(parsed, pattern, { locale })
}

/**
 * Formate un jour de la semaine
 *
 * @param date - Date pour extraire le jour
 * @param options - Options de formatage
 * @param long - Si true, retourne le nom complet (lundi vs lun.)
 * @returns Jour de la semaine ou chaîne vide si invalide
 *
 * @example
 * formatWeekday(new Date(), { language: 'fr' }) // "mer."
 * formatWeekday(new Date(), { language: 'fr' }, true) // "mercredi"
 */
export function formatWeekday(
  date: Date | string | number,
  options: FormatOptions = {},
  long = false
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { language = 'fr' } = options
  const locale = LOCALE_MAP[language]

  const pattern = long ? 'EEEE' : 'EEE'

  return format(parsed, pattern, { locale })
}

/**
 * Formate un mois et une année
 *
 * @param date - Date pour extraire mois/année
 * @param options - Options de formatage
 * @returns Mois et année ou chaîne vide si invalide
 *
 * @example
 * formatMonthYear(new Date(), { language: 'fr' }) // "décembre 2026"
 * formatMonthYear(new Date(), { language: 'en' }) // "December 2026"
 */
export function formatMonthYear(
  date: Date | string | number,
  options: FormatOptions = {}
): string {
  const parsed = toDate(date)
  if (!parsed) return ''

  const { language = 'fr' } = options
  const locale = LOCALE_MAP[language]

  return format(parsed, 'MMMM yyyy', { locale })
}

// ============================================================================
// EXPORTS POUR LES COMPOSANTS UI
// ============================================================================

/**
 * Crée un formateur avec des options prédéfinies
 *
 * Utile pour éviter de passer les options à chaque appel
 *
 * @param defaultOptions - Options par défaut
 * @returns Objet avec toutes les fonctions de formatage
 *
 * @example
 * const fmt = createFormatter({ dateFormat: 'YYYY-MM-DD', timeFormat: '24h', language: 'fr' })
 * fmt.date(new Date()) // "2026-12-31"
 * fmt.time(new Date()) // "14:30"
 */
export function createFormatter(defaultOptions: FormatOptions = {}) {
  return {
    date: (date: Date | string | number, opts?: FormatOptions) =>
      formatDate(date, { ...defaultOptions, ...opts }),

    time: (date: Date | string | number, opts?: FormatOptions) =>
      formatTime(date, { ...defaultOptions, ...opts }),

    dateTime: (date: Date | string | number, opts?: FormatOptions) =>
      formatDateTime(date, { ...defaultOptions, ...opts }),

    relative: (date: Date | string | number, opts?: FormatOptions) =>
      formatRelativeDate(date, { ...defaultOptions, ...opts }),

    shortDate: (date: Date | string | number, opts?: FormatOptions) =>
      formatShortDate(date, { ...defaultOptions, ...opts }),

    longDate: (date: Date | string | number, opts?: FormatOptions) =>
      formatLongDate(date, { ...defaultOptions, ...opts }),

    weekday: (date: Date | string | number, long?: boolean) =>
      formatWeekday(date, defaultOptions, long),

    monthYear: (date: Date | string | number, opts?: FormatOptions) =>
      formatMonthYear(date, { ...defaultOptions, ...opts }),
  }
}
