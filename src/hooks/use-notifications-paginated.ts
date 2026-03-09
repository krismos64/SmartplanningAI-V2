/**
 * Hook pour gérer les notifications avec pagination
 *
 * @ticket SP-324
 * @description Hook SWR avec pagination, filtres et actions en masse
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import type { NotificationType } from '@prisma/client'
import {
  getNotifications,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  deleteNotification as deleteNotificationAction,
  deleteAllRead as deleteAllReadAction,
} from '@/lib/actions/notifications'
import type { NotificationListItem } from '@/types/notification'
import type { CrudActionResult, PaginatedResult } from '@/types'

/** Limite par page par défaut */
const DEFAULT_PAGE_SIZE = 10

interface Filters {
  type: NotificationType | 'ALL'
  isRead: boolean | 'ALL'
}

interface UseNotificationsPaginatedOptions {
  initialPage?: number
  pageSize?: number
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasMore: boolean
}

interface UseNotificationsPaginatedReturn {
  notifications: NotificationListItem[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null | undefined
  page: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  filters: Filters
  setTypeFilter: (type: NotificationType | 'ALL') => void
  setReadFilter: (isRead: boolean | 'ALL') => void
  clearFilters: () => void
  hasActiveFilters: boolean
  unreadCount: number
  readCount: number
  markAsRead: (id: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  deleteNotification: (id: string) => Promise<boolean>
  deleteAllRead: () => Promise<boolean>
  refresh: () => void
}

export function useNotificationsPaginated(
  options: UseNotificationsPaginatedOptions = {}
): UseNotificationsPaginatedReturn {
  const { initialPage = 1, pageSize = DEFAULT_PAGE_SIZE } = options

  // États locaux pour pagination et filtres
  const [page, setPage] = useState(initialPage)
  const [filters, setFilters] = useState<Filters>({
    type: 'ALL',
    isRead: 'ALL',
  })

  // Clé SWR dynamique basée sur page + filtres
  const swrKey = [
    'notifications-paginated',
    page,
    pageSize,
    filters.type,
    filters.isRead,
  ]

  // Fetcher qui transforme les filtres pour l'action
  const fetcher = useCallback(async () => {
    const actionFilters: { type?: NotificationType; isRead?: boolean } = {}

    if (filters.type !== 'ALL') {
      actionFilters.type = filters.type
    }
    if (filters.isRead !== 'ALL') {
      actionFilters.isRead = filters.isRead
    }

    return getNotifications(
      Object.keys(actionFilters).length > 0 ? actionFilters : undefined,
      { page, pageSize, sortBy: 'createdAt', sortOrder: 'desc' }
    )
  }, [page, pageSize, filters.type, filters.isRead])

  const swrResult = useSWR<
    CrudActionResult<PaginatedResult<NotificationListItem>>,
    Error
  >(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  })
  const data = swrResult.data
  const error = swrResult.error
  const isLoading = swrResult.isLoading
  const mutate = swrResult.mutate

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [filters.type, filters.isRead])

  // Extraire les données
  const notifications: NotificationListItem[] = data?.success
    ? data.data.data
    : []

  // Utiliser useMemo pour la pagination afin d'éviter les changements de référence
  const pagination: Pagination | null = useMemo(() => {
    if (!data?.success) return null
    return {
      page: data.data.page,
      pageSize: data.data.pageSize,
      total: data.data.total,
      totalPages: data.data.totalPages,
      hasMore: data.data.page < data.data.totalPages,
    }
  }, [data])

  // Navigation pagination
  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && (!pagination || newPage <= pagination.totalPages)) {
        setPage(newPage)
      }
    },
    [pagination]
  )

  const nextPage = useCallback(() => {
    if (pagination?.hasMore) {
      setPage((p) => p + 1)
    }
  }, [pagination?.hasMore])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1)
    }
  }, [page])

  // Filtres
  const setTypeFilter = useCallback((type: NotificationType | 'ALL') => {
    setFilters((f) => ({ ...f, type }))
  }, [])

  const setReadFilter = useCallback((isRead: boolean | 'ALL') => {
    setFilters((f) => ({ ...f, isRead }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ type: 'ALL', isRead: 'ALL' })
  }, [])

  // Actions
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      if (data?.success) {
        const optimisticData = {
          ...data,
          data: {
            ...data.data,
            data: data.data.data.map((n) =>
              n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
            ),
          },
        }
        await mutate(optimisticData, { revalidate: false })
      }

      const result = await markAsReadAction(id)

      if (!result.success) {
        // Rollback
        await mutate()
      }

      return result.success
    },
    [data, mutate]
  )

  const handleMarkAllAsRead = useCallback(async () => {
    // Optimistic update
    if (data?.success) {
      const optimisticData = {
        ...data,
        data: {
          ...data.data,
          data: data.data.data.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date(),
          })),
        },
      }
      await mutate(optimisticData, { revalidate: false })
    }

    const result = await markAllAsReadAction()

    // Revalider pour avoir les bons totaux
    await mutate()

    return result.success
  }, [data, mutate])

  const handleDeleteNotification = useCallback(
    async (id: string) => {
      // Sauvegarder pour rollback
      const previousData = data

      // Optimistic update
      if (data?.success) {
        const optimisticData = {
          ...data,
          data: {
            ...data.data,
            data: data.data.data.filter((n) => n.id !== id),
            total: data.data.total - 1,
          },
        }
        await mutate(optimisticData, { revalidate: false })
      }

      const result = await deleteNotificationAction(id)

      if (!result.success) {
        // Rollback
        await mutate(previousData, { revalidate: false })
      } else {
        // Revalider pour pagination correcte
        await mutate()
      }

      return result.success
    },
    [data, mutate]
  )

  const handleDeleteAllRead = useCallback(async () => {
    // Sauvegarder pour rollback
    const previousData = data

    // Optimistic update : garder seulement les non-lues
    if (data?.success) {
      const unreadNotifications = data.data.data.filter((n) => !n.isRead)
      const optimisticData = {
        ...data,
        data: {
          ...data.data,
          data: unreadNotifications,
          total: unreadNotifications.length,
        },
      }
      await mutate(optimisticData, { revalidate: false })
    }

    const result = await deleteAllReadAction()

    if (!result.success) {
      // Rollback
      await mutate(previousData, { revalidate: false })
    } else {
      // Revalider
      await mutate()
    }

    return result.success
  }, [data, mutate])

  // Compteurs
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const readCount = notifications.filter((n) => n.isRead).length

  // Compute error message safely
  const errorMessage: string | null | undefined =
    error instanceof Error
      ? error.message
      : data && !data.success
        ? data.error
        : null

  return {
    // Données
    notifications,
    pagination,
    isLoading,
    error: errorMessage,

    // Pagination
    page,
    goToPage,
    nextPage,
    prevPage,

    // Filtres
    filters,
    setTypeFilter,
    setReadFilter,
    clearFilters,
    hasActiveFilters: filters.type !== 'ALL' || filters.isRead !== 'ALL',

    // Compteurs
    unreadCount,
    readCount,

    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
    deleteAllRead: handleDeleteAllRead,
    refresh: () => {
      void mutate()
    },
  }
}
