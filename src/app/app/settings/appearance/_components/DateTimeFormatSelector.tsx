'use client'

/**
 * DateTimeFormatSelector - Sélecteurs de format date et heure
 *
 * Deux selects pour configurer :
 * - Format de date (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
 * - Format d'heure (24h, 12h)
 *
 * @ticket SP-276
 */

import { Calendar, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  DateFormatPreference,
  TimeFormatPreference,
} from '@/types/preferences'
import { DATE_FORMAT_OPTIONS, TIME_FORMAT_OPTIONS } from '@/types/preferences'

interface DateTimeFormatSelectorProps {
  /** Format de date actuellement sélectionné */
  dateFormat: DateFormatPreference
  /** Format d'heure actuellement sélectionné */
  timeFormat: TimeFormatPreference
  /** Callback lors du changement de format de date */
  onDateFormatChange: (value: DateFormatPreference) => void
  /** Callback lors du changement de format d'heure */
  onTimeFormatChange: (value: TimeFormatPreference) => void
  /** Désactive les interactions */
  disabled?: boolean
}

export function DateTimeFormatSelector({
  dateFormat,
  timeFormat,
  onDateFormatChange,
  onTimeFormatChange,
  disabled,
}: DateTimeFormatSelectorProps) {
  return (
    <Card data-testid="datetime-format-selector">
      <CardHeader>
        <CardTitle className="text-lg">Formats de date et heure</CardTitle>
        <p className="text-sm text-muted-foreground">
          Personnalisez l&apos;affichage des dates et heures dans
          l&apos;application
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format de date */}
        <div className="space-y-2">
          <Label
            htmlFor="date-format"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Format de date
          </Label>
          <Select
            value={dateFormat}
            onValueChange={(value) =>
              onDateFormatChange(value as DateFormatPreference)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="date-format"
              className="w-full max-w-xs"
              data-testid="date-format-select"
            >
              <SelectValue placeholder="Sélectionnez un format" />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  data-testid={`date-format-option-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Exemple :{' '}
            <span className="font-mono">{getDateExample(dateFormat)}</span>
          </p>
        </div>

        {/* Format d'heure */}
        <div className="space-y-2">
          <Label
            htmlFor="time-format"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            Format d&apos;heure
          </Label>
          <Select
            value={timeFormat}
            onValueChange={(value) =>
              onTimeFormatChange(value as TimeFormatPreference)
            }
            disabled={disabled}
          >
            <SelectTrigger
              id="time-format"
              className="w-full max-w-xs"
              data-testid="time-format-select"
            >
              <SelectValue placeholder="Sélectionnez un format" />
            </SelectTrigger>
            <SelectContent>
              {TIME_FORMAT_OPTIONS.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  data-testid={`time-format-option-${option.value}`}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Exemple :{' '}
            <span className="font-mono">{getTimeExample(timeFormat)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Retourne un exemple de date formatée
 */
function getDateExample(format: DateFormatPreference): string {
  switch (format) {
    case 'DD/MM/YYYY':
      return '31/12/2026'
    case 'MM/DD/YYYY':
      return '12/31/2026'
    case 'YYYY-MM-DD':
      return '2026-12-31'
    default:
      return '31/12/2026'
  }
}

/**
 * Retourne un exemple d'heure formatée
 */
function getTimeExample(format: TimeFormatPreference): string {
  switch (format) {
    case '24h':
      return '14:30'
    case '12h':
      return '2:30 PM'
    default:
      return '14:30'
  }
}
