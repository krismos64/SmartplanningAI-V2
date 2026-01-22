/**
 * Hook - useBreadcrumbResolver
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 * @see Context7 - SWR Data Fetching Best Practices
 *
 * OBJECTIF :
 * Résout dynamiquement les segments d'URL contenant des IDs
 * vers des noms lisibles pour les breadcrumbs.
 *
 * FONCTIONNALITÉS :
 * - Détection automatique des patterns d'ID (UUID, CUID, numeric)
 * - Cache SWR avec deduplication (60s)
 * - États de chargement et d'erreur
 * - Mapping des segments vers les types d'entités
 */

'use client'

import useSWR from 'swr'

/**
 * Patterns de détection des IDs
 */
const ID_PATTERNS = {
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  cuid: /^c[a-z0-9]{24,}$/i,
  numeric: /^\d{3,}$/,
}

/**
 * Vérifie si un segment est un ID
 */
export function isIdSegment(segment: string): boolean {
  return (
    ID_PATTERNS.uuid.test(segment) ||
    ID_PATTERNS.cuid.test(segment) ||
    ID_PATTERNS.numeric.test(segment)
  )
}

/**
 * Mapping des segments d'URL vers les types d'entités
 */
const SEGMENT_TO_ENTITY_TYPE: Record<string, string> = {
  employees: 'employees',
  employee: 'employees',
  teams: 'teams',
  team: 'teams',
  companies: 'companies',
  company: 'companies',
  organizations: 'companies',
  organization: 'companies',
  schedules: 'schedules',
  schedule: 'schedules',
  planning: 'schedules',
  plannings: 'schedules',
  leaves: 'leave-requests',
  leave: 'leave-requests',
  'leave-requests': 'leave-requests',
  'leave-request': 'leave-requests',
  conges: 'leave-requests',
}

/**
 * Détermine le type d'entité à partir du segment précédent
 */
export function getEntityTypeFromPreviousSegment(
  previousSegment: string
): string | null {
  const normalized = previousSegment.toLowerCase()
  return SEGMENT_TO_ENTITY_TYPE[normalized] ?? null
}

/**
 * Type de réponse de l'API
 */
interface EntityNameResponse {
  success: boolean
  data?: {
    id: string
    type: string
    name: string
  }
  error?: string
}

/**
 * Fetcher pour SWR
 */
async function fetchEntityName(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch entity name: ${response.status}`)
  }

  const json: unknown = await response.json()
  const data = json as EntityNameResponse

  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'Unknown error')
  }

  return data.data.name
}

/**
 * Options du hook
 */
export interface UseBreadcrumbResolverOptions {
  enabled?: boolean
  dedupingInterval?: number
}

/**
 * Résultat du hook
 */
export interface UseBreadcrumbResolverResult {
  name: string | null
  isLoading: boolean
  error: Error | null
  isId: boolean
}

/**
 * Type pour le retour de SWR
 */
interface SWRResult {
  data: string | undefined
  error: Error | undefined
  isLoading: boolean
}

/**
 * Hook pour résoudre un segment d'URL vers un nom
 */
export function useBreadcrumbResolver(
  segment: string,
  previousSegment: string | null,
  _options: UseBreadcrumbResolverOptions = {}
): UseBreadcrumbResolverResult {
  const { enabled = true, dedupingInterval = 60000 } = _options

  const isId = isIdSegment(segment)
  const entityType = previousSegment
    ? getEntityTypeFromPreviousSegment(previousSegment)
    : null

  const apiUrl =
    isId && entityType && enabled
      ? `/api/entities/${entityType}/${segment}`
      : null

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const result: SWRResult = useSWR(apiUrl, fetchEntityName, {
    dedupingInterval,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    revalidateIfStale: false,
  })

  return {
    name: result.data ?? null,
    isLoading: result.isLoading && isId && !!entityType,
    error: result.error ?? null,
    isId,
  }
}

/**
 * Type pour un segment de breadcrumb résolu
 */
export interface ResolvedBreadcrumbSegment {
  segment: string
  label: string
  href: string
  isLast: boolean
  isLoading: boolean
  isId: boolean
}

/**
 * Mapping des labels statiques
 */
const STATIC_LABELS: Record<string, string> = {
  'super-admin': 'Administration',
  organizations: 'Organisations',
  monitoring: 'Monitoring',
  logs: 'Logs',
  team: 'Équipe',
  teams: 'Équipes',
  employees: 'Employés',
  employee: 'Employé',
  schedules: 'Plannings',
  planning: 'Planning',
  leaves: 'Congés',
  conges: 'Congés',
  'leave-requests': 'Demandes de congés',
  tasks: 'Tâches',
  stats: 'Statistiques',
  incidents: 'Incidents',
  'ai-planning': 'IA Planning',
  settings: 'Paramètres',
  profile: 'Profil',
  notifications: 'Notifications',
  companies: 'Entreprises',
  company: 'Entreprise',
}

/**
 * Hook pour résoudre tous les segments d'un pathname
 */
export function useBreadcrumbsFromPathname(
  pathname: string
): ResolvedBreadcrumbSegment[] {
  const rawSegments = pathname
    .split('/')
    .filter((s) => s && s !== 'app' && s !== 'dashboard')

  return rawSegments.map((segment, index) => {
    const isLast = index === rawSegments.length - 1
    const href = '/app/dashboard/' + rawSegments.slice(0, index + 1).join('/')
    const isId = isIdSegment(segment)

    const staticLabel =
      STATIC_LABELS[segment] ??
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    return {
      segment,
      label: staticLabel,
      href,
      isLast,
      isLoading: false,
      isId,
    }
  })
}

export default useBreadcrumbResolver
