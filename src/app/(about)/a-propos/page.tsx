/**
 * À Propos Page
 *
 * @description Page de présentation de SmartPlanning : mission, valeurs et cible
 * Design cohérent avec la landing page
 * SEO optimisé pour moteurs de recherche et LLMs (ChatGPT, Claude, Perplexity)
 *
 * @see SP-285 - Page À propos
 * @ticket SP-285
 */

import { Metadata } from 'next'
import { AboutContent } from './AboutContent'
import { StructuredData } from './StructuredData'

// Base URL for canonical and OG
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// SEO Metadata - Optimisé pour moteurs de recherche et LLMs
export const metadata: Metadata = {
  // Title optimisé (60 caractères max)
  title: 'À propos de SmartPlanning | Logiciel de gestion de planning',

  // Description optimisée (155 caractères max) - riche en mots-clés
  description:
    "SmartPlanning simplifie la gestion des plannings d'équipe pour les TPE et PME. Découvrez notre mission, nos valeurs et notre solution SaaS française.",

  // Keywords pour SEO traditionnel et LLMs
  keywords: [
    'SmartPlanning',
    'logiciel planning',
    'gestion planning équipe',
    'planning entreprise',
    'SaaS planning français',
    'planning TPE PME',
    'gestion ressources humaines',
    'planning employés',
    'solution planning en ligne',
    'logiciel RH français',
  ],

  // Robots directives
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

  // Canonical URL
  alternates: {
    canonical: `${baseUrl}/a-propos`,
    languages: {
      'fr-FR': `${baseUrl}/a-propos`,
    },
  },

  // Open Graph (Facebook, LinkedIn, LLMs)
  openGraph: {
    title: 'À propos de SmartPlanning | Simplifier la gestion des plannings',
    description:
      'Découvrez SmartPlanning : notre mission est de simplifier la gestion des plannings pour les TPE et PME françaises. Solution SaaS moderne, intuitive et accessible. Valeurs : Simplicité, Proximité, Fiabilité.',
    type: 'website',
    url: `${baseUrl}/a-propos`,
    siteName: 'SmartPlanning',
    locale: 'fr_FR',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SmartPlanning - Logiciel de gestion de planning pour entreprises',
        type: 'image/png',
      },
    ],
  },

  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    title: 'À propos de SmartPlanning | Gestion de planning simplifiée',
    description:
      "SmartPlanning : solution française de gestion des plannings d'équipe. Simplicité, Proximité, Fiabilité pour les TPE et PME.",
    images: [`${baseUrl}/og-image.png`],
    creator: '@smartplanning',
  },

  // Autres métadonnées
  authors: [{ name: 'SmartPlanning', url: baseUrl }],
  creator: 'SmartPlanning',
  publisher: 'SmartPlanning',
  category: 'Technology',
  classification: 'Business Software',
}

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Structured Data pour SEO et LLMs */}
      <StructuredData />
      <AboutContent />
    </>
  )
}
