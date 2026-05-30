/**
 * StructuredData Component
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Données structurées Schema.org pour :
 * - Référencement Google (rich snippets)
 * - Découvrabilité par LLMs (ChatGPT, Claude, Perplexity, Gemini)
 * - Partage sur réseaux sociaux
 *
 * @security Les données JSON-LD sont statiques et contrôlées,
 * aucun contenu utilisateur n'est injecté.
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// Organization Schema - Information sur l'entreprise
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${baseUrl}/#organization`,
  name: 'SmartPlanning',
  alternateName: 'Smart Planning',
  description:
    'SmartPlanning est un logiciel SaaS français de gestion de planning pour entreprises. Solution moderne et intuitive pour les TPE et PME.',
  url: baseUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${baseUrl}/images/logo-sp.png`,
    width: 512,
    height: 512,
  },
  image: `${baseUrl}/images/og-about.png`,
  foundingDate: '2024',
  foundingLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Artix',
      postalCode: '64170',
      addressCountry: 'FR',
    },
  },
  areaServed: {
    '@type': 'Country',
    name: 'France',
  },
  slogan: 'Simplifier la gestion des plannings pour les TPE et PME',
  knowsAbout: [
    'Gestion de planning',
    'Planning équipe',
    'Ressources humaines',
    'Organisation du travail',
    'SaaS B2B',
    'Logiciel RH',
  ],
  sameAs: [
    'https://www.linkedin.com/company/smartplanning-fr',
    'https://www.youtube.com/@SmartPlanning-x2c',
    'https://twitter.com/smartplanning',
  ],
}

// SoftwareApplication Schema - Information sur le produit
export const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${baseUrl}/#software`,
  name: 'SmartPlanning',
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Workforce Management Software',
  operatingSystem: 'Web Browser',
  description:
    'Logiciel de gestion de planning en ligne pour entreprises. Créez, gérez et partagez vos plannings. Solution française, sécurisée et intuitive.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Essai gratuit disponible',
  },
  featureList: [
    'Création de planning par glisser-déposer',
    'Gestion des équipes et des postes',
    'Notifications automatiques',
    'Export PDF et Excel',
    'Application mobile responsive',
    'Synchronisation en temps réel',
  ],
  screenshot: `${baseUrl}/images/manager.png`,
  softwareVersion: '1.0',
  releaseNotes: 'Version initiale avec gestion complète des plannings',
  provider: {
    '@id': `${baseUrl}/#organization`,
  },
}

// AboutPage Schema - Information sur cette page spécifique
export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${baseUrl}/a-propos/#webpage`,
  url: `${baseUrl}/a-propos`,
  name: 'À propos de SmartPlanning',
  description:
    'Découvrez SmartPlanning : notre mission de simplifier la gestion des plannings pour les TPE et PME. Nos valeurs : Simplicité, Proximité, Fiabilité.',
  inLanguage: 'fr-FR',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'SmartPlanning',
    url: baseUrl,
  },
  about: {
    '@id': `${baseUrl}/#organization`,
  },
  mainEntity: {
    '@id': `${baseUrl}/#organization`,
  },
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
        name: 'À propos',
        item: `${baseUrl}/a-propos`,
      },
    ],
  },
}

// FAQPage Schema - Questions fréquentes implicites
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Qu est-ce que SmartPlanning ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SmartPlanning est un logiciel SaaS français de gestion de planning pour entreprises. Il permet de créer, gérer et partager des plannings de manière simple et intuitive.',
      },
    },
    {
      '@type': 'Question',
      name: 'À qui SmartPlanning est-il destiné ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'SmartPlanning est destiné aux TPE et PME : managers, responsables RH, industrie, santé, commerce et services. Quel que soit votre secteur.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quelles sont les valeurs de SmartPlanning ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les trois valeurs fondamentales de SmartPlanning sont : la Simplicité (interface intuitive, prise en main rapide), la Proximité (support réactif, co-construction avec les utilisateurs), et la Fiabilité (sécurité des données, disponibilité maximale).',
      },
    },
    {
      '@type': 'Question',
      name: 'SmartPlanning est-il une solution française ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, SmartPlanning est une solution 100% française, conçue et hébergée en France. Nous respectons le RGPD et garantissons la sécurité de vos données.',
      },
    },
  ],
}

/**
 * StructuredData Component
 * Renders JSON-LD scripts in the head for SEO
 */
export function StructuredData() {
  // Combine all schemas into a graph for better SEO
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, softwareSchema, aboutPageSchema, faqSchema],
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
