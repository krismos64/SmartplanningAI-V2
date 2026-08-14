/**
 * sitemap.ts - Plan du site pour les moteurs de recherche
 *
 * @description Fichier Metadata API Next.js 15 generant /sitemap.xml
 * Pages publiques avec priorites differenciees :
 * - Pages principales (haute priorite) pour favoriser les sitelinks Google
 * - Pages secteur /solutions/* (0.8) alimentees par le registre (sectors)
 * - Pages legales (basse priorite) pour eviter leur apparition dans les SERP
 *
 * @ticket SP-462, SP-550, SP-552
 */

import type { MetadataRoute } from 'next'

import { getAllSectors } from '@/app/(sectors)/solutions/data'
import { getAllGuides } from '@/app/(guides)/guides/data'
import { PAGE_LAST_MODIFIED } from './page-last-modified'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'

// Pages secteur /solutions/[slug] : chaque secteur porte sa propre date
const sectorEntries: MetadataRoute.Sitemap = getAllSectors().map((sector) => ({
  url: `${baseUrl}/solutions/${sector.slug}`,
  lastModified: new Date(sector.lastModified),
  changeFrequency: 'monthly',
  priority: 0.8,
}))

/*
 * Hub /solutions : la plus recente entre la date du hub lui-meme et celle du
 * secteur le plus recent.
 *
 * La derivation depuis les seuls secteurs ne voyait pas une modification
 * PROPRE au hub. Le 14 aout 2026, le texte de ses cartes a ete raccourci sans
 * qu'aucune page secteur ne bouge : le `lastmod` serait reste au 11 aout,
 * annoncant a Google un contenu inchange alors qu'il avait change.
 */
const sectorsHubEntry: MetadataRoute.Sitemap[number] = {
  url: `${baseUrl}/solutions`,
  lastModified: new Date(
    Math.max(
      PAGE_LAST_MODIFIED.solutionsHub.getTime(),
      ...getAllSectors().map((sector) =>
        new Date(sector.lastModified).getTime()
      )
    )
  ),
  changeFrequency: 'weekly',
  priority: 0.8,
}

// Guides /guides/[slug] : chaque guide porte sa propre date,
// le hub prend la date du guide le plus récent
const guideEntries: MetadataRoute.Sitemap = getAllGuides().map((guide) => ({
  url: `${baseUrl}/guides/${guide.slug}`,
  lastModified: new Date(guide.lastModified),
  changeFrequency: 'monthly',
  priority: 0.7,
}))

const guidesHubEntry: MetadataRoute.Sitemap[number] = {
  url: `${baseUrl}/guides`,
  lastModified: new Date(
    Math.max(
      ...getAllGuides().map((guide) => new Date(guide.lastModified).getTime())
    )
  ),
  changeFrequency: 'weekly',
  priority: 0.7,
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: PAGE_LAST_MODIFIED.home,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tarifs`,
      lastModified: PAGE_LAST_MODIFIED.tarifs,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    sectorsHubEntry,
    ...sectorEntries,
    guidesHubEntry,
    ...guideEntries,
    {
      url: `${baseUrl}/a-propos`,
      lastModified: PAGE_LAST_MODIFIED.aPropos,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: PAGE_LAST_MODIFIED.contact,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cgu`,
      lastModified: PAGE_LAST_MODIFIED.cgu,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cgv`,
      lastModified: PAGE_LAST_MODIFIED.cgv,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: PAGE_LAST_MODIFIED.confidentialite,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/mentions-legales`,
      lastModified: PAGE_LAST_MODIFIED.mentionsLegales,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: PAGE_LAST_MODIFIED.cookies,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
