/**
 * StructuredData Component - Pages secteur /solutions/[slug]
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org en @graph :
 * - WebSite / Organization / SoftwareApplication (reutilises depuis la home,
 *   memes @id pour consolider le knowledge graph)
 * - WebPage + BreadcrumbList (page secteur, dateModified reelle)
 * - FAQPage (FAQ du secteur, aussi rendue dans l'UI)
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-552
 */

import {
  webSiteSchema,
  organizationSchema,
  softwareAppSchema,
} from '@/app/StructuredData'
import type { SectorData } from '../data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

interface SectorStructuredDataProps {
  sector: SectorData
}

export function SectorStructuredData({ sector }: SectorStructuredDataProps) {
  const pageUrl = `${baseUrl}/solutions/${sector.slug}`

  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${pageUrl}/#webpage`,
    url: pageUrl,
    name: sector.metaTitle,
    description: sector.metaDescription,
    inLanguage: 'fr-FR',
    dateModified: sector.lastModified,
    isPartOf: { '@id': `${baseUrl}/#website` },
    about: { '@id': `${baseUrl}/#software` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: sector.name,
          item: pageUrl,
        },
      ],
    },
  }

  const faqPageSchema = {
    '@type': 'FAQPage',
    mainEntity: sector.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      webSiteSchema,
      organizationSchema,
      softwareAppSchema,
      webPageSchema,
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
