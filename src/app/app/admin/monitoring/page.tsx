/**
 * Page Monitoring - Dashboard surveillance système
 *
 * Server Component avec Suspense boundaries.
 * Affiche : statut DB, KPIs SaaS, répartition abonnements.
 * Double protection RBAC : middleware (/app/admin) + hasRequiredRole.
 *
 * @ticket SP-464
 */
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { Activity } from 'lucide-react'

import { getMonitoringSnapshot } from '@/lib/actions/monitoring'
import {
  HealthStatusBadge,
  DatabaseHealthPanel,
  MonitoringKpisGrid,
  SubscriptionBreakdownPanel,
} from '@/components/admin/monitoring'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Monitoring | SmartPlanning',
  description:
    'Surveillance système et performance en temps réel de la plateforme SmartPlanning',
}

function MonitoringSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Chargement du monitoring"
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
      {/* KPI grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
      {/* Panels skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <Activity className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold">Erreur de chargement</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

async function MonitoringContent() {
  const result = await getMonitoringSnapshot()

  if (!result.success) {
    return <ErrorState message={result.error} />
  }

  const { health, quickStats, subscriptionBreakdown, timestamp } = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Activity className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Monitoring système
            </h1>
            <p className="text-sm text-muted-foreground">
              Surveillance en temps réel de la plateforme
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <HealthStatusBadge
            status={health.status}
            latency={health.metrics.latency}
          />
          <span className="text-xs text-muted-foreground">
            {new Date(timestamp).toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* KPIs SaaS */}
      <MonitoringKpisGrid
        companies={quickStats.companies}
        users={quickStats.users}
        mrr={quickStats.mrr}
        churn={quickStats.churn}
      />

      {/* Panneaux détail */}
      <div className="grid gap-6 md:grid-cols-2">
        <DatabaseHealthPanel health={health} />
        <SubscriptionBreakdownPanel breakdown={subscriptionBreakdown} />
      </div>
    </div>
  )
}

export default async function MonitoringPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <Suspense fallback={<MonitoringSkeleton />}>
      <MonitoringContent />
    </Suspense>
  )
}
