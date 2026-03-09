/**
 * Hook pour récupérer le nombre de notifications non lues
 *
 * @ticket SP-322
 * @description Utilise SWR pour le caching et la revalidation automatique
 */

'use client'

import useSWR from 'swr'
import { getUnreadCount } from '@/lib/actions/notifications'

/** Intervalle de refresh automatique (30 secondes) */
const REFRESH_INTERVAL = 30000

/**
 * Fetcher pour SWR qui appelle le Server Action
 */
async function fetchUnreadCount(): Promise<number> {
  const result = await getUnreadCount()
  if (result.success) {
    return result.data
  }
  throw new Error(result.error)
}

/**
 * Hook pour récupérer le nombre de notifications non lues
 *
 * Utilise SWR pour :
 * - Cache automatique
 * - Revalidation toutes les 30 secondes
 * - Revalidation au focus de la fenêtre
 * - Déduplication des requêtes
 *
 * @returns {object} { count, isLoading, isError, error, mutate }
 *
 * @example
 * const { count, isLoading, mutate } = useNotificationsCount()
 *
 * // Après avoir marqué une notification comme lue
 * await markAsRead(id)
 * mutate() // Refresh le compteur
 */
export function useNotificationsCount() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    number,
    Error
  >('notifications-unread-count', fetchUnreadCount, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Évite les requêtes dupliquées pendant 5s
    fallbackData: 0, // Valeur initiale pendant le premier chargement
  })

  return {
    /** Nombre de notifications non lues */
    count: data ?? 0,
    /** True pendant le chargement initial */
    isLoading,
    /** True pendant une revalidation (refresh) */
    isValidating,
    /** True si une erreur s'est produite */
    isError: !!error,
    /** Message d'erreur le cas échéant */
    error: error instanceof Error ? error.message : undefined,
    /** Fonction pour forcer un refresh du compteur */
    mutate,
  }
}
