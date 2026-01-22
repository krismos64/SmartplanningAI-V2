/**
 * DynamicBreadcrumbs - Fil d'Ariane avec résolution dynamique
 *
 * @ticket SP-264 - Dynamic Breadcrumbs
 * @see Context7 - React Server Components + Client Components
 *
 * OBJECTIF :
 * Affiche un fil d'Ariane avec résolution automatique des IDs
 * vers des noms lisibles via l'API /api/entities/[type]/[id].
 *
 * FONCTIONNALITÉS :
 * - Skeleton loading pour les segments en cours de résolution
 * - Accessibilité ARIA complète
 * - Schema.org BreadcrumbList pour le SEO
 * - Support des thèmes dark/light
 */

'use client'

import { Fragment, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import useSWR from 'swr'

import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mapping des segments statiques vers leurs labels
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
  plannings: 'Plannings',
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
  new: 'Nouveau',
  edit: 'Modifier',
  create: 'Créer',
  details: 'Détails',
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
function isIdSegment(segment: string): boolean {
  return (
    ID_PATTERNS.uuid.test(segment) ||
    ID_PATTERNS.cuid.test(segment) ||
    ID_PATTERNS.numeric.test(segment)
  )
}

/**
 * Détermine le type d'entité à partir du segment
 */
function getEntityType(segment: string): string | null {
  const normalized = segment.toLowerCase()
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
 * Fetcher pour SWR avec typage explicite
 */
async function fetchEntityName(url: string): Promise<string> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`)
  }

  const json: unknown = await response.json()
  const data = json as EntityNameResponse

  if (!data.success || !data.data) {
    throw new Error(data.error ?? 'Unknown error')
  }

  return data.data.name
}

/**
 * Props pour un segment de breadcrumb
 */
interface BreadcrumbSegmentProps {
  segment: string
  previousSegment: string | null
  href: string
  isLast: boolean
  className?: string
}

/**
 * Type pour le retour de SWR
 */
interface SWRResult {
  data: string | undefined
  isLoading: boolean
}

/**
 * Composant pour un segment de breadcrumb avec résolution dynamique
 */
function BreadcrumbSegment({
  segment,
  previousSegment,
  href,
  isLast,
  className,
}: BreadcrumbSegmentProps) {
  const isId = isIdSegment(segment)
  const entityType = previousSegment ? getEntityType(previousSegment) : null

  // Construire l'URL de l'API si c'est un ID
  const apiUrl =
    isId && entityType ? `/api/entities/${entityType}/${segment}` : null

  // Fetch avec SWR - cast explicite pour éviter les erreurs de type
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const swrResult: SWRResult = useSWR(apiUrl, fetchEntityName, {
    dedupingInterval: 60000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    revalidateIfStale: false,
  })

  const resolvedName = swrResult.data
  const isLoading = swrResult.isLoading

  // Déterminer le label à afficher
  let label: string | null = null
  if (isId && resolvedName) {
    label = resolvedName
  } else if (!isId) {
    label =
      STATIC_LABELS[segment.toLowerCase()] ??
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }

  // Afficher le skeleton si en chargement
  if (isId && isLoading) {
    return (
      <BreadcrumbItem className={className}>
        <Skeleton
          className="h-4 w-24"
          aria-label="Chargement du nom..."
          data-testid="breadcrumb-skeleton"
        />
      </BreadcrumbItem>
    )
  }

  // Afficher le label (ou l'ID tronqué si pas de résolution)
  const displayLabel = label ?? (isId ? `${segment.slice(0, 8)}...` : segment)

  if (isLast) {
    return (
      <BreadcrumbItem className={className}>
        <BreadcrumbPage
          className="max-w-48 truncate font-medium"
          title={displayLabel}
        >
          {displayLabel}
        </BreadcrumbPage>
      </BreadcrumbItem>
    )
  }

  return (
    <BreadcrumbItem className={className}>
      <BreadcrumbLink asChild>
        <Link
          href={href}
          className="max-w-48 truncate transition-colors hover:text-foreground"
          title={displayLabel}
        >
          {displayLabel}
        </Link>
      </BreadcrumbLink>
    </BreadcrumbItem>
  )
}

/**
 * Props du composant DynamicBreadcrumbs
 */
export interface DynamicBreadcrumbsProps {
  pathname: string
  showHomeIcon?: boolean
  homeLabel?: string
  homeHref?: string
  className?: string
}

/**
 * Génère les données structurées Schema.org pour le SEO
 */
function generateSchemaData(
  segments: string[],
  homeLabel: string,
  homeHref: string,
  origin: string
) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeLabel,
      item: `${origin}${homeHref}`,
    },
    ...segments.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: STATIC_LABELS[segment.toLowerCase()] ?? segment,
      item: `${origin}/app/dashboard/${segments.slice(0, index + 1).join('/')}`,
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

/**
 * Composant DynamicBreadcrumbs
 */
export function DynamicBreadcrumbs({
  pathname,
  showHomeIcon = true,
  homeLabel = 'Accueil',
  homeHref = '/app/dashboard',
  className,
}: DynamicBreadcrumbsProps) {
  // Parser le pathname et extraire les segments
  const segments = useMemo(() => {
    return pathname
      .split('/')
      .filter((s) => s && s !== 'app' && s !== 'dashboard')
  }, [pathname])

  // Construire les données structurées Schema.org
  const schemaData = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return generateSchemaData(segments, homeLabel, homeHref, origin)
  }, [segments, homeLabel, homeHref])

  // Ne pas afficher si pas de segments
  if (segments.length === 0) {
    return null
  }

  return (
    <>
      {/* Schema.org pour SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Breadcrumbs visuels */}
      <Breadcrumb
        className={cn('mb-6', className)}
        aria-label="Fil d'Ariane"
        data-testid="dynamic-breadcrumbs"
      >
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                href={homeHref}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                aria-label={homeLabel}
              >
                {showHomeIcon && (
                  <Home className="h-4 w-4" aria-hidden="true" />
                )}
                <span className={showHomeIcon ? 'sr-only sm:not-sr-only' : ''}>
                  {homeLabel}
                </span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Segments dynamiques */}
          {segments.map((segment, index) => {
            const previousSegment: string | null =
              index > 0 ? (segments[index - 1] ?? null) : null
            const href =
              '/app/dashboard/' + segments.slice(0, index + 1).join('/')
            const isLast = index === segments.length - 1

            return (
              <Fragment key={`${segment}-${index}`}>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </BreadcrumbSeparator>
                <BreadcrumbSegment
                  segment={segment}
                  previousSegment={previousSegment}
                  href={href}
                  isLast={isLast}
                />
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}

export default DynamicBreadcrumbs
