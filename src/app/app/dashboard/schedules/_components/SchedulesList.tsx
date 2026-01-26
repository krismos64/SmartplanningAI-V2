/**
 * Liste des Schedules avec vue calendrier
 *
 * @description Affiche les schedules en vue grille (semaine) ou liste (jour/mois)
 * @ticket SP-395
 */

'use client'

import { ScheduleWithRelations } from '@/lib/actions/schedules'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format, isSameDay, eachDayOfInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { CalendarX } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

interface SchedulesListProps {
  schedules: ScheduleWithRelations[]
  viewMode: 'day' | 'week' | 'month'
  startDate: Date
  endDate: Date
  isLoading?: boolean
}

// ============================================================================
// Constantes
// ============================================================================

const statusConfig = {
  DRAFT: {
    label: 'Brouillon',
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  CONFIRMED: {
    label: 'Confirmé',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  CANCELLED: {
    label: 'Annulé',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  COMPLETED: {
    label: 'Terminé',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
} as const

const typeColors = {
  WORK: 'bg-blue-500',
  BREAK: 'bg-yellow-500',
  MEETING: 'bg-purple-500',
  TRAINING: 'bg-orange-500',
  REMOTE: 'bg-teal-500',
  ON_CALL: 'bg-red-500',
  OVERTIME: 'bg-pink-500',
} as const

// ============================================================================
// Composant principal
// ============================================================================

export function SchedulesList({
  schedules,
  viewMode,
  startDate,
  endDate,
  isLoading,
}: SchedulesListProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
        <CalendarX className="mb-4 h-12 w-12 opacity-50" />
        <p className="text-lg font-medium">Aucun planning pour cette période</p>
        <p className="text-sm">Créez un nouveau shift pour commencer</p>
      </div>
    )
  }

  // Vue semaine : grille par jour
  if (viewMode === 'week') {
    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySchedules = schedules.filter((s) =>
            isSameDay(new Date(s.startDate), day)
          )

          return (
            <div key={day.toISOString()} className="min-h-[200px]">
              {/* En-tête du jour */}
              <div
                className={cn(
                  'rounded-t-lg p-2 text-center font-medium',
                  isSameDay(day, new Date())
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="text-xs uppercase">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>

              {/* Schedules du jour */}
              <div className="min-h-[150px] space-y-1 rounded-b-lg border border-t-0 bg-background p-1">
                {daySchedules.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    -
                  </div>
                ) : (
                  daySchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      compact
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Vue jour ou mois : liste simple
  return (
    <div className="space-y-2">
      {schedules.map((schedule) => (
        <ScheduleCard key={schedule.id} schedule={schedule} />
      ))}
    </div>
  )
}

// ============================================================================
// Composant ScheduleCard
// ============================================================================

interface ScheduleCardProps {
  schedule: ScheduleWithRelations
  compact?: boolean
}

function ScheduleCard({ schedule, compact = false }: ScheduleCardProps) {
  const initials = `${schedule.employee?.firstName?.[0] ?? '?'}${schedule.employee?.lastName?.[0] ?? '?'}`
  const typeColor =
    typeColors[schedule.type as keyof typeof typeColors] || 'bg-gray-500'
  const status = statusConfig[schedule.status as keyof typeof statusConfig]

  if (compact) {
    return (
      <div
        className={cn(
          'cursor-pointer rounded p-2 text-xs transition-opacity hover:opacity-80',
          typeColor,
          'text-white'
        )}
        title={`${schedule.employee?.firstName ?? ''} ${schedule.employee?.lastName ?? ''}`}
      >
        <div className="truncate font-medium">
          {schedule.startTime} - {schedule.endTime}
        </div>
        <div className="truncate opacity-90">
          {schedule.employee?.firstName ?? 'N/A'}{' '}
          {schedule.employee?.lastName?.[0] ?? ''}.
        </div>
      </div>
    )
  }

  return (
    <div className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className={cn('h-12 w-1 rounded-full', typeColor)} />

      <Avatar className="h-10 w-10">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {schedule.employee?.firstName ?? 'N/A'}{' '}
            {schedule.employee?.lastName ?? ''}
          </span>
          {status && (
            <Badge variant="outline" className={status.className}>
              {status.label}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(schedule.startDate), 'EEEE d MMMM', { locale: fr })}{' '}
          • {schedule.startTime} - {schedule.endTime}
        </div>
        {schedule.title && (
          <div className="truncate text-sm">{schedule.title}</div>
        )}
      </div>

      {schedule.team && <Badge variant="secondary">{schedule.team.name}</Badge>}
    </div>
  )
}
