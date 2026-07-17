/**
 * Page secteur /solutions/[slug]
 *
 * @description Template SEO/GEO des pages secteur (SP-552), genere en
 * statique a partir du registre data/ (dynamicParams = false : tout slug
 * inconnu retourne un 404). Premiere declinaison : restauration (SP-553).
 *
 * @ticket SP-552, SP-553
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllSectors, getSectorBySlug } from '../data'
import { SectorContent } from '../components/SectorContent'
import { SectorStructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// SSG strict : seuls les slugs du registre existent
export const dynamicParams = false

export function generateStaticParams() {
  return getAllSectors().map((sector) => ({ slug: sector.slug }))
}

interface SectorPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: SectorPageProps): Promise<Metadata> {
  const { slug } = await params
  const sector = getSectorBySlug(slug)
  if (!sector) return {}

  const pageUrl = `${baseUrl}/solutions/${sector.slug}`

  return {
    title: sector.metaTitle,
    description: sector.metaDescription,
    keywords: sector.keywords,
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
      canonical: pageUrl,
      languages: {
        'fr-FR': pageUrl,
      },
    },
    openGraph: {
      title: sector.metaTitle,
      description: sector.metaDescription,
      type: 'website',
      url: pageUrl,
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
      title: sector.metaTitle,
      description: sector.metaDescription,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function SectorPage({ params }: SectorPageProps) {
  const { slug } = await params
  const sector = getSectorBySlug(slug)
  if (!sector) notFound()

  return (
    <>
      <SectorStructuredData sector={sector} />
      <SectorContent sector={sector} />
    </>
  )
}
