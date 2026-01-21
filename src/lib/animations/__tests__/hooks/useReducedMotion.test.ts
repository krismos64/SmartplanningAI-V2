/**
 * Tests unitaires - useReducedMotion Hook
 *
 * @see SP-379 - Animations System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock framer-motion's useReducedMotion hook
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    useReducedMotion: vi.fn(() => null), // Returns null to use fallback
  }
})

import {
  useReducedMotion,
  usePrefersReducedMotion,
  useMotionSafe,
} from '../../hooks/useReducedMotion'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

describe('useReducedMotion Hook', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>
  let listeners: Array<(event: { matches: boolean }) => void> = []

  beforeEach(() => {
    listeners = []

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(
        (event: string, listener: (event: { matches: boolean }) => void) => {
          if (event === 'change') {
            listeners.push(listener)
          }
        }
      ),
      removeEventListener: vi.fn(
        (event: string, listener: (event: { matches: boolean }) => void) => {
          if (event === 'change') {
            listeners = listeners.filter((l) => l !== listener)
          }
        }
      ),
      addListener: vi.fn((listener: (event: { matches: boolean }) => void) => {
        listeners.push(listener)
      }),
      removeListener: vi.fn(
        (listener: (event: { matches: boolean }) => void) => {
          listeners = listeners.filter((l) => l !== listener)
        }
      ),
    }))

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })

    // Reset framer-motion mock
    vi.mocked(useFramerReducedMotion).mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  describe('useReducedMotion', () => {
    it('should return false by default', () => {
      const { result } = renderHook(() => useReducedMotion())
      expect(result.current).toBe(false)
    })

    it('should return true when prefers-reduced-motion: reduce is set', () => {
      matchMediaMock.mockImplementation(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      const { result } = renderHook(() => useReducedMotion())
      expect(result.current).toBe(true)
    })

    it('should use framer-motion result when available', () => {
      vi.mocked(useFramerReducedMotion).mockReturnValue(true)

      const { result } = renderHook(() => useReducedMotion())
      expect(result.current).toBe(true)
    })

    it('should react to media query changes', () => {
      const { result } = renderHook(() => useReducedMotion())

      expect(result.current).toBe(false)

      // Simulate media query change
      act(() => {
        listeners.forEach((listener) => {
          listener({ matches: true })
        })
      })

      expect(result.current).toBe(true)
    })

    it('should cleanup listeners on unmount', () => {
      const mockRemoveEventListener = vi.fn()
      matchMediaMock.mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: mockRemoveEventListener,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }))

      const { unmount } = renderHook(() => useReducedMotion())
      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalled()
    })
  })

  describe('usePrefersReducedMotion', () => {
    it('should be an alias for useReducedMotion', () => {
      const { result: result1 } = renderHook(() => useReducedMotion())
      const { result: result2 } = renderHook(() => usePrefersReducedMotion())

      expect(result1.current).toBe(result2.current)
    })
  })

  describe('useMotionSafe', () => {
    it('should return normal animation when reduced motion is false', () => {
      const normalAnimation = { x: 100, opacity: 1 }
      const reducedAnimation = { opacity: 1 }

      const { result } = renderHook(() =>
        useMotionSafe(normalAnimation, reducedAnimation)
      )

      expect(result.current).toEqual(normalAnimation)
    })

    it('should return reduced animation when reduced motion is true', () => {
      // Set framer-motion mock to return true
      vi.mocked(useFramerReducedMotion).mockReturnValue(true)

      const normalAnimation = { x: 100, opacity: 1 }
      const reducedAnimation = { opacity: 1 }

      const { result } = renderHook(() =>
        useMotionSafe(normalAnimation, reducedAnimation)
      )

      expect(result.current).toEqual(reducedAnimation)
    })

    it('should extract opacity when no reduced animation provided', () => {
      vi.mocked(useFramerReducedMotion).mockReturnValue(true)

      const normalAnimation = { x: 100, opacity: 0.8 }

      const { result } = renderHook(() => useMotionSafe(normalAnimation))

      expect(result.current).toEqual({ opacity: 0.8 })
    })

    it('should return empty object when no opacity and no reduced animation', () => {
      vi.mocked(useFramerReducedMotion).mockReturnValue(true)

      const normalAnimation = { x: 100, scale: 1.5 }

      const { result } = renderHook(() => useMotionSafe(normalAnimation))

      expect(result.current).toEqual({})
    })
  })
})
