/**
 * Proposition d'ajouter un jour planifié aux jours d'ouverture
 *
 * @ticket SP-617
 * @description Patisserie CARL planifiait le week-end avec des jours
 * d'ouverture restés à lundi-vendredi. Ces jours servent aussi au décompte
 * des congés : un clic les aligne sur le planning réel.
 */

'use client'

import { CalendarPlus, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DAY_LABELS, type DayOfWeek } from '@/types/company'

interface OpeningDaysSuggestionProps {
  days: DayOfWeek[]
  isSaving: boolean
  onAdd: () => void
  onDismiss: () => void
}

function listeDesJours(days: DayOfWeek[]): string {
  const noms = days.map((d) => DAY_LABELS[d].toLowerCase())
  if (noms.length <= 1) return noms.join('')
  return `${noms.slice(0, -1).join(', ')} et ${noms[noms.length - 1]}`
}

export function OpeningDaysSuggestion({
  days,
  isSaving,
  onAdd,
  onDismiss,
}: OpeningDaysSuggestionProps) {
  if (days.length === 0) return null

  const jours = listeDesJours(days)
  const pluriel = days.length > 1

  return (
    <Alert
      data-testid="opening-days-suggestion"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <CalendarPlus
          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
          aria-hidden
        />
        <div>
          <AlertTitle>
            Vous planifiez le {jours},{' '}
            {pluriel ? 'qui ne sont pas' : "qui n'est pas"} dans vos jours
            d&apos;ouverture
          </AlertTitle>
          <AlertDescription>
            Les jours d&apos;ouverture servent aussi au décompte des congés.
          </AlertDescription>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          data-testid="opening-days-add"
          onClick={onAdd}
          disabled={isSaving}
          className="min-h-11"
        >
          {isSaving
            ? 'Enregistrement…'
            : pluriel
              ? 'Ajouter ces jours'
              : 'Ajouter ce jour'}
        </Button>
        <Button
          variant="ghost"
          onClick={onDismiss}
          disabled={isSaving}
          className="min-h-11"
          aria-label="Ne plus proposer"
        >
          <X className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Alert>
  )
}
