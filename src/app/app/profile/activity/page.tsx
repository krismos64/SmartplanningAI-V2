/**
 * Page "Mon activité récente" — Profil utilisateur
 *
 * Server Component avec filtres URL (searchParams) pour bookmarkability.
 * Accessible à tous les rôles authentifiés.
 * Le userId vient TOUJOURS de la session JWT.
 *
 * @ticket SP-463
 */

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getUserActivity } from '@/lib/actions/audit-logs'
import { UserActivityTimeline } from './_components/user-activity-timeline'
import { UserActivityFilterBar } from './_components/user-activity-filter-bar'
import { UserActivityPagination } from './_components/user-activity-pagination'

export const metadata: Metadata = {
  title: 'Mon activité | SmartPlanning',
  description:
    "Consultez votre historique d'activité récente sur SmartPlanning",
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function UserActivityPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // 1. Authentification
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // 2. Lire les filtres depuis l'URL (Next.js 15 : searchParams est une Promise)
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const action = typeof params.action === 'string' ? params.action : undefined

  // 3. Récupérer l'activité (isolée au userId de la session)
  const result = await getUserActivity({ page, pageSize: 20, action })

  const data = result.success
    ? result.data
    : { data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/app/profile">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Activity className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mon activité récente
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.total} action{data.total > 1 ? 's' : ''} enregistrée
            {data.total > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filtre */}
      <UserActivityFilterBar />

      {/* Timeline */}
      <UserActivityTimeline logs={data.data} />

      {/* Pagination */}
      <UserActivityPagination
        page={data.page}
        totalPages={data.totalPages}
        total={data.total}
      />
    </div>
  )
}
