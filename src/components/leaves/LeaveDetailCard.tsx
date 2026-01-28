/**
 * LeaveDetailCard - Carte détaillée d'une demande de congé
 *
 * @description Affiche les informations complètes : type, dates, durée, motif
 * @ticket SP-414
 */

'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { LeaveRequest } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, FileText, Sun, Moon } from 'lucide-react'
import { LeaveTypeBadge } from './LeaveTypeBadge'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
  }
}

interface LeaveDetailCardProps {
  request: LeaveRequestWithEmployee
  className?: string
}

export function LeaveDetailCard({ request, className }: LeaveDetailCardProps) {
  const startDate = new Date(request.startDate)
  const endDate = new Date(request.endDate)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Détails de la demande
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Type */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type de congé</span>
          <LeaveTypeBadge type={request.type} />
        </div>

        {/* Dates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date de début</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
              {request.halfDay && request.halfDayPeriod === 'PM' && (
                <Badge variant="outline" className="gap-1">
                  <Moon className="h-3 w-3" />
                  Après-midi
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date de fin</span>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {format(endDate, 'EEEE d MMMM yyyy', { locale: fr })}
              </span>
              {request.halfDay && request.halfDayPeriod === 'AM' && (
                <Badge variant="outline" className="gap-1">
                  <Sun className="h-3 w-3" />
                  Matin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Durée */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Durée totale</span>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {request.days} jour{request.days > 1 ? 's' : ''}
              {request.halfDay ? ' ½' : ''}
            </span>
          </div>
        </div>

        {/* Raison */}
        {request.reason && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Motif</span>
            </div>
            <p className="rounded-md bg-muted p-3 text-sm">{request.reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
