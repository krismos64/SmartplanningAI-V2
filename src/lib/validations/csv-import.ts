/**
 * Schemas de validation Zod pour l'import CSV d'employes
 *
 * @description Validation des donnees CSV ligne par ligne.
 * Les valeurs CSV sont des strings, les schemas gèrent la coercion.
 * Les helpers de parsing sont dans csv-import.utils.ts (pas 'use server').
 *
 * @ticket SP-496
 */

import { z } from 'zod'
import {
  parseDateFlexible,
  matchDepartment,
  matchRole,
  parseSkills,
  parseWeeklyHours,
  MAX_IMPORT_ROWS,
} from '@/components/import/csv-import.utils'

// ============================================================================
// Schema pour UNE ligne CSV
// ============================================================================

/**
 * Valide et transforme une ligne CSV en donnees Employee
 *
 * Toutes les valeurs entrent comme strings (c'est du CSV).
 * Les transforms gerent la coercion vers les types cibles.
 */
export const csvEmployeeRowSchema = z.object({
  /** Prenom (obligatoire, 2-50 caracteres) */
  firstName: z
    .string()
    .min(1, 'Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .trim(),

  /** Nom (obligatoire, 2-50 caracteres) */
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .trim(),

  /** Email (optionnel) */
  email: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val.toLowerCase()))
    .pipe(z.string().email('Email invalide').nullable())
    .optional()
    .default(''),

  /** Telephone (optionnel) */
  phone: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val.replace(/[\s.\-()]/g, '')))
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9]{7,15}$/, 'Numéro de téléphone invalide')
        .nullable()
    )
    .optional()
    .default(''),

  /** Intitule du poste (optionnel) */
  jobTitle: z
    .string()
    .max(100, "L'intitulé du poste ne peut pas dépasser 100 caractères")
    .trim()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .default(''),

  /** Departement (optionnel, matche vers l'enum) */
  department: z
    .string()
    .trim()
    .transform((val) => matchDepartment(val))
    .optional()
    .default(''),

  /** Nom de l'equipe (optionnel, sera resolu en teamId) */
  teamName: z
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .optional()
    .default(''),

  /** Heures hebdomadaires (optionnel, defaut 35) */
  weeklyHours: z
    .string()
    .trim()
    .transform((val) => parseWeeklyHours(val))
    .pipe(
      z
        .number()
        .min(1, 'Minimum 1 heure par semaine')
        .max(60, 'Maximum 60 heures par semaine')
        .nullable()
    )
    .optional()
    .default(''),

  /** Date d'embauche (optionnel, formats: ISO, FR, Excel serial) */
  hireDate: z
    .string()
    .trim()
    .transform((val) => parseDateFlexible(val))
    .optional()
    .default(''),

  /** Role (optionnel, defaut EMPLOYEE) */
  role: z
    .string()
    .trim()
    .transform((val) => matchRole(val))
    .optional()
    .default(''),

  /** Competences (optionnel, separees par virgules) */
  skills: z
    .string()
    .trim()
    .transform((val) => parseSkills(val))
    .optional()
    .default(''),
})

export type CsvEmployeeRow = z.output<typeof csvEmployeeRowSchema>
export type CsvEmployeeRowInput = z.input<typeof csvEmployeeRowSchema>

// ============================================================================
// Schema pour les options d'import
// ============================================================================

export const csvImportOptionsSchema = z.object({
  /** Ignorer les doublons (defaut: true) */
  skipDuplicates: z.boolean().default(true),

  /** Creer automatiquement les equipes referencees (defaut: true) */
  autoCreateTeams: z.boolean().default(true),
})

export type CsvImportOptions = z.infer<typeof csvImportOptionsSchema>

// ============================================================================
// Schema pour le payload complet envoye a la Server Action
// ============================================================================

export const csvImportPayloadSchema = z.object({
  /** Contenu CSV brut (string) */
  csvContent: z
    .string()
    .min(1, 'Le contenu CSV est vide')
    .max(5 * 1024 * 1024, 'Le fichier est trop volumineux (max 5 MB)'),

  /** Options d'import */
  options: csvImportOptionsSchema,
})

export type CsvImportPayload = z.infer<typeof csvImportPayloadSchema>

// ============================================================================
// Types de resultats d'import
// ============================================================================

export interface CsvImportRowError {
  /** Numero de ligne dans le CSV (1-indexed, sans compter l'en-tete) */
  row: number
  /** Champ en erreur */
  field: string
  /** Message d'erreur */
  message: string
  /** Donnees brutes de la ligne */
  rawData?: Record<string, string>
}

export interface CsvImportSkipped {
  /** Numero de ligne */
  row: number
  /** Motif du skip */
  reason: string
  /** Nom de l'employe concerne */
  employeeName: string
}

export interface CsvImportCreated {
  /** Numero de ligne */
  row: number
  /** ID de l'employe cree */
  employeeId: string
  /** Nom complet */
  employeeName: string
  /** Equipe assignee (si applicable) */
  teamName?: string
}

export interface CsvImportResult {
  /** Nombre total de lignes traitees */
  totalRows: number
  /** Employes crees avec succes */
  created: CsvImportCreated[]
  /** Lignes ignorees (doublons) */
  skipped: CsvImportSkipped[]
  /** Lignes en erreur (validation) */
  errors: CsvImportRowError[]
  /** Equipes creees automatiquement */
  teamsCreated: string[]
  /** Duree totale de l'import en ms */
  durationMs: number
}

// ============================================================================
// Validation du nombre de lignes
// ============================================================================

export function validateRowCount(rowCount: number): string | null {
  if (rowCount === 0) {
    return 'Le fichier ne contient aucune ligne de données'
  }
  if (rowCount > MAX_IMPORT_ROWS) {
    return `Le fichier contient ${rowCount} lignes. Maximum autorisé : ${MAX_IMPORT_ROWS}. Contactez le support pour un import en masse.`
  }
  return null
}
