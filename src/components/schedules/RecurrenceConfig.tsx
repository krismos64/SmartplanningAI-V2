/**
 * Composant RecurrenceConfig - Configuration de récurrence
 *
 * @description Configuration des règles de récurrence pour les créneaux
 * @ticket SP-399
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, AlertCircle, Info } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import {
  type RecurrenceRule,
  type RecurrenceFrequency,
  type DayOfWeek,
  FREQUENCY_LABELS,
  DAY_LABELS,
  MAX_OCCURRENCES,
  MAX_TOTAL_SCHEDULES,
  validateRecurrenceRule,
  calculateTotalSchedules,
} from '@/lib/utils/recurrence'

// ============================================================================
// Types
// ============================================================================

interface RecurrenceConfigProps {
  /** Valeur actuelle de la récurrence */
  value: RecurrenceRule | null
  /** Callback appelé lors d'un changement */
  onChange: (rule: RecurrenceRule | null) => void
  /** Si la récurrence est activée */
  isEnabled: boolean
  /** Callback pour activer/désactiver */
  onEnabledChange: (enabled: boolean) => void
  /** Date de début du créneau (pour preview) */
  startDate: Date
  /** Date de fin du créneau (pour preview) */
  endDate: Date
  /** Nombre d'employés sélectionnés */
  employeeCount: number
  /** Désactiver le composant */
  disabled?: boolean
}

// ============================================================================
// Constantes
// ============================================================================

const FREQUENCIES: RecurrenceFrequency[] = [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
]

const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

const DEFAULT_RULE: RecurrenceRule = {
  frequency: 'WEEKLY',
  interval: 1,
  daysOfWeek: ['MONDAY'],
  occurrences: 4,
}

// ============================================================================
// Composant
// ============================================================================

export function RecurrenceConfig({
  value,
  onChange,
  isEnabled,
  onEnabledChange,
  startDate,
  endDate,
  employeeCount,
  disabled = false,
}: RecurrenceConfigProps) {
  // État local pour le mode de fin (date ou occurrences)
  const [endMode, setEndMode] = useState<'occurrences' | 'date'>(
    value?.endDate ? 'date' : 'occurrences'
  )

  // Règle locale pour édition
  const [localRule, setLocalRule] = useState<RecurrenceRule>(
    value || DEFAULT_RULE
  )

  // Erreur de validation
  const [validationError, setValidationError] = useState<string | null>(null)

  // Nombre total de créneaux calculé
  const [totalSchedules, setTotalSchedules] = useState<number>(0)

  // Synchroniser la règle locale quand value change
  useEffect(() => {
    if (value) {
      setLocalRule(value)
      setEndMode(value.endDate ? 'date' : 'occurrences')
    }
  }, [value])

  // Calculer le total de créneaux quand les paramètres changent
  useEffect(() => {
    if (isEnabled && localRule) {
      const total = calculateTotalSchedules(
        localRule,
        employeeCount,
        startDate,
        endDate
      )
      setTotalSchedules(total)
    } else {
      setTotalSchedules(employeeCount)
    }
  }, [isEnabled, localRule, employeeCount, startDate, endDate])

  // Valider et propager les changements
  const updateRule = useCallback(
    (updates: Partial<RecurrenceRule>) => {
      const newRule = { ...localRule, ...updates }
      setLocalRule(newRule)

      const error = validateRecurrenceRule(newRule)
      setValidationError(error)

      if (!error) {
        onChange(newRule)
      }
    },
    [localRule, onChange]
  )

  // Gérer le changement d'activation
  const handleEnabledChange = (enabled: boolean) => {
    onEnabledChange(enabled)
    if (enabled) {
      // Initialiser avec la règle par défaut ou existante
      const rule = value || DEFAULT_RULE
      setLocalRule(rule)
      onChange(rule)
    } else {
      onChange(null)
    }
  }

  // Gérer le changement de fréquence
  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    const updates: Partial<RecurrenceRule> = { frequency }

    // Réinitialiser les jours si on passe en DAILY ou MONTHLY
    if (frequency === 'DAILY' || frequency === 'MONTHLY') {
      updates.daysOfWeek = undefined
    } else if (!localRule.daysOfWeek || localRule.daysOfWeek.length === 0) {
      // Initialiser avec le jour actuel pour WEEKLY/BIWEEKLY
      const dayIndex = startDate.getDay()
      const dayMap: DayOfWeek[] = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
      ]
      const dayName = dayMap[dayIndex] ?? 'MONDAY'
      updates.daysOfWeek = [dayName]
    }

    updateRule(updates)
  }

  // Gérer le toggle d'un jour
  const handleDayToggle = (day: DayOfWeek) => {
    const currentDays = localRule.daysOfWeek || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day]

    // Au moins un jour doit être sélectionné
    if (newDays.length === 0) return

    updateRule({ daysOfWeek: newDays })
  }

  // Gérer le changement de mode de fin
  const handleEndModeChange = (mode: 'occurrences' | 'date') => {
    setEndMode(mode)
    if (mode === 'occurrences') {
      updateRule({
        endDate: undefined,
        occurrences: localRule.occurrences || 4,
      })
    } else {
      updateRule({
        occurrences: undefined,
        endDate: localRule.endDate || addWeeks(startDate, 4),
      })
    }
  }

  // Afficher le warning si trop de créneaux
  const showWarning = totalSchedules > MAX_TOTAL_SCHEDULES

  return (
    <div className="space-y-4 rounded-lg border p-4">
      {/* Header avec switch */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="recurrence-enabled" className="text-base font-medium">
            Créneau récurrent
          </Label>
          <p className="text-sm text-muted-foreground">
            Répéter ce créneau automatiquement
          </p>
        </div>
        <Switch
          id="recurrence-enabled"
          checked={isEnabled}
          onCheckedChange={handleEnabledChange}
          disabled={disabled}
        />
      </div>

      {/* Configuration (si activé) */}
      {isEnabled && (
        <div className="space-y-4 pt-2">
          {/* Fréquence */}
          <div className="grid gap-2">
            <Label htmlFor="frequency">Fréquence</Label>
            <Select
              value={localRule.frequency}
              onValueChange={(v) =>
                handleFrequencyChange(v as RecurrenceFrequency)
              }
              disabled={disabled}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq} value={freq}>
                    {FREQUENCY_LABELS[freq]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intervalle (sauf BIWEEKLY qui est fixe) */}
          {localRule.frequency !== 'BIWEEKLY' && (
            <div className="grid gap-2">
              <Label htmlFor="interval">
                Répéter tous les
                {localRule.frequency === 'DAILY' && ' X jours'}
                {localRule.frequency === 'WEEKLY' && ' X semaines'}
                {localRule.frequency === 'MONTHLY' && ' X mois'}
              </Label>
              <Input
                id="interval"
                type="number"
                min={1}
                max={12}
                value={localRule.interval}
                onChange={(e) =>
                  updateRule({ interval: parseInt(e.target.value) || 1 })
                }
                disabled={disabled}
                className="w-24"
              />
            </div>
          )}

          {/* Jours de la semaine (WEEKLY/BIWEEKLY seulement) */}
          {(localRule.frequency === 'WEEKLY' ||
            localRule.frequency === 'BIWEEKLY') && (
            <div className="grid gap-2">
              <Label>Jours de répétition</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected =
                    localRule.daysOfWeek?.includes(day) || false
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleDayToggle(day)}
                      disabled={disabled}
                      className="min-w-[48px]"
                    >
                      {DAY_LABELS[day]}
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Mode de fin */}
          <div className="grid gap-2">
            <Label>Fin de la récurrence</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={endMode === 'occurrences' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEndModeChange('occurrences')}
                disabled={disabled}
              >
                Nombre d&apos;occurrences
              </Button>
              <Button
                type="button"
                variant={endMode === 'date' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEndModeChange('date')}
                disabled={disabled}
              >
                Date de fin
              </Button>
            </div>
          </div>

          {/* Nombre d'occurrences */}
          {endMode === 'occurrences' && (
            <div className="grid gap-2">
              <Label htmlFor="occurrences">
                Nombre de répétitions (max {MAX_OCCURRENCES})
              </Label>
              <Input
                id="occurrences"
                type="number"
                min={1}
                max={MAX_OCCURRENCES}
                value={localRule.occurrences || 4}
                onChange={(e) =>
                  updateRule({
                    occurrences: Math.min(
                      parseInt(e.target.value) || 1,
                      MAX_OCCURRENCES
                    ),
                  })
                }
                disabled={disabled}
                className="w-24"
              />
            </div>
          )}

          {/* Date de fin */}
          {endMode === 'date' && (
            <div className="grid gap-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !localRule.endDate && 'text-muted-foreground'
                    )}
                    disabled={disabled}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localRule.endDate
                      ? format(localRule.endDate, 'PPP', { locale: fr })
                      : 'Sélectionner une date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localRule.endDate}
                    onSelect={(date) =>
                      updateRule({ endDate: date || undefined })
                    }
                    disabled={(date) => date < startDate}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Erreur de validation */}
          {validationError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Info sur le nombre de créneaux */}
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
                {totalSchedules} créneau{totalSchedules > 1 ? 'x' : ''} seront
                créés
              </p>
              {showWarning && (
                <p className="mt-1">
                  Maximum autorisé : {MAX_TOTAL_SCHEDULES}. Réduisez le nombre
                  d&apos;occurrences ou d&apos;employés.
                </p>
              )}
              {!showWarning && employeeCount > 1 && (
                <p className="mt-1">
                  ({localRule.occurrences || 'N'} occurrences × {employeeCount}{' '}
                  employés)
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
