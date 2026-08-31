/**
 * Schemas de validation Zod pour Employee
 *
 * @description Validation des formulaires de creation et modification d'employes.
 * Gere les champs RH, planning et competences.
 * Aligne avec le schema Prisma Employee.
 *
 * @ticket SP-152
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'
import { nameSchema, phoneSchema, optionalDateSchema } from './common'

// ============================================================================
// Enums pour les departements
// ============================================================================

/**
 * Departements disponibles
 * Liste des departements types pour une entreprise
 */
export const departmentEnum = z.enum([
  'DIRECTION',
  'RESSOURCES_HUMAINES',
  'COMMERCIAL',
  'MARKETING',
  'TECHNIQUE',
  'PRODUCTION',
  'LOGISTIQUE',
  'FINANCE',
  'JURIDIQUE',
  'SUPPORT',
  'AUTRE',
])

export type Department = z.infer<typeof departmentEnum>

/**
 * Labels francais pour les departements
 */
export const departmentLabels: Record<Department, string> = {
  DIRECTION: 'Direction',
  RESSOURCES_HUMAINES: 'Ressources Humaines',
  COMMERCIAL: 'Commercial',
  MARKETING: 'Marketing',
  TECHNIQUE: 'Technique',
  PRODUCTION: 'Production',
  LOGISTIQUE: 'Logistique',
  FINANCE: 'Finance',
  JURIDIQUE: 'Juridique',
  SUPPORT: 'Support',
  AUTRE: 'Autre',
}

// ============================================================================
// Schema de base Employee
// ============================================================================

/**
 * Schema de base pour les champs Employee
 *
 * Valide les donnees communes a la creation et la modification
 * Aligne avec le modele Prisma Employee
 */
export const employeeBaseSchema = z.object({
  /** Prenom de l'employe (2-50 caracteres) */
  firstName: nameSchema,

  /** Nom de l'employe (2-50 caracteres) */
  lastName: nameSchema,

  /** Intitule du poste (optionnel, max 100 caracteres) */
  jobTitle: z
    .string()
    .max(100, "L'intitulé du poste ne peut pas dépasser 100 caractères")
    .trim()
    .optional()
    .or(z.literal('')),

  /** Departement (optionnel) */
  department: departmentEnum.optional().or(z.literal('')),

  /** Telephone de contact */
  phone: phoneSchema,

  /** Email de contact (optionnel) */
  email: z
    .string()
    .email('Adresse email invalide')
    .max(255)
    .trim()
    .optional()
    .or(z.literal('')),

  /** Date d'embauche (optionnel) */
  hireDate: optionalDateSchema,

  /** Heures hebdomadaires contractuelles (1-60) */
  weeklyHours: z
    .number({
      invalid_type_error: 'Les heures doivent être un nombre',
    })
    .min(1, 'Minimum 1 heure par semaine')
    .max(60, 'Maximum 60 heures par semaine')
    .default(35),

  /** Competences (tableau de strings) */
  skills: z.array(z.string().trim()).default([]),
})

// ============================================================================
// Schema de creation Employee
// ============================================================================

/**
 * Schema pour la creation d'un Employee
 *
 * Herite du schema de base avec relations obligatoires
 */
export const createEmployeeSchema = employeeBaseSchema.extend({
  /** ID de l'utilisateur associe (optionnel pour creation sans compte) */
  userId: z.string().cuid('ID utilisateur invalide').optional(),

  /** ID de l'entreprise (obligatoire) */
  companyId: z.string().cuid("ID d'entreprise invalide"),

  /** ID de l'equipe (optionnel, mais obligatoire pour MANAGER) */
  teamId: z.string().cuid("ID d'équipe invalide").optional().or(z.literal('')),

  /** Employe actif par defaut */
  isActive: z.boolean().default(true),

  /** Role du compte a creer (optionnel, utilise uniquement si email fourni) */
  role: z
    .enum(['EMPLOYEE', 'MANAGER', 'DIRECTOR'])
    .optional()
    .default('EMPLOYEE'),
})

export type CreateEmployeeInput = z.input<typeof createEmployeeSchema>

// ============================================================================
// Schema de modification Employee
// ============================================================================

/**
 * Schema pour la modification d'un Employee
 *
 * Tous les champs sont optionnels sauf l'ID
 */
export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  /** ID de l'Employee a modifier (requis) */
  id: z.string().cuid("ID d'employé invalide"),

  /** ID de l'equipe (peut etre change) */
  teamId: z
    .string()
    .cuid("ID d'équipe invalide")
    .optional()
    .nullable()
    .or(z.literal('')),

  /** Statut actif/inactif */
  isActive: z.boolean().optional(),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

// ============================================================================
// Schema de filtrage Employee (pour les listes avec RBAC)
// ============================================================================

/**
 * Schema pour les filtres de recherche Employee
 *
 * Utilise dans les Server Actions de listing
 * Les filtres companyId et teamId sont appliques automatiquement selon le role
 */
export const employeeFiltersSchema = z.object({
  /** Recherche textuelle (nom, prenom, poste) */
  search: z.string().optional(),

  /** Filtrer par equipe */
  teamId: z.string().cuid().optional(),

  /** Filtrer par entreprise (SUPER_ADMIN uniquement) */
  companyId: z.string().cuid().optional(),

  /** Filtrer par departement */
  department: departmentEnum.optional(),

  /** Filtrer par statut actif */
  isActive: z.boolean().optional(),

  /** Filtrer par competence */
  skill: z.string().optional(),
})

export type EmployeeFilters = z.infer<typeof employeeFiltersSchema>

// ============================================================================
// Types pour l'affichage
// ============================================================================

/**
 * Options pour les selects de departement
 */
export const departmentOptions = Object.entries(departmentLabels).map(
  ([value, label]) => ({
    value: value as Department,
    label,
  })
)

/**
 * Heures hebdomadaires pre-definies
 */
export const weeklyHoursOptions = [
  { value: 35, label: '35h (Temps plein)' },
  { value: 39, label: '39h (Temps plein majoré)' },
  { value: 28, label: '28h (80%)' },
  { value: 24.5, label: '24.5h (70%)' },
  { value: 17.5, label: '17.5h (Mi-temps)' },
]

// ============================================================================
// Types avec relations (pour les reponses Server Actions)
// ============================================================================

/**
 * Type Employee avec compteurs pour l'affichage liste
 */
export interface EmployeeWithCounts {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  jobTitle: string | null
  department: string | null
  phone: string | null
  email: string | null
  hireDate: Date | null
  weeklyHours: number
  skills: string[]
  companyId: string
  teamId: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string | null
    email: string
    image: string | null
    /**
     * SP-578 : distingue un compte active d'une invitation restee en attente.
     * Sans ce signal, un responsable ne pouvait pas voir qu'un collaborateur
     * n'avait jamais recu ou ouvert son invitation.
     */
    isEmailVerified?: boolean
  } | null
  company?: {
    id: string
    name: string
  }
  team?: {
    id: string
    name: string
  } | null
  _count?: {
    schedules: number
    leaveRequests: number
  }
}

/**
 * Resultat de updateEmployee
 *
 * Etend CrudActionResult d'un champ `emailChange` : quand l'adresse email a
 * change et que l'employe possede un compte de connexion, la personne qui a
 * fait la modification doit savoir ce qui a ete envoye et si le collaborateur
 * doit encore confirmer.
 */
export type UpdateEmployeeResult =
  | {
      success: true
      data: EmployeeWithCounts
      /** Message a afficher au responsable, absent si l'email n'a pas change */
      emailChange?: {
        /** REINVITED : compte jamais active, adresse remplacee et invitation renvoyee */
        /** CONFIRMATION_SENT : compte actif, changement en attente de confirmation */
        kind: 'REINVITED' | 'CONFIRMATION_SENT'
        newEmail: string
        message: string
      }
    }
  | { success: false; error: string; field?: string }

/**
 * Relance d'invitation depuis la fiche employe (SP-578)
 */
export const resendInvitationByEmployeeSchema = z.object({
  employeeId: z.string().cuid(),
})

export type ResendInvitationByEmployeeInput = z.infer<
  typeof resendInvitationByEmployeeSchema
>
