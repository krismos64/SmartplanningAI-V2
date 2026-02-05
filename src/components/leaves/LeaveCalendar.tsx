'use client'

import { useMemo } from 'react'
import type { LeaveRequest } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LeaveCalendarDay } from './LeaveCalendarDay'
import { LEAVE_TYPE_LABELS, LEAVE_TYPE_COLORS } from '@/lib/validations/leave'
import { LeaveType } from '@prisma/client'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    user?: {
      image: string | null
    } | null
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  image?: string | null
}

interface LeaveCalendarProps {
  month: Date
  absences: LeaveRequestWithEmployee[]
  employees: Employee[]
  onMonthChange: (month: Date) => void
  onCellClick?: (employee: Employee, date: Date) => void
  className?: string
}

export function LeaveCalendar({
  month,
  absences,
  employees,
  onMonthChange,
  onCellClick,
  className,
}: LeaveCalendarProps) {
  const days = useMemo(() => {
    const start = startOfMonth(month)
    const end = endOfMonth(month)
    return eachDayOfInterval({ start, end })
  }, [month])

  const absenceMap = useMemo(() => {
    const map = new Map<string, LeaveRequestWithEmployee>()
    for (const absence of absences) {
      const start = new Date(absence.startDate)
      const end = new Date(absence.endDate)
      const absDays = eachDayOfInterval({ start, end })
      for (const day of absDays) {
        const key = `${absence.employeeId}-${format(day, 'yyyy-MM-dd')}`
        map.set(key, absence)
      }
    }
    return map
  }, [absences])

  const handlePrevMonth = () => onMonthChange(subMonths(month, 1))
  const handleNextMonth = () => onMonthChange(addMonths(month, 1))
  const handleToday = () => onMonthChange(new Date())

  const legendTypes: LeaveType[] = [
    'PAID_LEAVE',
    'RTT',
    'SICK_LEAVE',
    'UNPAID_LEAVE',
    'FAMILY_EVENT',
    'PARENTAL_LEAVE',
    'OTHER',
  ]

  return (
    <div className={cn('space-y-4', className)} data-testid="leaves-calendar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* WCAG 2.5.5: 44px minimum touch target */}
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            aria-label="Mois précédent"
            className="h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation"
            data-testid="calendar-prev-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2
            className="min-w-[180px] text-center text-lg font-semibold capitalize"
            data-testid="calendar-month-year"
          >
            {format(month, 'MMMM yyyy', { locale: fr })}
          </h2>
          {/* WCAG 2.5.5: 44px minimum touch target */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Mois suivant"
            className="h-11 min-h-[44px] w-11 min-w-[44px] touch-manipulation"
            data-testid="calendar-next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Aujourd&apos;hui
        </Button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-lg border">
        <div
          className="grid min-w-[800px]"
          style={{
            gridTemplateColumns: `150px repeat(${days.length}, minmax(40px, 1fr))`,
          }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-10 border-b border-r bg-muted/50 p-2 font-medium">
            Employé
          </div>
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'border-b p-1 text-center text-xs',
                isWeekend(day) && 'bg-muted/50',
                isToday(day) && 'bg-primary/10 font-semibold'
              )}
            >
              <div className="uppercase">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div>{format(day, 'd')}</div>
            </div>
          ))}

          {/* Employee rows */}
          {employees.map((employee) => {
            const initials =
              `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase()
            return (
              <div key={employee.id} className="contents">
                <div className="sticky left-0 z-10 flex items-center gap-2 border-b border-r bg-background px-2 text-sm font-medium">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    {employee.image && (
                      <AvatarImage
                        src={employee.image}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>
                {days.map((day) => {
                  const key = `${employee.id}-${format(day, 'yyyy-MM-dd')}`
                  const absence = absenceMap.get(key)
                  return (
                    <div key={key} className="border-b">
                      <LeaveCalendarDay
                        date={day}
                        absence={absence}
                        isWeekend={isWeekend(day)}
                        isToday={isToday(day)}
                        onClick={() => onCellClick?.(employee, day)}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {legendTypes.map((type) => (
          <div key={type} className="flex items-center gap-1.5 text-xs">
            <div className={cn('h-4 w-4 rounded', LEAVE_TYPE_COLORS[type])} />
            <span>{LEAVE_TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
