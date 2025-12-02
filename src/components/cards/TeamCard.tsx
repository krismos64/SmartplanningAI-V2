'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'
import { MoreVertical, Users, User as UserIcon } from 'lucide-react'
import {
  BaseCardProps,
  TeamCardTeam,
  TeamManager,
  TeamMember,
  TeamStats,
} from './types'
import { AvatarStack } from './AvatarStack'
import { TeamCardSkeleton } from './TeamCardSkeleton'

/**
 * TeamCard - Carte équipe avec variants compact/detailed
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Features :
 * - Variants compact (2-3 lignes) et detailed (multi-lignes)
 * - Bordure gauche colorée (team.color)
 * - Manager affiché
 * - AvatarStack des membres (max 5 + counter)
 * - Stats équipe (actifs, en congé)
 * - Actions dropdown configurables
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <TeamCard
 *   team={{ id: "1", name: "Équipe Frontend", color: "#3B82F6" }}
 *   manager={{ id: "m1", name: "Marie Martin", image: null }}
 *   members={teamMembers}
 *   totalMembers={15}
 *   stats={{ activeCount: 12, onLeaveCount: 3 }}
 *   variant="detailed"
 *   actions={[
 *     { label: "Voir équipe", onClick: () => {} },
 *     { label: "Modifier", onClick: () => {} },
 *   ]}
 * />
 * ```
 */

export interface TeamCardProps extends BaseCardProps {
  /** Données équipe (compatible Prisma Team) */
  team: TeamCardTeam

  /** Manager de l'équipe */
  manager?: TeamManager | null

  /** Membres de l'équipe (pour AvatarStack) */
  members: TeamMember[]

  /** Nombre total de membres (si pagination) */
  totalMembers?: number

  /** Statistiques de l'équipe */
  stats?: TeamStats

  /** Callback au clic sur la carte */
  onClick?: () => void
}

/**
 * Extrait les initiales d'un nom
 */
function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  if (parts.length === 1) {
    return first.charAt(0).toUpperCase()
  }
  return (first.charAt(0) + last.charAt(0)).toUpperCase()
}

export const TeamCard = React.forwardRef<HTMLDivElement, TeamCardProps>(
  (
    {
      team,
      manager,
      members,
      totalMembers,
      stats,
      variant = 'compact',
      actions,
      isLoading,
      onClick,
      className,
    },
    ref
  ) => {
    // État loading : afficher skeleton
    if (isLoading) {
      return <TeamCardSkeleton variant={variant} className={className} />
    }

    const memberCount = totalMembers ?? members.length
    const isClickable = !!onClick

    // Variant COMPACT
    if (variant === 'compact') {
      return (
        <Card
          ref={ref}
          className={cn(
            'overflow-hidden',
            'transition-all duration-200',
            isClickable && 'cursor-pointer hover:bg-accent/50',
            className
          )}
          onClick={onClick}
        >
          {/* Bordure colorée gauche */}
          <div
            className="flex"
            style={{ borderLeft: `4px solid ${team.color}` }}
          >
            <div className="flex-1 p-3">
              {/* Ligne 1 : Nom + count + actions */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-semibold">
                    {team.name}
                  </h3>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {memberCount} membre{memberCount > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Actions dropdown */}
                {actions && actions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'rounded-md p-1 hover:bg-accent',
                          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                        )}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Actions"
                      >
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {actions.map((action, index) => (
                        <React.Fragment key={index}>
                          {action.separator && index > 0 && (
                            <DropdownMenuSeparator />
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick()
                            }}
                            disabled={action.disabled}
                            className={cn(
                              action.variant === 'destructive' &&
                                'text-destructive focus:text-destructive'
                            )}
                          >
                            {action.icon && (
                              <action.icon className="mr-2 h-4 w-4" />
                            )}
                            {action.label}
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Ligne 2 : Manager */}
              {manager && (
                <div className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="truncate">Manager : {manager.name}</span>
                </div>
              )}

              {/* Ligne 3 : AvatarStack */}
              {members.length > 0 && (
                <AvatarStack members={members} max={5} size="sm" showStatus />
              )}
            </div>
          </div>
        </Card>
      )
    }

    // Variant DETAILED
    return (
      <Card
        ref={ref}
        className={cn(
          'overflow-hidden',
          'transition-all duration-200',
          isClickable && 'cursor-pointer hover:bg-accent/50',
          className
        )}
        onClick={onClick}
      >
        {/* Bordure colorée gauche */}
        <div className="flex" style={{ borderLeft: `4px solid ${team.color}` }}>
          <div className="flex-1 p-4">
            {/* Header : Nom + actions */}
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold">
                  {team.name}
                </h3>
                {team.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {team.description}
                  </p>
                )}
              </div>

              {/* Actions dropdown */}
              {actions && actions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        'flex-shrink-0 rounded-md p-1 hover:bg-accent',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                      )}
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Actions"
                    >
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.map((action, index) => (
                      <React.Fragment key={index}>
                        {action.separator && index > 0 && (
                          <DropdownMenuSeparator />
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick()
                          }}
                          disabled={action.disabled}
                          className={cn(
                            action.variant === 'destructive' &&
                              'text-destructive focus:text-destructive'
                          )}
                        >
                          {action.icon && (
                            <action.icon className="mr-2 h-4 w-4" />
                          )}
                          {action.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Manager */}
            {manager && (
              <div className="mb-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {manager.image && (
                    <AvatarImage src={manager.image} alt={manager.name || ''} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-xs text-primary">
                    {getInitials(manager.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Manager</p>
                  <p className="truncate text-sm font-medium">{manager.name}</p>
                </div>
              </div>
            )}

            {/* Stats */}
            {stats && (
              <div className="mb-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{memberCount}</span>
                  <span className="text-muted-foreground">membres</span>
                </div>
                {stats.activeCount !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="font-medium">{stats.activeCount}</span>
                    <span className="text-muted-foreground">actifs</span>
                  </div>
                )}
                {stats.onLeaveCount !== undefined && stats.onLeaveCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="font-medium">{stats.onLeaveCount}</span>
                    <span className="text-muted-foreground">en congé</span>
                  </div>
                )}
              </div>
            )}

            {/* AvatarStack */}
            {members.length > 0 && (
              <div className="border-t pt-3">
                <div className="flex items-center justify-between gap-2">
                  <AvatarStack members={members} max={5} size="md" showStatus />
                  {memberCount > 5 && (
                    <span className="text-sm text-muted-foreground">
                      +{memberCount - 5} autre{memberCount - 5 > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }
)

TeamCard.displayName = 'TeamCard'
