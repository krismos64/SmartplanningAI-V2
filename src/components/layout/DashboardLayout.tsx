'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

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

type UserRole = 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

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
                <Breadcrumbs pathname={pathname} />

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
}

function Breadcrumbs({ pathname }: BreadcrumbsProps) {
  const pathSegments = pathname
    .split('/')
    .filter((segment) => segment)
    .filter((segment) => segment !== 'dashboard')

  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join('/')}`
    const label = formatBreadcrumbLabel(segment)
    const isLast = index === pathSegments.length - 1

    return {
      href,
      label,
      isLast,
    }
  })

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Accueil</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbs.map((breadcrumb) => (
          <div key={breadcrumb.href} className="flex items-center gap-2">
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

function formatBreadcrumbLabel(segment: string): string {
  // Convertir les segments d'URL en labels lisibles
  const labelMap: Record<string, string> = {
    'super-admin': 'Administration',
    organizations: 'Organisations',
    monitoring: 'Monitoring',
    logs: 'Logs',
    team: 'Équipe',
    schedules: 'Plannings',
    leaves: 'Congés',
    tasks: 'Tâches',
    stats: 'Statistiques',
    incidents: 'Incidents',
    'ai-planning': 'IA Planning',
    settings: 'Paramètres',
    profile: 'Profil',
    notifications: 'Notifications',
  }

  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}
