/**
 * Types pour les paramètres entreprise
 *
 * @ticket SP-435 - Paramètres Entreprise
 *
 * Structure pour la configuration des jours/horaires de travail
 * stockée en partie dans Company (Prisma) et Company.defaultOpeningHours (JSON)
 */

// ============================================================================
// JOURS DE LA SEMAINE
// ============================================================================

/**
 * Jour de la semaine (format Prisma Company.workingDays)
 */
export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

/**
 * Liste ordonnée des jours de la semaine
 */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

/**
 * Labels français pour les jours
 */
export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lundi',
  TUESDAY: 'Mardi',
  WEDNESDAY: 'Mercredi',
  THURSDAY: 'Jeudi',
  FRIDAY: 'Vendredi',
  SATURDAY: 'Samedi',
  SUNDAY: 'Dimanche',
}

/**
 * Labels courts (3 lettres) pour les jours
 */
export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Lun',
  TUESDAY: 'Mar',
  WEDNESDAY: 'Mer',
  THURSDAY: 'Jeu',
  FRIDAY: 'Ven',
  SATURDAY: 'Sam',
  SUNDAY: 'Dim',
}

// ============================================================================
// PRESETS JOURS TRAVAILLÉS
// ============================================================================

/**
 * Preset de jours travaillés
 */
export interface WorkingDaysPreset {
  id: string
  label: string
  days: DayOfWeek[]
}

/**
 * Presets prédéfinis pour les jours travaillés
 */
export const WORKING_DAYS_PRESETS: WorkingDaysPreset[] = [
  {
    id: 'mon-fri',
    label: 'Lun-Ven (standard)',
    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  },
  {
    id: 'mon-sat',
    label: 'Lun-Sam',
    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
  },
  {
    id: 'all-week',
    label: 'Tous les jours',
    days: [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ],
  },
]

// ============================================================================
// PAUSE DÉJEUNER
// ============================================================================

/**
 * Configuration de la pause déjeuner
 */
export interface LunchBreakSettings {
  /** Pause déjeuner activée */
  enabled: boolean
  /** Heure de début (format HH:mm) */
  start: string
  /** Heure de fin (format HH:mm) */
  end: string
}

// ============================================================================
// PARAMÈTRES ENTREPRISE
// ============================================================================

/**
 * Paramètres entreprise complets (UI)
 *
 * Mapping avec Prisma :
 * - name → Company.name
 * - address → Company.address
 * - workingDays → Company.workingDays (String[])
 * - workingHoursStart → Company.workingHoursStart
 * - workingHoursEnd → Company.workingHoursEnd
 * - lunchBreak → Company.defaultOpeningHours.lunchBreak (JSON)
 */
export interface CompanySettings {
  /** Nom de l'entreprise */
  name: string
  /** Adresse complète */
  address: string | null
  /** Jours travaillés */
  workingDays: DayOfWeek[]
  /** Heure d'ouverture (format HH:mm) */
  workingHoursStart: string
  /** Heure de fermeture (format HH:mm) */
  workingHoursEnd: string
  /** Paramètres pause déjeuner */
  lunchBreak: LunchBreakSettings
}

// ============================================================================
// VALEURS PAR DÉFAUT
// ============================================================================

/**
 * Valeurs par défaut pour les paramètres entreprise
 */
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: '',
  address: null,
  workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  lunchBreak: {
    enabled: false,
    start: '12:00',
    end: '14:00',
  },
}

/**
 * Pause déjeuner par défaut
 */
export const DEFAULT_LUNCH_BREAK: LunchBreakSettings = {
  enabled: false,
  start: '12:00',
  end: '14:00',
}
