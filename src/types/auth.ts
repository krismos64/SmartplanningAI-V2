/**
 * Types TypeScript pour l'authentification NextAuth v5
 *
 * @description Extension des types NextAuth pour inclure les champs
 * personnalisés SmartPlanning (role, companyId) dans Session et JWT.
 *
 * @see https://authjs.dev/getting-started/typescript
 * @ticket SP-108, SP-110, SP-440, SP-447
 */

import { DefaultSession } from 'next-auth'
import type { Session as NextAuthSession } from 'next-auth'
import { UserRole } from '@prisma/client'

// Réexport des fonctions et constantes RBAC depuis permissions.ts
// pour un accès centralisé dans les composants auth
export {
  ROLE_HIERARCHY,
  PROTECTED_ROUTES,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  hasRequiredRole,
  getRequiredRoleForRoute,
  canAccessRoute,
  getDefaultDashboardForRole,
} from '@/lib/permissions'

/**
 * Extension du module next-auth
 *
 * Ajoute les champs métier SmartPlanning aux interfaces NextAuth
 */
declare module 'next-auth' {
  /**
   * Interface Session étendue
   *
   * Contient les données utilisateur disponibles côté client
   * via useSession() ou auth()
   */
  interface Session {
    user: {
      /** ID unique de l'utilisateur (cuid) */
      id: string
      /** Rôle dans l'application */
      role: UserRole
      /** ID de l'entreprise (null pour SYSTEM_ADMIN) */
      companyId: string | null
      /** Date de vérification email */
      emailVerified: Date | null
      /** Statut de l'abonnement (SubscriptionStatus enum ou null) @ticket SP-440 */
      subscriptionStatus: string | null
      /** Date de fin du trial en ISO string @ticket SP-440 */
      trialEndsAt: string | null
      /** Date de fin de période courante en ISO string @ticket SP-440 */
      currentPeriodEnd: string | null
      /** Mode impersonation actif @ticket SP-447 */
      isImpersonating?: boolean
      /** ID du SYSTEM_ADMIN qui impersonne @ticket SP-447 */
      originalAdminId?: string
      /** ID de l'utilisateur impersonné @ticket SP-447 */
      impersonatedUserId?: string
      /** ID de l'entreprise impersonnée @ticket SP-447 */
      impersonatedCompanyId?: string
      /** Email de l'utilisateur impersonné @ticket SP-447 */
      impersonatedUserEmail?: string
      /** Nom de l'entreprise impersonnée @ticket SP-447 */
      impersonatedCompanyName?: string
    } & DefaultSession['user']
  }

  /**
   * Interface User étendue
   *
   * Correspond au modèle Prisma User retourné par authorize()
   */
  interface User {
    id: string
    email: string
    name: string | null
    role: UserRole
    companyId: string | null
    emailVerified: Date | null
    image: string | null
    isActive: boolean
    /** Statut de l'abonnement enrichi depuis Company.Subscription @ticket SP-440 */
    subscriptionStatus: string | null
    /** Date de fin du trial en ISO string @ticket SP-440 */
    trialEndsAt: string | null
    /** Date de fin de période courante en ISO string @ticket SP-440 */
    currentPeriodEnd: string | null
  }
}

/**
 * Extension du module @auth/core/jwt
 *
 * Définit la structure du token JWT avec nos champs custom
 * Note: NextAuth v5 utilise @auth/core/jwt au lieu de next-auth/jwt
 */
declare module '@auth/core/jwt' {
  /**
   * Interface JWT étendue
   *
   * Ces champs sont stockés dans le token JWT signé
   * et disponibles dans les callbacks
   */
  interface JWT {
    /** ID utilisateur */
    id: string
    /** Rôle utilisateur */
    role: UserRole
    /** ID entreprise (null pour SYSTEM_ADMIN) */
    companyId: string | null
    /** Email vérifié */
    emailVerified: Date | null
    /** Statut de l'abonnement (SubscriptionStatus enum ou null) @ticket SP-440 */
    subscriptionStatus: string | null
    /** Date de fin du trial en ISO string @ticket SP-440 */
    trialEndsAt: string | null
    /** Date de fin de période courante en ISO string @ticket SP-440 */
    currentPeriodEnd: string | null
    /** Timestamp du dernier check subscription (Date.now()) @ticket SP-440 */
    subscriptionCheckedAt: number | null
    /** Mode impersonation actif @ticket SP-447 */
    isImpersonating?: boolean
    /** ID du SYSTEM_ADMIN qui impersonne @ticket SP-447 */
    originalAdminId?: string
    /** ID de l'utilisateur impersonné @ticket SP-447 */
    impersonatedUserId?: string
    /** ID de l'entreprise impersonnée @ticket SP-447 */
    impersonatedCompanyId?: string
    /** Email de l'utilisateur impersonné @ticket SP-447 */
    impersonatedUserEmail?: string
    /** Nom de l'entreprise impersonnée @ticket SP-447 */
    impersonatedCompanyName?: string
  }
}

/**
 * Type pour les credentials de connexion
 *
 * Utilisé dans le formulaire de login et le Credentials Provider
 */
export type LoginCredentials = {
  email: string
  password: string
}

/**
 * Type pour l'inscription d'un nouvel utilisateur
 *
 * Inclut les champs obligatoires pour créer un compte
 */
export type RegisterData = {
  email: string
  password: string
  name: string
  companyName: string
}

/**
 * Type pour la réinitialisation de mot de passe
 */
export type ResetPasswordData = {
  email: string
  token: string
  newPassword: string
}

/**
 * Type pour la vérification d'email
 */
export type EmailVerificationData = {
  email: string
  token: string
}

/**
 * Codes d'erreur d'authentification
 *
 * Utilisés pour les messages d'erreur localisés
 */
export type AuthErrorCode =
  | 'CredentialsSignin'
  | 'InvalidCredentials'
  | 'EmailNotVerified'
  | 'AccountDisabled'
  | 'CompanyInactive'
  | 'SessionExpired'
  | 'AccessDenied'
  | 'UnknownError'

/**
 * Type pour le contexte d'authentification
 *
 * Utilisé dans les hooks et Server Components
 */
export type AuthContext = {
  user: NextAuthSession['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Type pour les options de session NextAuth
 */
export type SessionStrategy = 'jwt' | 'database'

/**
 * Routes publiques (non protégées par le middleware)
 */
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  // Confirmation d'un changement d'adresse email demandé par un responsable :
  // le collaborateur clique depuis sa boîte mail, sans être connecté.
  '/confirm-email-change',
  '/api/auth',
] as const

/**
 * Routes d'authentification (redirections si déjà connecté)
 */
export const AUTH_ROUTES = ['/login', '/register'] as const

/**
 * Préfixe des routes API d'authentification
 */
export const AUTH_API_PREFIX = '/api/auth'

/**
 * Route par défaut après connexion
 */
export const DEFAULT_LOGIN_REDIRECT = '/app/dashboard'

/**
 * Routes exclues du middleware (invitations, etc.)
 */
export const MIDDLEWARE_EXCLUDED_ROUTES = ['/app/invite', '/app/join'] as const

// ============================================================================
// CONSTANTES RBAC (SP-110)
// ============================================================================

/**
 * Routes protégées par rôle minimum requis
 *
 * Mapping des préfixes de routes vers le rôle minimum nécessaire.
 * Utilisé par le middleware pour vérifier les permissions.
 *
 * @example
 * ROLE_PROTECTED_ROUTES['/app/admin'] // 'SYSTEM_ADMIN'
 *
 * @ticket SP-110
 */
export const ROLE_PROTECTED_ROUTES: Record<string, UserRole> = {
  '/app/admin': 'SYSTEM_ADMIN',
  '/app/director': 'DIRECTOR',
  '/app/manager': 'MANAGER',
} as const

/**
 * Dashboard par défaut selon le rôle de l'utilisateur
 *
 * Utilisé pour la redirection après connexion ou après accès refusé.
 * Chaque rôle a son propre espace de travail.
 *
 * @example
 * DEFAULT_REDIRECT_BY_ROLE['DIRECTOR'] // '/app/director/dashboard'
 *
 * @ticket SP-110
 */
export const DEFAULT_REDIRECT_BY_ROLE: Record<UserRole, string> = {
  SYSTEM_ADMIN: '/app/admin/dashboard',
  DIRECTOR: '/app/director/dashboard',
  MANAGER: '/app/manager/dashboard',
  EMPLOYEE: '/app/dashboard',
} as const

/**
 * Route de redirection en cas d'accès refusé (rôle insuffisant)
 *
 * Redirige silencieusement l'utilisateur vers son dashboard
 * au lieu d'afficher une page d'erreur 403.
 *
 * @ticket SP-110
 */
export const ACCESS_DENIED_REDIRECT = '/app/dashboard' as const

// ============================================================================
// CONSTANTES SUBSCRIPTION GUARD (SP-440)
// ============================================================================

/**
 * Routes accessibles même si l'abonnement est inactif.
 * Permet au directeur de régler son paiement ou gérer son profil.
 *
 * @ticket SP-440
 */
export const SUBSCRIPTION_EXEMPT_ROUTES = [
  '/app/dashboard/billing',
  '/app/profile',
  '/app/settings',
] as const

// ============================================================================
// IMPERSONATION (SP-447)
// ============================================================================

/**
 * Contexte d'impersonation stocké dans le cookie sp-impersonation
 *
 * @ticket SP-447
 */
export interface ImpersonationContext {
  /** ID du SYSTEM_ADMIN qui impersonne */
  originalAdminId: string
  /** ID de l'utilisateur cible */
  targetUserId: string
  /** ID de l'entreprise cible */
  targetCompanyId: string
  /** Rôle de l'utilisateur cible */
  targetRole: string
  /** Email de l'utilisateur cible */
  targetEmail: string
  /** Nom de l'entreprise cible */
  targetCompanyName: string
  /** Timestamp de début d'impersonation */
  startedAt: number
}

/**
 * Nom du cookie d'impersonation
 */
export const IMPERSONATION_COOKIE_NAME = 'sp-impersonation' as const

/**
 * Durée de vie du cookie d'impersonation (1 heure)
 */
export const IMPERSONATION_MAX_AGE = 3600 as const
