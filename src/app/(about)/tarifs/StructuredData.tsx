/**
 * StructuredData Component - Page Tarifs
 * JSON-LD structured data for SEO and LLM discoverability
 *
 * @description Donnees structurees Schema.org pour :
 * - Google Rich Results (Offer, FAQPage)
 * - Decouverte par LLMs (ChatGPT, Claude, Perplexity, Gemini)
 *
 * @security Les donnees JSON-LD sont statiques et controlees,
 * aucun contenu utilisateur n'est injecte.
 *
 * @ticket SP-359
 */

import { PRICING, INCLUDED_FEATURES } from '@/lib/config/pricing'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// SoftwareApplication + Offer Schema
export const softwareOfferSchema = {
  '@context': 'https://schema.org',
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

// FAQ data shared between JSON-LD and UI
export const PRICING_FAQS = [
  {
    question: 'Combien coute SmartPlanning ?',
    answer:
      'SmartPlanning coute 2,90\u00a0\u20ac HT par employe par mois. Toutes les fonctionnalites sont incluses, sans frais caches.',
  },
  {
    question: "Que se passe-t-il si j'ajoute un employe en cours de mois ?",
    answer:
      'Le prorata est calcule automatiquement. Vous ne payez que les jours restants du mois en cours.',
  },
  {
    question: 'Et si je retire un employe ?',
    answer:
      "Le prorata s'applique egalement a la baisse. Votre facture du mois suivant sera ajustee.",
  },
  {
    question: "Qu'est-ce qui se passe apres les 21 jours d'essai ?",
    answer:
      'Vous choisissez de continuer en entrant vos informations de paiement, ou votre compte est simplement suspendu. Aucun prelevement automatique.',
  },
  {
    question: 'Comment fonctionne la facturation ?',
    answer:
      'Facturation mensuelle par prelevement automatique via Stripe. Vous recevez une facture par email chaque mois.',
  },
  {
    question: 'Puis-je annuler a tout moment ?',
    answer:
      "Oui, sans engagement. Vous pouvez annuler en 1 clic depuis vos parametres. Votre acces reste actif jusqu'a la fin du mois paye.",
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Carte bancaire (Visa, Mastercard, American Express) via Stripe, plateforme de paiement securisee.',
  },
  {
    question: 'Y a-t-il des frais caches ?',
    answer:
      'Non. Le tarif de 2,90\u00a0\u20ac/employe/mois inclut toutes les fonctionnalites : plannings, conges, notifications, export, support. Aucun supplement.',
  },
] as const

// FAQPage Schema
export const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PRICING_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

// WebPage Schema for breadcrumbs
const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${baseUrl}/tarifs/#webpage`,
  url: `${baseUrl}/tarifs`,
  name: 'Tarifs SmartPlanning',
  description:
    'Tarif unique et transparent : 2,90\u00a0\u20ac HT par employe par mois. Toutes les fonctionnalites incluses.',
  inLanguage: 'fr-FR',
  isPartOf: {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'SmartPlanning',
    url: baseUrl,
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
        name: 'Tarifs',
        item: `${baseUrl}/tarifs`,
      },
    ],
  },
}

export function StructuredData() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [softwareOfferSchema, faqPageSchema, webPageSchema],
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
