'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

import { SidebarProvider } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { getDefaultDashboardForRole } from '@/lib/permissions'

type UserRole = 'SYSTEM_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: UserRole
    organizationId?: string
  }
  notificationsCount?: number
}

export function DashboardLayout({
  children,
  user,
  notificationsCount = 0,
}: DashboardLayoutProps) {
  const pathname = usePathname()
  const homePath = getDefaultDashboardForRole(user.role)

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar user={user} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <Header user={user} notificationsCount={notificationsCount} />

          {/* Page content */}
          <main className="flex-1">
            <ScrollArea className="h-[calc(100vh-4rem-3.5rem)]">
              <div className="container mx-auto p-6">
                {/* Breadcrumbs */}
                <Breadcrumbs pathname={pathname} homePath={homePath} />

                {/* Page content with Suspense boundary */}
                <Suspense
                  fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-64 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  }
                >
                  {children}
                </Suspense>
              </div>
            </ScrollArea>
          </main>

          {/* Footer */}
          <Footer variant="dashboard" />
        </div>
      </div>
    </SidebarProvider>
  )
}

interface BreadcrumbsProps {
  pathname: string
  homePath: string
}

function Breadcrumbs({ pathname, homePath }: BreadcrumbsProps) {
  // Filtrer les segments non pertinents (app, dashboard seul)
  const pathSegments = pathname
    .split('/')
    .filter((segment) => segment && segment !== 'app')

  // Ne pas afficher les breadcrumbs sur la page d'accueil
  if (pathSegments.length === 0 || pathname === homePath) {
    return null
  }

  // Construire les breadcrumbs avec les bons hrefs
  const breadcrumbs = buildBreadcrumbs(pathSegments)

  // Si on n'a qu'un segment "dashboard", ne pas afficher
  if (breadcrumbs.length === 1 && breadcrumbs[0]?.segment === 'dashboard') {
    return null
  }

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* Home link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={homePath} className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="sr-only md:not-sr-only">Accueil</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path segments */}
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1

          return (
            <div key={breadcrumb.href} className="flex items-center gap-2">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

interface BreadcrumbData {
  href: string
  label: string
  segment: string
}

/**
 * Construit les breadcrumbs à partir des segments de chemin
 * Gère les cas spéciaux : IDs dynamiques, new, edit, members
 */
function buildBreadcrumbs(segments: string[]): BreadcrumbData[] {
  const breadcrumbs: BreadcrumbData[] = []
  let currentPath = '/app'

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (!segment) continue

    const prevSegment = segments[i - 1]
    currentPath += `/${segment}`

    // Ignorer certains segments internes
    if (shouldSkipSegment(segment)) {
      continue
    }

    // Déterminer le label approprié
    const label = formatBreadcrumbLabel(segment, prevSegment)

    breadcrumbs.push({
      href: currentPath,
      label,
      segment,
    })
  }

  return breadcrumbs
}

/**
 * Détermine si un segment doit être ignoré dans les breadcrumbs
 */
function shouldSkipSegment(segment: string): boolean {
  // Toujours ignorer _components
  if (segment.startsWith('_')) {
    return true
  }

  return false
}

/**
 * Formate un segment en label lisible
 * Gère les IDs dynamiques, les actions (new, edit) et les modules
 */
function formatBreadcrumbLabel(segment: string, prevSegment?: string): string {
  // Actions spéciales
  if (segment === 'new') {
    return 'Nouveau'
  }
  if (segment === 'edit') {
    return 'Modifier'
  }
  if (segment === 'members') {
    return 'Membres'
  }

  // IDs dynamiques (CUID, UUID ou numérique)
  if (isIdSegment(segment)) {
    return getEntityLabel(prevSegment)
  }

  // Labels statiques connus
  const labelMap: Record<string, string> = {
    // Routes principales
    dashboard: 'Tableau de bord',
    admin: 'Administration',
    director: 'Direction',
    manager: 'Management',

    // Modules CRUD
    companies: 'Entreprises',
    employees: 'Employés',
    teams: 'Équipes',

    // Planning
    schedules: 'Plannings',
    leaves: 'Congés',
    tasks: 'Tâches',

    // Analytics
    stats: 'Statistiques',
    incidents: 'Incidents',
    'ai-planning': 'IA Planning',

    // Système
    monitoring: 'Monitoring',
    logs: 'Logs système',
    settings: 'Paramètres',
    profile: 'Profil',
    notifications: 'Notifications',

    // Anciens labels
    'super-admin': 'Administration',
    organizations: 'Organisations',
    team: 'Équipe',
  }

  return labelMap[segment] || capitalizeFirst(segment)
}

/**
 * Vérifie si un segment est un ID dynamique
 */
function isIdSegment(segment: string): boolean {
  // CUID (25 caractères alphanumériques commençant par c)
  if (/^c[a-z0-9]{24,}$/i.test(segment)) {
    return true
  }
  // UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return true
  }
  // ID numérique
  if (/^\d+$/.test(segment)) {
    return true
  }
  return false
}

/**
 * Retourne un label générique pour une entité basé sur le segment parent
 */
function getEntityLabel(parentSegment?: string): string {
  const entityLabels: Record<string, string> = {
    companies: 'Entreprise',
    employees: 'Employé',
    teams: 'Équipe',
    schedules: 'Planning',
    leaves: 'Congé',
    tasks: 'Tâche',
  }

  return entityLabels[parentSegment || ''] || 'Détails'
}

/**
 * Met en majuscule la première lettre
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
