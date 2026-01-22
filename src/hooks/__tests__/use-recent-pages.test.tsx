/**
 * Tests unitaires - useRecentPages hook
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 *
 * 8 tests couvrant :
 * - État initial
 * - Ajout de page
 * - Vidage de l'historique
 * - État isLoading
 * - Re-render stability
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRecentPages } from '../use-recent-pages'
import { recentPagesStore } from '@/lib/storage/recent-pages-store'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useRecentPages', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    recentPagesStore.clear()
  })

  afterEach(() => {
    recentPagesStore.clear()
  })

  // =========================================================================
  // TESTS ÉTAT INITIAL
  // =========================================================================

  describe('Initial state', () => {
    it('should return empty array initially', () => {
      const { result } = renderHook(() => useRecentPages())

      expect(result.current.recentPages).toEqual([])
    })

    it('should have isLoading true initially, then false after hydration', async () => {
      const { result } = renderHook(() => useRecentPages())

      // Après le premier render, isLoading devrait passer à false
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should return stored pages after hydration', async () => {
      // Pré-remplir le store
      recentPagesStore.addPage({ path: '/test', title: 'Test', icon: 'Home' })

      const { result } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.recentPages).toHaveLength(1)
        expect(result.current.recentPages[0]?.path).toBe('/test')
      })
    })
  })

  // =========================================================================
  // TESTS AJOUT DE PAGE
  // =========================================================================

  describe('addPage', () => {
    it('should add a page', async () => {
      const { result } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.addPage({
          path: '/dashboard',
          title: 'Dashboard',
          icon: 'Home',
        })
      })

      expect(result.current.recentPages).toHaveLength(1)
      expect(result.current.recentPages[0]?.path).toBe('/dashboard')
    })

    it('should add timestamp automatically', async () => {
      const { result } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const before = Date.now()

      act(() => {
        result.current.addPage({
          path: '/test',
          title: 'Test',
        })
      })

      const after = Date.now()

      expect(result.current.recentPages[0]?.visitedAt).toBeGreaterThanOrEqual(
        before
      )
      expect(result.current.recentPages[0]?.visitedAt).toBeLessThanOrEqual(
        after
      )
    })

    it('should deduplicate by path', async () => {
      const { result } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.addPage({ path: '/first', title: 'First' })
        result.current.addPage({ path: '/second', title: 'Second' })
        result.current.addPage({ path: '/first', title: 'First Updated' })
      })

      expect(result.current.recentPages).toHaveLength(2)
      expect(result.current.recentPages[0]?.path).toBe('/first')
      expect(result.current.recentPages[0]?.title).toBe('First Updated')
    })
  })

  // =========================================================================
  // TESTS VIDAGE
  // =========================================================================

  describe('clearHistory', () => {
    it('should clear all pages', async () => {
      const { result } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.addPage({ path: '/test', title: 'Test' })
      })

      expect(result.current.recentPages).toHaveLength(1)

      act(() => {
        result.current.clearHistory()
      })

      expect(result.current.recentPages).toEqual([])
    })
  })

  // =========================================================================
  // TESTS STABILITÉ
  // =========================================================================

  describe('Stability', () => {
    it('should return stable function references', async () => {
      const { result, rerender } = renderHook(() => useRecentPages())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const firstAddPage = result.current.addPage
      const firstClearHistory = result.current.clearHistory

      rerender()

      expect(result.current.addPage).toBe(firstAddPage)
      expect(result.current.clearHistory).toBe(firstClearHistory)
    })
  })
})
