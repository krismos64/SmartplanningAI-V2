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
import { faqs } from './(landing)/data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// WebSite Schema
export const webSiteSchema = {
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  name: 'SmartPlanning',
  url: baseUrl,
  description:
    'Logiciel SaaS francais de gestion de plannings pour TPE et PME.',
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
    'SmartPlanning est un logiciel SaaS francais de gestion de planning pour entreprises. Solution moderne et intuitive pour TPE, PME et grandes entreprises.',
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
    'Logiciel SaaS de gestion de plannings pour TPE et PME francaises.',
  offers: {
    '@type': 'Offer',
    price: String(PRICING.PRICE_PER_EMPLOYEE),
    priceCurrency: PRICING.CURRENCY,
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: String(PRICING.PRICE_PER_EMPLOYEE),
      priceCurrency: PRICING.CURRENCY,
      unitText: 'employe par mois',
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
