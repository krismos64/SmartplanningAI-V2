/**
 * Types partagés pour les composants métier (UserCard, TeamCard)
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Architecture :
 * - UserStatus : États possibles d'un utilisateur
 * - CardAction : Actions du dropdown menu
 * - CardVariant : Variants d'affichage (compact/detailed)
 */

import { UserRole } from "@prisma/client";
import { LucideIcon } from "lucide-react";

// ============================================================================
// STATUTS UTILISATEUR
// ============================================================================

/**
 * Statuts possibles d'un utilisateur
 * Utilisé pour le badge et l'indicateur visuel
 */
export type UserStatus = "active" | "on_leave" | "absent" | "inactive";

/**
 * Configuration des statuts avec labels et couleurs Tailwind
 */
export const USER_STATUS_CONFIG: Record<
  UserStatus,
  {
    label: string;
    color: string;
    dotColor: string;
  }
> = {
  active: {
    label: "Actif",
    color:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  on_leave: {
    label: "Congé",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },
  absent: {
    label: "Absent",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
  inactive: {
    label: "Inactif",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
    dotColor: "bg-gray-400",
  },
};

// ============================================================================
// ACTIONS DROPDOWN
// ============================================================================

/**
 * Action pour le dropdown menu des cards
 *
 * @example
 * ```tsx
 * const actions: CardAction[] = [
 *   { label: "Voir profil", icon: User, onClick: () => {} },
 *   { label: "Modifier", icon: Pencil, onClick: () => {} },
 *   { separator: true, label: "Supprimer", icon: Trash2, onClick: () => {}, variant: "destructive" },
 * ];
 * ```
 */
export interface CardAction {
  /** Texte affiché dans le menu */
  label: string;

  /** Icône Lucide optionnelle */
  icon?: LucideIcon;

  /** Callback au clic */
  onClick: () => void;

  /** Variant de style (destructive = rouge) */
  variant?: "default" | "destructive";

  /** Désactiver l'action */
  disabled?: boolean;

  /** Ajouter un séparateur AVANT cette action */
  separator?: boolean;
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Variants d'affichage des cards
 * - compact : Affichage en ligne, minimal
 * - detailed : Affichage complet avec toutes les infos
 */
export type CardVariant = "compact" | "detailed";

// ============================================================================
// PROPS COMMUNES
// ============================================================================

/**
 * Props de base partagées par toutes les cards métier
 */
export interface BaseCardProps {
  /** Variant d'affichage */
  variant?: CardVariant;

  /** Actions du dropdown menu */
  actions?: CardAction[];

  /** État de chargement */
  isLoading?: boolean;

  /** Classes CSS additionnelles */
  className?: string;
}

// ============================================================================
// TYPES UTILISATEUR (compatibles Prisma)
// ============================================================================

/**
 * Données utilisateur minimales pour UserCard
 * Compatible avec le modèle Prisma User
 */
export interface UserCardUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
}

/**
 * Données employé optionnelles pour UserCard detailed
 * Compatible avec le modèle Prisma Employee
 */
export interface UserCardEmployee {
  firstName: string;
  lastName: string;
  jobTitle?: string | null;
  department?: string | null;
  phone?: string | null;
}

// ============================================================================
// TYPES ÉQUIPE (compatibles Prisma)
// ============================================================================

/**
 * Données équipe pour TeamCard
 * Compatible avec le modèle Prisma Team
 */
export interface TeamCardTeam {
  id: string;
  name: string;
  description?: string | null;
  color: string;
}

/**
 * Membre d'équipe simplifié pour AvatarStack
 */
export interface TeamMember {
  id: string;
  name: string | null;
  image?: string | null;
  status?: UserStatus;
}

/**
 * Manager d'équipe simplifié
 */
export interface TeamManager {
  id: string;
  name: string | null;
  image?: string | null;
}

/**
 * Statistiques d'équipe
 */
export interface TeamStats {
  activeCount?: number;
  onLeaveCount?: number;
}

// ============================================================================
// LABELS RÔLES (traduction française)
// ============================================================================

/**
 * Labels traduits pour les rôles utilisateur
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "Super Admin",
  DIRECTOR: "Directeur",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
};
