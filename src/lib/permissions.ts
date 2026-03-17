/**
 * Configuration RBAC (Role-Based Access Control) pour SmartPlanning
 *
 * @description Gestion des permissions et hiérarchie des rôles utilisateurs.
 * Ce fichier est Edge-compatible (pas de dépendance Prisma runtime).
 *
 * Hiérarchie des rôles (du plus élevé au plus bas) :
 * - SYSTEM_ADMIN : Super administrateur plateforme SaaS (niveau 4)
 * - DIRECTOR : Directeur entreprise - accès total entreprise (niveau 3)
 * - MANAGER : Manager équipe - gestion équipe (niveau 2)
 * - EMPLOYEE : Employé - consultation + demandes congés (niveau 1)
 *
 * @see https://authjs.dev/guides/role-based-access-control
 * @ticket SP-110
 */

import type { UserRole } from '@prisma/client'

/**
 * Hiérarchie des rôles avec leur niveau de privilèges
 *
 * Un rôle de niveau supérieur a automatiquement accès aux ressources
 * des rôles de niveau inférieur.
 *
 * @example
 * ROLE_HIERARCHY['DIRECTOR'] // 3
 * ROLE_HIERARCHY['EMPLOYEE'] // 1
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SYSTEM_ADMIN: 4,
  DIRECTOR: 3,
  MANAGER: 2,
  EMPLOYEE: 1,
} as const

/**
 * Routes protégées par rôle minimum requis
 *
 * L'ordre est important : les routes les plus spécifiques doivent
 * être listées en premier pour un matching correct.
 *
 * Structure :
 * - /app/admin/* → SYSTEM_ADMIN uniquement
 * - /app/director/* → DIRECTOR et supérieurs
 * - /app/manager/* → MANAGER et supérieurs
 * - /app/* → Tous les utilisateurs authentifiés
 *
 * @example
 * PROTECTED_ROUTES['/app/admin'] // 'SYSTEM_ADMIN'
 */
export const PROTECTED_ROUTES: Record<string, UserRole> = {
  '/app/admin': 'SYSTEM_ADMIN',
  '/app/directeur': 'DIRECTOR',
  '/app/manager': 'MANAGER',
  '/app': 'EMPLOYEE', // Route par défaut pour tous les authentifiés
} as const

/**
 * Routes triées par spécificité (plus long en premier)
 *
 * Utilisé pour le matching des routes dans getRequiredRoleForRoute()
 * Garantit que /app/admin/* match avant /app/*
 */
const SORTED_PROTECTED_ROUTES = Object.entries(PROTECTED_ROUTES).sort(
  ([a], [b]) => b.length - a.length
)

/**
 * Vérifie si un rôle utilisateur a le niveau requis pour accéder à une ressource
 *
 * Utilise la hiérarchie des rôles : un rôle de niveau supérieur
 * a automatiquement accès aux ressources des niveaux inférieurs.
 *
 * @param userRole - Rôle de l'utilisateur actuel
 * @param requiredRole - Rôle minimum requis pour accéder à la ressource
 * @returns true si l'utilisateur a les permissions suffisantes
 *
 * @example
 * hasRequiredRole('DIRECTOR', 'MANAGER')    // true (niveau 3 >= niveau 2)
 * hasRequiredRole('EMPLOYEE', 'MANAGER')    // false (niveau 1 < niveau 2)
 * hasRequiredRole('SYSTEM_ADMIN', 'EMPLOYEE') // true (niveau 4 >= niveau 1)
 */
export function hasRequiredRole(
  userRole: UserRole | undefined,
  requiredRole: UserRole
): boolean {
  if (!userRole) {
    return false
  }

  const userLevel = ROLE_HIERARCHY[userRole]
  const requiredLevel = ROLE_HIERARCHY[requiredRole]

  // Vérification de sécurité si le rôle n'existe pas dans la hiérarchie
  if (userLevel === undefined || requiredLevel === undefined) {
    return false
  }

  return userLevel >= requiredLevel
}

/**
 * Détermine le rôle minimum requis pour accéder à une route donnée
 *
 * Parcourt les routes protégées et retourne le rôle associé à la première
 * route qui correspond au pathname. Les routes sont triées par spécificité
 * (plus long en premier) pour garantir un matching correct.
 *
 * @param pathname - Chemin de la route (ex: '/app/admin/utilisateurs')
 * @returns Le rôle minimum requis, ou null si la route n'est pas protégée par rôle
 *
 * @example
 * getRequiredRoleForRoute('/app/admin/utilisateurs')     // 'SYSTEM_ADMIN'
 * getRequiredRoleForRoute('/app/directeur/equipes')  // 'DIRECTOR'
 * getRequiredRoleForRoute('/app/tableau-de-bord')       // 'EMPLOYEE'
 * getRequiredRoleForRoute('/login')               // null (route publique)
 */
export function getRequiredRoleForRoute(pathname: string): UserRole | null {
  for (const [route, role] of SORTED_PROTECTED_ROUTES) {
    if (pathname.startsWith(route)) {
      return role
    }
  }

  return null
}

/**
 * Vérifie si un utilisateur peut accéder à une route spécifique
 *
 * Combine getRequiredRoleForRoute et hasRequiredRole pour une vérification complète.
 *
 * @param pathname - Chemin de la route à vérifier
 * @param userRole - Rôle de l'utilisateur actuel
 * @returns true si l'utilisateur peut accéder à la route
 *
 * @example
 * canAccessRoute('/app/admin/utilisateurs', 'SYSTEM_ADMIN') // true
 * canAccessRoute('/app/admin/utilisateurs', 'EMPLOYEE')     // false
 * canAccessRoute('/login', 'EMPLOYEE')               // true (pas de restriction)
 */
export function canAccessRoute(
  pathname: string,
  userRole: UserRole | undefined
): boolean {
  const requiredRole = getRequiredRoleForRoute(pathname)

  // Si pas de rôle requis, la route est accessible
  if (!requiredRole) {
    return true
  }

  return hasRequiredRole(userRole, requiredRole)
}

/**
 * Retourne le dashboard par défaut selon le rôle de l'utilisateur
 *
 * Utilisé pour la redirection après connexion ou en cas d'accès refusé.
 *
 * @param userRole - Rôle de l'utilisateur
 * @returns Chemin du dashboard approprié
 *
 * @example
 * getDefaultDashboardForRole('SYSTEM_ADMIN') // '/app/admin/dashboard'
 * getDefaultDashboardForRole('EMPLOYEE')     // '/app/tableau-de-bord'
 */
export function getDefaultDashboardForRole(
  userRole: UserRole | undefined
): string {
  switch (userRole) {
    case 'SYSTEM_ADMIN':
      return '/app/admin/dashboard'
    case 'DIRECTOR':
      return '/app/directeur/dashboard'
    case 'MANAGER':
      return '/app/manager/dashboard'
    case 'EMPLOYEE':
    default:
      return '/app/tableau-de-bord'
  }
}

/**
 * Labels français des rôles pour l'affichage UI
 *
 * @example
 * ROLE_LABELS['SYSTEM_ADMIN'] // 'Super Administrateur'
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Super Administrateur',
  DIRECTOR: 'Directeur',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employé',
} as const

/**
 * Description des rôles pour l'aide contextuelle
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Accès complet à la plateforme SaaS et toutes les entreprises',
  DIRECTOR: 'Accès complet à son entreprise et gestion des managers',
  MANAGER: 'Gestion de son équipe et validation des congés',
  EMPLOYEE: 'Consultation des plannings et demandes de congés',
} as const
