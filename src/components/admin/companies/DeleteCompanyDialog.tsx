/**
 * Dialog de confirmation de suppression Company
 *
 * @description Modal de confirmation avec avertissement sur le cascade delete.
 * Utilise les patterns SP-150 (useDeleteMutation) et shadcn AlertDialog.
 *
 * @ticket SP-151
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
import { deleteCompany, type CompanyWithCounts } from '@/lib/actions/companies'

// ============================================================================
// Types
// ============================================================================

interface DeleteCompanyDialogProps {
  /** Company à supprimer */
  company: CompanyWithCounts | null
  /** État d'ouverture du dialog */
  open: boolean
  /** Callback de fermeture */
  onOpenChange: (open: boolean) => void
  /** Callback après suppression réussie */
  onSuccess?: () => void
}

// ============================================================================
// Composant
// ============================================================================

export function DeleteCompanyDialog({
  company,
  open,
  onOpenChange,
  onSuccess,
}: DeleteCompanyDialogProps) {
  const isImpersonating = useIsImpersonating()

  // Hook mutation pour delete
  const deleteMutation = useDeleteMutation(deleteCompany, {
    successMessage: 'Entreprise supprimée avec succès',
    onSuccess: () => {
      onOpenChange(false)
      onSuccess?.()
    },
  })

  // Handler de confirmation
  const handleConfirm = () => {
    if (!company) return
    void deleteMutation.mutate(company.id)
  }

  if (!company) return null

  const hasRelations =
    company._count.users > 0 ||
    company._count.teams > 0 ||
    company._count.employees > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer l&apos;entreprise
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-semibold text-foreground">
                  {company.name}
                </span>{' '}
                ?
              </p>

              {hasRelations && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm">
                  <p className="mb-2 font-medium text-destructive">
                    Cette action supprimera également :
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    {company._count.users > 0 && (
                      <li>
                        {company._count.users} utilisateur
                        {company._count.users > 1 ? 's' : ''}
                      </li>
                    )}
                    {company._count.teams > 0 && (
                      <li>
                        {company._count.teams} équipe
                        {company._count.teams > 1 ? 's' : ''}
                      </li>
                    )}
                    {company._count.employees > 0 && (
                      <li>
                        {company._count.employees} employé
                        {company._count.employees > 1 ? 's' : ''}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                Cette action est irréversible.
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
            disabled={deleteMutation.isPending || isImpersonating}
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
