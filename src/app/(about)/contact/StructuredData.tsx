/**
 * StructuredData Component - Page Contact
 *
 * Donnees structurees Schema.org pour :
 * - Google Rich Results (ContactPage, ContactPoint)
 * - Decouverte par les assistants (ChatGPT, Claude, Perplexity, Gemini)
 *
 * @security Donnees statiques et controlees, aucun contenu utilisateur
 * n'est injecte.
 *
 * @ticket SP-574
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

/** Point de contact, rattache a l'organisation deja declaree sur la landing. */
export const contactPointSchema = {
  '@type': 'ContactPoint',
  '@id': `${baseUrl}/contact#contactpoint`,
  contactType: 'customer support',
  email: 'contact@smartplanning.fr',
  availableLanguage: {
    '@type': 'Language',
    name: 'French',
    alternateName: 'fr',
  },
  areaServed: 'FR',
}

export const contactPageSchema = {
  '@type': 'ContactPage',
  '@id': `${baseUrl}/contact#webpage`,
  url: `${baseUrl}/contact`,
  name: 'Contact | SmartPlanning',
  description:
    'Une question sur SmartPlanning, la mise en place ou le tarif ? Notre équipe répond sous 24 h ouvrées.',
  inLanguage: 'fr-FR',
  isPartOf: {
    '@id': `${baseUrl}/#website`,
  },
  about: {
    '@id': `${baseUrl}/#organization`,
  },
  mainEntity: contactPointSchema,
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
        name: 'Contact',
        item: `${baseUrl}/contact`,
      },
    ],
  },
}

export function StructuredData() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [contactPageSchema],
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
