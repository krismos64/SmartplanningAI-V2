/**
 * Page edition Team
 *
 * @description Formulaire de modification d'une equipe existante.
 * Accessible a SYSTEM_ADMIN et DIRECTOR uniquement.
 *
 * @ticket SP-153
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getTeam, getManagersForSelect } from '@/lib/actions/teams'
import { TeamForm } from '@/components/teams'
import { Button } from '@/components/ui/button'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const params = await props.params
  const result = await getTeam(params.id)

  if (!result.success || !result.data) {
    return {
      title: 'Équipe non trouvée | SmartPlanning',
    }
  }

  return {
    title: `Modifier ${result.data.name} | SmartPlanning`,
    description: `Modification de l'équipe ${result.data.name}`,
  }
}

export default async function EditTeamPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN et DIRECTOR peuvent modifier
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR'].includes(role)) {
    redirect('/app/director/teams')
  }

  const result = await getTeam(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const team = result.data

  // Charger les managers disponibles
  const managersResult = await getManagersForSelect(team.companyId)
  const managers = managersResult.success ? (managersResult.data ?? []) : []

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/director/teams/${team.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Modifier l&apos;équipe
          </h1>
          <p className="text-muted-foreground">
            Modifiez les informations de l&apos;équipe {team.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <TeamForm team={team} companyId={team.companyId} managers={managers} />
    </div>
  )
}
