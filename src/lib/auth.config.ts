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
 * @ticket SP-108, SP-110
 */

import type { NextAuthConfig } from 'next-auth'
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  AUTH_API_PREFIX,
  MIDDLEWARE_EXCLUDED_ROUTES,
  ACCESS_DENIED_REDIRECT,
} from '@/types/auth'
import {
  hasRequiredRole,
  getRequiredRoleForRoute,
  getDefaultDashboardForRole,
} from '@/lib/permissions'

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
   * authorized : Exécuté par le middleware pour vérifier l'accès
   */
  callbacks: {
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
     *
     * @param auth - Session utilisateur (null si non connecté)
     * @param request - Requête Next.js
     * @returns true si autorisé, Response pour rediriger
     *
     * @ticket SP-108, SP-110
     */
    authorized({ auth, request: { nextUrl } }) {
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

      // 3. Routes publiques : accessibles sans authentification
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
      if (isPublicRoute) {
        return true
      }

      // 4. Routes d'auth : si connecté, rediriger vers dashboard selon rôle
      const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
      if (isAuthRoute) {
        if (isLoggedIn) {
          // Redirection vers le dashboard approprié selon le rôle
          const redirectUrl = getDefaultDashboardForRole(userRole)
          return Response.redirect(new URL(redirectUrl, nextUrl))
        }
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
