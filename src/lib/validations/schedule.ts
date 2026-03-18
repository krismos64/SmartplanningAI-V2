/**
 * Schemas de validation Zod pour Schedule
 *
 * @description Validation des formulaires de creation et modification de shifts.
 * Gere les horaires, recurrence et creation multi-employes.
 * Aligne avec le schema Prisma Schedule.
 *
 * @ticket SP-393
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'
import { ScheduleType, ScheduleStatus } from '@prisma/client'

// ============================================================================
// SCHEMAS UTILITAIRES
// ============================================================================

// Import timeSchema depuis common.ts (ne pas re-exporter pour éviter conflit)
import { timeSchema } from './common'

/**
 * Jours de la semaine (format string)
 */
export const dayOfWeekSchema = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
])

export type DayOfWeek = z.infer<typeof dayOfWeekSchema>

/**
 * Frequence de recurrence
 */
export const recurrenceFrequencySchema = z.enum([
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
])

export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>

/**
 * Labels francais pour les frequences
 */
export const recurrenceFrequencyLabels: Record<RecurrenceFrequency, string> = {
  DAILY: 'Quotidien',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Mensuel',
}

// ============================================================================
// SCHEMA REGLE DE RECURRENCE
// ============================================================================

/**
 * Regle de recurrence pour les shifts repetitifs
 *
 * Doit specifier soit une date de fin, soit un nombre d'occurrences
 */
export const recurrenceRuleSchema = z
  .object({
    /** Frequence de repetition */
    frequency: recurrenceFrequencySchema,

    /** Intervalle (tous les X jours/semaines/mois) */
    interval: z.number().int().min(1).max(12).default(1),

    /** Jours de la semaine (MONDAY, TUESDAY, etc.) - pour WEEKLY/BIWEEKLY */
    daysOfWeek: z.array(dayOfWeekSchema).optional(),

    /** Date de fin de la recurrence */
    endDate: z.coerce.date().optional(),

    /** Nombre d'occurrences (max 52 = 1 an) */
    occurrences: z.number().int().min(1).max(52).optional(),
  })
  .refine((data) => data.endDate || data.occurrences, {
    message: "Vous devez specifier une date de fin OU un nombre d'occurrences",
  })

export type RecurrenceRule = z.infer<typeof recurrenceRuleSchema>

// ============================================================================
// SCHEMA DE BASE SCHEDULE
// ============================================================================

/**
 * Schema de base pour les champs Schedule
 *
 * Valide les donnees communes a la creation et la modification
 * Aligne avec le modele Prisma Schedule
 */
export const scheduleBaseSchema = z.object({
  /** ID de l'employe */
  employeeId: z.string().cuid('ID employe invalide'),

  /** ID de l'equipe (optionnel) */
  teamId: z.string().cuid('ID equipe invalide').optional().nullable(),

  /** ID de l'entreprise */
  companyId: z.string().cuid('ID entreprise invalide'),

  /** Date de debut */
  startDate: z.coerce.date({
    errorMap: () => ({ message: 'Date de debut invalide' }),
  }),

  /** Date de fin */
  endDate: z.coerce.date({
    errorMap: () => ({ message: 'Date de fin invalide' }),
  }),

  /** Heure de debut (format HH:mm) */
  startTime: timeSchema,

  /** Heure de fin (format HH:mm) */
  endTime: timeSchema,

  /** Type de creneau */
  type: z.nativeEnum(ScheduleType).default('WORK'),

  /** Statut du creneau */
  status: z.nativeEnum(ScheduleStatus).default('DRAFT'),

  /** Titre du creneau (optionnel) */
  title: z
    .string()
    .max(100, 'Le titre ne peut pas depasser 100 caracteres')
    .trim()
    .optional()
    .nullable(),

  /** Description (optionnelle) */
  description: z
    .string()
    .max(500, 'La description ne peut pas depasser 500 caracteres')
    .trim()
    .optional()
    .nullable(),

  /** Lieu (optionnel) */
  location: z
    .string()
    .max(200, 'Le lieu ne peut pas depasser 200 caracteres')
    .trim()
    .optional()
    .nullable(),

  /** Couleur hexadecimale (optionnelle) */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadecimale invalide (ex: #10B981)')
    .optional()
    .nullable(),

  /** Est-ce un shift recurrent ? */
  isRecurring: z.boolean().default(false),

  /** Regles de recurrence (requis si isRecurring=true) */
  recurrenceRule: recurrenceRuleSchema.optional().nullable(),

  /** ID de groupe de recurrence (genere automatiquement) */
  recurrenceGroupId: z.string().cuid().optional().nullable(),

  /** ID de groupe multi-employes (genere automatiquement) */
  scheduleGroupId: z.string().cuid().optional().nullable(),
})

// ============================================================================
// SCHEMA CREATION SCHEDULE
// ============================================================================

/**
 * Schema pour la creation d'un Schedule
 *
 * Supporte la creation pour un seul employe (employeeId)
 * ou pour plusieurs employes (employeeIds)
 */
export const createScheduleSchema = scheduleBaseSchema
  .omit({ recurrenceGroupId: true, scheduleGroupId: true, employeeId: true })
  .extend({
    /** ID de l'employe (optionnel si employeeIds fourni) */
    employeeId: z.string().cuid('ID employe invalide').optional(),
    /** Liste d'employes pour creation multi-employes */
    employeeIds: z
      .array(z.string().cuid('ID employe invalide'))
      .min(1, 'Au moins un employe requis')
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Valider qu'on a soit employeeId soit employeeIds
    if (
      !data.employeeId &&
      (!data.employeeIds || data.employeeIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous devez specifier un employe ou une liste d'employes",
        path: ['employeeId'],
      })
    }

    // Valider date/heure fin > debut
    const startDateTime = new Date(
      `${data.startDate.toISOString().split('T')[0]}T${data.startTime}`
    )
    const endDateTime = new Date(
      `${data.endDate.toISOString().split('T')[0]}T${data.endTime}`
    )
    if (endDateTime <= startDateTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date/heure de fin doit etre apres la date/heure de debut',
        path: ['endTime'],
      })
    }

    // Valider recurrence si isRecurring
    if (data.isRecurring && !data.recurrenceRule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Les regles de recurrence sont requises pour un shift recurrent',
        path: ['recurrenceRule'],
      })
    }
  })

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>

// ============================================================================
// SCHEMA MODIFICATION SCHEDULE
// ============================================================================

/**
 * Schema pour la modification d'un Schedule
 *
 * Tous les champs sont optionnels sauf l'ID
 */
export const updateScheduleSchema = scheduleBaseSchema
  .partial()
  .extend({
    /** ID du schedule a modifier (requis) */
    id: z.string().cuid('ID schedule invalide'),
  })
  .refine(
    (data) => {
      // Valider les dates/heures seulement si tous les champs sont fournis
      if (data.startDate && data.endDate && data.startTime && data.endTime) {
        const startDateTime = new Date(
          `${data.startDate.toISOString().split('T')[0]}T${data.startTime}`
        )
        const endDateTime = new Date(
          `${data.endDate.toISOString().split('T')[0]}T${data.endTime}`
        )
        return endDateTime > startDateTime
      }
      return true
    },
    {
      message: 'La date/heure de fin doit etre apres la date/heure de debut',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      // Valider la recurrence seulement si isRecurring est fourni
      if (data.isRecurring === true) {
        return !!data.recurrenceRule
      }
      return true
    },
    {
      message: 'Les regles de recurrence sont requises pour un shift recurrent',
      path: ['recurrenceRule'],
    }
  )

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>

// ============================================================================
// SCHEMA FILTRES SCHEDULE
// ============================================================================

/**
 * Schema pour les filtres de recherche Schedule
 *
 * Utilise dans les Server Actions de listing
 */
export const scheduleFiltersSchema = z.object({
  /** Filtrer par entreprise */
  companyId: z.string().cuid().optional(),

  /** Filtrer par employe */
  employeeId: z.string().cuid().optional(),

  /** Filtrer par plusieurs employes */
  employeeIds: z.array(z.string().cuid()).optional(),

  /** Filtrer par equipe */
  teamId: z.string().cuid().optional(),

  /** Filtrer par type de creneau */
  type: z.nativeEnum(ScheduleType).optional(),

  /** Filtrer par plusieurs types */
  types: z.array(z.nativeEnum(ScheduleType)).optional(),

  /** Filtrer par statut */
  status: z.nativeEnum(ScheduleStatus).optional(),

  /** Filtrer par plusieurs statuts */
  statuses: z.array(z.nativeEnum(ScheduleStatus)).optional(),

  /** Date de debut minimum */
  startDate: z.coerce.date().optional(),

  /** Date de fin maximum */
  endDate: z.coerce.date().optional(),

  /** Filtrer les recurrents uniquement */
  isRecurring: z.boolean().optional(),

  /** Recherche textuelle (titre, description) */
  search: z.string().max(100).optional(),

  /** Page (pagination) */
  page: z.coerce.number().int().min(1).default(1),

  /** Limite par page */
  limit: z.coerce.number().int().min(1).max(500).default(20),

  /** Champ de tri */
  sortBy: z
    .enum(['startDate', 'endDate', 'createdAt', 'title', 'type', 'status'])
    .default('startDate'),

  /** Ordre de tri */
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type ScheduleFilters = z.infer<typeof scheduleFiltersSchema>

// ============================================================================
// LABELS FRANCAIS
// ============================================================================

/**
 * Labels francais pour les types de schedule
 */
export const scheduleTypeLabels: Record<ScheduleType, string> = {
  WORK: 'Travail',
  REST: 'Repos',
  BREAK: 'Pause',
  MEETING: 'Réunion',
  TRAINING: 'Formation',
  REMOTE: 'Télétravail',
  ON_CALL: 'Astreinte',
  OVERTIME: 'Heures supplémentaires',
}

/**
 * Labels francais pour les statuts de schedule
 */
export const scheduleStatusLabels: Record<ScheduleStatus, string> = {
  DRAFT: 'Brouillon',
  CONFIRMED: 'Confirmé',
}

/**
 * Options pour les selects de type
 */
export const scheduleTypeOptions = Object.entries(scheduleTypeLabels).map(
  ([value, label]) => ({
    value: value as ScheduleType,
    label,
  })
)

/**
 * Options pour les selects de statut
 */
export const scheduleStatusOptions = Object.entries(scheduleStatusLabels).map(
  ([value, label]) => ({
    value: value as ScheduleStatus,
    label,
  })
)

/**
 * Couleurs par defaut pour les types
 */
export const scheduleTypeColors: Record<ScheduleType, string> = {
  WORK: '#10B981', // Emerald
  MEETING: '#3B82F6', // Blue
  BREAK: '#F59E0B', // Amber
  TRAINING: '#8B5CF6', // Violet
  REMOTE: '#06B6D4', // Cyan
  ON_CALL: '#EF4444', // Red
  OVERTIME: '#F97316', // Orange
  REST: '#16A34A', // Green
}
