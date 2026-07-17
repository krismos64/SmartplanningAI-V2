/**
 * Page guide /guides/[slug]
 *
 * @description Guides pratiques longs formats (SP-555), generes en
 * statique a partir du registre data/ (dynamicParams = false : tout
 * slug inconnu retourne un 404).
 *
 * @ticket SP-555
 */

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllGuides, getGuideBySlug } from '../data'
import { GuideContent } from '../components/GuideContent'
import { GuideStructuredData } from './StructuredData'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// SSG strict : seuls les slugs du registre existent
export const dynamicParams = false

export function generateStaticParams() {
  return getAllGuides().map((guide) => ({ slug: guide.slug }))
}

interface GuidePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  const pageUrl = `${baseUrl}/guides/${guide.slug}`

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    keywords: guide.keywords,
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
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: 'article',
      publishedTime: guide.datePublished,
      modifiedTime: guide.lastModified,
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
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()

  return (
    <>
      <GuideStructuredData guide={guide} />
      <GuideContent guide={guide} />
    </>
  )
}
