/**
 * Page Journal d'audit - Admin
 *
 * Server Component avec filtres URL (searchParams) pour bookmarkability.
 * Double protection RBAC : middleware (/app/admin) + checkPermission(SYSTEM_ADMIN).
 *
 * @ticket SP-445
 */

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { hasRequiredRole } from '@/lib/permissions'

import { getAuditLogs } from '@/lib/actions/audit-logs'
import { AuditLogsDataTable } from './_components/audit-logs-data-table'

export const metadata: Metadata = {
  title: "Journal d'audit | SmartPlanning",
  description:
    "Consultation des logs d'audit et traçabilité des actions sur la plateforme SmartPlanning",
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // 1. Authentification
  const session = await auth()

  if (!session?.user) {
    redirect('/connexion')
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

  // 4. Récupérer les données
  const result = await getAuditLogs(filters)

  // 5. Fallback si erreur
  const data = result.success
    ? result.data
    : { data: [], total: 0, page: 1, pageSize: 25, totalPages: 0 }

  return (
    <div className="space-y-6">
      <AuditLogsDataTable data={data} />
    </div>
  )
}
