/**
 * Schémas Zod pour la validation des paramètres entreprise
 *
 * @ticket SP-435 - Paramètres Entreprise
 *
 * ✅ Via Context7 (Zod v3 best practices)
 * - z.refine() pour les validations cross-field
 * - Regex pour les formats horaires HH:mm
 */

import { z } from 'zod'
import { DAYS_OF_WEEK } from '@/types/company'

// ============================================================================
// CONSTANTES DE VALIDATION
// ============================================================================

/**
 * Regex pour le format horaire HH:mm (00:00 à 23:59)
 */
const TIME_FORMAT_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

/**
 * Message d'erreur pour le format horaire
 */
const TIME_FORMAT_ERROR = 'Format HH:mm attendu (ex: 09:00)'

// ============================================================================
// SCHÉMAS DE BASE
// ============================================================================

/**
 * Schéma pour un jour de la semaine
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

/**
 * Schéma pour un horaire au format HH:mm
 */
export const timeSchema = z.string().regex(TIME_FORMAT_REGEX, TIME_FORMAT_ERROR)

/**
 * Schéma pour les paramètres de pause déjeuner
 */
export const lunchBreakSettingsSchema = z
  .object({
    enabled: z.boolean(),
    start: timeSchema,
    end: timeSchema,
  })
  .refine(
    (data) => {
      // Si désactivé, pas de validation horaire
      if (!data.enabled) return true
      // Vérifier que l'heure de fin est après l'heure de début
      return data.start < data.end
    },
    {
      message: 'La fin de la pause doit être après le début',
      path: ['end'],
    }
  )

// ============================================================================
// SCHÉMAS POUR LES ACTIONS
// ============================================================================

/**
 * Schéma pour la mise à jour des paramètres entreprise
 *
 * Tous les champs sont optionnels pour permettre les mises à jour partielles
 */
export const updateCompanySettingsSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Le nom est requis')
      .max(100, 'Le nom ne doit pas dépasser 100 caractères')
      .optional(),
    address: z
      .string()
      .max(500, "L'adresse ne doit pas dépasser 500 caractères")
      .nullable()
      .optional(),
    workingDays: z
      .array(dayOfWeekSchema)
      .min(1, 'Au moins un jour travaillé est requis')
      .refine(
        (days) => {
          // Vérifier que les jours sont uniques
          return new Set(days).size === days.length
        },
        { message: 'Les jours doivent être uniques' }
      )
      .refine(
        (days) => {
          // Vérifier que tous les jours sont valides
          return days.every((day) =>
            DAYS_OF_WEEK.includes(day as (typeof DAYS_OF_WEEK)[number])
          )
        },
        { message: 'Jour invalide' }
      )
      .optional(),
    workingHoursStart: timeSchema.optional(),
    workingHoursEnd: timeSchema.optional(),
    lunchBreak: lunchBreakSettingsSchema.optional(),
  })
  .refine(
    (data) => {
      // Si les deux horaires sont fournis, vérifier la cohérence
      if (data.workingHoursStart && data.workingHoursEnd) {
        return data.workingHoursStart < data.workingHoursEnd
      }
      return true
    },
    {
      message: "L'heure de fermeture doit être après l'heure d'ouverture",
      path: ['workingHoursEnd'],
    }
  )

/**
 * Schéma complet pour les paramètres entreprise (lecture)
 */
export const companySettingsSchema = z.object({
  name: z.string(),
  address: z.string().nullable(),
  workingDays: z.array(dayOfWeekSchema),
  workingHoursStart: timeSchema,
  workingHoursEnd: timeSchema,
  lunchBreak: lunchBreakSettingsSchema,
})

// ============================================================================
// TYPES INFÉRÉS
// ============================================================================

export type DayOfWeekInput = z.infer<typeof dayOfWeekSchema>
export type LunchBreakSettingsInput = z.infer<typeof lunchBreakSettingsSchema>
export type UpdateCompanySettingsInput = z.infer<
  typeof updateCompanySettingsSchema
>
export type CompanySettingsInput = z.infer<typeof companySettingsSchema>

// ============================================================================
// LABELS FR POUR L'UI
// ============================================================================

export const COMPANY_SETTINGS_LABELS = {
  name: "Nom de l'entreprise",
  address: 'Adresse',
  workingDays: 'Jours travaillés',
  workingHoursStart: "Heure d'ouverture",
  workingHoursEnd: 'Heure de fermeture',
  lunchBreak: 'Pause déjeuner',
} as const

export const COMPANY_SETTINGS_DESCRIPTIONS = {
  name: 'Le nom officiel de votre entreprise',
  address: "L'adresse physique de votre établissement",
  workingDays: 'Les jours où votre entreprise est ouverte',
  workingHours: 'Les horaires de travail par défaut',
  lunchBreak: 'La plage horaire de la pause déjeuner',
} as const
