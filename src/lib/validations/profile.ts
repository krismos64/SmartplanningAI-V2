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
 *
 * Champs NON modifiables ici :
 * - email : Nécessite un flux de vérification séparé (SP-XXX futur)
 * - role : Modifiable uniquement par SYSTEM_ADMIN/DIRECTOR
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
 * Le champ phone est optionnel (peut être vide ou absent).
 */
export const editProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional().or(z.literal('')),
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
} as const

/**
 * Placeholders des champs pour l'UI
 */
export const EDIT_PROFILE_PLACEHOLDERS = {
  firstName: 'Jean',
  lastName: 'Dupont',
  phone: '0612345678',
} as const
