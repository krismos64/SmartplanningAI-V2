/**
 * Configuration NextAuth Edge-compatible
 *
 * @description Configuration partagée entre auth.ts et middleware.ts
 * Cette config ne contient PAS le Prisma adapter car le middleware
 * s'exécute en Edge Runtime où Prisma n'est pas disponible.
 *
 * Inclut la logique RBAC (Role-Based Access Control) pour :
 * - Vérifier les permissions par rôle sur les routes protégées
 * - Rediriger vers le dashboard approprié selon le rôle
 * - Bloquer l'accès aux routes réservées à certains rôles
 *
 * @see https://authjs.dev/guides/edge-compatibility
 * @see https://authjs.dev/guides/role-based-access-control
 * @ticket SP-108, SP-110, SP-440, SP-447
 */

import type { NextAuthConfig } from 'next-auth'
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  AUTH_API_PREFIX,
  MIDDLEWARE_EXCLUDED_ROUTES,
  ACCESS_DENIED_REDIRECT,
  IMPERSONATION_COOKIE_NAME,
} from '@/types/auth'
import {
  hasRequiredRole,
  getRequiredRoleForRoute,
  getDefaultDashboardForRole,
} from '@/lib/permissions'
import { checkSubscriptionAccess } from '@/lib/subscription-guard'

/**
 * Configuration NextAuth partagée (Edge-compatible)
 *
 * Contient uniquement les options qui fonctionnent en Edge Runtime :
 * - pages : URLs personnalisées
 * - callbacks : authorized (pour middleware)
 * - session : stratégie JWT
 *
 * Les providers et adapter sont ajoutés dans auth.ts
 */
export const authConfig: NextAuthConfig = {
  /**
   * Pages personnalisées
   *
   * Redirige vers nos pages custom au lieu des pages par défaut NextAuth
   */
  pages: {
    signIn: '/login',
    // signOut: '/logout',
    error: '/login', // Affiche les erreurs sur la page login
    // verifyRequest: '/verify-email',
    // newUser: '/welcome',
  },

  /**
   * Configuration de session
   *
   * JWT strategy car on ne veut pas de sessions en base
   * pour un déploiement VPS simple
   */
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Refresh token toutes les 24h
  },

  /**
   * Callbacks
   *
   * Inclut jwt et session pour que le middleware puisse accéder aux
   * données utilisateur (role, companyId) depuis le token JWT.
   */
  callbacks: {
    /**
     * Callback JWT
     *
     * Appelé à chaque création/mise à jour du token JWT.
     * Ajoute nos champs custom au token.
     *
     * IMPORTANT: Ce callback doit être dans authConfig pour que le
     * middleware puisse lire le rôle utilisateur.
     */
    async jwt({ token, user, trigger, session }) {
      // Au premier login, user est défini
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.emailVerified = user.emailVerified
        token.image = user.image
        // SP-440 : données subscription pour le guard middleware
        token.subscriptionStatus = user.subscriptionStatus ?? null
        token.trialEndsAt = user.trialEndsAt ?? null
        token.currentPeriodEnd = user.currentPeriodEnd ?? null
        token.subscriptionCheckedAt = Date.now()
      }

      // Mise à jour de la session (ex: après upload d'avatar)
      if (trigger === 'update' && session?.image !== undefined) {
        token.image = session.image
      }

      // SP-447 : Mise à jour impersonation via session.update()
      // Appelé après POST/DELETE /api/admin/impersonate côté client
      if (trigger === 'update' && session?.isImpersonating !== undefined) {
        if (session.isImpersonating === true) {
          // Démarrage impersonation : override role et companyId
          token.isImpersonating = true
          token.originalAdminId = session.originalAdminId as string
          token.impersonatedUserId = session.impersonatedUserId as string
          token.impersonatedCompanyId = session.impersonatedCompanyId as string
          token.impersonatedUserEmail = session.impersonatedUserEmail as string
          token.impersonatedCompanyName =
            session.impersonatedCompanyName as string
          // Override le rôle et companyId pour que le RBAC fonctionne
          token.role =
            session.impersonatedRole as import('@prisma/client').UserRole
          token.companyId = session.impersonatedCompanyId as string
        } else {
          // Arrêt impersonation : restaurer la session admin
          token.isImpersonating = undefined
          token.role = 'SYSTEM_ADMIN' as import('@prisma/client').UserRole
          token.companyId = null
          token.originalAdminId = undefined
          token.impersonatedUserId = undefined
          token.impersonatedCompanyId = undefined
          token.impersonatedUserEmail = undefined
          token.impersonatedCompanyName = undefined
        }
      }

      // SP-447 : Si impersonation active, override companyId/role à chaque refresh
      if (token.isImpersonating && token.impersonatedCompanyId) {
        token.companyId = token.impersonatedCompanyId as string
      }

      // SP-440 : Rafraîchissement périodique des données subscription
      // Bloqué si impersonation active (SP-447) : ne pas re-fetcher
      // pour l'admin, on garde les données de la company impersonnée
      const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
      const checkedAt = token.subscriptionCheckedAt as number | null
      if (
        token.companyId &&
        token.role !== 'SYSTEM_ADMIN' &&
        !token.isImpersonating &&
        (!checkedAt || Date.now() - checkedAt > SUBSCRIPTION_CHECK_INTERVAL)
      ) {
        try {
          // Import dynamique : fonctionne côté serveur, échoue en Edge (catch)
          const { prisma } = await import('@/lib/prisma')
          const company = await prisma.company.findUnique({
            where: { id: token.companyId as string },
            select: {
              trialEndsAt: true,
              subscription: {
                select: {
                  status: true,
                  currentPeriodEnd: true,
                },
              },
            },
          })
          if (company) {
            token.subscriptionStatus = company.subscription?.status ?? null
            token.trialEndsAt = company.trialEndsAt?.toISOString() ?? null
            token.currentPeriodEnd =
              company.subscription?.currentPeriodEnd?.toISOString() ?? null
            token.subscriptionCheckedAt = Date.now()
          }
        } catch {
          // En Edge Runtime, l'import Prisma échoue — comportement attendu.
          // Le token conserve ses valeurs existantes.
        }
      }

      return token
    },

    /**
     * Callback Session
     *
     * Appelé à chaque accès à la session.
     * Expose les données du token dans session.user.
     *
     * IMPORTANT: Ce callback doit être dans authConfig pour que le
     * middleware puisse accéder à session.user.role.
     */
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as import('@prisma/client').UserRole
        session.user.companyId = token.companyId as string | null
        session.user.emailVerified = token.emailVerified as Date | null
        session.user.image = token.image as string | null
        // SP-440 : données subscription exposées dans la session
        session.user.subscriptionStatus = token.subscriptionStatus as
          | string
          | null
        session.user.trialEndsAt = token.trialEndsAt as string | null
        session.user.currentPeriodEnd = token.currentPeriodEnd as string | null
        // SP-447 : données impersonation exposées dans la session
        session.user.isImpersonating = token.isImpersonating ?? false
        session.user.originalAdminId = token.originalAdminId as
          | string
          | undefined
        session.user.impersonatedUserId = token.impersonatedUserId as
          | string
          | undefined
        session.user.impersonatedCompanyId = token.impersonatedCompanyId as
          | string
          | undefined
        session.user.impersonatedUserEmail = token.impersonatedUserEmail as
          | string
          | undefined
        session.user.impersonatedCompanyName = token.impersonatedCompanyName as
          | string
          | undefined
      }
      return session
    },

    /**
     * Callback authorized pour le middleware
     *
     * Détermine si une requête est autorisée à accéder à une route.
     * Implémente le RBAC (Role-Based Access Control) pour vérifier
     * que l'utilisateur a les permissions nécessaires.
     *
     * Ordre de vérification :
     * 1. Routes API auth → toujours accessibles
     * 2. Routes exclues (invitations) → toujours accessibles
     * 3. Routes publiques → toujours accessibles
     * 4. Routes d'auth (login/register) → redirect si déjà connecté
     * 5. Routes /app/* non authentifié → redirect vers login
     * 6. RBAC : vérification du rôle requis pour la route
     * 7. Subscription Guard : vérification abonnement actif (SP-440)
     *
     * @param auth - Session utilisateur (null si non connecté)
     * @param request - Requête Next.js
     * @returns true si autorisé, Response pour rediriger
     *
     * @ticket SP-108, SP-110, SP-440, SP-453
     */
    authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth
      const pathname = nextUrl.pathname
      const userRole = auth?.user?.role

      // 1. Routes API auth : toujours accessibles
      if (pathname.startsWith(AUTH_API_PREFIX)) {
        return true
      }

      // 2. Routes exclues du middleware (invitations, etc.)
      const isExcludedRoute = MIDDLEWARE_EXCLUDED_ROUTES.some((route) =>
        pathname.startsWith(route)
      )
      if (isExcludedRoute) {
        return true
      }

      // 3. Routes d'auth : si connecté, rediriger vers dashboard selon rôle
      // IMPORTANT: Vérifié AVANT les routes publiques car /login et /register
      // sont dans les deux listes
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
      )
      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirection vers le dashboard approprié selon le rôle
          const redirectUrl = getDefaultDashboardForRole(userRole)
          return Response.redirect(new URL(redirectUrl, nextUrl))
        }
        return true
      }

      // 4. Routes publiques : accessibles sans authentification
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
      if (isPublicRoute) {
        return true
      }

      // 5. Routes /app/* : nécessitent authentification
      const isAppRoute = pathname.startsWith('/app')
      if (isAppRoute && !isLoggedIn) {
        // Stocker l'URL de callback pour redirection après login
        const callbackUrl = encodeURIComponent(pathname + nextUrl.search)
        return Response.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        )
      }

      // 6. RBAC : Vérification du rôle requis pour les routes protégées
      if (isLoggedIn && isAppRoute) {
        const requiredRole = getRequiredRoleForRoute(pathname)

        // Si un rôle est requis et l'utilisateur n'a pas les permissions
        if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
          // Redirection silencieuse vers le dashboard par défaut
          return Response.redirect(new URL(ACCESS_DENIED_REDIRECT, nextUrl))
        }
      }

      // 7. Impersonation Guard (SP-453) : bloquer /app/admin/* en impersonation
      // Lecture Edge-compatible du cookie sp-impersonation via request.cookies
      if (isLoggedIn && pathname.startsWith('/app/admin')) {
        try {
          const impersonationCookie = request.cookies.get(
            IMPERSONATION_COOKIE_NAME
          )
          if (impersonationCookie?.value) {
            const parsed: unknown = JSON.parse(impersonationCookie.value)
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'originalAdminId' in parsed
            ) {
              return Response.redirect(new URL('/app/dashboard', nextUrl))
            }
          }
        } catch {
          // Cookie invalide ou erreur de lecture — ignorer
        }
      }

      // 8. Subscription Guard (SP-440) : vérification abonnement actif
      // S'applique aux routes /app/* pour les utilisateurs connectés
      // Les routes exemptées (billing, profile, settings) et SYSTEM_ADMIN
      // sont gérés dans checkSubscriptionAccess (function pure)
      if (isLoggedIn && isAppRoute) {
        const subscriptionCheck = checkSubscriptionAccess({
          role: (userRole as string) ?? '',
          subscriptionStatus: auth?.user?.subscriptionStatus ?? null,
          trialEndsAt: auth?.user?.trialEndsAt ?? null,
          currentPeriodEnd: auth?.user?.currentPeriodEnd ?? null,
          pathname,
        })

        if (!subscriptionCheck.allowed) {
          const billingUrl = new URL('/app/dashboard/billing', nextUrl)
          if (subscriptionCheck.redirectReason) {
            billingUrl.searchParams.set(
              'reason',
              subscriptionCheck.redirectReason
            )
          }
          return Response.redirect(billingUrl)
        }
      }

      // Routes non-/app/* : autorisées (pages publiques hors liste)
      if (!isAppRoute) {
        return true
      }

      // Par défaut : autorisé si connecté sur route /app/*
      return isLoggedIn
    },
  },

  /**
   * Providers vides ici
   *
   * Les providers sont définis dans auth.ts car ils nécessitent
   * l'accès à Prisma qui n'est pas disponible en Edge Runtime
   */
  providers: [],
}
