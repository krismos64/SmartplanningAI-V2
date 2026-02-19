/**
 * Dialog de confirmation de suppression Employee
 *
 * @description Modal de confirmation avec avertissement sur les donnees liees.
 * Utilise les patterns SP-150 (useDeleteMutation) et shadcn AlertDialog.
 * Note: MANAGER ne peut pas supprimer, seulement desactiver (via toggleStatus).
 *
 * @ticket SP-152
 */

'use client'

import { AlertTriangle } from 'lucide-react'

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
import { useIsImpersonating } from '@/hooks'
import { useDeleteMutation } from '@/hooks/use-crud-mutation'
import { deleteEmployee } from '@/lib/actions/employees'
import type { EmployeeWithCounts } from '@/lib/validations/employee'

// ============================================================================
// Types
// ============================================================================

interface DeleteEmployeeDialogProps {
  /** Employee a supprimer */
  employee: EmployeeWithCounts | null
  /** Etat d'ouverture du dialog */
  open: boolean
  /** Callback de fermeture */
  onOpenChange: (open: boolean) => void
  /** Callback apres suppression reussie */
  onSuccess?: () => void
}

// ============================================================================
// Composant
// ============================================================================

export function DeleteEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: DeleteEmployeeDialogProps) {
  const isImpersonating = useIsImpersonating()

  // Hook mutation pour delete
  const deleteMutation = useDeleteMutation(deleteEmployee, {
    successMessage: 'Employe supprime avec succes',
    onSuccess: () => {
      onOpenChange(false)
      onSuccess?.()
    },
  })

  // Handler de confirmation
  const handleConfirm = () => {
    if (!employee) return
    void deleteMutation.mutate(employee.id)
  }

  if (!employee) return null

  const hasSchedules = (employee._count?.schedules ?? 0) > 0
  const hasLeaveRequests = (employee._count?.leaveRequests ?? 0) > 0
  const hasRelations = hasSchedules || hasLeaveRequests

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer l&apos;employe
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Etes-vous sur de vouloir supprimer{' '}
                <span className="font-semibold text-foreground">
                  {employee.firstName} {employee.lastName}
                </span>{' '}
                ?
              </p>

              {hasRelations && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm">
                  <p className="mb-2 font-medium text-destructive">
                    Attention : Cet employe a des donnees liees
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {hasSchedules && (
                      <li>
                        {employee._count?.schedules} planning
                        {(employee._count?.schedules ?? 0) > 1 ? 's' : ''}
                      </li>
                    )}
                    {hasLeaveRequests && (
                      <li>
                        {employee._count?.leaveRequests} demande
                        {(employee._count?.leaveRequests ?? 0) > 1
                          ? 's'
                          : ''}{' '}
                        de conge
                      </li>
                    )}
                  </ul>
                  <p className="mt-2 text-xs">
                    Conseil : Desactivez l&apos;employe plutot que de le
                    supprimer pour conserver l&apos;historique.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Cette action est irreversible.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={
              deleteMutation.isPending || hasSchedules || isImpersonating
            }
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
