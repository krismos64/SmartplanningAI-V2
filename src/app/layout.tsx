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

import type { Metadata, Viewport } from 'next'
import { Inter, Rajdhani } from 'next/font/google'
import { ToastProvider } from '@/components/toast'
import { CookieConsentProvider } from '@/components/cookies'
import { UmamiAnalyticsWrapper } from '@/components/analytics'
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
    default: 'SmartPlanning - Gestion intelligente des plannings',
    template: '%s | SmartPlanning',
  },
  description:
    "Solution SaaS de gestion des plannings d'entreprise. Automatisez vos plannings, gérez vos équipes et optimisez votre organisation. Bientôt disponible !",
  keywords: [
    'planning',
    'gestion',
    'entreprise',
    'RH',
    'équipes',
    'SaaS',
    'ressources humaines',
    'congés',
    'shifts',
    'organisation',
  ],
  authors: [
    { name: 'Christophe Dev', url: 'https://christophe-dev-freelance.fr' },
  ],
  creator: 'Christophe Dev',
  publisher: 'SmartPlanning SaaS',

  // Métadonnées Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://smartplanning.fr',
    title: 'SmartPlanning - Bientôt disponible',
    description:
      'La solution intelligente de gestion des plannings arrive bientôt !',
    siteName: 'SmartPlanning',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SmartPlanning - Gestion de planning',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'SmartPlanning - Bientôt disponible',
    description:
      'La solution intelligente de gestion des plannings arrive bientôt !',
    images: ['/twitter-image.png'],
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

  // Icônes et manifeste PWA
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
        {/* Cookie Consent RGPD (SP-283) - Provider enveloppe tout le contenu */}
        <CookieConsentProvider>
          {/*
            Structure sémantique HTML5
            - <main> sera fourni par les layouts enfants
            - Permet l'accessibilité (lecteurs d'écran)
            - Font Rajdhani appliquée par défaut (SmartPlanning branding)
          */}
          {children}

          {/* Toast System - Sonner (SP-122) */}
          <ToastProvider />

          {/* Umami Analytics - Privacy-friendly (SP-345) */}
          <UmamiAnalyticsWrapper />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
