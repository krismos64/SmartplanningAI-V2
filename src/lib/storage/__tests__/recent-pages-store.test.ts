/**
 * Tests unitaires - recentPagesStore
 *
 * @ticket SP-264 - Phase 4 - Recent Pages
 *
 * 10 tests couvrant :
 * - Lecture du snapshot
 * - Snapshot serveur vide (SSR)
 * - Ajout de pages
 * - Déduplication
 * - Limite de 5 pages
 * - Vidage du store
 * - Souscription aux changements
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { recentPagesStore, type RecentPage } from '../recent-pages-store'

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

describe('recentPagesStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    recentPagesStore.clear()
  })

  // =========================================================================
  // TESTS SNAPSHOT
  // =========================================================================

  describe('getSnapshot', () => {
    it('should return empty array when localStorage is empty', () => {
      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toEqual([])
    })

    it('should return stored pages', () => {
      const pages: RecentPage[] = [
        {
          path: '/dashboard',
          title: 'Dashboard',
          icon: 'Home',
          visitedAt: Date.now(),
        },
      ]
      localStorageMock.setItem(
        'smartplanning:recent-pages',
        JSON.stringify(pages)
      )

      // Invalider le cache
      recentPagesStore.clear()
      localStorageMock.setItem(
        'smartplanning:recent-pages',
        JSON.stringify(pages)
      )

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toEqual(pages)
    })

    it('should return empty array for invalid JSON', () => {
      localStorageMock.setItem('smartplanning:recent-pages', 'invalid json')

      // Force refresh
      recentPagesStore.clear()
      localStorageMock.setItem('smartplanning:recent-pages', 'invalid json')

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toEqual([])
    })

    it('should filter invalid entries', () => {
      const invalidData = [
        { path: '/valid', title: 'Valid', visitedAt: 123 },
        { invalid: 'entry' },
        { path: '/missing-title', visitedAt: 123 },
        null,
        'string',
      ]
      localStorageMock.setItem(
        'smartplanning:recent-pages',
        JSON.stringify(invalidData)
      )

      // Force refresh
      recentPagesStore.clear()
      localStorageMock.setItem(
        'smartplanning:recent-pages',
        JSON.stringify(invalidData)
      )

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toHaveLength(1)
      expect(snapshot[0]?.path).toBe('/valid')
    })
  })

  // =========================================================================
  // TESTS SNAPSHOT SERVEUR (SSR)
  // =========================================================================

  describe('getServerSnapshot', () => {
    it('should always return empty array', () => {
      const snapshot = recentPagesStore.getServerSnapshot()
      expect(snapshot).toEqual([])
    })

    it('should return empty array even with stored data', () => {
      localStorageMock.setItem(
        'smartplanning:recent-pages',
        JSON.stringify([{ path: '/test', title: 'Test', visitedAt: 123 }])
      )

      const snapshot = recentPagesStore.getServerSnapshot()
      expect(snapshot).toEqual([])
    })
  })

  // =========================================================================
  // TESTS AJOUT DE PAGES
  // =========================================================================

  describe('addPage', () => {
    it('should add a new page', () => {
      recentPagesStore.addPage({
        path: '/dashboard',
        title: 'Dashboard',
        icon: 'Home',
      })

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toHaveLength(1)
      expect(snapshot[0]?.path).toBe('/dashboard')
      expect(snapshot[0]?.title).toBe('Dashboard')
      expect(snapshot[0]?.icon).toBe('Home')
      expect(snapshot[0]?.visitedAt).toBeDefined()
    })

    it('should add timestamp automatically', () => {
      const before = Date.now()

      recentPagesStore.addPage({
        path: '/test',
        title: 'Test',
      })

      const after = Date.now()
      const snapshot = recentPagesStore.getSnapshot()

      expect(snapshot[0]?.visitedAt).toBeGreaterThanOrEqual(before)
      expect(snapshot[0]?.visitedAt).toBeLessThanOrEqual(after)
    })

    it('should add new pages at the beginning', () => {
      recentPagesStore.addPage({ path: '/first', title: 'First' })
      recentPagesStore.addPage({ path: '/second', title: 'Second' })

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot[0]?.path).toBe('/second')
      expect(snapshot[1]?.path).toBe('/first')
    })
  })

  // =========================================================================
  // TESTS DÉDUPLICATION
  // =========================================================================

  describe('deduplication', () => {
    it('should move existing page to top on revisit', () => {
      recentPagesStore.addPage({ path: '/first', title: 'First' })
      recentPagesStore.addPage({ path: '/second', title: 'Second' })
      recentPagesStore.addPage({ path: '/first', title: 'First Updated' })

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toHaveLength(2)
      expect(snapshot[0]?.path).toBe('/first')
      expect(snapshot[0]?.title).toBe('First Updated')
      expect(snapshot[1]?.path).toBe('/second')
    })

    it('should update timestamp on revisit', async () => {
      recentPagesStore.addPage({ path: '/test', title: 'Test' })
      const firstVisit = recentPagesStore.getSnapshot()[0]?.visitedAt ?? 0

      // Attendre un peu pour avoir un timestamp différent
      await new Promise((resolve) => setTimeout(resolve, 10))

      recentPagesStore.addPage({ path: '/test', title: 'Test' })
      const secondVisit = recentPagesStore.getSnapshot()[0]?.visitedAt ?? 0

      expect(secondVisit).toBeGreaterThan(firstVisit)
    })
  })

  // =========================================================================
  // TESTS LIMITE
  // =========================================================================

  describe('limit', () => {
    it('should limit to 5 pages', () => {
      for (let i = 1; i <= 7; i++) {
        recentPagesStore.addPage({ path: `/page-${i}`, title: `Page ${i}` })
      }

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toHaveLength(5)
    })

    it('should keep most recent pages', () => {
      for (let i = 1; i <= 7; i++) {
        recentPagesStore.addPage({ path: `/page-${i}`, title: `Page ${i}` })
      }

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot[0]?.path).toBe('/page-7')
      expect(snapshot[4]?.path).toBe('/page-3')
    })
  })

  // =========================================================================
  // TESTS VIDAGE
  // =========================================================================

  describe('clear', () => {
    it('should clear all pages', () => {
      recentPagesStore.addPage({ path: '/test', title: 'Test' })
      recentPagesStore.clear()

      const snapshot = recentPagesStore.getSnapshot()
      expect(snapshot).toEqual([])
    })

    it('should remove from localStorage', () => {
      recentPagesStore.addPage({ path: '/test', title: 'Test' })
      recentPagesStore.clear()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'smartplanning:recent-pages'
      )
    })
  })

  // =========================================================================
  // TESTS SOUSCRIPTION
  // =========================================================================

  describe('subscribe', () => {
    it('should call callback on addPage', () => {
      const callback = vi.fn()
      const unsubscribe = recentPagesStore.subscribe(callback)

      recentPagesStore.addPage({ path: '/test', title: 'Test' })

      expect(callback).toHaveBeenCalled()
      unsubscribe()
    })

    it('should call callback on clear', () => {
      const callback = vi.fn()
      const unsubscribe = recentPagesStore.subscribe(callback)

      recentPagesStore.clear()

      expect(callback).toHaveBeenCalled()
      unsubscribe()
    })

    it('should not call callback after unsubscribe', () => {
      const callback = vi.fn()
      const unsubscribe = recentPagesStore.subscribe(callback)

      unsubscribe()
      recentPagesStore.addPage({ path: '/test', title: 'Test' })

      expect(callback).not.toHaveBeenCalled()
    })
  })
})
