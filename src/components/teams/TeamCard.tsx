/**
 * Carte d'affichage Team
 *
 * @description Affiche les informations d'une equipe dans une carte.
 * Utilise les composants shadcn/ui.
 * Affiche le nom, description, couleur, manager et nombre de membres.
 *
 * @ticket SP-153
 */

'use client'

import { Users, User, Calendar, Edit, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import {
  type TeamWithCounts,
  getTeamInitials,
  formatMembersCount,
  getFullName,
} from '@/lib/validations/team'

// ============================================================================
// Types
// ============================================================================

interface TeamCardProps {
  /** Données de l'équipe */
  team: TeamWithCounts
  /** Afficher les boutons d'action (edit, delete) */
  showActions?: boolean
  /** Callback pour suppression */
  onDelete?: (teamId: string) => void
  /** Loader pendant la suppression */
  isDeleting?: boolean
}

// ============================================================================
// Composant
// ============================================================================

export function TeamCard({
  team,
  showActions = true,
  onDelete,
  isDeleting = false,
}: TeamCardProps) {
  const membersCount = team._count?.employees ?? team.employees?.length ?? 0
  const schedulesCount = team._count?.schedules ?? 0

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg">
      {/* Barre de couleur en haut */}
      <div
        className="absolute left-0 right-0 top-0 h-1"
        style={{ backgroundColor: team.color }}
      />

      <CardHeader className="pb-2 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar équipe avec initiales */}
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold text-white shadow-md"
              style={{ backgroundColor: team.color }}
            >
              {getTeamInitials(team.name)}
            </div>
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              {team.company && (
                <CardDescription className="text-xs">
                  {team.company.name}
                </CardDescription>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        {/* Description */}
        {team.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {team.description}
          </p>
        )}

        {/* Manager */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          {team.manager ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={team.manager.user?.image || undefined} />
                <AvatarFallback className="text-xs">
                  {team.manager.firstName[0]}
                  {team.manager.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{getFullName(team.manager)}</span>
              <Badge variant="secondary" className="text-xs">
                Manager
              </Badge>
            </div>
          ) : (
            <span className="text-sm italic text-muted-foreground">
              Aucun manager assigné
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{membersCount}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatMembersCount(membersCount)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {schedulesCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {schedulesCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {schedulesCount} planning{schedulesCount > 1 ? 's' : ''}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="justify-end gap-2 border-t pt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/director/teams/${team.id}`}>
              <Eye className="mr-1 h-4 w-4" />
              Voir
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/app/director/teams/${team.id}/edit`}>
              <Edit className="mr-1 h-4 w-4" />
              Modifier
            </Link>
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(team.id)}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
