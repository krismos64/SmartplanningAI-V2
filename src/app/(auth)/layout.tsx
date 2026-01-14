/**
 * Auth Layout - Layout pour les pages d'authentification
 *
 * ✅ Source : Next.js 15 Route Groups + Authentication patterns (Context7)
 *
 * OBJECTIF (CDA) :
 * Layout dédié aux pages d'authentification (login, register).
 * Utilise les Route Groups (auth) pour isoler ces pages du reste de l'app.
 * Design dark cohérent avec la landing page.
 *
 * AVANTAGES ROUTE GROUPS :
 * - URL propres : /login et /register (pas de /auth/login)
 * - Layout personnalisé sans affecter les autres pages
 * - Organisation claire du code
 *
 * FONCTIONNALITÉS :
 * - Design dark cohérent avec landing page
 * - Header et Footer réutilisés de la landing
 * - Animations Framer Motion
 * - Responsive mobile-first
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 Route Groups : (folder)
 * - Pattern recommandé pour auth flows
 */

import type { Metadata } from 'next'
import { AuthLayoutClient } from './AuthLayoutClient'

/**
 * Metadata pour les pages d'authentification
 *
 * Ces metadata sont partagées par login et register,
 * mais peuvent être surchargées individuellement
 */
export const metadata: Metadata = {
  title: 'Authentification',
  robots: {
    index: false, // Pages auth non indexées par Google
    follow: false,
  },
}

/**
 * AuthLayout Component
 *
 * Layout avec design dark cohérent avec la landing page
 *
 * ARCHITECTURE (CDA) :
 * - Header de la landing (sans liens navigation)
 * - Contenu centré avec card glassmorphism
 * - Footer de la landing
 * - Background animé
 *
 * @param children - Pages login ou register
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>
}
