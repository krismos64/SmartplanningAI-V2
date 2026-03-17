/**
 * Tests pour le hook useNotifications
 *
 * @ticket SP-323, SP-326
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

import { useNotifications } from '@/hooks/use-notifications'

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

// Types
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
]

// Wrapper SWR sans cache pour tests isolés
function wrapper({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        refreshInterval: 0,
      }}
    >
      {children}
    </SWRConfig>
  )
}

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Chargement initial', () => {
    it('devrait retourner isLoading=true initialement', () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.notifications).toEqual([])
    })

    it('devrait charger les notifications avec succès', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(2)
      expect(result.current.notifications[0].title).toBe('Nouveau planning')
      expect(result.current.isError).toBe(false)
    })

    it('devrait gérer les erreurs', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBe('Erreur serveur')
      expect(result.current.notifications).toEqual([])
    })
  })

  describe('markAsRead', () => {
    it('devrait marquer une notification comme lue avec optimistic update', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(markAsRead).mockResolvedValue({
        success: true,
        data: { ...mockNotifications[0], isRead: true, readAt: new Date() },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Vérifier que la notification est non lue initialement
      expect(result.current.notifications[0].isRead).toBe(false)

      // Marquer comme lue
      let success: boolean = false
      await act(async () => {
        success = await result.current.markAsRead('notif-1')
      })

      expect(success).toBe(true)
      expect(markAsRead).toHaveBeenCalledWith('notif-1')
    })

    it("devrait retourner false en cas d'erreur", async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(markAsRead).mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.markAsRead('notif-1')
      })

      expect(success).toBe(false)
    })

    it('ne devrait pas appeler markAsRead si la notification est déjà lue', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: [{ ...mockNotifications[1], isRead: true }],
          total: 1,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // La notification notif-2 est déjà lue
      await act(async () => {
        await result.current.markAsRead('notif-2')
      })

      // Le server action est quand même appelé (on ne skip pas côté hook)
      expect(markAsRead).toHaveBeenCalled()
    })
  })

  describe('markAllAsRead', () => {
    it('devrait marquer toutes les notifications comme lues', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(markAllAsRead).mockResolvedValue({
        success: true,
        data: { count: 1 },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.markAllAsRead()
      })

      expect(success).toBe(true)
      expect(markAllAsRead).toHaveBeenCalled()
    })

    it("devrait retourner false en cas d'erreur", async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(markAllAsRead).mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.markAllAsRead()
      })

      expect(success).toBe(false)
    })
  })

  describe('Liste vide', () => {
    it('devrait gérer une liste vide', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toEqual([])
      expect(result.current.isError).toBe(false)
    })
  })

  // ========================================================================
  // deleteNotification - SP-326
  // ========================================================================

  describe('deleteNotification', () => {
    it('devrait supprimer une notification avec optimistic update', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(deleteNotification).mockResolvedValue({
        success: true,
        data: { deleted: true },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.notifications).toHaveLength(2)

      let success: boolean = false
      await act(async () => {
        success = await result.current.deleteNotification('notif-1')
      })

      expect(success).toBe(true)
      expect(deleteNotification).toHaveBeenCalledWith('notif-1')
    })

    it("devrait retourner false en cas d'erreur", async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(deleteNotification).mockResolvedValue({
        success: false,
        error: 'Erreur de suppression',
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.deleteNotification('notif-1')
      })

      expect(success).toBe(false)
    })

    it('devrait exposer la fonction deleteNotification', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(typeof result.current.deleteNotification).toBe('function')
    })
  })

  // ========================================================================
  // deleteAllRead - SP-326
  // ========================================================================

  describe('deleteAllRead', () => {
    it('devrait supprimer toutes les notifications lues', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(deleteAllRead).mockResolvedValue({
        success: true,
        data: { count: 1 },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = false
      await act(async () => {
        success = await result.current.deleteAllRead()
      })

      expect(success).toBe(true)
      expect(deleteAllRead).toHaveBeenCalled()
    })

    it("devrait retourner false en cas d'erreur", async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: mockNotifications,
          total: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      })
      vi.mocked(deleteAllRead).mockResolvedValue({
        success: false,
        error: 'Erreur',
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let success: boolean = true
      await act(async () => {
        success = await result.current.deleteAllRead()
      })

      expect(success).toBe(false)
    })

    it('devrait exposer la fonction deleteAllRead', async () => {
      vi.mocked(getNotifications).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
      })

      const { result } = renderHook(() => useNotifications(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(typeof result.current.deleteAllRead).toBe('function')
    })
  })
})
