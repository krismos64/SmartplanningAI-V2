/**
 * Composant RecurrenceEditDialog - Dialog de gestion de créneau récurrent
 *
 * @description Dialog pour choisir l'action et la portée sur un créneau récurrent
 * @ticket SP-399
 */

'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Calendar, CalendarRange, Trash2, Pencil } from 'lucide-react'
import { useIsImpersonating } from '@/hooks'

// ============================================================================
// Types
// ============================================================================

export type RecurrenceEditScope = 'single' | 'all'

export type RecurrenceEditAction = 'edit' | 'delete'

interface RecurrenceEditDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scope: RecurrenceEditScope) => void
  action: RecurrenceEditAction
  counts?: {
    single: number
    future: number
    all: number
  }
  isLoading?: boolean
  /** Callback pour changer d'action (modifier → supprimer) */
  onActionChange?: (action: RecurrenceEditAction) => void
}

// ============================================================================
// Composant principal
// ============================================================================

export function RecurrenceEditDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  counts = { single: 1, future: 0, all: 0 },
  isLoading = false,
  onActionChange,
}: RecurrenceEditDialogProps) {
  const isImpersonating = useIsImpersonating()
  const isDelete = action === 'delete'
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  const title = isDelete
    ? 'Supprimer un créneau récurrent'
    : 'Créneau récurrent'

  const description = isDelete
    ? 'Quels créneaux souhaitez-vous supprimer ?'
    : 'Que souhaitez-vous faire ?'

  const handleClose = () => {
    setConfirmDeleteAll(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={isOpen && !confirmDeleteAll}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isDelete ? (
                <Trash2 className="h-5 w-5 text-destructive" />
              ) : (
                <Pencil className="h-5 w-5 text-primary" />
              )}
              {title}
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Section Modifier */}
            {!isDelete && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Modifier
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-auto justify-start gap-3 p-3 text-left"
                    onClick={() => onConfirm('single')}
                    disabled={isLoading || isImpersonating}
                  >
                    <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Ce créneau</p>
                    </div>
                  </Button>

                  {counts.all > 1 && (
                    <Button
                      variant="outline"
                      className="h-auto justify-start gap-3 p-3 text-left"
                      onClick={() => onConfirm('all')}
                      disabled={isLoading || isImpersonating}
                    >
                      <CalendarRange className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Toute la série</p>
                        <p className="text-xs text-muted-foreground">
                          {counts.all} créneaux
                        </p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Section Supprimer */}
            {!isDelete && onActionChange && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Supprimer
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-auto justify-start gap-3 border-destructive/30 p-3 text-left text-destructive hover:bg-destructive/5"
                    onClick={() => {
                      onActionChange('delete')
                      onConfirm('single')
                    }}
                    disabled={isLoading || isImpersonating}
                  >
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Ce créneau</p>
                    </div>
                  </Button>

                  {counts.all > 1 && (
                    <Button
                      variant="outline"
                      className="h-auto justify-start gap-3 border-destructive/30 p-3 text-left text-destructive hover:bg-destructive/5"
                      onClick={() => {
                        onActionChange('delete')
                        setConfirmDeleteAll(true)
                      }}
                      disabled={isLoading || isImpersonating}
                    >
                      <Trash2 className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Toute la série</p>
                        <p className="text-xs text-destructive/70">
                          {counts.all} créneaux
                        </p>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Mode delete direct (si appelé en mode delete) */}
            {isDelete && (
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto justify-start gap-3 border-destructive/30 p-3 text-left text-destructive hover:bg-destructive/5"
                  onClick={() => onConfirm('single')}
                  disabled={isLoading || isImpersonating}
                >
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Ce créneau</p>
                  </div>
                </Button>

                {counts.all > 1 && (
                  <Button
                    variant="outline"
                    className="h-auto justify-start gap-3 border-destructive/30 p-3 text-left text-destructive hover:bg-destructive/5"
                    onClick={() => setConfirmDeleteAll(true)}
                    disabled={isLoading || isImpersonating}
                  >
                    <CalendarRange className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Toute la série</p>
                      <p className="text-xs text-destructive/70">
                        {counts.all} créneaux
                      </p>
                    </div>
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression de toute la série */}
      <AlertDialog open={confirmDeleteAll} onOpenChange={setConfirmDeleteAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer toute la série ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les {counts.all} créneaux de cette récurrence seront
              définitivement supprimés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setConfirmDeleteAll(false)
                onConfirm('all')
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer tout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
