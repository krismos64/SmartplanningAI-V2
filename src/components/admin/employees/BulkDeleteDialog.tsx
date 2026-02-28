'use client'

import { useState } from 'react'
import { useIsImpersonating } from '@/hooks'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

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
import { bulkDeleteEmployees } from '@/lib/actions/employees'

interface BulkDeleteDialogProps {
  selectedCount: number
  selectedIds: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function BulkDeleteDialog({
  selectedCount,
  selectedIds,
  open,
  onOpenChange,
  onSuccess,
}: BulkDeleteDialogProps) {
  const isImpersonating = useIsImpersonating()
  const [isPending, setIsPending] = useState(false)

  const handleConfirm = async () => {
    setIsPending(true)
    try {
      const result = await bulkDeleteEmployees(selectedIds)

      if (result.success && result.data) {
        const { deletedCount, skippedNames } = result.data

        if (deletedCount > 0) {
          toast.success(
            `${deletedCount} employé${deletedCount > 1 ? 's' : ''} supprimé${deletedCount > 1 ? 's' : ''}`
          )
        }

        if (skippedNames.length > 0) {
          toast.warning(
            `${skippedNames.length} employé${skippedNames.length > 1 ? 's' : ''} ignoré${skippedNames.length > 1 ? 's' : ''} (accès non autorisé) : ${skippedNames.join(', ')}`
          )
        }

        onOpenChange(false)
        onSuccess?.()
      } else if (!result.success) {
        toast.error(result.error || 'Erreur lors de la suppression')
      }
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer {selectedCount} employé{selectedCount > 1 ? 's' : ''}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-semibold text-foreground">
                  {selectedCount} employé{selectedCount > 1 ? 's' : ''}
                </span>{' '}
                ?
              </p>

              <div className="rounded-md bg-destructive/10 p-3 text-sm">
                <p className="font-medium text-destructive">
                  Les plannings et demandes de congé associés seront également
                  supprimés.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Cette action est irréversible.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              void handleConfirm()
            }}
            disabled={isPending || isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
