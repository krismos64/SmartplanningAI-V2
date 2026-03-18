/**
 * Panneau latéral affichant les heures planifiées vs contractuelles par employé
 *
 * @ticket SP-406
 */

'use client'

import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'

// ============================================================================
// Types
// ============================================================================

export interface EmployeeWithHours {
  id: string
  firstName: string
  lastName: string
  weeklyHours: number
  image?: string | null
}

export type ViewMode = 'day' | 'week' | 'month'

export interface WeeklyHoursPanelProps {
  schedules: ScheduleWithRelations[]
  employees: EmployeeWithHours[]
  isOpen: boolean
  onToggle: () => void
  viewMode?: ViewMode
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

/**
 * Calcule les heures contractuelles de référence selon la vue.
 * weeklyHours est la base. On estime :
 * - jour : weeklyHours / 5
 * - semaine : weeklyHours
 * - mois : weeklyHours * 52 / 12 ≈ weeklyHours * 4.33
 */
function getContractHours(weeklyHours: number, viewMode: ViewMode): number {
  switch (viewMode) {
    case 'day':
      return weeklyHours / 5
    case 'week':
      return weeklyHours
    case 'month':
      return Math.round(((weeklyHours * 52) / 12) * 10) / 10
  }
}

const viewLabels: Record<ViewMode, string> = {
  day: 'Heures jour',
  week: 'Heures semaine',
  month: 'Heures mois',
}

export function WeeklyHoursPanel({
  schedules,
  employees,
  isOpen,
  viewMode = 'week',
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
        const contract = getContractHours(emp.weeklyHours, viewMode)
        const diff = planned - contract
        const percentage = contract > 0 ? (planned / contract) * 100 : 0

        return { ...emp, planned, contract, diff, percentage }
      })
      // Sous-staffés en haut (diff croissant)
      .sort((a, b) => a.diff - b.diff)

    return result
  }, [schedules, employees, viewMode])

  if (!isOpen) return null

  return (
    <div className="w-80 shrink-0" data-testid="weekly-hours-panel">
      <div className="sp-glass-panel rounded-xl">
        {/* Header */}
        <div className="sp-panel-header flex items-center gap-2 px-4 py-3">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{viewLabels[viewMode]}</h3>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-320px)] space-y-3 overflow-y-auto p-4">
          {employeeHours.length === 0 ? (
            <div className="sp-empty-state px-4 py-8 text-center">
              <Clock className="mx-auto mb-2 h-8 w-8 text-primary/40" />
              <p className="text-sm text-muted-foreground">
                Aucun employé planifié
              </p>
            </div>
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
                  ? 'text-green-600 dark:text-green-400'
                  : emp.diff > 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-orange-600 dark:text-orange-400'

              return (
                <div key={emp.id} className="sp-hours-row space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        {emp.image && (
                          <AvatarImage
                            src={emp.image}
                            alt={`${emp.firstName} ${emp.lastName}`}
                          />
                        )}
                        <AvatarFallback className="sp-avatar-neon text-xs font-medium text-primary">
                          {getInitials(emp.firstName, emp.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate text-sm font-medium">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="text-muted-foreground">
                        {viewMode === 'week' ? (
                          <>
                            {emp.planned.toFixed(1).replace('.0', '')}h /{' '}
                            {emp.contract}h
                          </>
                        ) : (
                          <>{emp.planned.toFixed(1).replace('.0', '')}h</>
                        )}
                      </span>
                      {viewMode === 'week' && (
                        <span
                          className={cn('text-xs font-semibold', diffColor)}
                        >
                          {diffText}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Progress bar (semaine uniquement) */}
                  {viewMode === 'week' && (
                    <div className="sp-progress-track h-1.5 w-full rounded-full">
                      <div
                        className={cn(
                          'sp-progress-bar h-full rounded-full transition-all',
                          barColor
                        )}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
