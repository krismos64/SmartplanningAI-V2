/**
 * Composant ScheduleCalendarMobile - Vue cards responsive
 *
 * @description Vue en cards empilées verticalement pour mobile/tablette (<768px)
 * Pas de scroll horizontal - design mobile-first
 * Affiche les indisponibilités en badges (SP-402)
 *
 * @ticket SP-396, SP-402
 */

'use client'

import { useMemo, useState } from 'react'
import {
  format,
  isSameDay,
  eachDayOfInterval,
  isToday,
  addDays,
  isWithinInterval,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, Users, CalendarX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleCalendarProps } from './ScheduleCalendar'
import { ScheduleWithRelations } from '@/lib/actions/schedules'
import { Skeleton } from '@/components/ui/skeleton'
import { AvailabilityBadge } from './AvailabilityBadge'
import { AvailabilityPopover } from './AvailabilityPopover'
import type { AvailabilityWithEmployee } from '@/lib/actions/availabilities'

// ============================================================================
// Configuration des couleurs et labels
// ============================================================================

const typeConfig = {
  WORK: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-l-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'Travail',
  },
  BREAK: {
    bg: 'bg-yellow-50 dark:bg-yellow-950',
    border: 'border-l-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300',
    label: 'Pause',
  },
  MEETING: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-l-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
    label: 'Réunion',
  },
  TRAINING: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-l-orange-500',
    text: 'text-orange-700 dark:text-orange-300',
    label: 'Formation',
  },
  REMOTE: {
    bg: 'bg-teal-50 dark:bg-teal-950',
    border: 'border-l-teal-500',
    text: 'text-teal-700 dark:text-teal-300',
    label: 'Télétravail',
  },
  ON_CALL: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-l-red-500',
    text: 'text-red-700 dark:text-red-300',
    label: 'Astreinte',
  },
  OVERTIME: {
    bg: 'bg-pink-50 dark:bg-pink-950',
    border: 'border-l-pink-500',
    text: 'text-pink-700 dark:text-pink-300',
    label: 'Heures sup.',
  },
  REST: {
    bg: 'bg-gray-50 dark:bg-gray-950',
    border: 'border-l-gray-500',
    text: 'text-gray-700 dark:text-gray-300',
    label: 'Repos',
  },
} as const

const statusConfig = {
  DRAFT: { variant: 'outline' as const, label: 'Brouillon' },
  CONFIRMED: { variant: 'default' as const, label: 'Confirmé' },
} as const

// ============================================================================
// Composant principal
// ============================================================================

export function ScheduleCalendarMobile({
  schedules,
  viewMode,
  currentDate,
  onScheduleClick,
  isLoading,
  availabilities = [],
  showAvailabilities = true,
  onAvailabilityClick,
}: ScheduleCalendarProps) {
  // État pour le popover d'indisponibilité
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityWithEmployee | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Handler pour le clic sur une indisponibilité
  const handleAvailabilityClick = (avail: AvailabilityWithEmployee) => {
    if (onAvailabilityClick) {
      onAvailabilityClick(avail)
    } else {
      setSelectedAvailability(avail)
      setPopoverOpen(true)
    }
  }

  // Calculer les jours à afficher selon le mode de vue
  const schedulesByDay = useMemo(() => {
    let days: Date[]

    switch (viewMode) {
      case 'day':
        days = [currentDate]
        break
      case 'week':
        days = eachDayOfInterval({
          start: currentDate,
          end: addDays(currentDate, 6),
        })
        break
      case 'month':
        // Pour le mois, on affiche seulement les jours avec des schedules
        const uniqueDays = new Set(
          schedules.map((s) => format(new Date(s.startDate), 'yyyy-MM-dd'))
        )
        days = Array.from(uniqueDays)
          .sort()
          .map((d) => new Date(d))
        break
      default:
        days = [currentDate]
    }

    return days.map((day) => {
      // Filtrer les indisponibilités pour ce jour (SP-402)
      const dayAvailabilities = showAvailabilities
        ? availabilities.filter((avail) => {
            const startDate = new Date(avail.startDate)
            const endDate = new Date(avail.endDate)
            return isWithinInterval(day, { start: startDate, end: endDate })
          })
        : []

      return {
        date: day,
        schedules: schedules.filter((s) =>
          isSameDay(new Date(s.startDate), day)
        ),
        availabilities: dayAvailabilities,
      }
    })
  }, [schedules, viewMode, currentDate, availabilities, showAvailabilities])

  // État de chargement
  if (isLoading) {
    return <MobileCalendarSkeleton />
  }

  // Aucun schedule
  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <CalendarX className="mb-4 h-12 w-12 opacity-50" />
        <p className="text-lg font-medium">Aucun planning</p>
        <p className="text-sm">Pas de plannings pour cette période</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {schedulesByDay.map(
        ({
          date,
          schedules: daySchedules,
          availabilities: dayAvailabilities,
        }) => (
          <DaySection
            key={date.toISOString()}
            date={date}
            schedules={daySchedules}
            availabilities={dayAvailabilities}
            onScheduleClick={onScheduleClick}
            onAvailabilityClick={handleAvailabilityClick}
            showEmptyDays={viewMode !== 'month'}
          />
        )
      )}

      {/* Popover de détail d'indisponibilité (SP-402) */}
      {selectedAvailability && (
        <AvailabilityPopover
          availability={selectedAvailability}
          open={popoverOpen}
          onOpenChange={(open) => {
            setPopoverOpen(open)
            if (!open) {
              setSelectedAvailability(null)
            }
          }}
        >
          <span />
        </AvailabilityPopover>
      )}
    </div>
  )
}

// ============================================================================
// Section par jour
// ============================================================================

interface DaySectionProps {
  date: Date
  schedules: ScheduleWithRelations[]
  availabilities?: AvailabilityWithEmployee[]
  onScheduleClick?: (schedule: ScheduleWithRelations) => void
  onAvailabilityClick?: (availability: AvailabilityWithEmployee) => void
  showEmptyDays?: boolean
}

function DaySection({
  date,
  schedules,
  availabilities = [],
  onScheduleClick,
  onAvailabilityClick,
  showEmptyDays = true,
}: DaySectionProps) {
  const today = isToday(date)

  // Ne pas afficher les jours sans schedules (sauf si showEmptyDays ou aujourd'hui)
  if (schedules.length === 0 && !showEmptyDays && !today) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* En-tête du jour */}
      <div
        className={cn(
          'sticky top-0 z-10 flex items-center gap-2 rounded-lg px-3 py-2 font-medium',
          today ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <span className="capitalize">
          {format(date, 'EEEE d MMMM', { locale: fr })}
        </span>
        {today && (
          <Badge variant="secondary" className="text-xs">
            Aujourd&apos;hui
          </Badge>
        )}
        <span className="ml-auto text-sm opacity-75">
          {schedules.length} planning{schedules.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Badges d'indisponibilités (SP-402) */}
      {availabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {availabilities.map((avail) => (
            <AvailabilityBadge
              key={avail.id}
              availability={avail}
              compact
              onClick={onAvailabilityClick}
            />
          ))}
        </div>
      )}

      {/* Cards des schedules */}
      {schedules.length === 0 ? (
        <p className="py-2 pl-3 text-sm text-muted-foreground">
          Aucun planning prévu
        </p>
      ) : (
        <div className="space-y-2">
          {schedules
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onClick={() => onScheduleClick?.(schedule)}
              />
            ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Card d'un schedule
// ============================================================================

interface ScheduleCardProps {
  schedule: ScheduleWithRelations
  onClick?: () => void
}

function ScheduleCard({ schedule, onClick }: ScheduleCardProps) {
  const type =
    typeConfig[schedule.type as keyof typeof typeConfig] || typeConfig.WORK
  const status =
    statusConfig[schedule.status as keyof typeof statusConfig] ||
    statusConfig.DRAFT

  const initials = `${schedule.employee?.firstName?.[0] ?? '?'}${schedule.employee?.lastName?.[0] ?? '?'}`
  const employeeImage = schedule.employee?.user?.image

  return (
    <Card
      className={cn(
        'cursor-pointer border-l-4 transition-all',
        'hover:shadow-md active:scale-[0.98]',
        type.bg,
        type.border,
        schedule.status === 'DRAFT' &&
          'border-dashed opacity-60 hover:opacity-80'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar employé */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            {employeeImage && (
              <AvatarImage
                src={employeeImage}
                alt={`${schedule.employee?.firstName ?? ''} ${schedule.employee?.lastName ?? ''}`}
              />
            )}
            <AvatarFallback className="text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Contenu principal */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Nom et statut */}
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium">
                {schedule.employee?.firstName ?? 'N/A'}{' '}
                {schedule.employee?.lastName ?? ''}
              </span>
              <Badge variant={status.variant} className="flex-shrink-0 text-xs">
                {status.label}
              </Badge>
            </div>

            {/* Titre si présent */}
            {schedule.title && (
              <p className="truncate text-sm font-medium">{schedule.title}</p>
            )}

            {/* Horaires */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {schedule.type === 'REST'
                  ? 'Journée entière'
                  : `${schedule.startTime} - ${schedule.endTime}`}
              </span>
            </div>

            {/* Équipe si présente */}
            {schedule.team && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span className="truncate">{schedule.team.name}</span>
              </div>
            )}

            {/* Type de shift */}
            <Badge variant="outline" className={cn('text-xs', type.text)}>
              {type.label}
            </Badge>
          </div>
        </div>

        {/* Description si présente */}
        {schedule.description && (
          <p className="mt-2 line-clamp-2 border-t pt-2 text-sm text-muted-foreground">
            {schedule.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Skeleton de chargement
// ============================================================================

function MobileCalendarSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((day) => (
        <div key={day} className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[1, 2].map((card) => (
            <Skeleton key={card} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}
