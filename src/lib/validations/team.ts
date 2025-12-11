/**
 * Schemas de validation Zod pour Team
 *
 * @description Validation des formulaires de creation et modification d'equipe.
 * Inclut la gestion des membres et du manager.
 *
 * @ticket SP-150
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'

// ============================================================================
// Schema de base Team
// ============================================================================

/**
 * Schema de base pour les champs Team
 *
 * Valide les donnees communes a la creation et la modification
 */
export const teamBaseSchema = z.object({
  /** Nom de l'equipe (2-50 caracteres) */
  name: z
    .string()
    .min(2, "Le nom de l'équipe doit contenir au moins 2 caractères")
    .max(50, "Le nom de l'équipe ne peut pas dépasser 50 caractères")
    .trim(),

  /** Description de l'equipe (optionnel, max 500 caracteres) */
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
    .or(z.literal('')),

  /** Couleur d'identification (format hex: #RRGGBB) */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Format de couleur invalide (ex: #FF5733)')
    .optional()
    .or(z.literal('')),
})

// ============================================================================
// Schema de creation Team
// ============================================================================

/**
 * Schema pour la creation d'une Team
 *
 * Le managerId est obligatoire a la creation
 */
export const createTeamSchema = teamBaseSchema.extend({
  /** ID du manager de l'equipe (requis) */
  managerId: z
    .string()
    .min(1, 'Le manager est requis')
    .cuid('ID de manager invalide'),
})

export type CreateTeamInput = z.infer<typeof createTeamSchema>

// ============================================================================
// Schema de modification Team
// ============================================================================

/**
 * Schema pour la modification d'une Team
 *
 * Tous les champs sont optionnels sauf l'ID
 */
export const updateTeamSchema = teamBaseSchema.partial().extend({
  /** ID de la Team a modifier (requis) */
  id: z.string().cuid("ID d'équipe invalide"),

  /** Nouveau manager (optionnel) */
  managerId: z.string().cuid('ID de manager invalide').optional(),
})

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

// ============================================================================
// Schema de gestion des membres
// ============================================================================

/**
 * Schema pour ajouter/retirer des membres d'une equipe
 */
export const teamMembersSchema = z.object({
  /** ID de l'equipe */
  teamId: z.string().cuid("ID d'équipe invalide"),

  /** IDs des employes a ajouter */
  employeeIds: z
    .array(z.string().cuid("ID d'employé invalide"))
    .min(1, 'Au moins un employé doit être sélectionné'),
})

export type TeamMembersInput = z.infer<typeof teamMembersSchema>

/**
 * Schema pour retirer un seul membre
 */
export const removeTeamMemberSchema = z.object({
  /** ID de l'equipe */
  teamId: z.string().cuid("ID d'équipe invalide"),

  /** ID de l'employe a retirer */
  employeeId: z.string().cuid("ID d'employé invalide"),
})

export type RemoveTeamMemberInput = z.infer<typeof removeTeamMemberSchema>

// ============================================================================
// Schema de filtrage Team (pour les listes)
// ============================================================================

/**
 * Schema pour les filtres de recherche Team
 *
 * Utilise dans les Server Actions de listing
 */
export const teamFiltersSchema = z.object({
  /** Recherche textuelle (nom, description) */
  search: z.string().optional(),

  /** Filtrer par manager */
  managerId: z.string().cuid().optional(),

  /** Inclure les equipes sans membres */
  includeEmpty: z.boolean().optional(),
})

export type TeamFilters = z.infer<typeof teamFiltersSchema>

// ============================================================================
// Couleurs predefinies pour les equipes
// ============================================================================

/**
 * Palette de couleurs predefinies pour les equipes
 *
 * Permet une selection rapide dans le formulaire
 */
export const TEAM_COLOR_PALETTE = [
  { value: '#3B82F6', label: 'Bleu' },
  { value: '#10B981', label: 'Vert' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rouge' },
  { value: '#8B5CF6', label: 'Violet' },
  { value: '#EC4899', label: 'Rose' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
  { value: '#F97316', label: 'Corail' },
  { value: '#6366F1', label: 'Indigo' },
] as const

export type TeamColor = (typeof TEAM_COLOR_PALETTE)[number]['value']
