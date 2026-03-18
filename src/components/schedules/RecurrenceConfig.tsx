/**
 * Composant RecurrenceConfig - Configuration simplifiée de récurrence
 *
 * Interface intuitive : sélection des jours + nombre de semaines.
 * Génère en interne une RecurrenceRule compatible avec le moteur existant.
 *
 * @ticket SP-399
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Info, AlertCircle, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type RecurrenceRule,
  type DayOfWeek,
  DAY_LABELS,
  MAX_TOTAL_SCHEDULES,
} from '@/lib/utils/recurrence'

// ============================================================================
// Types
// ============================================================================

interface RecurrenceConfigProps {
  value: RecurrenceRule | null
  onChange: (rule: RecurrenceRule | null) => void
  isEnabled: boolean
  onEnabledChange: (enabled: boolean) => void
  startDate: Date
  endDate: Date
  employeeCount: number
  disabled?: boolean
}

// ============================================================================
// Constantes
// ============================================================================

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const WEEKDAYS: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
]

// ============================================================================
// Composant
// ============================================================================

export function RecurrenceConfig({
  value,
  onChange,
  isEnabled,
  onEnabledChange,
  employeeCount,
  disabled = false,
}: RecurrenceConfigProps) {
  // État simplifié : jours sélectionnés + nombre de semaines
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    value?.daysOfWeek ?? WEEKDAYS
  )
  const [weeks, setWeeks] = useState<number>(() => {
    if (value?.occurrences && value?.daysOfWeek?.length) {
      return Math.ceil(value.occurrences / value.daysOfWeek.length)
    }
    return 4
  })

  // Synchroniser quand value change de l'extérieur
  useEffect(() => {
    if (value?.daysOfWeek?.length) {
      setSelectedDays(value.daysOfWeek)
    }
    if (value?.occurrences && value?.daysOfWeek?.length) {
      setWeeks(Math.ceil(value.occurrences / value.daysOfWeek.length))
    }
  }, [value])

  // Construire la RecurrenceRule et propager
  const propagateRule = useCallback(
    (days: DayOfWeek[], numWeeks: number) => {
      if (days.length === 0) return

      const totalOccurrences = days.length * numWeeks
      const rule: RecurrenceRule = {
        frequency: 'WEEKLY',
        interval: 1,
        daysOfWeek: days,
        occurrences: totalOccurrences,
      }
      onChange(rule)
    },
    [onChange]
  )

  // Toggle un jour
  const handleDayToggle = (day: DayOfWeek) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]

    // Au moins un jour requis
    if (newDays.length === 0) return

    setSelectedDays(newDays)
    propagateRule(newDays, weeks)
  }

  // Sélectionner tous les jours ouvrés
  const selectWeekdays = () => {
    setSelectedDays(WEEKDAYS)
    propagateRule(WEEKDAYS, weeks)
  }

  // Sélectionner tous les jours
  const selectAllDays = () => {
    setSelectedDays(DAYS_OF_WEEK)
    propagateRule(DAYS_OF_WEEK, weeks)
  }

  // Changement du nombre de semaines
  const handleWeeksChange = (value: string) => {
    const num = Math.max(1, Math.min(52, parseInt(value) || 1))
    setWeeks(num)
    propagateRule(selectedDays, num)
  }

  // Activation/désactivation
  const handleEnabledChange = (enabled: boolean) => {
    onEnabledChange(enabled)
    if (enabled) {
      propagateRule(selectedDays, weeks)
    } else {
      onChange(null)
    }
  }

  // Calcul du résumé
  const totalOccurrences = selectedDays.length * weeks
  const totalSchedules = totalOccurrences * employeeCount
  const showWarning = totalSchedules > MAX_TOTAL_SCHEDULES

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header avec switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="recurrence-enabled" className="text-sm font-medium">
            Répéter ce créneau
          </Label>
        </div>
        <Switch
          id="recurrence-enabled"
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
          disabled={disabled}
        />
      </div>

      {/* Configuration simplifiée */}
      {isEnabled && (
        <div className="space-y-4 pt-1">
          {/* Jours de la semaine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Jours</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={selectWeekdays}
                  className="text-xs text-primary hover:underline"
                  disabled={disabled}
                >
                  Lun–Ven
                </button>
                <span className="text-xs text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-xs text-primary hover:underline"
                  disabled={disabled}
                >
                  Tous
                </button>
              </div>
            </div>
            <div className="flex gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day)
                return (
                  <Button
                    key={day}
                    type="button"
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleDayToggle(day)}
                    disabled={disabled}
                    className={cn(
                      'h-9 flex-1 px-0 text-xs font-medium',
                      isSelected && 'shadow-sm'
                    )}
                  >
                    {DAY_LABELS[day]}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Nombre de semaines */}
          <div className="flex items-center gap-3">
            <Label htmlFor="weeks-count" className="shrink-0 text-sm">
              Pendant
            </Label>
            <Input
              id="weeks-count"
              type="number"
              min={1}
              max={52}
              value={weeks}
              onChange={(e) => handleWeeksChange(e.target.value)}
              disabled={disabled}
              className="w-20 text-center"
            />
            <span className="text-sm text-muted-foreground">
              semaine{weeks > 1 ? 's' : ''}
            </span>
          </div>

          {/* Résumé */}
          <div
            className={cn(
              'flex items-start gap-2 rounded-md p-3 text-sm',
              showWarning
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {showWarning ? (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {totalSchedules} créneau{totalSchedules > 1 ? 'x' : ''}{' '}
                {totalSchedules > 1 ? 'seront créés' : 'sera créé'}
              </p>
              <p className="mt-0.5 text-xs">
                {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} × {weeks} semaine{weeks > 1 ? 's' : ''}
                {employeeCount > 1 && ` × ${employeeCount} employés`}
              </p>
              {showWarning && (
                <p className="mt-1 text-xs">
                  Maximum autorisé : {MAX_TOTAL_SCHEDULES}. Réduisez le nombre
                  de semaines ou d&apos;employés.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
