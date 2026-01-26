/**
 * Schemas de validation Zod pour Availability
 *
 * @description Validation des formulaires de creation et modification d'indisponibilites.
 * Gere les periodes d'indisponibilite, preferences et recurrence.
 * Aligne avec le schema Prisma Availability.
 *
 * @ticket SP-393
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'
import { AvailabilityType } from '@prisma/client'
import { timeSchema } from './common'
import { recurrenceRuleSchema } from './schedule'

// ============================================================================
// SCHEMA DE BASE AVAILABILITY
// ============================================================================

/**
 * Schema de base pour les champs Availability
 *
 * Valide les donnees communes a la creation et la modification
 * Aligne avec le modele Prisma Availability
 */
export const availabilityBaseSchema = z.object({
  /** ID de l'employe */
  employeeId: z.string().cuid("ID employe invalide"),

  /** ID de l'entreprise */
  companyId: z.string().cuid("ID entreprise invalide"),

  /** Date de debut */
  startDate: z.coerce.date({
    errorMap: () => ({ message: 'Date de debut invalide' }),
  }),

  /** Date de fin */
  endDate: z.coerce.date({
    errorMap: () => ({ message: 'Date de fin invalide' }),
  }),

  /** Heure de debut (optionnel pour journee entiere) */
  startTime: timeSchema.optional().nullable(),

  /** Heure de fin (optionnel pour journee entiere) */
  endTime: timeSchema.optional().nullable(),

  /** Type d'indisponibilite */
  type: z.nativeEnum(AvailabilityType).default('UNAVAILABLE'),

  /** Raison (optionnelle) */
  reason: z
    .string()
    .max(500, 'La raison ne peut pas depasser 500 caracteres')
    .trim()
    .optional()
    .nullable(),

  /** Est-ce une indisponibilite recurrente ? */
  isRecurring: z.boolean().default(false),

  /** Regles de recurrence (requis si isRecurring=true) */
  recurrenceRule: recurrenceRuleSchema.optional().nullable(),
})

// ============================================================================
// SCHEMA CREATION AVAILABILITY
// ============================================================================

/**
 * Schema pour la creation d'une Availability
 *
 * Valide que la date de fin >= date de debut
 * et que la recurrence est fournie si isRecurring=true
 */
export const createAvailabilitySchema = availabilityBaseSchema.superRefine(
  (data, ctx) => {
    // Valider date fin >= date debut
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de fin doit etre egale ou apres la date de debut',
        path: ['endDate'],
      })
    }

    // Valider recurrence si isRecurring
    if (data.isRecurring && !data.recurrenceRule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Les regles de recurrence sont requises pour une indisponibilite recurrente',
        path: ['recurrenceRule'],
      })
    }

    // Valider que si une heure est specifiee, les deux doivent l'etre
    if ((data.startTime || data.endTime) && !(data.startTime && data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Si vous specifiez une heure, vous devez specifier l'heure de debut ET l'heure de fin",
        path: ['startTime'],
      })
    }

    // Valider heure fin > heure debut si meme jour
    if (
      data.startTime &&
      data.endTime &&
      data.startDate.toDateString() === data.endDate.toDateString() &&
      data.endTime <= data.startTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'heure de fin doit etre apres l'heure de debut",
        path: ['endTime'],
      })
    }
  }
)

export type CreateAvailabilityInput = z.infer<typeof createAvailabilitySchema>

// ============================================================================
// SCHEMA MODIFICATION AVAILABILITY
// ============================================================================

/**
 * Schema pour la modification d'une Availability
 *
 * Tous les champs sont optionnels sauf l'ID
 */
export const updateAvailabilitySchema = availabilityBaseSchema
  .partial()
  .extend({
    /** ID de l'indisponibilite a modifier (requis) */
    id: z.string().cuid("ID indisponibilite invalide"),
  })
  .superRefine((data, ctx) => {
    // Valider les dates seulement si les deux sont fournies
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La date de fin doit etre egale ou apres la date de debut',
        path: ['endDate'],
      })
    }

    // Valider la recurrence seulement si isRecurring est fourni
    if (data.isRecurring === true && !data.recurrenceRule) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Les regles de recurrence sont requises pour une indisponibilite recurrente',
        path: ['recurrenceRule'],
      })
    }
  })

export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>

// ============================================================================
// SCHEMA FILTRES AVAILABILITY
// ============================================================================

/**
 * Schema pour les filtres de recherche Availability
 *
 * Utilise dans les Server Actions de listing
 */
export const availabilityFiltersSchema = z.object({
  /** Filtrer par entreprise */
  companyId: z.string().cuid().optional(),

  /** Filtrer par employe */
  employeeId: z.string().cuid().optional(),

  /** Filtrer par plusieurs employes */
  employeeIds: z.array(z.string().cuid()).optional(),

  /** Filtrer par type */
  type: z.nativeEnum(AvailabilityType).optional(),

  /** Filtrer par plusieurs types */
  types: z.array(z.nativeEnum(AvailabilityType)).optional(),

  /** Date de debut minimum */
  startDate: z.coerce.date().optional(),

  /** Date de fin maximum */
  endDate: z.coerce.date().optional(),

  /** Filtrer les recurrentes uniquement */
  isRecurring: z.boolean().optional(),

  /** Page (pagination) */
  page: z.coerce.number().int().min(1).default(1),

  /** Limite par page */
  limit: z.coerce.number().int().min(1).max(100).default(20),

  /** Champ de tri */
  sortBy: z
    .enum(['startDate', 'endDate', 'createdAt', 'type'])
    .default('startDate'),

  /** Ordre de tri */
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type AvailabilityFilters = z.infer<typeof availabilityFiltersSchema>

// ============================================================================
// LABELS FRANCAIS
// ============================================================================

/**
 * Labels francais pour les types d'indisponibilite
 */
export const availabilityTypeLabels: Record<AvailabilityType, string> = {
  UNAVAILABLE: 'Indisponible',
  PREFERRED: 'Preference horaire',
  VACATION: 'Conges / Vacances',
  SICK: 'Maladie',
  TRAINING: 'Formation',
  OTHER: 'Autre',
}

/**
 * Options pour les selects de type
 */
export const availabilityTypeOptions = Object.entries(
  availabilityTypeLabels
).map(([value, label]) => ({
  value: value as AvailabilityType,
  label,
}))

/**
 * Couleurs par defaut pour les types
 */
export const availabilityTypeColors: Record<AvailabilityType, string> = {
  UNAVAILABLE: '#EF4444', // Red
  PREFERRED: '#10B981', // Emerald
  VACATION: '#3B82F6', // Blue
  SICK: '#F59E0B', // Amber
  TRAINING: '#8B5CF6', // Violet
  OTHER: '#6B7280', // Gray
}

/**
 * Icones pour les types (noms Lucide)
 */
export const availabilityTypeIcons: Record<AvailabilityType, string> = {
  UNAVAILABLE: 'ban',
  PREFERRED: 'star',
  VACATION: 'palmtree',
  SICK: 'thermometer',
  TRAINING: 'graduation-cap',
  OTHER: 'circle-help',
}
