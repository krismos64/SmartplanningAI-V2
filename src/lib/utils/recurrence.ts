/**
 * Utilitaires pour la gestion des récurrences de créneaux
 *
 * @description Génération des occurrences pour les créneaux récurrents
 * @ticket SP-399
 */

import {
  addDays,
  addWeeks,
  addMonths,
  isBefore,
  isAfter,
  getDay,
  startOfDay,
} from 'date-fns'

// ============================================================================
// Types
// ============================================================================

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface RecurrenceRule {
  frequency: RecurrenceFrequency
  interval: number
  daysOfWeek?: DayOfWeek[]
  endDate?: Date
  occurrences?: number
}

export interface OccurrenceDate {
  startDate: Date
  endDate: Date
}

// ============================================================================
// Constantes
// ============================================================================

/** Nombre maximum d'occurrences autorisées */
export const MAX_OCCURRENCES = 52

/** Nombre maximum de créneaux créés en une fois (multi-employés × occurrences) */
export const MAX_TOTAL_SCHEDULES = 200

/** Mapping jour de la semaine vers index date-fns (0 = Dimanche) */
const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

// ============================================================================
// Fonctions utilitaires
// ============================================================================

/**
 * Calcule la durée en jours entre deux dates
 */
function getDurationInDays(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate)
  const end = startOfDay(endDate)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Avance une date selon la fréquence et l'intervalle
 */
function advanceDate(
  date: Date,
  frequency: RecurrenceFrequency,
  interval: number
): Date {
  switch (frequency) {
    case 'DAILY':
      return addDays(date, interval)
    case 'WEEKLY':
      return addWeeks(date, interval)
    case 'BIWEEKLY':
      return addWeeks(date, interval * 2)
    case 'MONTHLY':
      return addMonths(date, interval)
    default:
      return addDays(date, interval)
  }
}

// ============================================================================
// Fonction principale
// ============================================================================

/**
 * Génère toutes les occurrences d'un créneau récurrent
 *
 * @param startDate - Date de début du premier créneau
 * @param endDate - Date de fin du premier créneau
 * @param rule - Règle de récurrence
 * @returns Liste des dates d'occurrences
 *
 * @example
 * // Récurrence hebdomadaire les lundis et mercredis, 4 occurrences
 * generateOccurrences(
 *   new Date('2026-01-26'),
 *   new Date('2026-01-26'),
 *   {
 *     frequency: 'WEEKLY',
 *     interval: 1,
 *     daysOfWeek: ['MONDAY', 'WEDNESDAY'],
 *     occurrences: 4
 *   }
 * )
 */
export function generateOccurrences(
  startDate: Date,
  endDate: Date,
  rule: RecurrenceRule
): OccurrenceDate[] {
  const occurrences: OccurrenceDate[] = []
  const duration = getDurationInDays(startDate, endDate)

  // Limite de sécurité
  const maxOccurrences = Math.min(
    rule.occurrences || MAX_OCCURRENCES,
    MAX_OCCURRENCES
  )
  const ruleEndDate = rule.endDate ? startOfDay(rule.endDate) : null

  // Pour WEEKLY/BIWEEKLY avec jours spécifiques
  if (
    (rule.frequency === 'WEEKLY' || rule.frequency === 'BIWEEKLY') &&
    rule.daysOfWeek &&
    rule.daysOfWeek.length > 0
  ) {
    return generateWeeklyWithDays(
      startDate,
      duration,
      rule.frequency,
      rule.interval,
      rule.daysOfWeek,
      maxOccurrences,
      ruleEndDate
    )
  }

  // Pour DAILY, MONTHLY ou WEEKLY sans jours spécifiques
  let currentStart = startOfDay(startDate)

  while (occurrences.length < maxOccurrences) {
    // Vérifier la date de fin
    if (ruleEndDate && isAfter(currentStart, ruleEndDate)) {
      break
    }

    // Ajouter l'occurrence
    const occurrenceEnd = addDays(currentStart, duration)
    occurrences.push({
      startDate: new Date(currentStart),
      endDate: new Date(occurrenceEnd),
    })

    // Avancer à la prochaine occurrence
    currentStart = advanceDate(currentStart, rule.frequency, rule.interval)
  }

  return occurrences
}

/**
 * Génère les occurrences pour une récurrence hebdomadaire avec jours spécifiques
 */
function generateWeeklyWithDays(
  startDate: Date,
  duration: number,
  frequency: RecurrenceFrequency,
  interval: number,
  daysOfWeek: DayOfWeek[],
  maxOccurrences: number,
  endDate: Date | null
): OccurrenceDate[] {
  const occurrences: OccurrenceDate[] = []

  // Trier les jours de la semaine dans l'ordre
  const sortedDays = [...daysOfWeek].sort(
    (a, b) => DAY_TO_INDEX[a] - DAY_TO_INDEX[b]
  )

  // Trouver le début de la semaine de départ
  let currentWeekStart = startOfDay(startDate)
  const startDayIndex = getDay(currentWeekStart)

  // Reculer au dimanche de cette semaine
  currentWeekStart = addDays(currentWeekStart, -startDayIndex)

  // Compteur de semaines pour gérer l'intervalle
  let weekCounter = 0

  // Limite de sécurité pour éviter boucle infinie
  const maxIterations = maxOccurrences * 10
  let iterations = 0

  while (occurrences.length < maxOccurrences && iterations < maxIterations) {
    iterations++

    // Vérifier si c'est une semaine active (selon l'intervalle)
    const isActiveWeek =
      frequency === 'BIWEEKLY'
        ? weekCounter % (interval * 2) === 0
        : weekCounter % interval === 0

    if (isActiveWeek) {
      // Parcourir les jours de cette semaine
      for (const day of sortedDays) {
        if (occurrences.length >= maxOccurrences) break

        const dayIndex = DAY_TO_INDEX[day]
        const occurrenceStart = addDays(currentWeekStart, dayIndex)

        // Ignorer si avant la date de début originale
        if (isBefore(occurrenceStart, startOfDay(startDate))) {
          continue
        }

        // Vérifier la date de fin
        if (endDate && isAfter(occurrenceStart, endDate)) {
          return occurrences
        }

        // Ajouter l'occurrence
        const occurrenceEnd = addDays(occurrenceStart, duration)
        occurrences.push({
          startDate: new Date(occurrenceStart),
          endDate: new Date(occurrenceEnd),
        })
      }
    }

    // Passer à la semaine suivante
    currentWeekStart = addWeeks(currentWeekStart, 1)
    weekCounter++
  }

  return occurrences
}

/**
 * Valide une règle de récurrence
 *
 * @returns Message d'erreur ou null si valide
 */
export function validateRecurrenceRule(rule: RecurrenceRule): string | null {
  // Vérifier qu'on a soit endDate soit occurrences
  if (!rule.endDate && !rule.occurrences) {
    return "Vous devez spécifier une date de fin ou un nombre d'occurrences"
  }

  // Vérifier l'intervalle
  if (rule.interval < 1 || rule.interval > 12) {
    return "L'intervalle doit être entre 1 et 12"
  }

  // Vérifier le nombre d'occurrences
  if (
    rule.occurrences &&
    (rule.occurrences < 1 || rule.occurrences > MAX_OCCURRENCES)
  ) {
    return `Le nombre d'occurrences doit être entre 1 et ${MAX_OCCURRENCES}`
  }

  // Vérifier les jours de la semaine pour WEEKLY/BIWEEKLY
  if (
    (rule.frequency === 'WEEKLY' || rule.frequency === 'BIWEEKLY') &&
    (!rule.daysOfWeek || rule.daysOfWeek.length === 0)
  ) {
    return 'Vous devez sélectionner au moins un jour de la semaine'
  }

  // Vérifier que la date de fin est dans le futur
  if (rule.endDate && isBefore(rule.endDate, new Date())) {
    return 'La date de fin doit être dans le futur'
  }

  return null
}

/**
 * Génère un ID unique pour un groupe de récurrence
 */
export function generateRecurrenceGroupId(): string {
  return `recurrence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcule le nombre total de créneaux qui seront créés
 *
 * @param rule - Règle de récurrence
 * @param employeeCount - Nombre d'employés sélectionnés
 * @param startDate - Date de début
 * @param endDate - Date de fin
 * @returns Nombre total de créneaux
 */
export function calculateTotalSchedules(
  rule: RecurrenceRule,
  employeeCount: number,
  startDate: Date,
  endDate: Date
): number {
  const occurrences = generateOccurrences(startDate, endDate, rule)
  return occurrences.length * employeeCount
}

/**
 * Labels français pour les fréquences
 */
export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  DAILY: 'Quotidien',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Mensuel',
}

/**
 * Labels français pour les jours de la semaine
 */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mer',
  THURSDAY: 'Jeu',
  FRIDAY: 'Ven',
  SATURDAY: 'Sam',
  SUNDAY: 'Dim',
}

/**
 * Labels français complets pour les jours de la semaine
 */
export const DAY_LABELS_FULL: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
}
