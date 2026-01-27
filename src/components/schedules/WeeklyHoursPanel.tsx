/**
 * Panneau latéral affichant les heures planifiées vs contractuelles par employé
 *
 * @ticket SP-406
 */

'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Types
// ============================================================================

export interface EmployeeWithHours {
  id: string
  firstName: string
  lastName: string
  weeklyHours: number
}

export interface WeeklyHoursPanelProps {
  schedules: ScheduleWithRelations[]
  employees: EmployeeWithHours[]
  isOpen: boolean
  onToggle: () => void
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Calcule la durée en heures entre deux horaires HH:mm
 */
function computeShiftDuration(startTime: string, endTime: string): number {
  const [sh = 0, sm = 0] = startTime.split(':').map(Number)
  const [eh = 0, em = 0] = endTime.split(':').map(Number)
  const startMinutes = sh * 60 + sm
  const endMinutes = eh * 60 + em
  const diff = endMinutes - startMinutes
  return diff > 0 ? diff / 60 : 0
}

/**
 * Retourne les initiales d'un employé (2 lettres max)
 */
function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// ============================================================================
// Composant
// ============================================================================

export function WeeklyHoursPanel({
  schedules,
  employees,
  isOpen,
}: WeeklyHoursPanelProps) {
  const employeeHours = useMemo(() => {
    // Sommer les heures planifiées par employé
    const hoursMap = new Map<string, number>()

    for (const schedule of schedules) {
      // Ne pas compter les jours de repos dans les heures travaillées
      if (schedule.type === 'REST') continue
      const duration = computeShiftDuration(
        schedule.startTime,
        schedule.endTime
      )
      hoursMap.set(
        schedule.employeeId,
        (hoursMap.get(schedule.employeeId) ?? 0) + duration
      )
    }

    // Construire la liste des employés planifiés
    const result = employees
      .filter((emp) => hoursMap.has(emp.id))
      .map((emp) => {
        const planned = hoursMap.get(emp.id) ?? 0
        const contract = emp.weeklyHours
        const diff = planned - contract
        const percentage = contract > 0 ? (planned / contract) * 100 : 0

        return { ...emp, planned, contract, diff, percentage }
      })
      // Sous-staffés en haut (diff croissant)
      .sort((a, b) => a.diff - b.diff)

    return result
  }, [schedules, employees])

  if (!isOpen) return null

  return (
    <div className="w-80 shrink-0" data-testid="weekly-hours-panel">
      <div className="rounded-lg border bg-card shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Heures semaine</h3>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-320px)] space-y-3 overflow-y-auto p-4">
          {employeeHours.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Aucun employé planifié
            </p>
          ) : (
            employeeHours.map((emp) => {
              const barPercent = Math.min(emp.percentage, 100)
              const barColor =
                emp.percentage > 100
                  ? 'bg-red-500'
                  : emp.percentage >= 90
                    ? 'bg-orange-500'
                    : 'bg-green-500'

              const diffText =
                emp.diff === 0
                  ? '0h'
                  : emp.diff > 0
                    ? `+${emp.diff.toFixed(1).replace('.0', '')}h`
                    : `${emp.diff.toFixed(1).replace('.0', '')}h`

              const diffColor =
                emp.diff === 0
                  ? 'text-green-600'
                  : emp.diff > 0
                    ? 'text-red-600'
                    : 'text-orange-600'

              return (
                <div key={emp.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(emp.firstName, emp.lastName)}
                      </div>
                      <span className="max-w-[120px] truncate text-sm font-medium">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">
                        {emp.planned.toFixed(1).replace('.0', '')}h /{' '}
                        {emp.contract}h
                      </span>
                      <span className={cn('text-xs font-semibold', diffColor)}>
                        {diffText}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        barColor
                      )}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
