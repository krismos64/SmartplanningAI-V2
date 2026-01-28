'use client'

import type { LeaveRequest } from '@prisma/client'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { LEAVE_TYPE_COLORS, LEAVE_TYPE_LABELS } from '@/lib/validations/leave'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
  }
}

interface LeaveCalendarDayProps {
  date: Date
  absence?: LeaveRequestWithEmployee
  isWeekend: boolean
  isToday: boolean
  onClick?: () => void
}

export function LeaveCalendarDay({
  date,
  absence,
  isWeekend,
  isToday,
  onClick,
}: LeaveCalendarDayProps) {
  if (isWeekend) {
    return (
      <div
        className="flex h-10 w-full items-center justify-center bg-muted/50 text-xs text-muted-foreground"
        aria-label={`${format(date, 'EEEE d MMMM', { locale: fr })} - Weekend`}
      >
        —
      </div>
    )
  }

  if (!absence) {
    return (
      <div
        className={cn(
          'flex h-10 w-full cursor-pointer items-center justify-center text-xs transition-colors hover:bg-muted/30',
          isToday && 'ring-2 ring-inset ring-primary'
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
        aria-label={format(date, 'EEEE d MMMM', { locale: fr })}
      />
    )
  }

  const colorClass = LEAVE_TYPE_COLORS[absence.type]
  const typeLabel = LEAVE_TYPE_LABELS[absence.type]
  const isHalfDay = absence.halfDay
  const isAM = absence.halfDayPeriod === 'AM'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'relative flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden text-xs font-medium transition-all hover:opacity-80',
            isToday && 'ring-2 ring-inset ring-primary',
            !isHalfDay && colorClass
          )}
          role="button"
          tabIndex={0}
          aria-label={`${typeLabel} - ${format(date, 'EEEE d MMMM', { locale: fr })}`}
        >
          {isHalfDay ? (
            <>
              <div
                className={cn(
                  'absolute inset-x-0 h-1/2',
                  isAM ? 'top-0' : 'bottom-0',
                  colorClass
                )}
              />
              <span className="relative z-10 text-[10px]">½</span>
            </>
          ) : (
            <span className="truncate px-0.5">
              {absence.type === 'PAID_LEAVE'
                ? 'CP'
                : absence.type === 'RTT'
                  ? 'RTT'
                  : absence.type === 'SICK_LEAVE'
                    ? 'MAL'
                    : absence.type.slice(0, 3)}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="center">
        <div className="space-y-2">
          <p className="font-medium">{typeLabel}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(absence.startDate), 'dd MMM', { locale: fr })} –{' '}
            {format(new Date(absence.endDate), 'dd MMM yyyy', { locale: fr })}
          </p>
          <p className="text-sm text-muted-foreground">
            {absence.days} jour{absence.days > 1 ? 's' : ''}
            {isHalfDay && ` (${isAM ? 'matin' : 'après-midi'})`}
          </p>
          {absence.reason && (
            <p className="text-sm text-muted-foreground">
              Motif : {absence.reason}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
