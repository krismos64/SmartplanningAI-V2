/**
 * Hub /guides - Index des guides pratiques
 *
 * @description Page d'index du hub editorial (SP-555) : liste les
 * guides du registre data/ avec maillage vers les pages secteur.
 *
 * @ticket SP-555
 */

import type { Metadata } from 'next'
import { getAllGuides } from './data'
import { GuidesHubContent } from './components/GuidesHubContent'
import { GuidesHubStructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'
const hubUrl = `${baseUrl}/guides`

export const metadata: Metadata = {
  title: 'Guides pratiques planning et RH pour TPE/PME',
  description:
    "Méthodes de planning d'équipe, gestion des congés payés, règles légales : les guides pratiques SmartPlanning pour les TPE et PME, vérifiés et mis à jour.",
  keywords: [
    'guide planning équipe',
    'guide congés payés',
    'ressources RH TPE PME',
    'méthode planning travail',
    'règles légales planning',
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
    canonical: hubUrl,
    languages: {
      'fr-FR': hubUrl,
    },
  },
  openGraph: {
    title: 'Guides pratiques planning et RH pour TPE/PME',
    description:
      "Méthodes de planning d'équipe, gestion des congés payés, règles légales : les guides pratiques SmartPlanning pour les TPE et PME.",
    type: 'website',
    url: hubUrl,
    siteName: 'SmartPlanning',
    locale: 'fr_FR',
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'SmartPlanning - Logiciel de gestion de planning pour entreprises',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guides pratiques planning et RH pour TPE/PME',
    description:
      "Méthodes de planning d'équipe, gestion des congés payés, règles légales : les guides pratiques SmartPlanning.",
    images: [`${baseUrl}/og-image.png`],
  },
}

export default function GuidesHubPage() {
  return (
    <>
      <GuidesHubStructuredData />
      <GuidesHubContent guides={getAllGuides()} />
    </>
  )
}
