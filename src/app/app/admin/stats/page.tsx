/**
 * Page Statistiques globales Admin
 *
 * Server Component affichant les KPIs SaaS, charts Recharts
 * et un bouton d'export PDF. SYSTEM_ADMIN uniquement.
 *
 * @ticket SP-475
 */

import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { getAdminStats } from '@/lib/services/dashboard'
import { BarChart3 } from 'lucide-react'

import {
  StatsKpiGrid,
  StatsGrowthChart,
  StatsRevenueChart,
  StatsSubscriptionChart,
  ExportPdfButton,
} from './_components'

export const metadata = {
  title: 'Statistiques | SmartPlanning Admin',
  description:
    'Statistiques globales de la plateforme SaaS - KPIs, MRR, croissance, abonnements',
}

// ============================================================================
// Loading skeleton
// ============================================================================

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
      </div>
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-96 animate-pulse rounded-lg bg-muted" />
    </div>
  )
}

// ============================================================================
// Error state
// ============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <BarChart3 className="h-8 w-8 text-destructive" aria-hidden />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// ============================================================================
// Stats content (async)
// ============================================================================

async function StatsContent() {
  const statsResult = await getAdminStats()

  if (!statsResult.success || !statsResult.data) {
    return <ErrorState message={statsResult.error ?? 'Erreur inconnue'} />
  }

  const stats = statsResult.data

  return (
    <div className="space-y-6" data-testid="admin-stats-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Statistiques globales
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue d&apos;ensemble de la plateforme SaaS
          </p>
        </div>
        <ExportPdfButton />
      </div>

      {/* KPIs 3x2 */}
      <StatsKpiGrid stats={stats} />

      {/* Charts row 1 : croissance + revenus */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatsGrowthChart companiesGrowth={stats.companiesGrowth} />
        <StatsRevenueChart revenueByPlan={stats.revenueByPlan} />
      </div>

      {/* Chart row 2 : distribution abonnements (pleine largeur) */}
      <StatsSubscriptionChart
        subscriptionStatusDistribution={stats.subscriptionStatusDistribution}
      />
    </div>
  )
}

// ============================================================================
// Page
// ============================================================================

export default async function AdminStatsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsContent />
    </Suspense>
  )
}
