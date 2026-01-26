/**
 * Composant ConflictConfirmDialog - Dialog de confirmation pour conflits
 *
 * @description Dialog modal pour confirmer une action malgré des conflits détectés
 * @ticket SP-400
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
import { ConflictAlert } from './ConflictAlert'

import type { AvailabilityConflict } from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface ConflictConfirmDialogProps {
  /** État d'ouverture du dialog */
  open: boolean
  /** Callback de changement d'état */
  onOpenChange: (open: boolean) => void
  /** Liste de tous les conflits */
  conflicts: AvailabilityConflict[]
  /** Conflits bloquants */
  hardConflicts: AvailabilityConflict[]
  /** Conflits d'avertissement */
  softConflicts: AvailabilityConflict[]
  /** Callback de confirmation */
  onConfirm: () => void
  /** Callback d'annulation */
  onCancel: () => void
  /** Nom de l'employé concerné (pour le titre) */
  employeeName?: string
  /** Date du créneau (pour le contexte) */
  scheduleDate?: string
  /** Indique si une action est en cours */
  isLoading?: boolean
}

// ============================================================================
// Composant principal
// ============================================================================

export function ConflictConfirmDialog({
  open,
  onOpenChange,
  conflicts,
  hardConflicts,
  softConflicts,
  onConfirm,
  onCancel,
  employeeName,
  scheduleDate,
  isLoading = false,
}: ConflictConfirmDialogProps) {
  const hasHardConflicts = hardConflicts.length > 0

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle
              className={
                hasHardConflicts
                  ? 'h-5 w-5 text-destructive'
                  : 'h-5 w-5 text-yellow-600'
              }
            />
            Conflit{conflicts.length > 1 ? 's' : ''} détecté
            {conflicts.length > 1 ? 's' : ''}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                {employeeName && scheduleDate ? (
                  <>
                    Le créneau de <strong>{employeeName}</strong> le{' '}
                    <strong>{scheduleDate}</strong> entre en conflit avec :
                  </>
                ) : (
                  'Ce créneau entre en conflit avec des indisponibilités déclarées :'
                )}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Affichage des conflits */}
        <div className="max-h-[300px] overflow-y-auto">
          <ConflictAlert
            conflicts={conflicts}
            hardConflicts={hardConflicts}
            softConflicts={softConflicts}
            showActions={false}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              hasHardConflicts
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            {isLoading
              ? 'En cours...'
              : hasHardConflicts
                ? 'Confirmer malgré le conflit'
                : 'Confirmer'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
