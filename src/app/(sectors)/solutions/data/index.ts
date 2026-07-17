/**
 * index.ts - Registre des pages secteur /solutions/[slug]
 *
 * @description Source unique des secteurs publiés. Ajouter un secteur :
 * créer son fichier de données (voir restauration.ts) puis l'enregistrer
 * ici. Le sitemap, generateStaticParams et le footer s'alimentent tous
 * depuis ce registre.
 *
 * @ticket SP-552
 */

import type { SectorData } from './types'
import { restaurationSector } from './restauration'
import { commerceSector } from './commerce'

export type { SectorData, SectorFaq, SectorIconName } from './types'

const SECTORS: readonly SectorData[] = [restaurationSector, commerceSector]

export function getAllSectors(): readonly SectorData[] {
  return SECTORS
}

export function getSectorBySlug(slug: string): SectorData | undefined {
  return SECTORS.find((sector) => sector.slug === slug)
}
