/**
 * Composant ConflictAlert - Alerte de conflit horaire
 *
 * @description Affiche les conflits entre un créneau et les indisponibilités
 * @ticket SP-400
 */

'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AlertTriangle, Info, Calendar, Clock } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { AvailabilityConflict } from '@/lib/actions/availabilities'
import { availabilityTypeLabels } from '@/lib/validations/availability'
import { AvailabilityType } from '@prisma/client'

// ============================================================================
// Types
// ============================================================================

export interface ConflictAlertProps {
  /** Tous les conflits détectés */
  conflicts: AvailabilityConflict[]
  /** Conflits bloquants (VACATION, SICK, UNAVAILABLE) */
  hardConflicts: AvailabilityConflict[]
  /** Conflits d'avertissement (PREFERRED, TRAINING, OTHER) */
  softConflicts: AvailabilityConflict[]
  /** Callback pour confirmer malgré le conflit */
  onConfirm?: () => void
  /** Callback pour annuler l'action */
  onCancel?: () => void
  /** Afficher les boutons Confirmer/Annuler */
  showActions?: boolean
  /** Classe CSS additionnelle */
  className?: string
}

// ============================================================================
// Emojis par type d'indisponibilité
// ============================================================================

const typeEmojis: Record<AvailabilityType, string> = {
  VACATION: '🏖️',
  SICK: '🤒',
  UNAVAILABLE: '🚫',
  PREFERRED: '⭐',
  TRAINING: '📚',
  OTHER: '📌',
}

// ============================================================================
// Composant interne : Liste des conflits
// ============================================================================

function ConflictList({
  conflicts,
  isHard,
}: {
  conflicts: AvailabilityConflict[]
  isHard: boolean
}) {
  if (conflicts.length === 0) return null

  return (
    <ul className="mt-2 space-y-2">
      {conflicts.map((conflict) => (
        <li
          key={conflict.id}
          className={cn(
            'rounded-md border p-2 text-sm',
            isHard
              ? 'border-destructive/30 bg-destructive/5'
              : 'border-yellow-500/30 bg-yellow-500/5'
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Nom employé */}
            <span className="font-medium">
              {conflict.employee.firstName} {conflict.employee.lastName}
            </span>

            {/* Badge type avec emoji */}
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isHard
                  ? 'border-destructive/50 text-destructive'
                  : 'border-yellow-600/50 text-yellow-700 dark:text-yellow-500'
              )}
            >
              {typeEmojis[conflict.type]}{' '}
              {availabilityTypeLabels[conflict.type]}
            </Badge>
          </div>

          {/* Dates */}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(conflict.startDate), 'dd MMM yyyy', {
                locale: fr,
              })}
              {format(new Date(conflict.startDate), 'yyyy-MM-dd') !==
                format(new Date(conflict.endDate), 'yyyy-MM-dd') && (
                <>
                  {' → '}
                  {format(new Date(conflict.endDate), 'dd MMM yyyy', {
                    locale: fr,
                  })}
                </>
              )}
            </span>

            {/* Heures si spécifiées */}
            {conflict.startTime && conflict.endTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {conflict.startTime} - {conflict.endTime}
              </span>
            )}
          </div>

          {/* Raison si présente */}
          {conflict.reason && (
            <p className="mt-1 text-xs italic text-muted-foreground">
              &quot;{conflict.reason}&quot;
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

// ============================================================================
// Composant principal
// ============================================================================

export function ConflictAlert({
  conflicts,
  hardConflicts,
  softConflicts,
  onConfirm,
  onCancel,
  showActions = false,
  className,
}: ConflictAlertProps) {
  // Rien à afficher si pas de conflits
  if (conflicts.length === 0) {
    return null
  }

  const hasHardConflicts = hardConflicts.length > 0
  const hasSoftConflicts = softConflicts.length > 0

  return (
    <div className={cn('space-y-3', className)}>
      {/* Alerte Hard Conflicts */}
      {hasHardConflicts && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            Conflit{hardConflicts.length > 1 ? 's' : ''} horaire
            {hardConflicts.length > 1 ? 's' : ''} détecté
            {hardConflicts.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription>
            <p>
              {hardConflicts.length === 1
                ? 'Un employé a déclaré une indisponibilité sur cette période.'
                : `${hardConflicts.length} indisponibilités bloquantes détectées sur cette période.`}
            </p>
            <ConflictList conflicts={hardConflicts} isHard={true} />
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte Soft Conflicts */}
      {hasSoftConflicts && (
        <Alert
          variant="default"
          className="border-yellow-500/50 bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 [&>svg]:text-yellow-600"
        >
          <Info className="h-4 w-4" />
          <AlertTitle>
            Avertissement{softConflicts.length > 1 ? 's' : ''}
          </AlertTitle>
          <AlertDescription>
            <p className="text-yellow-700 dark:text-yellow-300">
              {softConflicts.length === 1
                ? 'Un employé a une préférence ou formation sur cette période.'
                : `${softConflicts.length} préférences ou formations sur cette période.`}
            </p>
            <ConflictList conflicts={softConflicts} isHard={false} />
          </AlertDescription>
        </Alert>
      )}

      {/* Boutons d'action */}
      {showActions && (onConfirm || onCancel) && (
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Annuler
            </Button>
          )}
          {onConfirm && (
            <Button
              variant={hasHardConflicts ? 'destructive' : 'default'}
              size="sm"
              onClick={onConfirm}
            >
              {hasHardConflicts ? 'Créer malgré le conflit' : 'Confirmer'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
