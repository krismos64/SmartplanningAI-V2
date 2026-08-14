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

import {
  PAGE_LAST_MODIFIED,
  toSchemaDate,
} from '@/app/page-last-modified'

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

// FAQ data shared between JSON-LD and UI
export const PRICING_FAQS = [
  {
    question: 'Combien coûte SmartPlanning ?',
    answer:
      'SmartPlanning coûte 2,90\u00a0\u20ac HT par employé par mois. Toutes les fonctionnalités sont incluses, sans frais cachés.',
  },
  {
    question: "Que se passe-t-il si j'ajoute un employé en cours de mois ?",
    answer:
      'Le prorata est calculé automatiquement. Vous ne payez que les jours restants du mois en cours.',
  },
  {
    question: 'Et si je retire un employé ?',
    answer:
      "Le prorata s'applique également à la baisse. Votre facture du mois suivant sera ajustée.",
  },
  {
    question: "Qu'est-ce qui se passe après les 21 jours d'essai ?",
    answer:
      'Vous choisissez de continuer en entrant vos informations de paiement, ou votre compte est simplement suspendu. Aucun prélèvement automatique.',
  },
  {
    question: 'Comment fonctionne la facturation ?',
    answer:
      'Facturation mensuelle par prélèvement automatique via Stripe. Vous recevez une facture par email chaque mois.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer:
      "Oui, sans engagement. Vous pouvez annuler en 1 clic depuis vos paramètres. Votre accès reste actif jusqu'à la fin du mois payé.",
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Carte bancaire (Visa, Mastercard, American Express) via Stripe, plateforme de paiement sécurisée.',
  },
  {
    question: 'Y a-t-il des frais cachés ?',
    answer:
      'Non. Le tarif de 2,90\u00a0\u20ac/employé/mois inclut toutes les fonctionnalités : plannings, congés, notifications, export, support. Aucun supplément.',
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
    'Tarif unique et transparent : 2,90\u00a0\u20ac HT par employé par mois. Toutes les fonctionnalités incluses.',
  inLanguage: 'fr-FR',
  /*
   * Fraicheur affichee aux moteurs et aux assistants. Une page de tarifs est
   * precisement celle dont un assistant doit pouvoir dater le prix avant de
   * le citer. Lue depuis la meme constante que le `lastmod` du sitemap.
   */
  dateModified: toSchemaDate(PAGE_LAST_MODIFIED.tarifs),
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
