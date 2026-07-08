/**
 * Page Admin — Journal des emails (EmailLog cross-company)
 *
 * Server Component avec filtres URL (searchParams) pour bookmarkability
 * (pattern journal d'audit SP-445). Double protection RBAC :
 * middleware (/app/admin) + hasRequiredRole.
 *
 * Donne la visibilité délivrabilité qui manquait lors de l'incident
 * Sprint 16 (PaymentConfirmed jamais envoyé, détecté tardivement).
 *
 * @ticket SP-545
 */

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'
import { MailCheck } from 'lucide-react'

import {
  getEmailLogsAdmin,
  getEmailLogsKpisAdmin,
} from '@/lib/actions/admin-email-logs'
import {
  EmailLogsKpis,
  EmailLogsFilterBar,
  EmailLogsDataTable,
} from './_components'

export const metadata: Metadata = {
  title: 'Journal des emails | SmartPlanning',
  description:
    'Suivi de la délivrabilité des emails transactionnels de la plateforme SmartPlanning',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // 1. Authentification
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // 2. RBAC côté page (double protection avec middleware)
  if (!hasRequiredRole(session.user.role, 'SYSTEM_ADMIN')) {
    redirect('/app/dashboard')
  }

  // 3. Lire les filtres depuis l'URL (Next.js 15 : searchParams est une Promise)
  const params = await searchParams

  const filters: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value) {
      filters[key] = value
    }
  }

  // 4. Récupérer données + KPIs en parallèle
  const [logsResult, kpisResult] = await Promise.all([
    getEmailLogsAdmin(filters),
    getEmailLogsKpisAdmin(),
  ])

  const data =
    logsResult.success && logsResult.data
      ? logsResult.data
      : { logs: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }

  return (
    <div className="space-y-6" data-testid="admin-emails-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <MailCheck className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Journal des emails
          </h1>
          <p className="text-sm text-muted-foreground">
            Délivrabilité des emails transactionnels (billing, auth, admin)
          </p>
        </div>
      </div>

      {/* KPIs 7 jours */}
      {kpisResult.success && kpisResult.data && (
        <EmailLogsKpis kpis={kpisResult.data} />
      )}

      {/* Filtres URL bookmarkables */}
      <EmailLogsFilterBar />

      {/* Table + pagination */}
      <EmailLogsDataTable data={data} />
    </div>
  )
}
