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
import { useMediaQuery } from '@/hooks/use-media-query'

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

const legendTypes: LeaveType[] = [
  'PAID_LEAVE',
  'RTT',
  'SICK_LEAVE',
  'UNPAID_LEAVE',
  'FAMILY_EVENT',
  'PARENTAL_LEAVE',
  'OTHER',
]

export function LeaveCalendar({
  month,
  absences,
  employees,
  onMonthChange,
  onCellClick,
  className,
}: LeaveCalendarProps) {
  const isMobile = useMediaQuery('(max-width: 1024px)')

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

  // Absences groupées par employé pour la vue mobile
  const absencesByEmployee = useMemo(() => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const map = new Map<string, LeaveRequestWithEmployee[]>()

    for (const absence of absences) {
      const start = new Date(absence.startDate)
      const end = new Date(absence.endDate)
      // Inclure si la période chevauche le mois affiché
      if (start <= monthEnd && end >= monthStart) {
        const existing = map.get(absence.employeeId) ?? []
        // Éviter les doublons (même absence)
        if (!existing.some((a) => a.id === absence.id)) {
          existing.push(absence)
        }
        map.set(absence.employeeId, existing)
      }
    }

    return map
  }, [absences, month])

  const handlePrevMonth = () => onMonthChange(subMonths(month, 1))
  const handleNextMonth = () => onMonthChange(addMonths(month, 1))
  const handleToday = () => onMonthChange(new Date())

  return (
    <div className={cn('space-y-4', className)} data-testid="leaves-calendar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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
            className="min-w-[140px] text-center text-lg font-semibold capitalize sm:min-w-[180px]"
            data-testid="calendar-month-year"
          >
            {format(month, 'MMMM yyyy', { locale: fr })}
          </h2>
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

      {/* Vue mobile : liste par employé */}
      {isMobile ? (
        <div className="space-y-3">
          {employees.map((employee) => {
            const initials =
              `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase()
            const employeeAbsences = absencesByEmployee.get(employee.id) ?? []

            return (
              <div
                key={employee.id}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center gap-2 pb-2">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {employee.image && (
                      <AvatarImage
                        src={employee.image}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    )}
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {employee.firstName} {employee.lastName}
                  </span>
                </div>

                {employeeAbsences.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucune absence ce mois
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {employeeAbsences.map((absence) => {
                      const colorClass = LEAVE_TYPE_COLORS[absence.type]
                      const typeLabel = LEAVE_TYPE_LABELS[absence.type]
                      return (
                        <div
                          key={absence.id}
                          className={cn(
                            'flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs',
                            colorClass
                          )}
                        >
                          <span className="font-medium">
                            {typeLabel}
                            {absence.halfDay &&
                              ` (${absence.halfDayPeriod === 'AM' ? 'matin' : 'après-midi'})`}
                          </span>
                          <span>
                            {format(new Date(absence.startDate), 'dd MMM', {
                              locale: fr,
                            })}
                            {absence.days > 1 &&
                              ` – ${format(new Date(absence.endDate), 'dd MMM', { locale: fr })}`}
                            {' '}
                            ({absence.days}j)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {employees.length === 0 && (
            <div className="flex min-h-[100px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground">
                Aucun employé dans l&apos;équipe
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Vue desktop : grille matricielle adaptative */
        <div className="rounded-lg border">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `minmax(100px, 140px) repeat(${days.length}, minmax(0, 1fr))`,
            }}
          >
            {/* Header row */}
            <div className="sticky left-0 z-10 border-b border-r bg-muted/50 px-2 py-1 text-xs font-medium">
              Employé
            </div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'border-b px-0.5 py-1 text-center text-[10px] leading-tight',
                  isWeekend(day) && 'bg-muted/50',
                  isToday(day) && 'bg-primary/10 font-semibold'
                )}
              >
                <div className="uppercase">
                  {format(day, 'EEEEE', { locale: fr })}
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
                  <div className="sticky left-0 z-10 flex items-center gap-1.5 border-b border-r bg-background px-1.5 text-xs font-medium">
                    <Avatar className="h-5 w-5 flex-shrink-0">
                      {employee.image && (
                        <AvatarImage
                          src={employee.image}
                          alt={`${employee.firstName} ${employee.lastName}`}
                        />
                      )}
                      <AvatarFallback className="text-[8px]">
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
      )}

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
