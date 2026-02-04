'use client'

/**
 * WorkingDaysSelector - Sélecteur des jours travaillés
 *
 * - 7 checkboxes pour chaque jour de la semaine
 * - 3 presets rapides (Lun-Ven, Lun-Sam, Tous)
 *
 * @ticket SP-435
 */

import { CalendarDays } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DayOfWeek } from '@/types/company'
import {
  DAYS_OF_WEEK,
  DAY_LABELS,
  DAY_SHORT_LABELS,
  WORKING_DAYS_PRESETS,
} from '@/types/company'
import { COMPANY_SETTINGS_DESCRIPTIONS } from '@/lib/validations/company-settings'

interface WorkingDaysSelectorProps {
  /** Jours actuellement sélectionnés */
  workingDays: DayOfWeek[]
  /** Callback lors du changement des jours */
  onWorkingDaysChange: (days: DayOfWeek[]) => void
  /** Désactive les checkboxes */
  disabled?: boolean
}

export function WorkingDaysSelector({
  workingDays,
  onWorkingDaysChange,
  disabled = false,
}: WorkingDaysSelectorProps) {
  /**
   * Toggle un jour dans la sélection
   */
  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    if (checked) {
      // Ajouter le jour et trier selon l'ordre de la semaine
      const newDays = [...workingDays, day].sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)
      )
      onWorkingDaysChange(newDays)
    } else {
      // Retirer le jour (sauf si c'est le dernier)
      if (workingDays.length > 1) {
        onWorkingDaysChange(workingDays.filter((d) => d !== day))
      }
    }
  }

  /**
   * Applique un preset
   */
  const handlePresetClick = (presetDays: DayOfWeek[]) => {
    onWorkingDaysChange(presetDays)
  }

  /**
   * Vérifie si un preset correspond à la sélection actuelle
   */
  const isPresetActive = (presetDays: DayOfWeek[]) => {
    if (presetDays.length !== workingDays.length) return false
    return presetDays.every((day) => workingDays.includes(day))
  }

  return (
    <Card data-testid="working-days-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Jours travaillés
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {COMPANY_SETTINGS_DESCRIPTIONS.workingDays}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Presets */}
        <div
          className="flex flex-wrap gap-2"
          data-testid="working-days-presets"
        >
          {WORKING_DAYS_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant={isPresetActive(preset.days) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset.days)}
              disabled={disabled}
              data-testid={`preset-${preset.id}`}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Checkboxes des jours */}
        <div
          className="flex flex-wrap gap-3"
          data-testid="working-days-checkboxes"
        >
          {DAYS_OF_WEEK.map((day) => {
            const isChecked = workingDays.includes(day)
            const isLastDay = workingDays.length === 1 && isChecked

            return (
              <div
                key={day}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors',
                  isChecked
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50'
                )}
              >
                <Checkbox
                  id={`day-${day}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    handleDayToggle(day, checked === true)
                  }
                  disabled={disabled || isLastDay}
                  data-testid={`day-checkbox-${day}`}
                  aria-label={`${isChecked ? 'Désactiver' : 'Activer'} ${DAY_LABELS[day]}`}
                />
                <Label
                  htmlFor={`day-${day}`}
                  className={cn(
                    'cursor-pointer text-sm font-medium',
                    isLastDay && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <span className="hidden sm:inline">{DAY_LABELS[day]}</span>
                  <span className="sm:hidden">{DAY_SHORT_LABELS[day]}</span>
                </Label>
              </div>
            )
          })}
        </div>

        {/* Message d'aide */}
        <p className="text-xs text-muted-foreground">
          Au moins un jour travaillé doit être sélectionné.
        </p>
      </CardContent>
    </Card>
  )
}
