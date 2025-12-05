/**
 * Configuration NextAuth Edge-compatible
 *
 * @description Configuration partagée entre auth.ts et middleware.ts
 * Cette config ne contient PAS le Prisma adapter car le middleware
 * s'exécute en Edge Runtime où Prisma n'est pas disponible.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 * @ticket SP-108
 */

import type { NextAuthConfig } from 'next-auth'
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  AUTH_API_PREFIX,
  DEFAULT_LOGIN_REDIRECT,
  MIDDLEWARE_EXCLUDED_ROUTES,
} from '@/types/auth'

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
     * Détermine si une requête est autorisée à accéder à une route
     *
     * @param auth - Session utilisateur (null si non connecté)
     * @param request - Requête Next.js
     * @returns true si autorisé, false ou Response pour rediriger
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth
      const pathname = nextUrl.pathname

      // Routes API auth : toujours accessibles
      if (pathname.startsWith(AUTH_API_PREFIX)) {
        return true
      }

      // Routes exclues du middleware (invitations, etc.)
      const isExcludedRoute = MIDDLEWARE_EXCLUDED_ROUTES.some((route) =>
        pathname.startsWith(route)
      )
      if (isExcludedRoute) {
        return true
      }

      // Routes publiques : accessibles sans authentification
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )

      // Routes d'auth : si connecté, rediriger vers dashboard
      const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
      if (isAuthRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return true
      }

      // Routes /app/* : nécessitent authentification
      const isAppRoute = pathname.startsWith('/app')
      if (isAppRoute && !isLoggedIn) {
        // Stocker l'URL de callback pour redirection après login
        const callbackUrl = encodeURIComponent(pathname + nextUrl.search)
        return Response.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        )
      }

      // Routes publiques ou autres : autorisées
      if (isPublicRoute || !isAppRoute) {
        return true
      }

      // Par défaut : autorisé si connecté
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
