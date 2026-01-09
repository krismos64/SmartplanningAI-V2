/**
 * Page liste des Teams (RBAC multi-role)
 *
 * @description Liste des equipes avec filtres, tri et actions CRUD.
 * Accessible a SYSTEM_ADMIN et DIRECTOR avec acces complet.
 * MANAGER peut voir uniquement ses equipes.
 *
 * @ticket SP-153
 */

import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Users } from 'lucide-react'

import { listTeams } from '@/lib/actions/teams'
import { TeamsDataTable } from '@/components/teams'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Gestion des équipes | SmartPlanning',
  description: 'Administration des équipes et de leurs membres',
}

function TeamsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}

async function TeamsContent() {
  const result = await listTeams({ page: 1, pageSize: 100 }, {})

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          Erreur lors du chargement des équipes
        </p>
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </div>
    )
  }

  const teams = result.data?.data ?? []

  return <TeamsDataTable teams={teams} showCreateButton />
}

export default async function TeamsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Équipes</h1>
          <p className="text-muted-foreground">
            Gérez vos équipes et leurs membres
          </p>
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<TeamsTableSkeleton />}>
        <TeamsContent />
      </Suspense>
    </div>
  )
}
