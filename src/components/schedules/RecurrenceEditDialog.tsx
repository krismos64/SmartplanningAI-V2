/**
 * Composant RecurrenceEditDialog - Dialog de modification/suppression groupée
 *
 * @description Dialog pour choisir la portée d'une modification/suppression
 * sur un créneau récurrent (ce créneau, futurs, ou tous)
 * @ticket SP-399
 */

'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { CalendarX, CalendarClock, Calendar, Trash2, Edit } from 'lucide-react'
import { useIsImpersonating } from '@/hooks'

// ============================================================================
// Types
// ============================================================================

export type RecurrenceEditScope = 'single' | 'future' | 'all'

export type RecurrenceEditAction = 'edit' | 'delete'

interface RecurrenceEditDialogProps {
  /** Si le dialog est ouvert */
  isOpen: boolean
  /** Callback de fermeture */
  onClose: () => void
  /** Callback de confirmation avec la portée choisie */
  onConfirm: (scope: RecurrenceEditScope) => void
  /** Action en cours (édition ou suppression) */
  action: RecurrenceEditAction
  /** Nombre de créneaux concernés pour chaque option */
  counts?: {
    single: number
    future: number
    all: number
  }
  /** Chargement en cours */
  isLoading?: boolean
}

// ============================================================================
// Composant
// ============================================================================

export function RecurrenceEditDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  counts = { single: 1, future: 0, all: 0 },
  isLoading = false,
}: RecurrenceEditDialogProps) {
  const isImpersonating = useIsImpersonating()
  const isDelete = action === 'delete'

  const title = isDelete
    ? 'Supprimer un créneau récurrent'
    : 'Modifier un créneau récurrent'

  const description = isDelete
    ? "Ce créneau fait partie d'une série récurrente. Quelle action souhaitez-vous effectuer ?"
    : "Ce créneau fait partie d'une série récurrente. Quels créneaux souhaitez-vous modifier ?"

  const handleConfirm = (scope: RecurrenceEditScope) => {
    onConfirm(scope)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDelete ? (
              <Trash2 className="h-5 w-5 text-destructive" />
            ) : (
              <Edit className="h-5 w-5 text-primary" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-3 py-4">
          {/* Option: Ce créneau uniquement */}
          <Button
            variant="outline"
            className="h-auto justify-start gap-3 p-4 text-left"
            onClick={() => handleConfirm('single')}
            disabled={isLoading || isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
          >
            <CalendarX className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Ce créneau uniquement</p>
              <p className="text-sm text-muted-foreground">
                {isDelete ? 'Supprime' : 'Modifie'} uniquement cette occurrence
                {counts.single > 1 && ` (${counts.single} créneau)`}
              </p>
            </div>
          </Button>

          {/* Option: Ce créneau et les suivants */}
          {counts.future > 0 && (
            <Button
              variant="outline"
              className="h-auto justify-start gap-3 p-4 text-left"
              onClick={() => handleConfirm('future')}
              disabled={isLoading || isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
            >
              <CalendarClock className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Ce créneau et les suivants</p>
                <p className="text-sm text-muted-foreground">
                  {isDelete ? 'Supprime' : 'Modifie'} cette occurrence et toutes
                  les futures ({counts.future} créneau
                  {counts.future > 1 ? 'x' : ''})
                </p>
              </div>
            </Button>
          )}

          {/* Option: Tous les créneaux */}
          {counts.all > 1 && (
            <Button
              variant="outline"
              className="h-auto justify-start gap-3 p-4 text-left"
              onClick={() => handleConfirm('all')}
              disabled={isLoading || isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
            >
              <Calendar className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium">Tous les créneaux de la série</p>
                <p className="text-sm text-muted-foreground">
                  {isDelete ? 'Supprime' : 'Modifie'} tous les créneaux de cette
                  récurrence ({counts.all} créneau{counts.all > 1 ? 'x' : ''})
                </p>
              </div>
            </Button>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================================
// Dialog de confirmation de suppression simple
// ============================================================================

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Supprimer ce créneau ?',
  description = 'Cette action est irréversible. Le créneau sera définitivement supprimé.',
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const isImpersonating = useIsImpersonating()

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
