/**
 * Middleware Next.js : protection des routes et CSP à nonce
 *
 * @description NextAuth v5 protège les routes /app/* (SP-108). Le middleware
 * génère aussi un nonce par requête et pose la Content Security Policy
 * (SP-598). Il s'exécute en Edge Runtime avant chaque requête.
 *
 * @see https://authjs.dev/getting-started/session-management/protecting
 * @ticket SP-108, SP-598
 */

import type { NextFetchEvent, NextRequest } from 'next/server'
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { buildCsp, generateNonce } from '@/lib/security/csp'
import { applyCsp } from '@/lib/security/csp-response'

/**
 * Middleware NextAuth
 *
 * Utilise la configuration Edge-compatible (sans Prisma)
 * pour vérifier l'authentification avant d'accéder aux routes protégées
 */
const { auth } = NextAuth(authConfig)

type Middleware = (
  request: NextRequest,
  event: NextFetchEvent
) => Promise<Response | null | undefined>

// Appelé sans handler : voir csp-response.ts, un handler désactiverait la
// redirection par défaut de NextAuth
const authMiddleware = auth as unknown as Middleware

const isHttps = (
  process.env.AUTH_URL ??
  process.env.NEXTAUTH_URL ??
  'https://'
).startsWith('https://')

export default async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<Response> {
  const nonce = generateNonce()
  const csp = buildCsp(nonce, {
    isDev: process.env.NODE_ENV === 'development',
    isHttps,
  })
  const authResponse = await authMiddleware(request, event)
  return applyCsp(authResponse, request, nonce, csp)
}

/**
 * Configuration du matcher
 *
 * Définit les routes sur lesquelles le middleware s'applique
 *
 * Exclut :
 * - /_next/* : Assets Next.js
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
