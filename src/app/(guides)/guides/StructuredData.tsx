/**
 * StructuredData Component - Hub /guides
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org en @graph :
 * - WebSite / Organization (memes @id que la home)
 * - CollectionPage + BreadcrumbList
 * - ItemList des guides publies
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-555
 */

import { webSiteSchema, organizationSchema } from '@/app/StructuredData'
import { getAllGuides } from './data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export function GuidesHubStructuredData() {
  const hubUrl = `${baseUrl}/guides`
  const guides = getAllGuides()

  const collectionPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${hubUrl}/#webpage`,
    url: hubUrl,
    name: 'Guides pratiques planning et RH pour TPE/PME',
    description:
      'Guides pratiques SmartPlanning : méthodes de planning, gestion des congés payés et règles légales pour TPE et PME.',
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: hubUrl },
      ],
    },
  }

  const itemListSchema = {
    '@type': 'ItemList',
    itemListElement: guides.map((guide, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: guide.title,
      url: `${baseUrl}/guides/${guide.slug}`,
    })),
  }

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      webSiteSchema,
      organizationSchema,
      collectionPageSchema,
      itemListSchema,
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
