/**
 * Configuration NextAuth v5 pour SmartPlanning
 *
 * @description Configuration complète de l'authentification avec :
 * - Credentials Provider (email/password)
 * - JWT strategy pour les sessions
 * - Callbacks pour enrichir session avec role et companyId
 * - Vérifications de sécurité (isActive, company.isActive)
 *
 * @see https://authjs.dev/getting-started/authentication/credentials
 * @ticket SP-108, SP-440
 */

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { UserRole, SubscriptionStatus } from '@prisma/client'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { authConfig } from '@/lib/auth.config'
import { logAuditAction } from '@/lib/services/audit'
import { registerSession, removeSession } from '@/lib/session-store'

/**
 * Schéma de validation des credentials
 *
 * Utilise Zod pour valider les données d'entrée avant traitement
 */
const credentialsSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

/**
 * Type de retour de authorizeCredentials
 *
 * Correspond à l'objet user injecté par NextAuth dans le callback jwt
 * au premier login (cf. auth.config.ts). null = authentification refusée.
 */
type AuthorizedUser = {
  id: string
  email: string
  name: string | null
  role: UserRole
  companyId: string | null
  emailVerified: Date | null
  image: string | null
  isActive: boolean
  subscriptionStatus: SubscriptionStatus | null
  trialEndsAt: string | null
  currentPeriodEnd: string | null
}

/**
 * Fonction d'autorisation du Credentials Provider (extraite pour testabilité)
 *
 * Vérifie les credentials et retourne l'utilisateur si valide.
 * Extraite de la closure inline du provider pour pouvoir être testée
 * unitairement sans instancier NextAuth (SP-526).
 *
 * @security
 * - Validation Zod des inputs
 * - Vérification du hash bcrypt
 * - Vérification emailVerified (SP-526)
 * - Vérification isActive
 * - Vérification company.isActive (sauf SYSTEM_ADMIN)
 *
 * @returns L'utilisateur autorisé, ou null si credentials invalides.
 *          Lève une Error typée (EmailNotVerified / AccountDisabled /
 *          CompanyInactive) pour les refus métier.
 */
export async function authorizeCredentials(
  credentials: Partial<Record<'email' | 'password', unknown>>
): Promise<AuthorizedUser | null> {
  // 1. Valider les credentials avec Zod
  const result = credentialsSchema.safeParse(credentials)
  if (!result.success) {
    return null
  }

  const { email, password } = result.data

  // 2. Chercher l'utilisateur par email
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      company: {
        select: {
          id: true,
          isActive: true,
          trialEndsAt: true, // SP-440 subscription guard
          subscription: {
            select: {
              status: true,
              currentPeriodEnd: true,
            },
          },
        },
      },
    },
  })

  // 3. Vérifier que l'utilisateur existe
  if (!user) {
    return null
  }

  // 4. Vérifier le mot de passe
  const isPasswordValid = await verifyPassword(password, user.password)
  if (!isPasswordValid) {
    return null
  }

  // 5. Vérifier que l'email a été vérifié (SP-526)
  // emailVerified (DateTime?) est la source de vérité, pas isEmailVerified.
  // Tant que l'utilisateur n'a pas cliqué sur le lien reçu par email,
  // on refuse la connexion. La page /login intercepte 'EmailNotVerified'
  // pour proposer de renvoyer l'email de vérification.
  if (!user.emailVerified) {
    throw new Error('EmailNotVerified')
  }

  // 6. Vérifier que le compte est actif
  if (!user.isActive) {
    throw new Error('AccountDisabled')
  }

  // 7. Vérifier que l'entreprise est active (sauf SYSTEM_ADMIN)
  if (user.role !== 'SYSTEM_ADMIN') {
    if (!user.company) {
      throw new Error('CompanyInactive')
    }
    if (!user.company.isActive) {
      throw new Error('CompanyInactive')
    }
  }

  // 8. Mettre à jour lastLoginAt
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  // 9. Audit trail : log LOGIN (fire-and-forget, SP-443)
  logAuditAction({
    action: 'LOGIN',
    entityType: 'USER',
    entityId: user.id,
    userId: user.id,
    companyId: user.companyId ?? undefined,
    details: { email: user.email },
  }).catch(console.error)

  // 10. Enregistrer la session active dans Redis (fire-and-forget, SP-480)
  // Si Redis est down, le JWT fonctionne quand même normalement.
  registerSession(user.id, {
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    loginAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
    ip: 'unknown', // Pas d'accès au Request dans authorize()
    userAgent: 'unknown',
  }).catch(console.error)

  // 11. Retourner l'utilisateur (sans le mot de passe)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
    emailVerified: user.emailVerified,
    image: user.image,
    isActive: user.isActive,
    // SP-440 : données subscription pour le middleware guard
    subscriptionStatus: user.company?.subscription?.status ?? null,
    trialEndsAt: user.company?.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd:
      user.company?.subscription?.currentPeriodEnd?.toISOString() ?? null,
  }
}

/**
 * Configuration NextAuth complète
 *
 * Étend authConfig avec :
 * - Credentials Provider
 * - Callbacks JWT et Session
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  /**
   * Providers d'authentification
   *
   * Credentials : Authentification email/password classique
   * Possibilité d'ajouter Google, GitHub, etc. plus tard
   */
  providers: [
    Credentials({
      /**
       * Définition des champs du formulaire
       */
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'votre@email.com',
        },
        password: {
          label: 'Mot de passe',
          type: 'password',
        },
      },

      /**
       * Fonction d'autorisation
       *
       * Déléguée à authorizeCredentials (fonction nommée extraite pour
       * testabilité, cf. plus haut dans ce fichier — SP-526).
       */
      authorize: authorizeCredentials,
    }),
  ],

  /**
   * Callbacks
   *
   * Note: Les callbacks jwt, session et authorized sont définis dans authConfig
   * pour être partagés avec le middleware. On étend simplement ici.
   */
  callbacks: {
    ...authConfig.callbacks,
  },

  /**
   * Events (optionnel)
   *
   * Pour logging ou analytics
   */
  events: {
    signIn() {
      // LOGIN audit est géré dans authorize() avec les données complètes (SP-443)
    },
    signOut(message) {
      // Audit trail : log LOGOUT (fire-and-forget, SP-443)
      const token = 'token' in message ? message.token : null
      if (token?.sub) {
        logAuditAction({
          action: 'LOGOUT',
          entityType: 'USER',
          entityId: token.sub,
          userId: token.sub,
          companyId: (token.companyId as string) ?? undefined,
        }).catch(console.error)

        // Supprimer la session de Redis (fire-and-forget, SP-480)
        removeSession(token.sub).catch(console.error)
      }
    },
  },

  /**
   * Debug mode (dev only)
   */
  debug: process.env.NODE_ENV === 'development',
})
