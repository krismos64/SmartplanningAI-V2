/**
 * Page Admin — Abonnements & Paiements cross-company
 *
 * Server Component avec RBAC double (middleware + hasRequiredRole).
 * KPIs de synthèse (MRR service partagé SP-469), table des abonnements
 * et historique des paiements cross-tenant.
 *
 * @ticket SP-542
 */

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { CreditCard } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { getSubscriptionsSummaryAdmin } from '@/lib/actions/admin-subscriptions'
import {
  SubscriptionsSummaryCards,
  SubscriptionsDataTable,
  PaymentsDataTable,
} from './_components'

export const metadata: Metadata = {
  title: 'Abonnements | SmartPlanning',
  description:
    'Administration des abonnements et paiements de toutes les entreprises clientes',
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
  )
}

async function SummarySection() {
  const summary = await getSubscriptionsSummaryAdmin()
  return <SubscriptionsSummaryCards summary={summary} />
}

export default async function AdminSubscriptionsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  return (
    <div className="space-y-6" data-testid="admin-subscriptions-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <CreditCard className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Abonnements & Paiements
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue cross-entreprises des abonnements et de l&apos;historique des
            paiements
          </p>
        </div>
      </div>

      {/* KPIs de synthèse */}
      <Suspense fallback={<SummarySkeleton />}>
        <SummarySection />
      </Suspense>

      {/* Table abonnements */}
      <SubscriptionsDataTable />

      {/* Historique paiements */}
      <PaymentsDataTable />
    </div>
  )
}
