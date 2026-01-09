/**
 * Page detail Team
 *
 * @description Affiche les details d'une equipe et ses membres.
 * Accessible a SYSTEM_ADMIN, DIRECTOR et MANAGER (pour ses equipes).
 *
 * @ticket SP-153
 */

import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Users, Calendar } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getTeam } from '@/lib/actions/teams'
import { TeamMembersManager } from '@/components/teams'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  getTeamInitials,
  getFullName,
  formatMembersCount,
} from '@/lib/validations/team'

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
    title: `${result.data.name} | SmartPlanning`,
    description:
      result.data.description || `Détails de l'équipe ${result.data.name}`,
  }
}

export default async function TeamDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Seuls SYSTEM_ADMIN, DIRECTOR et MANAGER ont acces
  const role = session.user.role as string
  if (!['SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER'].includes(role)) {
    redirect('/app')
  }

  const result = await getTeam(params.id)

  if (!result.success || !result.data) {
    notFound()
  }

  const team = result.data
  const canEdit = ['SYSTEM_ADMIN', 'DIRECTOR'].includes(role)
  const membersCount = team._count?.employees ?? team.employees.length
  const schedulesCount = team._count?.schedules ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/director/teams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            {/* Avatar équipe */}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: team.color }}
            >
              {getTeamInitials(team.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{team.name}</h1>
              {team.company && (
                <p className="text-muted-foreground">{team.company.name}</p>
              )}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/app/director/teams/${team.id}/members`}>
                <Users className="mr-2 h-4 w-4" />
                Gérer les membres
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/app/director/teams/${team.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations principales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Description */}
            {team.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="mt-1">{team.description}</p>
              </div>
            )}

            {/* Manager */}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Manager
              </p>
              <div className="mt-2">
                {team.manager ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={team.manager.user?.image || undefined}
                      />
                      <AvatarFallback>
                        {team.manager.firstName[0]}
                        {team.manager.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getFullName(team.manager)}</p>
                      {team.manager.user?.email && (
                        <p className="text-sm text-muted-foreground">
                          {team.manager.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="italic text-muted-foreground">
                    Aucun manager assigné
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{membersCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatMembersCount(membersCount)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{schedulesCount}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Planning{schedulesCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membres */}
        <TeamMembersManager team={team} readOnly={!canEdit} />
      </div>
    </div>
  )
}
