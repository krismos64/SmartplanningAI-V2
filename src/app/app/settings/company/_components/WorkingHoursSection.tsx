'use client'

/**
 * WorkingHoursSection - Section des horaires de travail
 *
 * - Heure d'ouverture et fermeture
 * - Toggle pause déjeuner avec horaires
 *
 * @ticket SP-435
 */

import { Clock, Coffee } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { LunchBreakSettings } from '@/types/company'
import { COMPANY_SETTINGS_DESCRIPTIONS } from '@/lib/validations/company-settings'

interface WorkingHoursSectionProps {
  /** Heure d'ouverture (format HH:mm) */
  workingHoursStart: string
  /** Heure de fermeture (format HH:mm) */
  workingHoursEnd: string
  /** Paramètres de la pause déjeuner */
  lunchBreak: LunchBreakSettings
  /** Callback lors du changement de l'heure d'ouverture */
  onWorkingHoursStartChange: (time: string) => void
  /** Callback lors du changement de l'heure de fermeture */
  onWorkingHoursEndChange: (time: string) => void
  /** Callback lors du changement de la pause déjeuner */
  onLunchBreakChange: (lunchBreak: LunchBreakSettings) => void
  /** Désactive les inputs */
  disabled?: boolean
}

export function WorkingHoursSection({
  workingHoursStart,
  workingHoursEnd,
  lunchBreak,
  onWorkingHoursStartChange,
  onWorkingHoursEndChange,
  onLunchBreakChange,
  disabled = false,
}: WorkingHoursSectionProps) {
  /**
   * Toggle l'activation de la pause déjeuner
   */
  const handleLunchBreakToggle = (enabled: boolean) => {
    onLunchBreakChange({
      ...lunchBreak,
      enabled,
    })
  }

  /**
   * Change l'heure de début de la pause
   */
  const handleLunchStartChange = (start: string) => {
    onLunchBreakChange({
      ...lunchBreak,
      start,
    })
  }

  /**
   * Change l'heure de fin de la pause
   */
  const handleLunchEndChange = (end: string) => {
    onLunchBreakChange({
      ...lunchBreak,
      end,
    })
  }

  return (
    <Card data-testid="working-hours-section">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          Horaires de travail
        </CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {COMPANY_SETTINGS_DESCRIPTIONS.workingHours}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Horaires d'ouverture/fermeture */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="working-hours-start">Heure d&apos;ouverture</Label>
            <Input
              id="working-hours-start"
              type="time"
              value={workingHoursStart}
              onChange={(e) => onWorkingHoursStartChange(e.target.value)}
              disabled={disabled}
              data-testid="working-hours-start-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="working-hours-end">Heure de fermeture</Label>
            <Input
              id="working-hours-end"
              type="time"
              value={workingHoursEnd}
              onChange={(e) => onWorkingHoursEndChange(e.target.value)}
              disabled={disabled}
              data-testid="working-hours-end-input"
            />
          </div>
        </div>

        {/* Pause déjeuner */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="lunch-break-toggle"
                  className="cursor-pointer font-medium"
                >
                  Pause déjeuner
                </Label>
                <p className="text-xs text-muted-foreground">
                  {COMPANY_SETTINGS_DESCRIPTIONS.lunchBreak}
                </p>
              </div>
            </div>
            <Switch
              id="lunch-break-toggle"
              checked={lunchBreak.enabled}
              onCheckedChange={handleLunchBreakToggle}
              disabled={disabled}
              data-testid="lunch-break-toggle"
              aria-label="Activer la pause déjeuner"
            />
          </div>

          {/* Horaires pause déjeuner (visible uniquement si activé) */}
          {lunchBreak.enabled && (
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              data-testid="lunch-break-hours"
            >
              <div className="space-y-2">
                <Label htmlFor="lunch-start">Début de la pause</Label>
                <Input
                  id="lunch-start"
                  type="time"
                  value={lunchBreak.start}
                  onChange={(e) => handleLunchStartChange(e.target.value)}
                  disabled={disabled}
                  data-testid="lunch-break-start-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lunch-end">Fin de la pause</Label>
                <Input
                  id="lunch-end"
                  type="time"
                  value={lunchBreak.end}
                  onChange={(e) => handleLunchEndChange(e.target.value)}
                  disabled={disabled}
                  data-testid="lunch-break-end-input"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
