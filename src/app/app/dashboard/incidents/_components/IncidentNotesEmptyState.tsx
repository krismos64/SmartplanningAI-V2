/**
 * IncidentNotesEmptyState - État affiché quand aucune note n'existe
 *
 * @description Encourage l'utilisateur à créer sa première note (si autorisé)
 * @ticket SP-426
 */

import { FileWarning, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface IncidentNotesEmptyStateProps {
  onCreateNote: () => void
  canCreate: boolean
}

export function IncidentNotesEmptyState({
  onCreateNote,
  canCreate,
}: IncidentNotesEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="empty-state"
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <FileWarning
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-2 text-lg font-medium">Aucune note d&apos;incident</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {canCreate
          ? 'Créez votre première note pour suivre les incidents comportementaux'
          : 'Aucune note visible pour le moment'}
      </p>
      {canCreate && (
        <Button onClick={onCreateNote} data-testid="empty-state-create-button">
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Nouvelle note
        </Button>
      )}
    </div>
  )
}
