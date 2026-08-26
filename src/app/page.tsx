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
  title: 'SmartPlanning : plannings, congés et RH pour entreprises',

  description:
    'SmartPlanning (Smart Planning), logiciel français de gestion des plannings et congés pour TPE et PME. Dès 2,90\u00a0\u20ac par employé et par mois, essai 21 jours.',

  keywords: [
    /*
     * « smart planning » en deux mots est volontaire, ce n'est pas une faute.
     *
     * Google traite `smartplanning` et `smart planning` comme deux requetes
     * distinctes : au 26 aout 2026 la premiere sortait en position 6,5, la
     * seconde en position 41 sur 191 impressions. La variante n'existait que
     * dans les `alternateName` du JSON-LD, signal faible, et nulle part dans
     * le contenu visible (56 occurrences accolees contre 2 espacees).
     */
    'smart planning',
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
    'messagerie interne entreprise',
    'import employés CSV Excel',
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
    title: 'SmartPlanning - Plannings, messagerie et RH pour entreprises',
    description:
      'Gérez les plannings, congés et la communication de vos équipes. Messagerie interne, import CSV/Excel. Solution SaaS française, essai gratuit 21 jours.',
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
    title: 'SmartPlanning - Gestion de planning pour entreprises',
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
