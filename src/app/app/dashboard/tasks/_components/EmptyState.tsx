/**
 * EmptyState - État affiché quand aucune tâche n'existe
 *
 * @description Encourage l'utilisateur à créer sa première tâche
 * @ticket SP-419
 */

import { CheckSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onCreateTask: () => void
}

export function EmptyState({ onCreateTask }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="empty-state"
    >
      <div className="mb-4 rounded-full bg-muted p-4">
        <CheckSquare
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="mb-2 text-lg font-medium">Aucune tâche</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Créez votre première tâche personnelle pour organiser votre travail
      </p>
      <Button onClick={onCreateTask} data-testid="empty-state-create-button">
        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
        Nouvelle tâche
      </Button>
    </div>
  )
}
