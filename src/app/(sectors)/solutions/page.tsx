/**
 * Hub /solutions - Index des pages secteur
 *
 * @description Page d'index des secteurs couverts (SP-563) : liste les
 * secteurs du registre data/ avec maillage vers les guides. Comble le
 * 404 sur le segment parent des pages /solutions/[slug].
 *
 * @ticket SP-563
 */

import type { Metadata } from 'next'
import { getAllSectors } from './data'
import { getAllGuides } from '@/app/(guides)/guides/data'
import { SectorsHubContent } from './components/SectorsHubContent'
import { SectorsHubStructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'
const hubUrl = `${baseUrl}/solutions`

export const metadata: Metadata = {
  title: 'Logiciel de planning par secteur : restauration, commerce, BTP',
  description:
    'Restauration, commerce, BTP : chaque secteur a ses règles de planning. Découvrez la solution adaptée à votre métier, 2,90 € HT par employé et essai 21 jours.',
  keywords: [
    'logiciel planning par secteur',
    'logiciel planning restauration',
    'logiciel planning commerce',
    'logiciel planning btp',
    'solution planning métier',
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
    title: 'Logiciel de planning par secteur : restauration, commerce, BTP',
    description:
      'Restauration, commerce, BTP : chaque secteur a ses règles de planning. Découvrez la solution adaptée à votre métier.',
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
    title: 'Logiciel de planning par secteur : restauration, commerce, BTP',
    description:
      'Restauration, commerce, BTP : chaque secteur a ses règles de planning. Découvrez la solution adaptée à votre métier.',
    images: [`${baseUrl}/og-image.png`],
  },
}

export default function SectorsHubPage() {
  // Seuls le slug et le titre traversent vers le Client Component : le
  // registre complet embarquerait le texte integral des guides dans le
  // bundle client.
  const guideLinks = getAllGuides().map((guide) => ({
    slug: guide.slug,
    title: guide.title,
  }))

  return (
    <>
      <SectorsHubStructuredData />
      <SectorsHubContent sectors={getAllSectors()} guides={guideLinks} />
    </>
  )
}
