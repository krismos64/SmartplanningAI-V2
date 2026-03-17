/**
 * Page gestion des membres Team
 *
 * @description Interface dediee a la gestion des membres d'une equipe.
 * Permet d'ajouter et retirer des membres avec confirmation.
 * Accessible a SYSTEM_ADMIN, DIRECTOR et MANAGER (pour ses equipes).
 *
 * @ticket SP-153
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getTeam } from '@/lib/actions/teams'
import { TeamMembersManager } from '@/components/teams'
import { Button } from '@/components/ui/button'
import { getTeamInitials } from '@/lib/validations/team'

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
    title: `Membres de ${result.data.name} | SmartPlanning`,
    description: `Gestion des membres de l'équipe ${result.data.name}`,
  }
}

export default async function TeamMembersPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // SYSTEM_ADMIN, DIRECTOR et MANAGER peuvent gerer les membres
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app')
  }

  const result = await getTeam(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const team = result.data

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/app/director/teams/${team.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white"
            style={{ backgroundColor: team.color }}
          >
            {getTeamInitials(team.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Gérer les membres
            </h1>
            <p className="text-muted-foreground">{team.name}</p>
          </div>
        </div>
      </div>

      {/* Manager des membres */}
      <TeamMembersManager team={team} />
    </div>
  )
}
