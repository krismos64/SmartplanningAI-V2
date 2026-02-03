/**
 * Tests pour le hook useNotificationsPaginated
 *
 * @ticket SP-324
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

import { useNotificationsPaginated } from '@/hooks/useNotificationsPaginated'

// Mock des actions
vi.mock('@/lib/actions/notifications', () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  deleteAllRead: vi.fn(),
}))

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '@/lib/actions/notifications'

// Données de test
const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Nouveau planning',
    message: 'Un nouveau planning a été créé',
    type: 'PLANNING',
    priority: 'LOW',
    actionUrl: '/app/dashboard/schedule',
    relatedType: 'Schedule',
    relatedId: 'schedule-1',
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-30T10:00:00'),
  },
  {
    id: 'notif-2',
    title: 'Congé approuvé',
    message: 'Votre demande a été approuvée',
    type: 'LEAVE',
    priority: 'LOW',
    actionUrl: '/app/dashboard/leaves',
    relatedType: 'LeaveRequest',
    relatedId: 'leave-1',
    isRead: true,
    readAt: new Date('2026-01-29T12:00:00'),
    createdAt: new Date('2026-01-29T10:00:00'),
  },
  {
    id: 'notif-3',
    title: 'Incident signalé',
    message: 'Une note vous concernant',
    type: 'INCIDENT',
    priority: 'HIGH',
    actionUrl: '/app/dashboard/incidents',
    relatedType: 'IncidentNote',
    relatedId: 'incident-1',
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-28T10:00:00'),
  },
]

const mockPaginatedResponse = {
  success: true,
  data: {
    data: mockNotifications,
    page: 1,
    pageSize: 10,
    total: 25,
    totalPages: 3,
  },
}

// Wrapper SWR sans cache pour tests isolés
function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
      }}
    >
      {children}
    </SWRConfig>
  )
}

describe('useNotificationsPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Chargement initial', () => {
    it('devrait retourner isLoading=true initialement', () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.notifications).toEqual([])
    })

    it('devrait charger les notifications avec succès', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(3)
      expect(result.current.pagination?.total).toBe(25)
      expect(result.current.pagination?.totalPages).toBe(3)
    })

    it('devrait gérer les erreurs', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Erreur serveur')
      })

      expect(result.current.notifications).toEqual([])
    })
  })

  describe('Pagination', () => {
    it('devrait avoir les valeurs de pagination correctes', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.page).toBe(1)
      expect(result.current.pagination?.hasMore).toBe(true)
    })

    it('devrait pouvoir aller à la page suivante', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(2)
    })

    it('devrait pouvoir aller à la page précédente', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(
        () => useNotificationsPaginated({ initialPage: 2 }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(1)
    })

    it('devrait pouvoir aller à une page spécifique', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.goToPage(3)
      })

      expect(result.current.page).toBe(3)
    })

    it('ne devrait pas aller en dessous de la page 1', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.prevPage()
      })

      expect(result.current.page).toBe(1)
    })
  })

  describe('Filtres', () => {
    it('devrait initialiser les filtres à ALL', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filters.type).toBe('ALL')
      expect(result.current.filters.isRead).toBe('ALL')
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('devrait pouvoir filtrer par type', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setTypeFilter('PLANNING')
      })

      expect(result.current.filters.type).toBe('PLANNING')
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('devrait pouvoir filtrer par statut lu/non-lu', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setReadFilter(false)
      })

      expect(result.current.filters.isRead).toBe(false)
      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('devrait pouvoir réinitialiser les filtres', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setTypeFilter('LEAVE')
        result.current.setReadFilter(true)
      })

      expect(result.current.hasActiveFilters).toBe(true)

      act(() => {
        result.current.clearFilters()
      })

      expect(result.current.filters.type).toBe('ALL')
      expect(result.current.filters.isRead).toBe('ALL')
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('devrait reset la page quand les filtres changent', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Aller à la page 2 d'abord
      act(() => {
        result.current.nextPage()
      })

      expect(result.current.page).toBe(2)

      // Changer le filtre devrait reset à la page 1
      act(() => {
        result.current.setTypeFilter('PLANNING')
      })

      expect(result.current.page).toBe(1)
    })
  })

  describe('Compteurs', () => {
    it('devrait compter les notifications non lues', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // 2 non lues (notif-1, notif-3)
      expect(result.current.unreadCount).toBe(2)
    })

    it('devrait compter les notifications lues', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // 1 lue (notif-2)
      expect(result.current.readCount).toBe(1)
    })
  })

  describe('Actions', () => {
    it('devrait appeler markAsRead', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)
      vi.mocked(markAsRead).mockResolvedValue({
        success: true,
        data: { ...mockNotifications[0], isRead: true },
      })

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.markAsRead('notif-1')
      })

      expect(markAsRead).toHaveBeenCalledWith('notif-1')
    })

    it('devrait appeler markAllAsRead', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)
      vi.mocked(markAllAsRead).mockResolvedValue({
        success: true,
        data: { count: 2 },
      })

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.markAllAsRead()
      })

      expect(markAllAsRead).toHaveBeenCalled()
    })

    it('devrait appeler deleteNotification', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)
      vi.mocked(deleteNotification).mockResolvedValue({
        success: true,
        data: { deleted: true },
      })

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteNotification('notif-1')
      })

      expect(deleteNotification).toHaveBeenCalledWith('notif-1')
    })

    it('devrait appeler deleteAllRead', async () => {
      vi.mocked(getNotifications).mockResolvedValue(mockPaginatedResponse)
      vi.mocked(deleteAllRead).mockResolvedValue({
        success: true,
        data: { count: 1 },
      })

      const { result } = renderHook(() => useNotificationsPaginated(), {
        wrapper,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteAllRead()
      })

      expect(deleteAllRead).toHaveBeenCalled()
    })
  })
})
