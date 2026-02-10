import { z } from 'zod'
import { nameSchema, phoneSchema } from './common'

/**
 * Schémas de validation pour l'édition du profil utilisateur
 *
 * @description Schémas Zod pour le formulaire d'édition du profil.
 * Distingue les champs modifiables des champs protégés.
 *
 * Champs modifiables :
 * - firstName/lastName : Stockés dans Employee (ou User.name si pas d'Employee)
 * - phone : Stocké dans Employee uniquement
 * - jobTitle : Poste occupé
 * - hireDate : Date d'embauche
 *
 * Champs NON modifiables ici :
 * - email : Nécessite un flux de vérification séparé (hors scope CDA)
 * - role : Modifiable uniquement par SYSTEM_ADMIN/DIRECTOR
 * - weeklyHours : Géré par le DIRECTOR/MANAGER
 * - team : Assignation gérée par le DIRECTOR/MANAGER
 *
 * @ticket SP-271
 */

// ============================================================================
// EDIT PROFILE SCHEMA
// ============================================================================

/**
 * Schéma de validation pour l'édition du profil
 *
 * Utilise les schémas communs nameSchema et phoneSchema pour cohérence.
 * Les champs phone, jobTitle et hireDate sont optionnels.
 */
export const editProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  jobTitle: z
    .string()
    .max(100, 'Le poste ne peut pas dépasser 100 caractères')
    .optional()
    .or(z.literal('')),
  hireDate: z.coerce.date().optional().nullable(),
})

/**
 * Type TypeScript inféré du schéma d'édition
 */
export type EditProfileInput = z.infer<typeof editProfileSchema>

// ============================================================================
// LABELS ET MESSAGES
// ============================================================================

/**
 * Labels des champs pour l'UI
 */
export const EDIT_PROFILE_LABELS = {
  firstName: 'Prénom',
  lastName: 'Nom',
  phone: 'Téléphone',
  jobTitle: 'Poste',
  hireDate: "Date d'embauche",
} as const

/**
 * Placeholders des champs pour l'UI
 */
export const EDIT_PROFILE_PLACEHOLDERS = {
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
  jobTitle: 'Développeur Full-Stack',
} as const
