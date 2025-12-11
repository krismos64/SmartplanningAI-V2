/**
 * Types generiques pour les operations CRUD
 *
 * @description Types reutilisables pour toutes les operations CRUD du projet.
 * Compatibles avec les Server Actions Next.js 15 et le pattern ServiceResult.
 *
 * @ticket SP-150
 * @see Context7 - Next.js 15 Server Actions error handling
 */

// ============================================================================
// Types de resultats d'actions CRUD
// ============================================================================

/**
 * Resultat d'une action CRUD (Create, Read, Update, Delete)
 *
 * Discriminated union pour typage strict des reponses Server Actions.
 * Compatible avec useActionState de React 19.
 *
 * @example
 * const result: CrudActionResult<User> = await createUser(data)
 * if (result.success) {
 *   console.log(result.data) // User
 * } else {
 *   console.log(result.error, result.field) // string, string | undefined
 * }
 */
export type CrudActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string }

/**
 * Resultat d'une action de suppression
 *
 * Variante simplifiee sans data pour les operations DELETE
 */
export type DeleteActionResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Resultat d'une action de liste paginee
 *
 * Utilise PaginatedResult<T> pour les listes avec pagination
 */
export type ListActionResult<T> =
  | { success: true; data: PaginatedResult<T> }
  | { success: false; error: string }

// ============================================================================
// Types de pagination
// ============================================================================

/**
 * Resultat pagine pour les listes
 *
 * Compatible avec le composant DataTable existant.
 * Ajoute totalPages calcule automatiquement.
 */
export interface PaginatedResult<T> {
  /** Donnees de la page courante */
  data: T[]
  /** Nombre total d'elements */
  total: number
  /** Numero de page actuel (1-indexed) */
  page: number
  /** Nombre d'elements par page */
  pageSize: number
  /** Nombre total de pages */
  totalPages: number
}

/**
 * Parametres de filtrage et tri pour les listes
 *
 * Utilise dans les Server Actions pour recuperer des listes paginées
 */
export interface ListQueryParams {
  /** Numero de page (1-indexed, defaut: 1) */
  page?: number
  /** Nombre d'elements par page (defaut: 10) */
  pageSize?: number
  /** Champ de tri */
  sortBy?: string
  /** Ordre de tri */
  sortOrder?: 'asc' | 'desc'
  /** Recherche textuelle */
  search?: string
}

/**
 * Parametres de filtrage etendus
 *
 * Ajoute des filtres personnalises aux parametres de base
 */
export interface FilterParams extends ListQueryParams {
  /** Filtres personnalises (cle-valeur) */
  filters?: Record<string, unknown>
}

// ============================================================================
// Types de formulaires - Company
// ============================================================================

/**
 * Donnees du formulaire de creation/edition Company
 *
 * Synchronise avec le schema Prisma Company et companySchema Zod
 */
export interface CompanyFormData {
  /** Nom de l'entreprise */
  name: string
  /** Numero SIRET (14 chiffres) */
  siret?: string
  /** Adresse postale */
  address?: string
  /** Telephone */
  phone?: string
  /** Email de contact */
  email?: string
  /** Site web */
  website?: string
  /** Fuseau horaire (defaut: Europe/Paris) */
  timezone?: string
  /** Plan d'abonnement */
  subscriptionPlan?: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  /** Statut actif/inactif */
  isActive?: boolean
}

// ============================================================================
// Types de formulaires - Team
// ============================================================================

/**
 * Donnees du formulaire de creation/edition Team
 *
 * Synchronise avec le schema Prisma Team et teamSchema Zod
 */
export interface TeamFormData {
  /** Nom de l'equipe */
  name: string
  /** Description de l'equipe */
  description?: string
  /** ID du manager de l'equipe */
  managerId: string
  /** Couleur d'identification (hex: #RRGGBB) */
  color?: string
}

// ============================================================================
// Types de formulaires - User
// ============================================================================

/**
 * Donnees du formulaire de creation User
 *
 * Synchronise avec le schema Prisma User et userSchema Zod
 */
export interface UserFormData {
  /** Nom complet */
  name: string
  /** Email (unique) */
  email: string
  /** Mot de passe (creation uniquement) */
  password?: string
  /** Role utilisateur */
  role: 'EMPLOYEE' | 'MANAGER' | 'DIRECTOR' | 'SYSTEM_ADMIN'
  /** Statut actif/inactif */
  isActive?: boolean
}

// ============================================================================
// Types utilitaires
// ============================================================================

/**
 * Type pour les entites avec ID
 *
 * Utilise pour les operations update/delete
 */
export interface WithId {
  id: string
}

/**
 * Type pour les entites avec timestamps
 *
 * Ajoute automatiquement par Prisma
 */
export interface WithTimestamps {
  createdAt: Date
  updatedAt: Date
}

/**
 * Type pour les entites multi-tenant
 *
 * Toutes les entites liees a une Company
 */
export interface WithCompany {
  companyId: string
}

/**
 * Options pour les operations CRUD
 *
 * Parametres optionnels pour les Server Actions
 */
export interface CrudOptions {
  /** Revalider le cache apres l'operation */
  revalidatePath?: string
  /** Logger l'activite */
  logActivity?: boolean
}
