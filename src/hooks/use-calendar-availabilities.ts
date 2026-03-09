/**
 * Hook pour charger les indisponibilités du calendrier
 *
 * @description Charge les indisponibilités pour une période donnée avec debounce
 * @ticket SP-402
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  getAvailabilitiesForCalendar,
  type AvailabilityWithEmployee,
} from '@/lib/actions/availabilities'

// ============================================================================
// Types
// ============================================================================

export interface UseCalendarAvailabilitiesParams {
  companyId: string
  startDate: Date | null
  endDate: Date | null
  teamId?: string
  employeeIds?: string[]
  enabled?: boolean
  debounceMs?: number
}

export interface UseCalendarAvailabilitiesReturn {
  availabilities: AvailabilityWithEmployee[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ============================================================================
// Hook
// ============================================================================

export function useCalendarAvailabilities({
  companyId,
  startDate,
  endDate,
  teamId,
  employeeIds,
  enabled = true,
  debounceMs = 200,
}: UseCalendarAvailabilitiesParams): UseCalendarAvailabilitiesReturn {
  const [availabilities, setAvailabilities] = useState<
    AvailabilityWithEmployee[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref pour gérer le debounce
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref pour annuler les requêtes obsolètes
  const requestIdRef = useRef(0)

  // Cache local pour éviter les requêtes dupliquées
  const cacheRef = useRef<Map<string, AvailabilityWithEmployee[]>>(new Map())

  // Générer une clé de cache
  const cacheKey = useMemo(() => {
    if (!startDate || !endDate) return null
    return [
      companyId,
      startDate.toISOString(),
      endDate.toISOString(),
      teamId ?? '',
      employeeIds?.sort().join(',') ?? '',
    ].join('|')
  }, [companyId, startDate, endDate, teamId, employeeIds])

  // Fonction de chargement
  const fetchAvailabilities = useCallback(async () => {
    if (!startDate || !endDate || !enabled) {
      return
    }

    // Vérifier le cache
    if (cacheKey && cacheRef.current.has(cacheKey)) {
      setAvailabilities(cacheRef.current.get(cacheKey)!)
      return
    }

    const currentRequestId = ++requestIdRef.current
    setIsLoading(true)
    setError(null)

    try {
      const result = await getAvailabilitiesForCalendar(
        companyId,
        startDate,
        endDate,
        teamId,
        employeeIds
      )

      // Ignorer si une requête plus récente est en cours
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      if (result.success) {
        setAvailabilities(result.data)
        // Mettre en cache
        if (cacheKey) {
          cacheRef.current.set(cacheKey, result.data)
          // Limiter la taille du cache à 10 entrées
          if (cacheRef.current.size > 10) {
            const firstKey = cacheRef.current.keys().next().value
            if (firstKey) {
              cacheRef.current.delete(firstKey)
            }
          }
        }
      } else {
        setError(result.error)
        setAvailabilities([])
      }
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) {
        return
      }
      console.error('[useCalendarAvailabilities] Error:', err)
      setError('Erreur lors du chargement des indisponibilités')
      setAvailabilities([])
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [companyId, startDate, endDate, teamId, employeeIds, enabled, cacheKey])

  // Fonction de refetch (ignore le cache)
  const refetch = useCallback(async () => {
    if (!startDate || !endDate) {
      return
    }

    // Invalider le cache pour cette clé
    if (cacheKey) {
      cacheRef.current.delete(cacheKey)
    }

    await fetchAvailabilities()
  }, [fetchAvailabilities, cacheKey, startDate, endDate])

  // Effet avec debounce
  useEffect(() => {
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Ne pas charger si désactivé ou paramètres invalides
    if (!enabled || !startDate || !endDate) {
      setAvailabilities([])
      setIsLoading(false)
      return
    }

    // Debounce
    debounceTimerRef.current = setTimeout(() => {
      void fetchAvailabilities()
    }, debounceMs)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [
    enabled,
    startDate,
    endDate,
    teamId,
    employeeIds,
    debounceMs,
    fetchAvailabilities,
  ])

  return {
    availabilities,
    isLoading,
    error,
    refetch,
  }
}
