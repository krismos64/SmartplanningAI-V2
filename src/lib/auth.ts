/**
 * Configuration NextAuth v5 pour SmartPlanning
 *
 * ⚠️ STRUCTURE PRÉPARÉE - IMPLÉMENTATION À VENIR (SP-105)
 *
 * OBJECTIF (CDA) :
 * Ce fichier contiendra la configuration complète de NextAuth v5
 * (anciennement Auth.js) pour gérer l'authentification multi-tenant.
 *
 * FONCTIONNALITÉS PRÉVUES :
 * - Authentification par email/password (Credentials Provider)
 * - Sessions JWT avec chiffrement
 * - Multi-tenant : isolation par companyId
 * - Rôles utilisateurs : DIRECTOR, MANAGER, EMPLOYEE
 * - Protection CSRF et sécurité renforcée
 *
 * ARCHITECTURE NEXTAUTH V5 :
 * - auth.ts : Configuration centrale
 * - middleware.ts : Protection des routes
 * - [...nextauth]/route.ts : API endpoints
 *
 * RÉFÉRENCE CDA :
 * - NextAuth v5 (beta.30) avec Prisma Adapter
 * - Pattern officiel recommandé par Vercel
 * - Compatible avec App Router Next.js 15
 *
 * TODO (SP-105) :
 * 1. Implémenter NextAuth configuration
 * 2. Configurer Prisma Adapter
 * 3. Définir callbacks (jwt, session)
 * 4. Ajouter Credentials Provider
 * 5. Créer middleware de protection
 */

// Import types NextAuth (à compléter au SP-105)
// import NextAuth from "next-auth"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import Credentials from "next-auth/providers/credentials"
// import { prisma } from "@/lib/prisma"

/**
 * Type temporaire pour la session utilisateur
 * Sera remplacé par les types NextAuth au SP-105
 */
export type SessionUser = {
  id: string
  email: string
  name: string
  role: 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'
  companyId: string
  emailVerified: Date | null
  image: string | null
}

/**
 * Configuration NextAuth (à implémenter)
 *
 * Structure prévue :
 * - adapter: PrismaAdapter(prisma)
 * - providers: [Credentials({ ... })]
 * - callbacks: { jwt, session }
 * - pages: { signIn: "/login", ... }
 * - session: { strategy: "jwt" }
 */
// export const { auth, signIn, signOut, handlers } = NextAuth({
//   // Configuration à venir au SP-105
// })

/**
 * Placeholder pour la fonction auth()
 * Sera remplacée par NextAuth au SP-105
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function auth() {
  // Temporaire : retourne null
  // Sera remplacé par : return await nextAuthInstance.auth()
  return null
}

/**
 * Placeholder pour signIn()
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function signIn() {
  throw new Error('NextAuth non encore implémenté - Voir SP-105')
}

/**
 * Placeholder pour signOut()
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function signOut() {
  throw new Error('NextAuth non encore implémenté - Voir SP-105')
}

/**
 * Placeholder pour handlers (GET/POST)
 */
export const handlers = {
  // eslint-disable-next-line @typescript-eslint/require-await
  GET: async () => {
    throw new Error('NextAuth non encore implémenté - Voir SP-105')
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  POST: async () => {
    throw new Error('NextAuth non encore implémenté - Voir SP-105')
  },
}
