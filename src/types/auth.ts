/**
 * Types TypeScript pour l'authentification NextAuth v5
 *
 * @description Extension des types NextAuth pour inclure les champs
 * personnalisés SmartPlanning (role, companyId) dans Session et JWT.
 *
 * @see https://authjs.dev/getting-started/typescript
 * @ticket SP-108
 */

import { DefaultSession } from 'next-auth'
import type { Session as NextAuthSession } from 'next-auth'
import { UserRole } from '@prisma/client'

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
  }
}

/**
 * Extension du module next-auth/jwt
 *
 * Définit la structure du token JWT avec nos champs custom
 */
declare module 'next-auth/jwt' {
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
export const MIDDLEWARE_EXCLUDED_ROUTES = [
  '/app/invite',
  '/app/join',
] as const
