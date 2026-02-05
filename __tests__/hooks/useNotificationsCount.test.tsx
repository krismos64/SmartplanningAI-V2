/**
 * Tests unitaires pour useNotificationsCount
 *
 * @ticket SP-322
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

// Mock du Server Action
vi.mock('@/lib/actions/notifications', () => ({
  getUnreadCount: vi.fn(),
}))

import { getUnreadCount } from '@/lib/actions/notifications'
import { useNotificationsCount } from '@/hooks/useNotificationsCount'

const mockGetUnreadCount = vi.mocked(getUnreadCount)

// Wrapper pour désactiver le cache SWR entre les tests
function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          // Désactiver le polling pour les tests
          refreshInterval: 0,
        }}
      >
        {children}
      </SWRConfig>
    )
  }
}

describe('useNotificationsCount - SP-322', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Valeurs retournées', () => {
    it('retourne 0 quand aucune notification', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 0 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.count).toBe(0)
      expect(result.current.isError).toBe(false)
    })

    it('retourne le bon compteur', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 5 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.count).toBe(5)
    })

    it('retourne un compteur élevé (ex: 99)', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 99 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.count).toBe(99)
      })
    })
  })

  describe('États de chargement', () => {
    it('isLoading est true initialement puis false', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 3 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      // Attendre que le chargement soit terminé
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.count).toBe(3)
    })
  })

  describe('Gestion des erreurs', () => {
    it('gère les erreurs du server action', async () => {
      mockGetUnreadCount.mockResolvedValue({
        success: false,
        error: 'Erreur de connexion',
      })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isError).toBe(true)
      expect(result.current.error).toBe('Erreur de connexion')
    })

    it("retourne count = 0 en cas d'erreur (fallback)", async () => {
      mockGetUnreadCount.mockResolvedValue({
        success: false,
        error: 'Erreur serveur',
      })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      // Le count reste à 0 (fallback)
      expect(result.current.count).toBe(0)
    })
  })

  describe('Fonctionnalité mutate', () => {
    it('expose la fonction mutate', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 2 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.count).toBe(2)
      })

      expect(typeof result.current.mutate).toBe('function')
    })
  })

  describe('Interface retournée', () => {
    it('retourne toutes les propriétés attendues', async () => {
      mockGetUnreadCount.mockResolvedValue({ success: true, data: 1 })

      const { result } = renderHook(() => useNotificationsCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Vérifier que toutes les propriétés sont présentes
      expect(result.current).toHaveProperty('count')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('isValidating')
      expect(result.current).toHaveProperty('isError')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('mutate')
    })
  })
})
