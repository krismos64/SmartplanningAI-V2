/**
 * NextAuth API Route - Gestionnaire d'authentification
 *
 * ✅ Source : NextAuth v5 documentation officielle (Context7)
 *
 * OBJECTIF (CDA) :
 * Route API catch-all pour gérer TOUTES les requêtes NextAuth.
 * Pattern [...nextauth] capture : /api/auth/signin, /api/auth/signout, etc.
 *
 * ROUTES GÉRÉES AUTOMATIQUEMENT :
 * - GET  /api/auth/signin       → Page de connexion
 * - POST /api/auth/signin       → Login
 * - GET  /api/auth/signout      → Page de déconnexion
 * - POST /api/auth/signout      → Logout
 * - GET  /api/auth/session      → Get current session
 * - GET  /api/auth/csrf         → CSRF token
 * - GET  /api/auth/providers    → Liste des providers
 * - POST /api/auth/callback/:provider → OAuth callbacks
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 App Router : app/api/auth/[...nextauth]/route.ts
 * - NextAuth v5 handlers pattern
 * - Catch-all dynamic route
 *
 * ⚠️ IMPORTANT :
 * Ce fichier sera complété au SP-105 avec la configuration NextAuth.
 * Pour Phase 3 (SP-104), c'est une structure vide fonctionnelle.
 */

// TODO (SP-105) : Décommenter et implémenter NextAuth
// import { handlers } from '@/lib/auth'
// export const { GET, POST } = handlers

/**
 * Gestionnaire GET temporaire (Phase 3)
 *
 * Retourne une réponse JSON indiquant que NextAuth n'est pas encore configuré.
 * Sera remplacé par handlers.GET de NextAuth au SP-105.
 */
export async function GET(request: Request) {
  return new Response(
    JSON.stringify({
      error: 'NextAuth non configuré',
      message: 'NextAuth v5 sera implémenté au ticket SP-105',
      phase: 'Phase 3 - Structure préparée',
      url: request.url,
    }),
    {
      status: 501, // Not Implemented
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * Gestionnaire POST temporaire (Phase 3)
 *
 * Retourne la même réponse que GET pour les requêtes POST.
 * Sera remplacé par handlers.POST de NextAuth au SP-105.
 */
export async function POST(request: Request) {
  return new Response(
    JSON.stringify({
      error: 'NextAuth non configuré',
      message: 'NextAuth v5 sera implémenté au ticket SP-105',
      phase: 'Phase 3 - Structure préparée',
      method: 'POST',
      url: request.url,
    }),
    {
      status: 501, // Not Implemented
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * CONFIGURATION NEXTAUTH À VENIR (SP-105)
 *
 * Structure prévue :
 *
 * ```typescript
 * import { handlers } from '@/lib/auth'
 *
 * // Export handlers NextAuth pour GET et POST
 * export const { GET, POST } = handlers
 *
 * // Runtime compatible Edge ou Node
 * export const runtime = 'nodejs' // ou 'edge'
 * ```
 *
 * FONCTIONNALITÉS NEXTAUTH :
 * - Credentials Provider (email/password)
 * - Prisma Adapter (DB PostgreSQL)
 * - JWT Sessions (chiffrées)
 * - Multi-tenant (companyId dans session)
 * - Role-based access (DIRECTOR, MANAGER, EMPLOYEE)
 * - CSRF protection
 * - Secure cookies (httpOnly, sameSite)
 *
 * SÉCURITÉ :
 * - AUTH_SECRET défini dans .env
 * - Passwords hashés avec bcrypt (10 rounds)
 * - Sessions JWT avec expiration
 * - Validation email requise
 * - Rate limiting sur login (prévu)
 */
