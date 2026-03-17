'use client'

/**
 * PreferencesPreview - Prévisualisation des préférences
 *
 * Affiche un aperçu en temps réel de l'effet des préférences
 * sur l'affichage des dates et heures.
 *
 * @ticket SP-276
 */

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatDate,
  formatTime,
  formatDateTime,
} from '@/lib/helpers/date-format'
import type { DisplayPreferences } from '@/types/preferences'

interface PreferencesPreviewProps {
  /** Préférences actuelles */
  preferences: DisplayPreferences
}

export function PreferencesPreview({ preferences }: PreferencesPreviewProps) {
  const [now, setNow] = useState<Date | null>(null)

  // Évite le mismatch d'hydratation en attendant le client
  useEffect(() => {
    setNow(new Date())
    // Mettre à jour chaque minute pour la démo
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Dates d'exemple pour la prévisualisation
  const exampleDates = {
    today: now,
    yesterday: now ? new Date(now.getTime() - 86400000) : null,
    nextWeek: now ? new Date(now.getTime() + 7 * 86400000) : null,
  }

  const formatOptions = {
    dateFormat: preferences.dateFormat,
    timeFormat: preferences.timeFormat,
    language: preferences.language,
  }

  return (
    <Card data-testid="preferences-preview">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-muted-foreground" />
          Prévisualisation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Aperçu de vos préférences d&apos;affichage
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="space-y-3">
            {/* Date seule */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Date d&apos;aujourd&apos;hui :
              </span>
              <span
                className="font-mono text-sm font-medium"
                data-testid="preview-date"
              >
                {exampleDates.today
                  ? formatDate(exampleDates.today, formatOptions)
                  : '—'}
              </span>
            </div>

            {/* Heure seule */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Heure actuelle :
              </span>
              <span
                className="font-mono text-sm font-medium"
                data-testid="preview-time"
              >
                {exampleDates.today
                  ? formatTime(exampleDates.today, formatOptions)
                  : '—'}
              </span>
            </div>

            {/* Date + heure */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Date et heure :
              </span>
              <span
                className="font-mono text-sm font-medium"
                data-testid="preview-datetime"
              >
                {exampleDates.today
                  ? formatDateTime(exampleDates.today, formatOptions)
                  : '—'}
              </span>
            </div>

            {/* Séparateur */}
            <div className="border-t pt-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Exemples dans l&apos;application :
              </p>

              {/* Exemple planning */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Prochain planning :
                </span>
                <span className="font-medium">
                  {exampleDates.nextWeek
                    ? formatDate(exampleDates.nextWeek, formatOptions)
                    : '—'}
                </span>
              </div>

              {/* Exemple réunion */}
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Réunion d&apos;équipe :
                </span>
                <span className="font-medium">
                  {exampleDates.today
                    ? `${formatDate(exampleDates.today, formatOptions)} à ${formatTime(
                        new Date(exampleDates.today.setHours(9, 0, 0, 0)),
                        formatOptions
                      )}`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
