/**
 * LeaveTimeline - Timeline d'événements pour une demande de congé
 *
 * @description Affiche l'historique des événements (création, approbation, refus, annulation)
 * @ticket SP-414
 */

'use client'

import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  PlusCircle,
  CheckCircle,
  XCircle,
  Ban,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TimelineEvent {
  type: 'created' | 'approved' | 'rejected' | 'cancelled'
  date: Date
  actor: {
    name: string
    avatar?: string | null
  }
  comment?: string | null
}

interface LeaveTimelineProps {
  events: TimelineEvent[]
  className?: string
}

const EVENT_CONFIG = {
  created: {
    icon: PlusCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Demande créée',
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    label: 'Demande approuvée',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Demande refusée',
  },
  cancelled: {
    icon: Ban,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Demande annulée',
  },
}

export function LeaveTimeline({ events, className }: LeaveTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun événement</p>
  }

  return (
    <div className={cn('relative space-y-0', className)}>
      {/* Ligne verticale */}
      <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-border" />

      {events.map((event, index) => {
        const config = EVENT_CONFIG[event.type]
        const Icon = config.icon

        return (
          <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Icône */}
            <div
              className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                config.bgColor
              )}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
            </div>

            {/* Contenu */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{config.label}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(event.date, {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>par</span>
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {event.actor.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{event.actor.name}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                {format(event.date, "EEEE d MMMM yyyy 'à' HH:mm", {
                  locale: fr,
                })}
              </p>

              {/* Commentaire */}
              {event.comment && (
                <div className="mt-2 flex gap-2 rounded-md bg-muted p-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm">{event.comment}</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
