/**
 * Route API NextAuth - Gestionnaire d'authentification
 *
 * @description Route API catch-all qui gère toutes les requêtes NextAuth v5.
 * Le pattern [...nextauth] capture toutes les routes /api/auth/*
 *
 * @routes Gérées automatiquement :
 * - GET  /api/auth/signin       → Page de connexion
 * - POST /api/auth/signin       → Login
 * - GET  /api/auth/signout      → Page de déconnexion
 * - POST /api/auth/signout      → Logout
 * - GET  /api/auth/session      → Get current session
 * - GET  /api/auth/csrf         → CSRF token
 * - GET  /api/auth/providers    → Liste des providers
 * - POST /api/auth/callback/:provider → OAuth callbacks
 *
 * @see https://authjs.dev/getting-started/installation
 * @ticket SP-108
 */

import { handlers } from '@/lib/auth'

/**
 * Export des handlers NextAuth
 *
 * Ces handlers gèrent automatiquement toutes les routes d'authentification
 */
export const { GET, POST } = handlers
