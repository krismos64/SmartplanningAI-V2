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
import { z } from 'zod'

import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { authConfig } from '@/lib/auth.config'

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
       * Vérifie les credentials et retourne l'utilisateur si valide
       *
       * @security
       * - Validation Zod des inputs
       * - Vérification du hash bcrypt
       * - Vérification isActive
       * - Vérification company.isActive (sauf SYSTEM_ADMIN)
       */
      async authorize(credentials) {
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

        // 5. Vérifier que le compte est actif
        if (!user.isActive) {
          throw new Error('AccountDisabled')
        }

        // 6. Vérifier que l'entreprise est active (sauf SYSTEM_ADMIN)
        if (user.role !== 'SYSTEM_ADMIN') {
          if (!user.company) {
            throw new Error('CompanyInactive')
          }
          if (!user.company.isActive) {
            throw new Error('CompanyInactive')
          }
        }

        // 7. Mettre à jour lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        // 8. Retourner l'utilisateur (sans le mot de passe)
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
      },
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
    signIn({ user }) {
      // Log de connexion (peut être envoyé à un service externe)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`[AUTH] User signed in: ${user?.email}`)
      }
    },
    signOut() {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[AUTH] User signed out')
      }
    },
  },

  /**
   * Debug mode (dev only)
   */
  debug: process.env.NODE_ENV === 'development',
})
