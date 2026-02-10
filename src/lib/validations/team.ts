/**
 * Schemas de validation Zod pour Team
 *
 * @description Validation des formulaires de creation et modification d'equipe.
 * Inclut la gestion des membres et du manager.
 * Aligne avec le schema Prisma Team.
 *
 * @ticket SP-153
 * @see Context7 - Zod safeParse refine validation patterns
 */

import { z } from 'zod'

// ============================================================================
// Constantes et couleurs
// ============================================================================

/**
 * Couleur par defaut pour les equipes
 */
export const DEFAULT_TEAM_COLOR = '#3B82F6'

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

// ============================================================================
// Schema de base Team
// ============================================================================

/**
 * Schema de base pour les champs Team
 *
 * Valide les donnees communes a la creation et la modification
 * Aligne avec le modele Prisma Team
 */
export const teamBaseSchema = z.object({
  /** Nom de l'equipe (2-100 caracteres) */
  name: z
    .string({
      required_error: "Le nom de l'équipe est requis",
    })
    .min(2, "Le nom de l'équipe doit contenir au moins 2 caractères")
    .max(100, "Le nom de l'équipe ne peut pas dépasser 100 caractères")
    .trim(),

  /** Description de l'equipe (optionnel, max 500 caracteres) */
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .trim()
    .optional()
    .nullable()
    .or(z.literal('')),

  /** Couleur d'identification (format hex: #RRGGBB) */
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Format de couleur invalide (ex: #3B82F6)')
    .default(DEFAULT_TEAM_COLOR),
})

// ============================================================================
// Schema de creation Team
// ============================================================================

/**
 * Schema pour la creation d'une Team
 *
 * Le companyId est obligatoire, managerId optionnel
 */
export const createTeamSchema = teamBaseSchema.extend({
  /** ID de l'entreprise (obligatoire) */
  companyId: z.string().cuid("ID d'entreprise invalide"),

  /** ID du manager de l'equipe (optionnel a la creation) */
  managerId: z
    .string()
    .cuid('ID de manager invalide')
    .optional()
    .nullable()
    .or(z.literal('')),
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

  /** Nouveau manager (optionnel, null pour retirer) */
  managerId: z
    .string()
    .cuid('ID de manager invalide')
    .optional()
    .nullable()
    .or(z.literal('')),
})

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

// ============================================================================
// Schema de gestion des membres
// ============================================================================

/**
 * Schema pour ajouter/retirer un membre d'une equipe
 */
export const teamMemberSchema = z.object({
  /** ID de l'equipe */
  teamId: z.string().cuid("ID d'équipe invalide"),

  /** ID de l'employe */
  employeeId: z.string().cuid("ID d'employé invalide"),
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>

/**
 * Schema pour ajouter plusieurs membres a une equipe
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
 * Schema pour assigner un manager
 */
export const assignManagerSchema = z.object({
  /** ID de l'equipe */
  teamId: z.string().cuid("ID d'équipe invalide"),

  /** ID du manager (null pour retirer) */
  managerId: z
    .string()
    .cuid('ID de manager invalide')
    .nullable()
    .or(z.literal('')),
})

export type AssignManagerInput = z.infer<typeof assignManagerSchema>

// ============================================================================
// Schema de filtrage Team (pour les listes)
// ============================================================================

/**
 * Schema pour les filtres de recherche Team
 *
 * Utilise dans les Server Actions de listing
 * Le filtre companyId est applique automatiquement selon le role RBAC
 */
export const teamFiltersSchema = z.object({
  /** Recherche textuelle (nom, description) */
  search: z.string().optional(),

  /** Filtrer par entreprise (SUPER_ADMIN uniquement) */
  companyId: z.string().cuid().optional(),

  /** Filtrer par manager */
  managerId: z.string().cuid().optional(),

  /** Filtrer les equipes sans manager */
  hasNoManager: z.boolean().optional(),

  /** Inclure les equipes sans membres */
  includeEmpty: z.boolean().optional(),
})

export type TeamFilters = z.infer<typeof teamFiltersSchema>

// ============================================================================
// Types avec relations (pour les reponses Server Actions)
// ============================================================================

/**
 * Type Employee minimaliste pour l'affichage des membres
 */
export interface TeamMemberInfo {
  id: string
  firstName: string
  lastName: string
  jobTitle: string | null
  isActive: boolean
  user?: {
    email: string
    image: string | null
  } | null
}

/**
 * Type Manager minimaliste pour l'affichage
 */
export interface TeamManagerInfo {
  id: string
  firstName: string
  lastName: string
  user?: {
    email: string
    image: string | null
  } | null
}

/**
 * Type Team avec compteurs pour l'affichage liste
 */
export interface TeamWithCounts {
  id: string
  name: string
  description: string | null
  color: string
  managerId: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  manager?: TeamManagerInfo | null
  company?: {
    id: string
    name: string
  }
  employees?: TeamMemberInfo[]
  _count?: {
    employees: number
    schedules: number
  }
}

/**
 * Type Team avec details complets pour la page detail
 */
export interface TeamWithDetails extends TeamWithCounts {
  employees: TeamMemberInfo[]
}

// ============================================================================
// Helpers pour l'affichage
// ============================================================================

/**
 * Genere les initiales a partir du nom d'equipe
 */
export function getTeamInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formate le nombre de membres
 */
export function formatMembersCount(count: number): string {
  if (count === 0) return 'Aucun membre'
  if (count === 1) return '1 membre'
  return `${count} membres`
}

/**
 * Genere le nom complet d'un membre
 */
export function getFullName(
  member: Pick<TeamMemberInfo, 'firstName' | 'lastName'>
): string {
  return `${member.firstName} ${member.lastName}`
}
