/**
 * Bandeau des brouillons de la période affichée
 *
 * @ticket SP-614
 * @description Un brouillon n'est visible que du dirigeant et des managers.
 * Le 22 octobre 2026, Patisserie CARL a planifié un mois en brouillon sans
 * que rien ne le lui signale : ses employées ne verront aucun de ces créneaux.
 */

'use client'

import { EyeOff, Send } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface DraftsBannerProps {
  /** Nombre de brouillons dans la période affichée */
  count: number
  isPublishing: boolean
  onPublish: () => void
}

export function DraftsBanner({
  count,
  isPublishing,
  onPublish,
}: DraftsBannerProps) {
  if (count === 0) return null

  const label =
    count === 1
      ? '1 créneau en brouillon sur cette période'
      : `${count} créneaux en brouillon sur cette période`

  return (
    <Alert
      data-testid="drafts-banner"
      className="flex flex-col gap-3 border-primary/30 bg-primary/5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex gap-3">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <div>
          <AlertTitle>{label}</AlertTitle>
          <AlertDescription>
            Vos employés ne les voient pas et ne sont pas prévenus tant
            qu&apos;ils ne sont pas publiés.
          </AlertDescription>
        </div>
      </div>
      <Button
        data-testid="publish-drafts-button"
        onClick={onPublish}
        disabled={isPublishing}
        className="min-h-11 shrink-0"
      >
        <Send className="mr-2 h-4 w-4" aria-hidden />
        {isPublishing ? 'Publication…' : 'Publier'}
      </Button>
    </Alert>
  )
}
