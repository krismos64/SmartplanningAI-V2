/**
 * StructuredData Component - Hub /solutions
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org en @graph :
 * - WebSite / Organization (memes @id que la home)
 * - CollectionPage + BreadcrumbList
 * - ItemList des secteurs publies
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-563
 */

import { webSiteSchema, organizationSchema } from '@/app/StructuredData'
import { getAllSectors } from './data'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export function SectorsHubStructuredData() {
  const hubUrl = `${baseUrl}/solutions`
  const sectors = getAllSectors()

  const collectionPageSchema = {
    '@type': 'CollectionPage',
    '@id': `${hubUrl}/#webpage`,
    url: hubUrl,
    name: 'Logiciel de planning par secteur : restauration, commerce, BTP',
    description:
      'Les pages secteur SmartPlanning : contraintes métier, cas concrets et tarif pour la restauration, le commerce et le BTP.',
    inLanguage: 'fr-FR',
    isPartOf: { '@id': `${baseUrl}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Solutions', item: hubUrl },
      ],
    },
  }

  const itemListSchema = {
    '@type': 'ItemList',
    itemListElement: sectors.map((sector, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: sector.name,
      url: `${baseUrl}/solutions/${sector.slug}`,
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
