/**
 * WeeklyGridView - Vue grille semaine par employé
 *
 * Affiche un tableau : employés en lignes, jours en colonnes.
 * Chaque cellule montre le créneau avec couleur par type.
 * Intègre les congés approuvés automatiquement.
 *
 * @ticket SP-396
 */

'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isToday,
  isWithinInterval,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight, Palmtree } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'
import { getTeamAbsences } from '@/lib/actions/leaves'
import type { LeaveRequest } from '@prisma/client'
import { LEAVE_TYPE_LABELS } from '@/lib/validations/leave'

// ============================================================================
// Types
// ============================================================================

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    user?: { image: string | null } | null
  }
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  image?: string | null
}

interface WeeklyGridViewProps {
  schedules: ScheduleWithRelations[]
  currentDate: Date
  onScheduleClick?: (schedule: ScheduleWithRelations) => void
  onRangeChange?: (start: Date, end: Date) => void
  canEdit?: boolean
  isLoading?: boolean
  companyId?: string
  teamIds?: string[]
}

// ============================================================================
// Couleurs par type de planning
// ============================================================================

const typeStyles: Record<string, { bg: string; text: string; label: string }> = {
  WORK: { bg: 'bg-blue-100 dark:bg-blue-900/60', text: 'text-blue-800 dark:text-blue-200', label: 'Travail' },
  REST: { bg: 'bg-green-100 dark:bg-green-900/60', text: 'text-green-800 dark:text-green-200', label: 'Repos' },
  BREAK: { bg: 'bg-yellow-100 dark:bg-yellow-900/60', text: 'text-yellow-800 dark:text-yellow-200', label: 'Pause' },
  MEETING: { bg: 'bg-purple-100 dark:bg-purple-900/60', text: 'text-purple-800 dark:text-purple-200', label: 'Réunion' },
  TRAINING: { bg: 'bg-orange-100 dark:bg-orange-900/60', text: 'text-orange-800 dark:text-orange-200', label: 'Formation' },
  REMOTE: { bg: 'bg-teal-100 dark:bg-teal-900/60', text: 'text-teal-800 dark:text-teal-200', label: 'Télétravail' },
  ON_CALL: { bg: 'bg-red-100 dark:bg-red-900/60', text: 'text-red-800 dark:text-red-200', label: 'Astreinte' },
  OVERTIME: { bg: 'bg-pink-100 dark:bg-pink-900/60', text: 'text-pink-800 dark:text-pink-200', label: 'Heures sup.' },
}

const leaveStyle = {
  bg: 'bg-amber-100 dark:bg-amber-900/50',
  text: 'text-amber-800 dark:text-amber-200',
}

// ============================================================================
// Composant principal
// ============================================================================

export function WeeklyGridView({
  schedules,
  currentDate,
  onScheduleClick,
  onRangeChange,
  canEdit = false,
  isLoading = false,
  teamIds = [],
}: WeeklyGridViewProps) {
  const [weekDate, setWeekDate] = useState(currentDate)
  const [leaves, setLeaves] = useState<LeaveRequestWithEmployee[]>([])

  const weekStart = useMemo(
    () => startOfWeek(weekDate, { weekStartsOn: 1 }),
    [weekDate]
  )
  const weekEnd = useMemo(
    () => endOfWeek(weekDate, { weekStartsOn: 1 }),
    [weekDate]
  )
  const days = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart, weekEnd]
  )

  // Charger les congés approuvés pour la semaine
  useEffect(() => {
    if (teamIds.length === 0) return
    const loadLeaves = async () => {
      const results = await Promise.all(
        teamIds.map((tid) => getTeamAbsences(tid, weekStart, weekEnd))
      )
      const allLeaves: LeaveRequestWithEmployee[] = []
      for (const r of results) {
        if (r.success) allLeaves.push(...r.data)
      }
      // Dédupliquer par ID
      const unique = Array.from(new Map(allLeaves.map((l) => [l.id, l])).values())
      setLeaves(unique)
    }
    void loadLeaves()
  }, [teamIds, weekStart, weekEnd])

  // Extraire la liste unique des employés depuis schedules + leaves
  const employees = useMemo(() => {
    const map = new Map<string, Employee>()

    for (const s of schedules) {
      if (!map.has(s.employeeId)) {
        map.set(s.employeeId, {
          id: s.employeeId,
          firstName: s.employee?.firstName ?? '',
          lastName: s.employee?.lastName ?? '',
          image: s.employee?.user?.image ?? null,
        })
      }
    }

    for (const l of leaves) {
      if (!map.has(l.employeeId)) {
        map.set(l.employeeId, {
          id: l.employeeId,
          firstName: l.employee?.firstName ?? '',
          lastName: l.employee?.lastName ?? '',
          image: l.employee?.user?.image ?? null,
        })
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`)
    )
  }, [schedules, leaves])

  // Index : employeeId-YYYY-MM-DD → schedules
  const scheduleIndex = useMemo(() => {
    const idx = new Map<string, ScheduleWithRelations[]>()
    for (const s of schedules) {
      const key = `${s.employeeId}-${format(new Date(s.startDate), 'yyyy-MM-dd')}`
      const arr = idx.get(key) ?? []
      arr.push(s)
      idx.set(key, arr)
    }
    return idx
  }, [schedules])

  // Index : employeeId → leaves actifs pour la semaine
  const leaveIndex = useMemo(() => {
    const idx = new Map<string, LeaveRequestWithEmployee[]>()
    for (const l of leaves) {
      const existing = idx.get(l.employeeId) ?? []
      existing.push(l)
      idx.set(l.employeeId, existing)
    }
    return idx
  }, [leaves])

  // Navigation
  const goToPrev = useCallback(() => {
    const prev = subWeeks(weekDate, 1)
    setWeekDate(prev)
    const s = startOfWeek(prev, { weekStartsOn: 1 })
    const e = endOfWeek(prev, { weekStartsOn: 1 })
    onRangeChange?.(s, e)
  }, [weekDate, onRangeChange])

  const goToNext = useCallback(() => {
    const next = addWeeks(weekDate, 1)
    setWeekDate(next)
    const s = startOfWeek(next, { weekStartsOn: 1 })
    const e = endOfWeek(next, { weekStartsOn: 1 })
    onRangeChange?.(s, e)
  }, [weekDate, onRangeChange])

  const goToToday = useCallback(() => {
    const today = new Date()
    setWeekDate(today)
    const s = startOfWeek(today, { weekStartsOn: 1 })
    const e = endOfWeek(today, { weekStartsOn: 1 })
    onRangeChange?.(s, e)
  }, [onRangeChange])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        {/* Header navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrev} className="h-9 w-9">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd&apos;hui
            </Button>
            <Button variant="outline" size="icon" onClick={goToNext} className="h-9 w-9">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h3 className="text-sm font-semibold capitalize">
            {format(weekStart, 'd MMM', { locale: fr })} – {format(weekEnd, 'd MMM yyyy', { locale: fr })}
          </h3>
        </div>

        {/* Grille */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[160px] border-b border-r bg-muted/50 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                  Employé
                </th>
                {days.map((day) => {
                  const today = isToday(day)
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        'min-w-[100px] border-b px-1 py-2 text-center text-xs',
                        isWeekend && 'bg-muted/30',
                        today && 'bg-primary/10'
                      )}
                    >
                      <div className={cn('uppercase', today && 'font-bold text-primary')}>
                        {format(day, 'EEE', { locale: fr })}
                      </div>
                      <div
                        className={cn(
                          'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                          today && 'bg-primary text-primary-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    Aucun planning cette semaine
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <EmployeeRow
                    key={emp.id}
                    employee={emp}
                    days={days}
                    scheduleIndex={scheduleIndex}
                    leaveIndex={leaveIndex}
                    onScheduleClick={onScheduleClick}
                    canEdit={canEdit}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Légende */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
          {Object.entries(typeStyles).map(([key, style]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('h-3 w-3 rounded-sm', style.bg)} />
              <span>{style.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className={cn('h-3 w-3 rounded-sm', leaveStyle.bg)} />
            <span>Congé</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

// ============================================================================
// Ligne employé
// ============================================================================

function EmployeeRow({
  employee,
  days,
  scheduleIndex,
  leaveIndex,
  onScheduleClick,
  canEdit,
}: {
  employee: Employee
  days: Date[]
  scheduleIndex: Map<string, ScheduleWithRelations[]>
  leaveIndex: Map<string, LeaveRequestWithEmployee[]>
  onScheduleClick?: (s: ScheduleWithRelations) => void
  canEdit: boolean
}) {
  const initials = `${employee.firstName[0] ?? ''}${employee.lastName[0] ?? ''}`.toUpperCase()
  const empLeaves = leaveIndex.get(employee.id) ?? []

  return (
    <tr className="group border-b last:border-b-0 hover:bg-muted/20">
      {/* Colonne employé */}
      <td className="sticky left-0 z-10 border-r bg-background px-2 py-1.5 group-hover:bg-muted/20">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7 flex-shrink-0">
            {employee.image && (
              <AvatarImage
                src={employee.image}
                alt={`${employee.firstName} ${employee.lastName}`}
              />
            )}
            <AvatarFallback className="text-[10px] font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">
            {employee.firstName} {employee.lastName}
          </span>
        </div>
      </td>

      {/* Cellules jours */}
      {days.map((day) => {
        const dateKey = `${employee.id}-${format(day, 'yyyy-MM-dd')}`
        const daySchedules = scheduleIndex.get(dateKey) ?? []
        const isWeekend = day.getDay() === 0 || day.getDay() === 6

        // Vérifier si en congé ce jour
        const dayLeave = empLeaves.find((l) =>
          isWithinInterval(day, {
            start: new Date(l.startDate),
            end: new Date(l.endDate),
          })
        )

        return (
          <td
            key={dateKey}
            className={cn(
              'px-1 py-1',
              isWeekend && 'bg-muted/20',
              isToday(day) && 'bg-primary/5'
            )}
          >
            {dayLeave ? (
              <LeaveCell leave={dayLeave} />
            ) : daySchedules.length > 0 ? (
              <div className="space-y-0.5">
                {daySchedules
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((s) => (
                    <ScheduleCell
                      key={s.id}
                      schedule={s}
                      onClick={() => onScheduleClick?.(s)}
                      canEdit={canEdit}
                    />
                  ))}
              </div>
            ) : isWeekend ? null : (
              <div className="flex h-10 items-center justify-center text-xs text-muted-foreground/40">
                —
              </div>
            )}
          </td>
        )
      })}
    </tr>
  )
}

// ============================================================================
// Cellule planning
// ============================================================================

function ScheduleCell({
  schedule,
  onClick,
  canEdit,
}: {
  schedule: ScheduleWithRelations
  onClick?: () => void
  canEdit: boolean
}) {
  const style = typeStyles[schedule.type] ?? typeStyles['WORK']
  const defaultStyle = { bg: 'bg-blue-100 dark:bg-blue-900/60', text: 'text-blue-800 dark:text-blue-200', label: 'Travail' }
  const s = style ?? defaultStyle

  const timeLabel =
    schedule.type === 'REST'
      ? 'Repos'
      : `${schedule.startTime}–${schedule.endTime}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            'rounded-md px-2 py-1.5 text-center text-[11px] font-medium leading-tight transition-all',
            s.bg,
            s.text,
            onClick && 'cursor-pointer hover:brightness-95 active:scale-[0.97]',
            canEdit && 'cursor-grab active:cursor-grabbing',
            schedule.status === 'DRAFT' && 'opacity-50 border border-dashed border-current'
          )}
        >
          {timeLabel}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">
          {schedule.employee?.firstName} {schedule.employee?.lastName}
        </p>
        <p>
          {s.label} — {schedule.type === 'REST' ? 'Journée entière' : `${schedule.startTime} – ${schedule.endTime}`}
        </p>
        {schedule.title && <p className="text-muted-foreground">{schedule.title}</p>}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// Cellule congé
// ============================================================================

function LeaveCell({ leave }: { leave: LeaveRequestWithEmployee }) {
  const typeLabel = LEAVE_TYPE_LABELS[leave.type] ?? 'Congé'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-center text-[11px] font-medium leading-tight',
            leaveStyle.bg,
            leaveStyle.text
          )}
        >
          <Palmtree className="h-3 w-3" />
          <span className="truncate">{typeLabel}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <p className="font-medium">
          {leave.employee?.firstName} {leave.employee?.lastName}
        </p>
        <p>{typeLabel}</p>
        <p className="text-muted-foreground">
          {format(new Date(leave.startDate), 'd MMM', { locale: fr })} – {format(new Date(leave.endDate), 'd MMM', { locale: fr })}
        </p>
      </TooltipContent>
    </Tooltip>
  )
}
