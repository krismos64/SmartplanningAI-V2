/**
 * Homepage - Page d'accueil SmartPlanning
 *
 * @description Server Component avec metadata SEO optimisee pour
 * moteurs de recherche et LLMs (ChatGPT, Claude, Perplexity, Gemini).
 * JSON-LD @graph combine (WebSite, Organization, SoftwareApplication, FAQPage).
 *
 * @ticket SP-462
 */

import { Metadata } from 'next'
import LandingPageContent from './LandingPageContent'
import { StructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export const metadata: Metadata = {
  title: 'SmartPlanning — Logiciel de gestion de planning pour entreprises',

  description:
    'Simplifiez la gestion des plannings de votre équipe. Solution SaaS française pour TPE et PME. Essai gratuit 21 jours, à partir de 2,90\u00a0\u20ac/employé/mois.',

  keywords: [
    'logiciel gestion planning entreprise',
    'outil planning équipe en ligne',
    'SaaS planning français',
    'planning TPE PME',
    'gestion congés en ligne',
    'alternative planning Excel',
    'logiciel RH français',
    'planning employés en ligne',
    'gestion horaires équipe',
    'solution planning cloud',
  ],

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

  alternates: {
    canonical: baseUrl,
    languages: {
      'fr-FR': baseUrl,
    },
  },

  openGraph: {
    title: 'SmartPlanning — Gestion de planning simplifiée pour entreprises',
    description:
      'Gérez les plannings de votre équipe en quelques clics. Solution SaaS française, essai gratuit 21 jours.',
    type: 'website',
    url: baseUrl,
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

  twitter: {
    card: 'summary_large_image',
    title: 'SmartPlanning — Gestion de planning pour entreprises',
    description:
      'Solution SaaS française de gestion des plannings. Essai gratuit 21 jours.',
    creator: '@smartplanning',
  },

  authors: [{ name: 'SmartPlanning', url: baseUrl }],
  creator: 'SmartPlanning',
  publisher: 'SmartPlanning',
  category: 'Technology',
  classification: 'Business Software',
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <LandingPageContent />
    </>
  )
}
