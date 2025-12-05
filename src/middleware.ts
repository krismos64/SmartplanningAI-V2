/**
 * Middleware Next.js pour la protection des routes
 *
 * @description Utilise NextAuth v5 pour protéger les routes /app/*
 * Le middleware s'exécute en Edge Runtime avant chaque requête.
 *
 * @see https://authjs.dev/getting-started/session-management/protecting
 * @ticket SP-108
 */

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

/**
 * Middleware NextAuth
 *
 * Utilise la configuration Edge-compatible (sans Prisma)
 * pour vérifier l'authentification avant d'accéder aux routes protégées
 */
const { auth } = NextAuth(authConfig)

export default auth

/**
 * Configuration du matcher
 *
 * Définit les routes sur lesquelles le middleware s'applique
 *
 * Exclut :
 * - /_next/* : Assets Next.js
 * - /api/* : Routes API (sauf /api/auth qui est géré)
 * - /static/* : Fichiers statiques
 * - Fichiers avec extensions (images, fonts, etc.)
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images)
     * - favicon.ico (icône du site)
     * - Fichiers publics avec extension
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}
