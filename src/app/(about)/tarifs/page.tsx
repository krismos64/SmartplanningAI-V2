/**
 * Tarifs Page - Page de tarification
 *
 * @description Server Component avec metadata SEO optimisee pour
 * moteurs de recherche et LLMs (ChatGPT, Claude, Perplexity).
 * JSON-LD structure pour Google Rich Results.
 *
 * @ticket SP-359
 */

import { Metadata } from 'next'
import { PricingPageContent } from './PricingPageContent'
import { StructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export const metadata: Metadata = {
  title: 'Tarifs SmartPlanning — 2,90\u00a0\u20ac par employe par mois',

  description:
    'Tarif unique et transparent : 2,90\u00a0\u20ac HT par employe par mois. Toutes les fonctionnalites incluses, sans engagement. Essai gratuit 21 jours sans carte bancaire.',

  keywords: [
    'tarif planning',
    'prix logiciel planning',
    'gestion planning tarif',
    'outil planning equipe prix',
    'SmartPlanning prix',
    'logiciel planning pas cher',
    'tarif per-seat planning',
    'prix gestion equipe',
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
    canonical: `${baseUrl}/tarifs`,
    languages: {
      'fr-FR': `${baseUrl}/tarifs`,
    },
  },

  openGraph: {
    title: 'SmartPlanning — 2,90\u00a0\u20ac/employe/mois, tout inclus',
    description:
      'Gerez les plannings de votre equipe a partir de 2,90\u00a0\u20ac par employe. Sans engagement, essai gratuit 21 jours.',
    type: 'website',
    url: `${baseUrl}/tarifs`,
    siteName: 'SmartPlanning',
    locale: 'fr_FR',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SmartPlanning — 2,90\u00a0\u20ac/employe/mois',
    description:
      'Tarif unique, toutes fonctionnalites incluses. Essai gratuit 21 jours.',
    creator: '@smartplanning',
  },

  authors: [{ name: 'SmartPlanning', url: baseUrl }],
  creator: 'SmartPlanning',
  publisher: 'SmartPlanning',
  category: 'Technology',
  classification: 'Business Software',
}

export default function TarifsPage() {
  return (
    <>
      <StructuredData />
      <PricingPageContent />
    </>
  )
}
