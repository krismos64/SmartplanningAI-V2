/**
 * Root Layout - Layout principal de l'application
 *
 * ✅ Source : Next.js 15 App Router + SEO best practices (Context7)
 *
 * OBJECTIF (CDA) :
 * Ce fichier définit la structure HTML de base pour TOUTES les pages.
 * Il est OBLIGATOIRE dans Next.js App Router et doit contenir <html> et <body>.
 *
 * FONCTIONNALITÉS :
 * - Metadata SEO (title, description, Open Graph, Twitter Cards)
 * - Import des styles globaux (Tailwind CSS)
 * - Police Google Fonts (Inter)
 * - Structure HTML sémantique
 * - Viewport responsive
 *
 * RÉFÉRENCE CDA :
 * - Next.js 15 Metadata API (remplace next/head)
 * - React Server Component par défaut
 * - SEO-first approach pour référencement Google
 */

import { UmamiAnalyticsWrapper } from '@/components/analytics'
import { CookieConsentProvider } from '@/components/cookies'
import { ErrorBoundaryWrapper } from '@/components/error'
import { SkipLink } from '@/components/layout/skip-link'
import { ThemeProvider } from '@/components/providers'
import { ToastProvider } from '@/components/toast'
import type { Metadata, Viewport } from 'next'
import { Inter, Rajdhani } from 'next/font/google'
import './globals.css'

/**
 * Configuration Google Font Inter
 *
 * Inter est une police optimisée pour les interfaces web
 * - Excellente lisibilité
 * - Chargement optimisé par Next.js (auto-hébergée)
 * - Variable font pour poids dynamiques
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

/**
 * Configuration Google Font Rajdhani (SmartPlanning)
 *
 * ✅ Source : SP-106 - Configuration Shadcn/ui
 *
 * Rajdhani est la police officielle de SmartPlanning
 * - Style moderne et futuriste
 * - Excellente pour les titres et interfaces
 * - Weights : 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
 * - Chargement optimisé par Next.js (auto-hébergée)
 */
const rajdhani = Rajdhani({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rajdhani',
  display: 'swap',
})

/**
 * Metadata SEO - Configuration globale
 *
 * IMPORTANT (CDA) :
 * Cette configuration s'applique à TOUTES les pages par défaut.
 * Les pages individuelles peuvent surcharger ces valeurs.
 *
 * SEO Checklist ✅ :
 * - Title unique et descriptif (< 60 caractères)
 * - Description engageante (< 160 caractères)
 * - Open Graph pour partages sociaux (Facebook, LinkedIn)
 * - Twitter Cards pour Twitter/X
 * - Viewport responsive
 * - Theme color pour PWA
 */
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'
  ),
  title: {
    default: 'SmartPlanning - Gestion intelligente des équipes',
    template: '%s | SmartPlanning',
  },
  description:
    "Solution SaaS de gestion des plannings d'entreprise. Automatisez vos plannings, gerez vos equipes et optimisez votre organisation. Essai gratuit 21 jours.",
  keywords: [
    'logiciel gestion planning entreprise',
    'outil planning equipe en ligne',
    'SaaS planning francais',
    'planning TPE PME',
    'gestion conges en ligne',
    'alternative planning Excel',
    'logiciel RH francais',
    'planning employes en ligne',
    'gestion horaires equipe',
    'solution planning cloud',
  ],
  authors: [
    { name: 'Christophe Dev', url: 'https://christophe-dev-freelance.fr' },
  ],
  creator: 'Christophe Dev',
  publisher: 'SmartPlanning SaaS',

  // Métadonnées Open Graph (Facebook, LinkedIn, Google, LLMs)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://smartplanning.fr',
    title: 'SmartPlanning - Gestion intelligente des plannings',
    description:
      "Solution SaaS de gestion des plannings d'entreprise. Automatisez vos plannings, gerez vos equipes et optimisez votre organisation. Essai gratuit 21 jours.",
    siteName: 'SmartPlanning',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SmartPlanning - Plateforme SaaS de gestion intelligente des plannings',
        type: 'image/png',
      },
      {
        url: '/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Logo SmartPlanning',
        type: 'image/png',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    site: '@smartplanning',
    title: 'SmartPlanning - Gestion intelligente des plannings',
    description:
      "Solution SaaS de gestion des plannings d'entreprise. Automatisez vos plannings, gerez vos equipes et optimisez votre organisation. Essai gratuit 21 jours.",
    images: [
      {
        url: '/twitter-image.png',
        width: 1200,
        height: 600,
        alt: 'SmartPlanning - Plateforme SaaS de gestion intelligente des plannings',
      },
    ],
    creator: '@christophedev',
  },

  // Robots et indexation
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icônes et manifeste PWA - Configuration complète multi-tailles
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      {
        url: '/apple-touch-icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
      },
      {
        url: '/apple-touch-icon-167x167.png',
        sizes: '167x167',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/android-chrome-512x512.png',
        color: '#3b82f6',
      },
    ],
  },
  manifest: '/site.webmanifest',

  // Images pour moteurs de recherche et LLMs
  other: {
    'msapplication-TileImage': '/android-chrome-192x192.png',
    'msapplication-TileColor': '#030712',
  },
}

/**
 * Viewport Configuration
 *
 * ✅ Source : Next.js 15 Viewport API
 *
 * IMPORTANT (Next.js 15+) :
 * viewport et themeColor ont été déplacés de Metadata vers Viewport export
 * pour améliorer les performances et suivre les nouvelles conventions.
 *
 * SEO & UX :
 * - Responsive design pour tous les devices
 * - Theme color adaptatif (light/dark mode)
 * - Zoom autorisé jusqu'à 5x pour accessibilité
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
}

/**
 * RootLayout Component
 *
 * RÈGLES (CDA) :
 * 1. DOIT contenir <html> et <body>
 * 2. DOIT accepter children comme prop
 * 3. Est un Server Component par défaut (pas de "use client")
 * 4. Appliqué à TOUTES les pages de l'app
 *
 * @param children - Contenu de la page enfant
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${rajdhani.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-rajdhani antialiased">
        {/* Skip Link - Accessibilité WCAG 2.4.1 (SP-269) */}
        <SkipLink />

        {/* Theme Provider (SP-265) - Dark/Light mode avec détection système */}
        <ThemeProvider>
          {/* Cookie Consent RGPD (SP-283) - Provider enveloppe tout le contenu */}
          <CookieConsentProvider>
            {/* Error Boundary (SP-304) - Capture les erreurs React côté client */}
            <ErrorBoundaryWrapper>
              {/*
                Structure sémantique HTML5 (SP-269)
                - <main id="main-content"> cible du skip link
                - Permet l'accessibilité (lecteurs d'écran)
                - Font Rajdhani appliquée par défaut (SmartPlanning branding)
              */}
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
            </ErrorBoundaryWrapper>

            {/* Toast System - Sonner (SP-122) */}
            <ToastProvider />

            {/* Umami Analytics - Privacy-friendly (SP-345) */}
            <UmamiAnalyticsWrapper />
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
