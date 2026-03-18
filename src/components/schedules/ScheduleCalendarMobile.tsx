/**
 * ScheduleCalendarMobile - Vue mobile intuitive des plannings
 *
 * Navigation jour par jour avec swipe visuel.
 * Cards épurées : nom + horaire + couleur type.
 *
 * @ticket SP-396
 */

'use client'

import { useMemo, useState, useCallback, useRef } from 'react'
import {
  format,
  isSameDay,
  isToday,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleCalendarProps } from './ScheduleCalendar'
import { ScheduleWithRelations } from '@/lib/actions/schedules'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================================
// Couleurs par type
// ============================================================================

const typeColors: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  WORK: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-l-blue-500',
    label: 'Travail',
  },
  REST: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-l-green-500',
    label: 'Repos',
  },
  BREAK: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/50',
    border: 'border-l-yellow-500',
    label: 'Pause',
  },
  MEETING: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'border-l-purple-500',
    label: 'Réunion',
  },
  TRAINING: {
    bg: 'bg-orange-50 dark:bg-orange-950/50',
    border: 'border-l-orange-500',
    label: 'Formation',
  },
  REMOTE: {
    bg: 'bg-teal-50 dark:bg-teal-950/50',
    border: 'border-l-teal-500',
    label: 'Télétravail',
  },
  ON_CALL: {
    bg: 'bg-red-50 dark:bg-red-950/50',
    border: 'border-l-red-500',
    label: 'Astreinte',
  },
  OVERTIME: {
    bg: 'bg-pink-50 dark:bg-pink-950/50',
    border: 'border-l-pink-500',
    label: 'Heures sup.',
  },
}

// ============================================================================
// Composant principal
// ============================================================================

export function ScheduleCalendarMobile({
  schedules,
  currentDate,
  onScheduleClick,
  onRangeChange,
  isLoading,
}: ScheduleCalendarProps) {
  const [mobileDate, setMobileDate] = useState(currentDate)
  const dateInputRef = useRef<HTMLInputElement>(null)

  // Navigation jour par jour
  const goToPrev = useCallback(() => {
    const prev = subDays(mobileDate, 1)
    setMobileDate(prev)
    onRangeChange?.(startOfDay(prev), endOfDay(prev))
  }, [mobileDate, onRangeChange])

  const goToNext = useCallback(() => {
    const next = addDays(mobileDate, 1)
    setMobileDate(next)
    onRangeChange?.(startOfDay(next), endOfDay(next))
  }, [mobileDate, onRangeChange])

  const goToToday = useCallback(() => {
    const today = new Date()
    setMobileDate(today)
    onRangeChange?.(startOfDay(today), endOfDay(today))
  }, [onRangeChange])

  const goToDate = useCallback(
    (date: Date) => {
      setMobileDate(date)
      onRangeChange?.(startOfDay(date), endOfDay(date))
    },
    [onRangeChange]
  )

  const handleDateInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (!val) return
      const date = new Date(val + 'T00:00:00')
      if (!isNaN(date.getTime())) {
        goToDate(date)
      }
    },
    [goToDate]
  )

  // Filtrer les schedules du jour affiché
  const daySchedules = useMemo(
    () =>
      schedules
        .filter((s) => isSameDay(new Date(s.startDate), mobileDate))
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [schedules, mobileDate]
  )

  const today = isToday(mobileDate)

  if (isLoading) {
    return <MobileSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Navigation jour */}
      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrev}
          className="h-10 w-10 touch-manipulation"
          aria-label="Jour précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="relative flex flex-col items-center">
          {/* Date picker natif caché — s'ouvre au tap sur la date */}
          <input
            ref={dateInputRef}
            type="date"
            value={format(mobileDate, 'yyyy-MM-dd')}
            onChange={handleDateInputChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Choisir une date"
          />
          <span className="text-xs font-medium uppercase text-muted-foreground">
            {today ? "Aujourd'hui" : format(mobileDate, 'EEEE', { locale: fr })}
          </span>
          <span className="text-lg font-bold">
            {format(mobileDate, 'd MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          className="h-10 w-10 touch-manipulation"
          aria-label="Jour suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Bouton retour à aujourd'hui */}
      {!today && (
        <button
          onClick={goToToday}
          className="w-full rounded-lg bg-primary/10 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Revenir à aujourd&apos;hui
        </button>
      )}

      {/* Liste des plannings du jour */}
      {daySchedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="mb-3 h-10 w-10 opacity-40" />
          <p className="text-sm">Aucun planning ce jour</p>
        </div>
      ) : (
        <div className="space-y-2">
          {daySchedules.map((schedule) => (
            <MobileScheduleCard
              key={schedule.id}
              schedule={schedule}
              onClick={() => onScheduleClick?.(schedule)}
            />
          ))}
        </div>
      )}

      {/* Résumé */}
      {daySchedules.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          {daySchedules.length} planning{daySchedules.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// Card simplifiée
// ============================================================================

function MobileScheduleCard({
  schedule,
  onClick,
}: {
  schedule: ScheduleWithRelations
  onClick?: () => void
}) {
  const defaultType = {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-l-blue-500',
    label: 'Travail',
  }
  const type = typeColors[schedule.type] ?? defaultType

  const employeeName =
    `${schedule.employee?.firstName ?? ''} ${schedule.employee?.lastName ?? ''}`.trim() ||
    'N/A'
  const initials =
    `${schedule.employee?.firstName?.[0] ?? ''}${schedule.employee?.lastName?.[0] ?? ''}`.toUpperCase()
  const employeeImage = schedule.employee?.user?.image

  const timeLabel =
    schedule.type === 'REST'
      ? 'Journée entière'
      : `${schedule.startTime} – ${schedule.endTime}`

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg border-l-4 p-3 transition-all active:scale-[0.98]',
        type.bg,
        type.border,
        onClick && 'cursor-pointer',
        schedule.status === 'DRAFT' && 'border-dashed opacity-60'
      )}
    >
      {/* Avatar */}
      <Avatar className="h-9 w-9 flex-shrink-0">
        {employeeImage && (
          <AvatarImage src={employeeImage} alt={employeeName} />
        )}
        <AvatarFallback className="text-xs font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Nom + Horaire */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{employeeName}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeLabel}</span>
        </div>
      </div>

      {/* Type label */}
      <span
        className={cn(
          'shrink-0 text-xs font-medium',
          type.border.replace('border-l-', 'text-')
        )}
      >
        {type.label}
      </span>
    </div>
  )
}

// ============================================================================
// Skeleton
// ============================================================================

function MobileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
