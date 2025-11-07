/**
 * Types TypeScript pour l'authentification NextAuth v5
 *
 * ✅ Source : Documentation NextAuth v5 + Best practices TypeScript
 *
 * OBJECTIF (CDA) :
 * Étendre les types NextAuth par défaut pour inclure nos champs
 * personnalisés (role, companyId) dans la session et le JWT.
 *
 * PROBLÉMATIQUE :
 * NextAuth v5 ne connaît pas nos champs métier par défaut.
 * Il faut étendre les interfaces pour avoir l'autocomplétion TypeScript.
 *
 * SOLUTION :
 * Module augmentation de NextAuth avec nos types custom.
 *
 * RÉFÉRENCE CDA :
 * - Pattern officiel NextAuth v5 + TypeScript
 * - Respect du principe de type-safety
 */

import { DefaultSession } from 'next-auth'
import type { Session as NextAuthSession } from 'next-auth'
import { UserRole } from '@prisma/client'

/**
 * Extension du module next-auth pour ajouter nos types custom
 *
 * Cela permet à TypeScript de connaître nos champs supplémentaires
 * dans session.user et JWT token
 */
declare module 'next-auth' {
  /**
   * Interface Session étendue
   *
   * Ajoute les champs métier SmartPlanning à la session utilisateur
   */
  interface Session {
    user: {
      id: string
      role: UserRole
      companyId: string
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  /**
   * Interface User étendue
   *
   * Correspond au modèle Prisma User avec les champs essentiels
   */
  interface User {
    id: string
    email: string
    name: string | null
    role: UserRole
    companyId: string
    emailVerified: Date | null
    image: string | null
  }
}

/**
 * Extension du module next-auth/jwt pour le token JWT
 * Note: Désactivé temporairement - Next-Auth v5 a une structure différente
 * À réactiver après migration complète vers v5 stable
 */
/*
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    companyId: string
    emailVerified: Date | null
  }
}
*/

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
  companyName: string // Pour créer l'organisation en même temps
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
 * Type pour les erreurs d'authentification
 */
export type AuthError =
  | 'CredentialsSignin'
  | 'InvalidCredentials'
  | 'EmailNotVerified'
  | 'AccountDisabled'
  | 'CompanyInactive'
  | 'SessionExpired'
  | 'UnknownError'

/**
 * Type pour le contexte d'authentification (hooks, Server Components)
 */
export type AuthContext = {
  user: NextAuthSession['user'] | null
  isAuthenticated: boolean
  isLoading: boolean
}
