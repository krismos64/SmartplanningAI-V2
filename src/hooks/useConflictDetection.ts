/**
 * Hook useConflictDetection - Détection de conflits horaires
 *
 * @description Hook pour détecter les conflits entre un créneau et les indisponibilités
 * @ticket SP-400
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  checkAvailabilityConflicts,
  type AvailabilityConflict,
} from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface UseConflictDetectionParams {
  /** Liste des IDs des employés à vérifier */
  employeeIds: string[]
  /** Date de début du créneau */
  startDate: Date | null
  /** Date de fin du créneau */
  endDate: Date | null
  /** Heure de début (optionnelle, format HH:mm) */
  startTime?: string | null
  /** Heure de fin (optionnelle, format HH:mm) */
  endTime?: string | null
  /** Activer/désactiver la vérification */
  enabled?: boolean
  /** Délai de debounce en ms (défaut: 300) */
  debounceMs?: number
  /** ID d'availability à exclure (pour l'édition) */
  excludeAvailabilityId?: string
}

export interface UseConflictDetectionReturn {
  /** Indique si une vérification est en cours */
  isChecking: boolean
  /** Indique s'il y a au moins un conflit */
  hasConflict: boolean
  /** Indique s'il y a un conflit bloquant */
  hasHardConflict: boolean
  /** Indique s'il y a un conflit d'avertissement */
  hasSoftConflict: boolean
  /** Liste de tous les conflits */
  conflicts: AvailabilityConflict[]
  /** Conflits bloquants (VACATION, SICK, UNAVAILABLE) */
  hardConflicts: AvailabilityConflict[]
  /** Conflits d'avertissement (PREFERRED, TRAINING, OTHER) */
  softConflicts: AvailabilityConflict[]
  /** Erreur éventuelle */
  error: string | null
  /** Forcer une nouvelle vérification */
  refetch: () => Promise<void>
  /** Réinitialiser l'état */
  reset: () => void
}

// ============================================================================
// État initial
// ============================================================================

const initialState: Omit<UseConflictDetectionReturn, 'refetch' | 'reset'> = {
  isChecking: false,
  hasConflict: false,
  hasHardConflict: false,
  hasSoftConflict: false,
  conflicts: [],
  hardConflicts: [],
  softConflicts: [],
  error: null,
}

// ============================================================================
// Hook principal
// ============================================================================

export function useConflictDetection({
  employeeIds,
  startDate,
  endDate,
  startTime,
  endTime,
  enabled = true,
  debounceMs = 300,
  excludeAvailabilityId,
}: UseConflictDetectionParams): UseConflictDetectionReturn {
  const [state, setState] = useState(initialState)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fonction de vérification
  const checkConflicts = useCallback(async () => {
    // Validation des paramètres
    if (!enabled) {
      return
    }

    if (!employeeIds.length || !startDate || !endDate) {
      setState(initialState)
      return
    }

    // Annuler la requête précédente si en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    setState((prev) => ({ ...prev, isChecking: true, error: null }))

    try {
      const result = await checkAvailabilityConflicts(
        employeeIds,
        startDate,
        endDate,
        startTime,
        endTime,
        excludeAvailabilityId
      )

      // Vérifier si la requête a été annulée
      if (abortControllerRef.current?.signal.aborted) {
        return
      }

      if (result.success && result.data) {
        setState({
          isChecking: false,
          hasConflict: result.data.hasConflict,
          hasHardConflict: result.data.hasHardConflict,
          hasSoftConflict: result.data.hasSoftConflict,
          conflicts: result.data.conflicts,
          hardConflicts: result.data.hardConflicts,
          softConflicts: result.data.softConflicts,
          error: null,
        })
      } else {
        setState({
          ...initialState,
          isChecking: false,
          error:
            ('error' in result ? result.error : null) ||
            'Erreur lors de la vérification',
        })
      }
    } catch (error) {
      // Ignorer les erreurs d'annulation
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      setState({
        ...initialState,
        isChecking: false,
        error: 'Erreur lors de la vérification des conflits',
      })
    }
  }, [
    employeeIds,
    startDate,
    endDate,
    startTime,
    endTime,
    enabled,
    excludeAvailabilityId,
  ])

  // Fonction de refetch manuelle
  const refetch = useCallback(async () => {
    // Annuler le debounce en cours
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    await checkConflicts()
  }, [checkConflicts])

  // Fonction de reset
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(initialState)
  }, [])

  // Mémoriser les valeurs pour les dépendances
  const employeeIdsKey = employeeIds.join(',')
  const startDateIso = startDate?.toISOString()
  const endDateIso = endDate?.toISOString()
  const hasValidParams = employeeIds.length > 0 && !!startDate && !!endDate

  // Effet avec debounce
  useEffect(() => {
    // Ne pas vérifier si désactivé
    if (!enabled) {
      setState(initialState)
      return
    }

    // Ne pas vérifier si paramètres invalides
    if (!hasValidParams) {
      setState(initialState)
      return
    }

    // Annuler le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Créer un nouveau timer
    debounceTimerRef.current = setTimeout(() => {
      void checkConflicts()
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [
    employeeIdsKey,
    startDateIso,
    endDateIso,
    startTime,
    endTime,
    enabled,
    debounceMs,
    excludeAvailabilityId,
    checkConflicts,
    hasValidParams,
  ])

  // Cleanup à l'unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    refetch,
    reset,
  }
}
