/**
 * StructuredData Component - Homepage
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org combinant 4 schemas en @graph :
 * - WebSite (identite du site)
 * - Organization (logo pour Google SERP et Knowledge Panel)
 * - SoftwareApplication + Offer (prix per-seat)
 * - FAQPage (FAQ de la landing page)
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-462
 */

import { PRICING, INCLUDED_FEATURES } from '@/lib/config/pricing'
import { faqs, roleDemos } from './(landing)/data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// WebSite Schema
export const webSiteSchema = {
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  name: 'SmartPlanning',
  url: baseUrl,
  description:
    'Logiciel SaaS français de gestion de plannings pour TPE et PME.',
  inLanguage: 'fr-FR',
  publisher: { '@id': `${baseUrl}/#organization` },
}

// Organization Schema (logo pour Google SERP)
export const organizationSchema = {
  '@type': 'Organization',
  '@id': `${baseUrl}/#organization`,
  name: 'SmartPlanning',
  alternateName: 'Smart Planning',
  description:
    'SmartPlanning est un logiciel SaaS français de gestion de planning pour entreprises. Solution moderne et intuitive pour TPE, PME et grandes entreprises.',
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/images/logo-sp.png`,
    width: 512,
    height: 512,
  },
  foundingDate: '2024',
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  sameAs: [
    'https://www.linkedin.com/company/smartplanning',
    'https://twitter.com/smartplanning',
  ],
}

// SoftwareApplication + Offer Schema
export const softwareAppSchema = {
  '@type': 'SoftwareApplication',
  '@id': `${baseUrl}/#software`,
  name: 'SmartPlanning',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Workforce Management Software',
  operatingSystem: 'Web Browser',
  description:
    'Logiciel SaaS de gestion de plannings pour TPE et PME françaises.',
  offers: {
    '@type': 'Offer',
    price: String(PRICING.PRICE_PER_EMPLOYEE),
    priceCurrency: PRICING.CURRENCY,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(PRICING.PRICE_PER_EMPLOYEE),
      priceCurrency: PRICING.CURRENCY,
      unitText: 'employé par mois',
      referenceQuantity: {
        '@type': 'QuantitativeValue',
        value: '1',
        unitCode: 'MON',
      },
    },
    eligibleQuantity: {
      '@type': 'QuantitativeValue',
      minValue: PRICING.MIN_EMPLOYEES,
      maxValue: PRICING.MAX_EMPLOYEES,
    },
    description: `Essai gratuit ${PRICING.TRIAL_DAYS} jours sans carte bancaire. Sans engagement.`,
  },
  featureList: [...INCLUDED_FEATURES],
  provider: {
    '@id': `${baseUrl}/#organization`,
  },
}

// Convertit "2:45" en duration ISO 8601 (PT2M45S)
function durationToIso(duration: string): string {
  const [minutes, seconds] = duration.split(':').map(Number)
  return `PT${minutes}M${seconds}S`
}

// VideoObject Schemas (3 démos par rôle) — boost rich snippets vidéo Google
export const videoSchemas = roleDemos.map((demo) => ({
  '@type': 'VideoObject',
  '@id': `${baseUrl}/#video-${demo.id}`,
  name: `Démo SmartPlanning — Espace ${demo.label}`,
  description: demo.description,
  thumbnailUrl: `${baseUrl}/images/logo-sp.png`,
  uploadDate: demo.uploadDate,
  duration: durationToIso(demo.duration),
  contentUrl: `https://www.youtube.com/watch?v=${demo.videoId}`,
  embedUrl: `https://www.youtube.com/embed/${demo.videoId}`,
  publisher: { '@id': `${baseUrl}/#organization` },
  inLanguage: 'fr-FR',
}))

// FAQPage Schema (depuis les donnees de la landing page)
export const faqPageSchema = {
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export function StructuredData() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      webSiteSchema,
      organizationSchema,
      softwareAppSchema,
      ...videoSchemas,
      faqPageSchema,
    ],
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(combinedSchema, null, 0),
      }}
    />
  )
}
