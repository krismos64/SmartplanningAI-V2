/**
 * Hook pour récupérer la liste des notifications
 *
 * @ticket SP-323
 * @description Utilise SWR pour le caching, la revalidation automatique et les optimistic updates
 */

'use client'

import useSWR, { mutate as globalMutate } from 'swr'
import {
  getNotifications,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
} from '@/lib/actions/notifications'
import type { NotificationListItem } from '@/types/notification'

/** Intervalle de refresh automatique (30 secondes) */
const REFRESH_INTERVAL = 30000

/** Nombre de notifications à afficher dans le dropdown */
const DEFAULT_LIMIT = 10

/** Clé SWR pour les notifications */
const NOTIFICATIONS_KEY = 'notifications-list'

/** Clé SWR pour le compteur (partagée avec useNotificationsCount) */
const NOTIFICATIONS_COUNT_KEY = 'notifications-unread-count'

/**
 * Fetcher pour SWR qui appelle le Server Action
 */
async function fetchNotifications(): Promise<NotificationListItem[]> {
  const result = await getNotifications(
    undefined, // Pas de filtres
    { page: 1, pageSize: DEFAULT_LIMIT, sortBy: 'createdAt', sortOrder: 'desc' }
  )
  if (result.success) {
    return result.data.data
  }
  throw new Error(result.error)
}

/**
 * Hook pour récupérer la liste des notifications
 *
 * Utilise SWR pour :
 * - Cache automatique
 * - Revalidation toutes les 30 secondes
 * - Revalidation au focus de la fenêtre
 * - Optimistic updates pour markAsRead
 *
 * @returns {object} { notifications, isLoading, isError, error, markAsRead, markAllAsRead, mutate }
 *
 * @example
 * const { notifications, markAsRead, markAllAsRead } = useNotifications()
 *
 * // Marquer comme lu (optimistic update)
 * await markAsRead(notificationId)
 */
export function useNotifications() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    NotificationListItem[],
    Error
  >(NOTIFICATIONS_KEY, fetchNotifications, {
    refreshInterval: REFRESH_INTERVAL,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // Évite les requêtes dupliquées pendant 5s
    fallbackData: [], // Valeur initiale pendant le premier chargement
  })

  /**
   * Marque une notification comme lue avec optimistic update
   *
   * @param notificationId - ID de la notification à marquer
   * @returns Promise<boolean> - true si succès
   */
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    // Optimistic update local
    const optimisticData = data?.map((n) =>
      n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
    )

    // Optimistic update du compteur (décrémenter)
    const notification = data?.find((n) => n.id === notificationId)
    const wasUnread = notification && !notification.isRead

    try {
      // Mettre à jour le cache local immédiatement
      await mutate(optimisticData, { revalidate: false })

      // Mettre à jour le compteur si la notification était non lue
      if (wasUnread) {
        await globalMutate(
          NOTIFICATIONS_COUNT_KEY,
          (currentCount: number | undefined) =>
            Math.max(0, (currentCount ?? 1) - 1),
          { revalidate: false }
        )
      }

      // Appeler le serveur
      const result = await markAsReadAction(notificationId)

      if (!result.success) {
        // Rollback en cas d'erreur
        await mutate()
        await globalMutate(NOTIFICATIONS_COUNT_KEY)
        return false
      }

      return true
    } catch {
      // Rollback en cas d'erreur
      await mutate()
      await globalMutate(NOTIFICATIONS_COUNT_KEY)
      return false
    }
  }

  /**
   * Marque toutes les notifications comme lues
   *
   * @returns Promise<boolean> - true si succès
   */
  const markAllAsRead = async (): Promise<boolean> => {
    // Optimistic update local
    const optimisticData = data?.map((n) => ({
      ...n,
      isRead: true,
      readAt: new Date(),
    }))

    try {
      // Mettre à jour le cache local immédiatement
      await mutate(optimisticData, { revalidate: false })

      // Mettre le compteur à 0
      await globalMutate(NOTIFICATIONS_COUNT_KEY, 0, { revalidate: false })

      // Appeler le serveur
      const result = await markAllAsReadAction()

      if (!result.success) {
        // Rollback en cas d'erreur
        await mutate()
        await globalMutate(NOTIFICATIONS_COUNT_KEY)
        return false
      }

      return true
    } catch {
      // Rollback en cas d'erreur
      await mutate()
      await globalMutate(NOTIFICATIONS_COUNT_KEY)
      return false
    }
  }

  return {
    /** Liste des notifications */
    notifications: data ?? [],
    /** True pendant le chargement initial */
    isLoading,
    /** True pendant une revalidation (refresh) */
    isValidating,
    /** True si une erreur s'est produite */
    isError: !!error,
    /** Message d'erreur le cas échéant */
    error: error instanceof Error ? error.message : undefined,
    /** Fonction pour marquer une notification comme lue */
    markAsRead,
    /** Fonction pour marquer toutes les notifications comme lues */
    markAllAsRead,
    /** Fonction pour forcer un refresh de la liste */
    mutate,
  }
}
