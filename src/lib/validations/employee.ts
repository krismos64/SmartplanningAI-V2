import { z } from 'zod'
import {
  emailSchema,
  phoneSchema,
  nameSchema,
  dateSchema,
  optionalDateSchema,
  optionalAmountSchema,
} from './common'

/**
 * Schémas de validation pour les formulaires Employee
 * Create, Update, Assign to Department
 */

// ============================================
// ENUMS (synchronisés avec Prisma)
// ============================================
export const employmentTypeEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'TEMPORARY',
  'INTERN',
])

export type EmploymentType = z.infer<typeof employmentTypeEnum>

export const contractTypeEnum = z.enum([
  'CDI',
  'CDD',
  'INTERIM',
  'FREELANCE',
  'APPRENTICE',
  'INTERN',
])

// ============================================
// CREATE EMPLOYEE FORM
// ============================================
export const createEmployeeSchema = z
  .object({
    // Informations personnelles
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,

    // Affectation
    departmentId: z.string().min(1, 'Le département est requis'),
    position: z
      .string()
      .min(2, 'Le poste doit contenir au moins 2 caractères')
      .max(100, 'Le poste doit contenir maximum 100 caractères')
      .trim(),

    // Type d'emploi et contrat
    employmentType: employmentTypeEnum,
    contractType: contractTypeEnum,

    // Dates
    startDate: dateSchema,
    endDate: optionalDateSchema,

    // Salaire et horaires
    salary: optionalAmountSchema,
    workingHours: z
      .number({
        invalid_type_error: "Le nombre d'heures doit être un nombre",
        required_error: "Le nombre d'heures est requis",
      })
      .min(1, "Le nombre d'heures doit être au minimum 1h/semaine")
      .max(168, "Le nombre d'heures ne peut pas dépasser 168h/semaine"),
  })
  .refine(
    (data) => {
      // Si CDD, INTERIM ou APPRENTICE, la date de fin est obligatoire
      if (
        ['CDD', 'INTERIM', 'APPRENTICE'].includes(data.contractType) &&
        !data.endDate
      ) {
        return false
      }
      return true
    },
    {
      message: 'La date de fin est obligatoire pour ce type de contrat',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // La date de fin doit être postérieure à la date de début
      if (data.endDate && data.startDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
      }
      return true
    },
    {
      message: 'La date de fin doit être postérieure à la date de début',
      path: ['endDate'],
    }
  )

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>

// ============================================
// UPDATE EMPLOYEE FORM
// ============================================
export const updateEmployeeSchema = z
  .object({
    // Informations personnelles
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,

    // Affectation
    departmentId: z.string().min(1, 'Le département est requis'),
    position: z
      .string()
      .min(2, 'Le poste doit contenir au moins 2 caractères')
      .max(100, 'Le poste doit contenir maximum 100 caractères')
      .trim(),

    // Type d'emploi et contrat
    employmentType: employmentTypeEnum,
    contractType: contractTypeEnum,

    // Dates
    startDate: dateSchema,
    endDate: optionalDateSchema,

    // Salaire et horaires
    salary: optionalAmountSchema,
    workingHours: z
      .number({
        invalid_type_error: "Le nombre d'heures doit être un nombre",
        required_error: "Le nombre d'heures est requis",
      })
      .min(1, "Le nombre d'heures doit être au minimum 1h/semaine")
      .max(168, "Le nombre d'heures ne peut pas dépasser 168h/semaine"),

    // Statut actif/inactif
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (
        ['CDD', 'INTERIM', 'APPRENTICE'].includes(data.contractType) &&
        !data.endDate
      ) {
        return false
      }
      return true
    },
    {
      message: 'La date de fin est obligatoire pour ce type de contrat',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
      }
      return true
    },
    {
      message: 'La date de fin doit être postérieure à la date de début',
      path: ['endDate'],
    }
  )

export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>

// ============================================
// ASSIGN EMPLOYEE TO SHIFT FORM
// ============================================
export const assignShiftSchema = z
  .object({
    employeeId: z.string().min(1, "L'employé est requis"),
    shiftId: z.string().min(1, 'Le créneau est requis'),
    date: dateSchema,
    notes: z
      .string()
      .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
      .trim()
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      // La date ne peut pas être dans le passé (plus de 24h)
      const shiftDate = new Date(data.date)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return shiftDate >= yesterday
    },
    {
      message: "Impossible d'affecter un créneau dans le passé",
      path: ['date'],
    }
  )

export type AssignShiftFormData = z.infer<typeof assignShiftSchema>

// ============================================
// LABELS TRADUITS POUR LES ENUMS
// ============================================
export const employmentTypeLabels: Record<
  z.infer<typeof employmentTypeEnum>,
  string
> = {
  FULL_TIME: 'Temps plein',
  PART_TIME: 'Temps partiel',
  TEMPORARY: 'Temporaire',
  INTERN: 'Stagiaire',
}

export const contractTypeLabels: Record<
  z.infer<typeof contractTypeEnum>,
  string
> = {
  CDI: 'CDI - Contrat à durée indéterminée',
  CDD: 'CDD - Contrat à durée déterminée',
  INTERIM: 'Intérim',
  FREELANCE: 'Freelance / Indépendant',
  APPRENTICE: 'Apprentissage',
  INTERN: 'Stage',
}
