/**
 * StructuredData Component - Guides /guides/[slug]
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org en @graph :
 * - WebSite / Organization (memes @id que la home)
 * - Article (headline, dates reelles, auteur Organization)
 * - BreadcrumbList 3 niveaux (Accueil > Guides > guide)
 * - FAQPage (FAQ du guide, aussi rendue dans l'UI)
 * - HowTo si le guide contient des sections etapes (stepName)
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-555
 */

import { webSiteSchema, organizationSchema } from '@/app/StructuredData'
import type { GuideData } from '../data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

interface GuideStructuredDataProps {
  guide: GuideData
}

export function GuideStructuredData({ guide }: GuideStructuredDataProps) {
  const pageUrl = `${baseUrl}/guides/${guide.slug}`

  const articleSchema = {
    '@type': 'Article',
    '@id': `${pageUrl}/#article`,
    headline: guide.title,
    description: guide.metaDescription,
    inLanguage: 'fr-FR',
    datePublished: guide.datePublished,
    dateModified: guide.lastModified,
    author: { '@id': `${baseUrl}/#organization` },
    publisher: { '@id': `${baseUrl}/#organization` },
    mainEntityOfPage: pageUrl,
    isPartOf: { '@id': `${baseUrl}/#website` },
  }

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Guides',
        item: `${baseUrl}/guides`,
      },
      { '@type': 'ListItem', position: 3, name: guide.title, item: pageUrl },
    ],
  }

  const faqPageSchema = {
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const steps = guide.sections.filter((section) => section.stepName)
  const howToSchema =
    steps.length > 0
      ? {
          '@type': 'HowTo',
          '@id': `${pageUrl}/#howto`,
          name: guide.title,
          description: guide.directAnswer,
          inLanguage: 'fr-FR',
          step: steps.map((section) => ({
            '@type': 'HowToStep',
            name: section.stepName,
            text: section.paragraphs.join(' '),
            url: `${pageUrl}#${section.id}`,
          })),
        }
      : null

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      webSiteSchema,
      organizationSchema,
      articleSchema,
      breadcrumbSchema,
      faqPageSchema,
      ...(howToSchema ? [howToSchema] : []),
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
