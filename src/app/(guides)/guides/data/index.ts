/**
 * index.ts - Registre des guides pratiques /guides/[slug]
 *
 * @description Source unique des guides publiés. Ajouter un guide :
 * créer son fichier de données puis l'enregistrer ici. Le hub /guides,
 * le sitemap et generateStaticParams s'alimentent depuis ce registre.
 *
 * @ticket SP-555
 */

import type { GuideData } from './types'
import { planningEquipeGuide } from './faire-un-planning-equipe'
import { congesPayesGuide } from './gerer-conges-payes'
import { coupureAmplitudeHcrGuide } from './coupure-amplitude-hcr'

export type { GuideData, GuideFaq, GuideSection } from './types'

const GUIDES: readonly GuideData[] = [
  planningEquipeGuide,
  congesPayesGuide,
  coupureAmplitudeHcrGuide,
]

export function getAllGuides(): readonly GuideData[] {
  return GUIDES
}

export function getGuideBySlug(slug: string): GuideData | undefined {
  return GUIDES.find((guide) => guide.slug === slug)
}
