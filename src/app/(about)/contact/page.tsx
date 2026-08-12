/**
 * Page Contact
 *
 * Le formulaire vivait jusqu'ici en bas de la landing, a l'ancre `#contact`.
 * Toutes les autres familles de contenu ont leur page, tarifs, a propos,
 * solutions, guides : le contact restait la seule entree du footer a pointer
 * vers un fragment. Une page dediee lui donne une URL indexable, un titre
 * propre et un JSON-LD `ContactPage`.
 *
 * La section landing est remplacee par un bloc d'appel qui renvoie ici : le
 * formulaire n'existe qu'a un seul endroit, pas de contenu duplique au crawl.
 *
 * @ticket SP-574
 */

import { Metadata } from 'next'
import { ContactPageContent } from './ContactPageContent'
import { StructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

export const metadata: Metadata = {
  // Le layout racine applique le template `%s | SmartPlanning` : le suffixe
  // ne doit pas etre repete ici, sous peine d'un titre en double.
  title: 'Contact et support',

  description:
    'Une question sur SmartPlanning, la mise en place ou le tarif ? Notre équipe répond sous 24 h ouvrées. Solution française de gestion de planning pour TPE et PME.',

  keywords: [
    'contact SmartPlanning',
    'support SmartPlanning',
    'démonstration planning',
    'aide logiciel planning',
    'assistance gestion planning',
    'contacter éditeur logiciel RH',
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: `${baseUrl}/contact`,
    languages: {
      'fr-FR': `${baseUrl}/contact`,
    },
  },

  openGraph: {
    title: 'Contact | SmartPlanning',
    description:
      'Décrivez votre équipe et votre organisation actuelle. Notre équipe vous répond sous 24 h ouvrées.',
    type: 'website',
    url: `${baseUrl}/contact`,
    siteName: 'SmartPlanning',
    locale: 'fr_FR',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Contact | SmartPlanning',
    description:
      'Une question sur SmartPlanning ? Réponse sous 24 h ouvrées.',
    creator: '@smartplanning',
  },

  authors: [{ name: 'SmartPlanning', url: baseUrl }],
  creator: 'SmartPlanning',
  publisher: 'SmartPlanning',
  category: 'Technology',
  classification: 'Business Software',
}

export default function ContactPage() {
  return (
    <>
      <StructuredData />
      <ContactPageContent />
    </>
  )
}
